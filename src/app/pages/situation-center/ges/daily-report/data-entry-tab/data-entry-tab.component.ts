import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, merge, of, Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { GesReportService } from '@/core/services/ges-report.service';
import { TimeService } from '@/core/services/time.service';
import { AuthService } from '@/core/services/auth.service';
import { GesConfigResponse, GesCascadeConfig, GesDailyData, GesDailyDataPayload, ReportIdleDischarge, ReportWeather } from '@/core/interfaces/ges-report';
import { HasUnsavedChanges } from '@/core/guards/auth.guard';
import { downloadBlob } from '@/core/utils/download';
import { CascadeWeatherComponent } from '../shared/cascade-weather.component';

export interface GesTotals {
    installedCapacity: number;
    totalAggregates: number;
    production: number;
    powerMwt: number;
    working: number;
    repair: number;
    mod: number;
    reserve: number;
}

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
        TooltipModule,
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
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private destroy$ = new Subject<void>();
    private rowsReset$ = new Subject<void>();

    selectedDate: Date = this.readDateFromUrl() ?? new Date();
    rows: DataEntryRow[] = [];
    cascadeGroups: { cascade_id: number; cascade_name: string; weather: ReportWeather | null; rows: DataEntryRow[] }[] = [];
    private cascadeWeatherMap = new Map<number, ReportWeather | null>();
    collapsedCascades = new Set<number>();
    loading = false;
    savingAll = false;
    canExport = this.authService.isScOrRais();
    downloading: 'excel' | 'pdf' | null = null;

    private formsTick = signal(0);
    readonly totals = computed<GesTotals>(() => this.calculateTotals(this.formsTick()));

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
        this.rowsReset$.next();
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
                            const cap = config.max_daily_production_mln_kwh ?? 0;
                            const form = this.createForm(data, cap);
                            const row = new DataEntryRow(config, form, data !== null);
                            row.idleDischarge = idleDischargeMap.get(config.organization_id) ?? null;
                            return row;
                        });
                        this.buildCascadeGroups();
                        for (const row of this.rows) {
                            row.form.valueChanges
                                .pipe(takeUntil(merge(this.destroy$, this.rowsReset$)))
                                .subscribe(() => this.formsTick.update(t => t + 1));

                            this.wireGesFlowAutoFill(row);
                        }
                        this.formsTick.update(t => t + 1);
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
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { date: this.timeService.dateToYMD(date) },
            queryParamsHandling: 'merge'
        });
        this.loadData();
    }

    private readDateFromUrl(): Date | null {
        const raw = this.route.snapshot.queryParamMap.get('date');
        if (!raw) return null;
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
        if (!m) return null;
        const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        return isNaN(d.getTime()) ? null : d;
    }

    sumAggregates(row: DataEntryRow): number {
        const v = (name: string) => Number(row.form.get(name)?.value ?? 0) || 0;
        return v('working_aggregates') + v('repair_aggregates') + v('modernization_aggregates');
    }

    sumExceedsTotal(row: DataEntryRow): boolean {
        return this.sumAggregates(row) > row.config.total_aggregates;
    }

    productionExceedsMax(row: DataEntryRow): boolean {
        const cap = row.config.max_daily_production_mln_kwh ?? 0;
        if (cap <= 0) return false;
        const value = Number(row.form.get('daily_production_mln_kwh')?.value ?? 0) || 0;
        return value > cap;
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

        if (dirtyRows.some(r => this.productionExceedsMax(r))) {
            this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('COMMON.ERROR'),
                detail: this.translate.instant('GES_REPORT.PRODUCTION_EXCEEDS_MAX_GENERIC')
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
                const msg = err?.error?.message ?? err?.error?.error ?? '';
                let detail: string;
                const capDetail = this.parseProductionCapError(msg);
                if (capDetail) {
                    detail = capDetail;
                } else if (typeof idx === 'number' && pairs[idx]) {
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
        if (this.productionExceedsMax(row)) {
            this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('COMMON.ERROR'),
                detail: this.translate.instant('GES_REPORT.PRODUCTION_EXCEEDS_MAX_GENERIC')
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
                const msg = err?.error?.message ?? err?.error?.error ?? '';
                const capDetail = this.parseProductionCapError(msg);
                const detail = capDetail
                    ? capDetail
                    : msg.includes('aggregates sum exceeds total')
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

    private parseProductionCapError(msg: unknown): string | null {
        if (typeof msg !== 'string') return null;
        if (!msg.includes('daily_production_mln_kwh exceeds max')) return null;
        const m = /organization_id=(\d+):\s*([\d.]+)\s*>\s*([\d.]+)/.exec(msg);
        if (!m) return null;
        const orgId = +m[1];
        const value = +m[2];
        const max = +m[3];
        const station = this.rows.find(r => r.config.organization_id === orgId);
        return this.translate.instant('GES_REPORT.PRODUCTION_EXCEEDS_MAX_SERVER', {
            station: station?.config.organization_name ?? `#${orgId}`,
            value,
            max
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

    private wireGesFlowAutoFill(row: DataEntryRow): void {
        const outflowCtrl = row.form.get('total_outflow_m3s');
        const gesFlowCtrl = row.form.get('ges_flow_m3s');
        if (!outflowCtrl || !gesFlowCtrl) return;

        let userTouched = false;

        gesFlowCtrl.valueChanges
            .pipe(takeUntil(merge(this.destroy$, this.rowsReset$)))
            .subscribe(() => { userTouched = true; });

        outflowCtrl.valueChanges
            .pipe(takeUntil(merge(this.destroy$, this.rowsReset$)))
            .subscribe((outflow: number | null) => {
                if (userTouched) return;
                const idle = row.idleDischarge?.flow_rate_m3s ?? 0;
                const computed = outflow != null ? outflow - idle : null;
                gesFlowCtrl.setValue(computed, { emitEvent: false });
                gesFlowCtrl.markAsDirty();
            });

        const initialOutflow = outflowCtrl.value;
        if (initialOutflow != null && gesFlowCtrl.value == null) {
            const idle = row.idleDischarge?.flow_rate_m3s ?? 0;
            gesFlowCtrl.setValue(initialOutflow - idle, { emitEvent: false });
            gesFlowCtrl.markAsPristine();
        }
    }

    private calculateTotals(_tick: number): GesTotals {
        let installedCapacity = 0, totalAggregates = 0;
        let production = 0, working = 0, repair = 0, mod = 0;

        for (const row of this.rows) {
            installedCapacity += row.config.installed_capacity_mwt || 0;
            totalAggregates += row.config.total_aggregates || 0;

            const v = row.form.value;
            production += Number(v.daily_production_mln_kwh ?? 0) || 0;
            working += Number(v.working_aggregates ?? 0) || 0;
            repair += Number(v.repair_aggregates ?? 0) || 0;
            mod += Number(v.modernization_aggregates ?? 0) || 0;
        }

        const reserve = Math.max(0, totalAggregates - working - repair - mod);
        const powerMwt = production * 1000 / 24;
        return {
            installedCapacity, totalAggregates, production, powerMwt,
            working, repair, mod, reserve
        };
    }

    private createForm(data: GesDailyData | null, cap: number): FormGroup {
        const productionValidators = cap > 0
            ? [Validators.min(0), Validators.max(cap)]
            : [Validators.min(0)];
        return this.fb.group({
            daily_production_mln_kwh: [data?.daily_production_mln_kwh ?? null, productionValidators],
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
