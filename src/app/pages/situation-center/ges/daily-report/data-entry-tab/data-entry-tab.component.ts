import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { GesReportService } from '@/core/services/ges-report.service';
import { TimeService } from '@/core/services/time.service';
import { AuthService } from '@/core/services/auth.service';
import { GesConfigResponse, GesCascadeConfig, GesDailyData, GesDailyDataPayload, ReportIdleDischarge, ReportWeather } from '@/core/interfaces/ges-report';
import { HasUnsavedChanges } from '@/core/guards/auth.guard';
import { downloadBlob } from '@/core/utils/download';
import { CascadeWeatherComponent } from '../shared/cascade-weather.component';

export class DataEntryRow {
    config: GesConfigResponse;
    form: FormGroup;
    saved: boolean;
    saving: boolean;
    idleDischarge: ReportIdleDischarge | null = null;

    constructor(config: GesConfigResponse, form: FormGroup, saved: boolean) {
        this.config = config;
        this.form = form;
        this.saved = saved;
        this.saving = false;
    }

    get dirty(): boolean {
        return this.form.dirty;
    }

    set dirty(value: boolean) {
        if (!value) {
            this.form.markAsPristine();
        }
    }
}

@Component({
    selector: 'app-ges-data-entry-tab',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        DatePicker,
        TableModule,
        InputNumberModule,
        ButtonModule,
        TagModule,
        InputTextModule,
        CascadeWeatherComponent
    ],
    templateUrl: './data-entry-tab.component.html'
})
export class DataEntryTabComponent implements OnInit, OnDestroy, HasUnsavedChanges {
    private gesReportService = inject(GesReportService);
    private timeService = inject(TimeService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private authService = inject(AuthService);
    private destroy$ = new Subject<void>();

    selectedDate: Date = new Date();
    rows: DataEntryRow[] = [];
    cascadeGroups: { cascade_id: number; cascade_name: string; weather: ReportWeather | null; rows: DataEntryRow[] }[] = [];
    private cascadeWeatherMap = new Map<number, ReportWeather | null>();
    collapsedCascades = new Set<number>();
    loading = false;
    savingAll = false;
    canExport = this.authService.isScOrRais();
    downloading: 'excel' | 'pdf' | null = null;

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    download(format: 'excel' | 'pdf'): void {
        if (this.downloading) return;
        const date = this.timeService.dateToYMD(this.selectedDate);
        this.downloading = format;
        this.gesReportService.exportReport({ date, format }).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (response) => {
                const ext = format === 'pdf' ? 'pdf' : 'xlsx';
                const filename = this.parseFilename(response) ?? `GES-${date}.${ext}`;
                downloadBlob(response.body!, filename);
                this.downloading = null;
            },
            error: (err) => { this.downloading = null; this.handleExportError(err); }
        });
    }

    private async handleExportError(err: HttpErrorResponse): Promise<void> {
        let detail = this.translate.instant('ERRORS.BAD_REQUEST');
        if (err.status === 400 && err.error instanceof Blob) {
            try {
                const body = JSON.parse(await err.error.text()) as { message?: string };
                if (body.message) detail = body.message;
            } catch {
                /* keep fallback */
            }
        }
        this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('COMMON.ERROR'),
            detail
        });
    }

    private parseFilename(response: HttpResponse<Blob>): string | null {
        const cd = response.headers.get('Content-Disposition');
        const m = cd?.match(/filename="([^"]+)"/);
        return m ? m[1] : null;
    }

    loadData(): void {
        this.loading = true;
        this.rows = [];

        const dateStr = this.timeService.dateToYMD(this.selectedDate);

        forkJoin({
            configs: this.gesReportService.getConfigs(),
            cascadeConfigs: this.gesReportService.getCascadeConfigs().pipe(catchError(() => of([] as GesCascadeConfig[]))),
            report: this.gesReportService.getReport(dateStr).pipe(catchError(() => of(null)))
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: ({ configs, cascadeConfigs, report }) => {
                if (!configs.length) {
                    this.loading = false;
                    return;
                }

                const cascadeMap = new Map(cascadeConfigs.map(c => [c.organization_id, c]));
                configs.sort((a, b) => {
                    const aCO = cascadeMap.get(a.cascade_id)?.sort_order ?? 999;
                    const bCO = cascadeMap.get(b.cascade_id)?.sort_order ?? 999;
                    return aCO - bCO || (a.sort_order ?? 0) - (b.sort_order ?? 0);
                });

                const idleDischargeMap = new Map<number, ReportIdleDischarge | null>();
                this.cascadeWeatherMap.clear();
                if (report) {
                    for (const cascade of report.cascades) {
                        this.cascadeWeatherMap.set(cascade.cascade_id, cascade.weather);
                        for (const station of cascade.stations) {
                            idleDischargeMap.set(station.organization_id, station.idle_discharge);
                        }
                    }
                }

                const requests = configs.map(config =>
                    this.gesReportService.getDailyData(config.organization_id, dateStr).pipe(
                        catchError(() => of(null))
                    )
                );

                forkJoin(requests).pipe(takeUntil(this.destroy$)).subscribe({
                    next: (results) => {
                        this.rows = configs.map((config, i) => {
                            const data = results[i];
                            const form = this.createForm(data);
                            const row = new DataEntryRow(config, form, data !== null);
                            row.idleDischarge = idleDischargeMap.get(config.organization_id) ?? null;
                            return row;
                        });
                        this.buildCascadeGroups();
                        this.loading = false;
                    },
                    error: () => {
                        this.loading = false;
                    }
                });
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    onDateChange(date: Date): void {
        this.selectedDate = date;
        this.loadData();
    }

    sumAggregates(row: DataEntryRow): number {
        const v = (name: string) => Number(row.form.get(name)?.value ?? 0) || 0;
        return v('working_aggregates') + v('repair_aggregates') + v('modernization_aggregates');
    }

    sumExceedsTotal(row: DataEntryRow): boolean {
        return this.sumAggregates(row) > row.config.total_aggregates;
    }

    saveAll(): void {
        const dirtyRows = this.rows.filter(r => r.dirty);
        if (!dirtyRows.length) return;

        if (dirtyRows.some(r => this.sumExceedsTotal(r))) {
            this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('COMMON.ERROR'),
                detail: this.translate.instant('GES_REPORT.AGGREGATES_SUM_EXCEEDS_TOTAL')
            });
            return;
        }

        const pairs = dirtyRows
            .map(row => ({ row, payload: this.buildPayload(row) }))
            .filter(p => Object.keys(p.payload).length > 2);

        if (!pairs.length) {
            dirtyRows.forEach(r => r.form.markAsPristine());
            return;
        }

        this.savingAll = true;
        this.gesReportService.upsertDailyData(pairs.map(p => p.payload)).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: () => {
                pairs.forEach(p => {
                    p.row.saved = true;
                    p.row.form.markAsPristine();
                });
                this.savingAll = false;
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('COMMON.SUCCESS')
                });
            },
            // atomic rollback: do NOT mark any row pristine on error
            error: (err) => {
                this.savingAll = false;
                const idx = err?.error?.item_index;
                const msg = err?.error?.message ?? '';
                let detail: string;
                if (typeof idx === 'number' && pairs[idx]) {
                    detail = this.translate.instant('GES_REPORT.BATCH_FAILED_AT', {
                        station: pairs[idx].row.config.organization_name
                    });
                } else if (msg.includes('aggregates sum exceeds total')) {
                    detail = this.translate.instant('GES_REPORT.AGGREGATES_SUM_EXCEEDS_TOTAL');
                } else {
                    detail = msg || err?.message || '';
                }
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('COMMON.ERROR'),
                    detail
                });
            }
        });
    }

    saveRow(row: DataEntryRow): void {
        if (this.sumExceedsTotal(row)) {
            this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('COMMON.ERROR'),
                detail: this.translate.instant('GES_REPORT.AGGREGATES_SUM_EXCEEDS_TOTAL')
            });
            return;
        }
        const payload = this.buildPayload(row);
        if (Object.keys(payload).length <= 2) {
            row.form.markAsPristine();
            return;
        }
        row.saving = true;
        this.gesReportService.upsertDailyData([payload]).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: () => {
                row.saved = true;
                row.saving = false;
                row.form.markAsPristine();
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('COMMON.SUCCESS')
                });
            },
            error: (err) => {
                row.saving = false;
                const msg = err?.error?.message ?? '';
                const detail = msg.includes('aggregates sum exceeds total')
                    ? this.translate.instant('GES_REPORT.AGGREGATES_SUM_EXCEEDS_TOTAL')
                    : (msg || err?.message || '');
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('COMMON.ERROR'),
                    detail
                });
            }
        });
    }

    getStatus(row: DataEntryRow): 'saved' | 'modified' | 'empty' {
        if (row.dirty) return 'modified';
        if (row.saved) return 'saved';
        return 'empty';
    }

    getStatusSeverity(row: DataEntryRow): 'success' | 'warn' | 'secondary' {
        if (row.dirty) return 'warn';
        if (row.saved) return 'success';
        return 'secondary';
    }

    canDeactivate(): boolean {
        const hasDirty = this.rows.some(r => r.dirty);
        if (!hasDirty) return true;
        return confirm(this.translate.instant('GES_REPORT.UNSAVED_CHANGES'));
    }

    toggleCascade(cascadeId: number): void {
        if (this.collapsedCascades.has(cascadeId)) {
            this.collapsedCascades.delete(cascadeId);
        } else {
            this.collapsedCascades.add(cascadeId);
        }
    }

    private buildCascadeGroups(): void {
        const map = new Map<number, { cascade_id: number; cascade_name: string; weather: ReportWeather | null; rows: DataEntryRow[] }>();
        for (const row of this.rows) {
            const id = row.config.cascade_id;
            if (!map.has(id)) {
                map.set(id, {
                    cascade_id: id,
                    cascade_name: row.config.cascade_name,
                    weather: this.cascadeWeatherMap.get(id) ?? null,
                    rows: []
                });
            }
            map.get(id)!.rows.push(row);
        }
        this.cascadeGroups = Array.from(map.values());
    }

    private createForm(data: GesDailyData | null): FormGroup {
        return this.fb.group({
            daily_production_mln_kwh: [data?.daily_production_mln_kwh ?? null],
            working_aggregates: [data?.working_aggregates ?? null],
            repair_aggregates: [data?.repair_aggregates ?? null],
            modernization_aggregates: [data?.modernization_aggregates ?? null],
            water_level_m: [data?.water_level_m ?? null],
            water_volume_mln_m3: [data?.water_volume_mln_m3 ?? null],
            water_head_m: [data?.water_head_m ?? null],
            reservoir_income_m3s: [data?.reservoir_income_m3s ?? null],
            total_outflow_m3s: [data?.total_outflow_m3s ?? null],
            ges_flow_m3s: [data?.ges_flow_m3s ?? null]
        });
    }

    private buildPayload(row: DataEntryRow): GesDailyDataPayload {
        const payload: GesDailyDataPayload = {
            organization_id: row.config.organization_id,
            date: this.timeService.dateToYMD(this.selectedDate)
        };
        const fields: (keyof GesDailyDataPayload)[] = [
            'daily_production_mln_kwh',
            'working_aggregates',
            'repair_aggregates',
            'modernization_aggregates',
            'water_level_m',
            'water_volume_mln_m3',
            'water_head_m',
            'reservoir_income_m3s',
            'total_outflow_m3s',
            'ges_flow_m3s'
        ];
        for (const f of fields) {
            const ctrl = row.form.get(f);
            if (ctrl?.dirty) {
                Object.assign(payload, { [f]: ctrl.value });
            }
        }
        return payload;
    }

}
