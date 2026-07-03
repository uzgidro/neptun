import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MenuItem, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { DischargeService } from '@/core/services/discharge.service';
import { downloadBlob } from '@/core/utils/download';
import { DischargeSummaryResponse, SummaryBucket, SummaryGranularity, SummaryGrandTotal, SummaryMetrics } from '@/core/interfaces/discharge';

export type MetricKey = 'volume_mln_m3' | 'avg_flow_rate_m3_s' | 'generation_loss_kwh';

export interface SummaryRow {
    type: 'cascade' | 'hpp';
    id: number;
    name: string;
    buckets: SummaryBucket[];
    total: SummaryMetrics;
}

interface LabeledOption<T> {
    label: string;
    value: T;
}

const MS_PER_DAY = 86_400_000;
const MAX_DAY_RANGE = 366;
const MAX_EXPORT_MONTHS = 24;

@Component({
    selector: 'app-discharge-summary',
    imports: [DecimalPipe, FormsModule, TranslateModule, TableModule, Button, Menu, DatePicker, Select, SelectButton],
    templateUrl: './discharge-summary.component.html',
    styleUrl: './discharge-summary.component.scss'
})
export class DischargeSummaryComponent implements OnInit, OnDestroy {
    private dischargeService = inject(DischargeService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    from: Date = new Date(new Date().getFullYear(), 0, 1);
    to: Date = new Date();
    granularity: SummaryGranularity = 'month';
    metric: MetricKey = 'volume_mln_m3';

    loading = false;
    validationError: string | null = null;

    columns: string[] = [];
    rows: SummaryRow[] = [];
    grandTotal: SummaryGrandTotal | null = null;

    downloadingExport: 'excel' | 'pdf' | null = null;

    // label — i18n-ключ, переводится в шаблоне (см. granularity/metric опции).
    exportItems: MenuItem[] = [
        { label: 'SITUATION_CENTER.DISCHARGE.SUMMARY.DOWNLOAD_EXCEL', icon: 'pi pi-file-excel', command: () => this.export('excel') },
        { label: 'SITUATION_CENTER.DISCHARGE.SUMMARY.DOWNLOAD_PDF', icon: 'pi pi-file-pdf', command: () => this.export('pdf') }
    ];

    // label — i18n-ключ; перевод делается в шаблоне через | translate, чтобы ярлыки
    // не застревали как сырые ключи, если бандлы ещё не загружены на момент ngOnInit,
    // и переводились на лету при смене языка.
    granularityOptions: LabeledOption<SummaryGranularity>[] = [
        { label: 'SITUATION_CENTER.DISCHARGE.SUMMARY.GRANULARITY_DAY', value: 'day' },
        { label: 'SITUATION_CENTER.DISCHARGE.SUMMARY.GRANULARITY_MONTH', value: 'month' },
        { label: 'SITUATION_CENTER.DISCHARGE.SUMMARY.GRANULARITY_YEAR', value: 'year' }
    ];
    metricOptions: LabeledOption<MetricKey>[] = [
        { label: 'SITUATION_CENTER.DISCHARGE.SUMMARY.METRIC_VOLUME', value: 'volume_mln_m3' },
        { label: 'SITUATION_CENTER.DISCHARGE.SUMMARY.METRIC_AVG_FLOW', value: 'avg_flow_rate_m3_s' },
        { label: 'SITUATION_CENTER.DISCHARGE.SUMMARY.METRIC_GEN_LOSS', value: 'generation_loss_kwh' }
    ];

    ngOnInit(): void {
        this.load();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    load(): void {
        this.validationError = this.validate();
        if (this.validationError) {
            return;
        }
        this.loading = true;
        this.dischargeService
            .getSummary(this.from, this.to, this.granularity)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => this.buildView(res),
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('SITUATION_CENTER.DISCHARGE.SUMMARY.LOAD_FAILED')
                    });
                    this.loading = false;
                },
                complete: () => (this.loading = false)
            });
    }

    /** Mirrors the API's 400 constraints so invalid ranges never leave the client. */
    private validate(): string | null {
        if (!this.from || !this.to || this.from > this.to) {
            return 'SITUATION_CENTER.DISCHARGE.SUMMARY.ERR_FROM_AFTER_TO';
        }
        if (this.granularity === 'day' && this.inclusiveDays(this.from, this.to) > MAX_DAY_RANGE) {
            return 'SITUATION_CENTER.DISCHARGE.SUMMARY.ERR_RANGE_TOO_LONG';
        }
        return null;
    }

    private inclusiveDays(from: Date, to: Date): number {
        const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
        const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
        return Math.floor((b - a) / MS_PER_DAY) + 1;
    }

    /** Экспорт сводки в xlsx/pdf (всегда месячный, независимо от выбранной гранулярности). */
    export(format: 'excel' | 'pdf'): void {
        if (this.downloadingExport) {
            return;
        }
        const err = this.validateExport();
        if (err) {
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('COMMON.ERROR'),
                detail: this.translate.instant(err)
            });
            return;
        }
        this.downloadingExport = format;
        this.dischargeService
            .getSummaryExport(this.from, this.to, format)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    // Имя формируем на клиенте: сервер отдаёт filename в Content-Disposition
                    // как UTF-8 байты без RFC 5987, что превращается в mojibake при чтении.
                    const ext = format === 'pdf' ? 'pdf' : 'xlsx';
                    const filename = `Холостые-сбросы-сводка-${this.dateYMD(this.from)}_${this.dateYMD(this.to)}.${ext}`;
                    downloadBlob(res.body!, filename);
                    this.downloadingExport = null;
                },
                error: (e) => {
                    this.downloadingExport = null;
                    this.handleExportError(e);
                }
            });
    }

    /** Export-only limits: from<=to and at most 24 monthly buckets (edge months count whole). */
    private validateExport(): string | null {
        if (!this.from || !this.to || this.from > this.to) {
            return 'SITUATION_CENTER.DISCHARGE.SUMMARY.ERR_FROM_AFTER_TO';
        }
        const buckets = (this.to.getFullYear() * 12 + this.to.getMonth()) - (this.from.getFullYear() * 12 + this.from.getMonth()) + 1;
        if (buckets > MAX_EXPORT_MONTHS) {
            return 'SITUATION_CENTER.DISCHARGE.SUMMARY.ERR_EXPORT_TOO_LONG';
        }
        return null;
    }

    private async handleExportError(err: HttpErrorResponse): Promise<void> {
        let detail = this.translate.instant('SITUATION_CENTER.DISCHARGE.SUMMARY.EXPORT_FAILED');
        if (err.status === 400 && err.error instanceof Blob) {
            try {
                const body = JSON.parse(await err.error.text()) as { error?: string };
                if (body.error) detail = body.error;
            } catch { /* keep fallback */ }
        }
        this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('COMMON.ERROR'),
            detail
        });
    }

    private dateYMD(d: Date): string {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    private buildView(res: DischargeSummaryResponse): void {
        this.columns = res.grand_total.buckets.map((b) => b.period);
        this.grandTotal = res.grand_total;
        const rows: SummaryRow[] = [];
        for (const cascade of res.cascades) {
            rows.push({
                type: 'cascade',
                id: cascade.id,
                // Псевдокаскад станций без каскада приходит как {id: 0, name: ""}.
                name: cascade.id === 0 ? this.translate.instant('SITUATION_CENTER.DISCHARGE.SUMMARY.NO_CASCADE') : cascade.name,
                buckets: cascade.buckets,
                total: cascade.total
            });
            for (const hpp of cascade.hpps) {
                rows.push({ type: 'hpp', id: hpp.id, name: hpp.name, buckets: hpp.buckets, total: hpp.total });
            }
        }
        this.rows = rows;
    }

    /**
     * Значение активной метрики для ячейки. generation_loss_kwh приходит в кВт·ч —
     * переводим в тыс. кВт·ч (делим на 1000). Остальные метрики показываем как есть.
     */
    cellValue(metrics: SummaryMetrics): number {
        const raw = metrics[this.metric];
        return this.metric === 'generation_loss_kwh' ? raw / 1000 : raw;
    }
}
