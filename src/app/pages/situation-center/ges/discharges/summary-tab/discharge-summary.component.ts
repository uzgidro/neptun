import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { DischargeService } from '@/core/services/discharge.service';
import { DischargeSummaryResponse, SummaryBucket, SummaryGranularity, SummaryGrandTotal, SummaryMetrics } from '@/core/interfaces/discharge';

export type MetricKey = 'volume_mln_m3' | 'avg_flow_rate_m3_s' | 'generation_loss_mwh';

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

@Component({
    selector: 'app-discharge-summary',
    imports: [DecimalPipe, FormsModule, TranslateModule, TableModule, Button, DatePicker, Select, SelectButton],
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

    granularityOptions: LabeledOption<SummaryGranularity>[] = [];
    metricOptions: LabeledOption<MetricKey>[] = [];

    ngOnInit(): void {
        this.granularityOptions = [
            { label: this.translate.instant('SITUATION_CENTER.DISCHARGE.SUMMARY.GRANULARITY_DAY'), value: 'day' },
            { label: this.translate.instant('SITUATION_CENTER.DISCHARGE.SUMMARY.GRANULARITY_MONTH'), value: 'month' },
            { label: this.translate.instant('SITUATION_CENTER.DISCHARGE.SUMMARY.GRANULARITY_YEAR'), value: 'year' }
        ];
        this.metricOptions = [
            { label: this.translate.instant('SITUATION_CENTER.DISCHARGE.SUMMARY.METRIC_VOLUME'), value: 'volume_mln_m3' },
            { label: this.translate.instant('SITUATION_CENTER.DISCHARGE.SUMMARY.METRIC_AVG_FLOW'), value: 'avg_flow_rate_m3_s' },
            { label: this.translate.instant('SITUATION_CENTER.DISCHARGE.SUMMARY.METRIC_GEN_LOSS'), value: 'generation_loss_mwh' }
        ];
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
}
