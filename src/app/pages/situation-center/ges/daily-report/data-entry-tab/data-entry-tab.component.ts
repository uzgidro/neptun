import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { GesConfigResponse, GesDailyData } from '@/core/interfaces/ges-report';
import { HasUnsavedChanges } from '@/core/guards/auth.guard';

export class DataEntryRow {
    config: GesConfigResponse;
    form: FormGroup;
    saved: boolean;
    saving: boolean;

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
        InputTextModule
    ],
    templateUrl: './data-entry-tab.component.html'
})
export class DataEntryTabComponent implements OnInit, OnDestroy, HasUnsavedChanges {
    private gesReportService = inject(GesReportService);
    private timeService = inject(TimeService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    selectedDate: Date = new Date();
    rows: DataEntryRow[] = [];
    cascadeGroups: { cascade_id: number; cascade_name: string; rows: DataEntryRow[] }[] = [];
    loading = false;
    savingAll = false;

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadData(): void {
        this.loading = true;
        this.rows = [];

        this.gesReportService.getConfigs().pipe(takeUntil(this.destroy$)).subscribe({
            next: (configs) => {
                if (!configs.length) {
                    this.loading = false;
                    return;
                }

                const dateStr = this.timeService.dateToYMD(this.selectedDate);
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
                            return new DataEntryRow(config, form, data !== null);
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

    saveAll(): void {
        const dirtyRows = this.rows.filter(r => r.dirty);
        if (!dirtyRows.length) return;

        this.savingAll = true;
        const requests = dirtyRows.map(row =>
            this.gesReportService.upsertDailyData(this.buildPayload(row)).pipe(
                catchError(err => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: err.message
                    });
                    return of(null);
                })
            )
        );

        forkJoin(requests).pipe(takeUntil(this.destroy$)).subscribe({
            next: (results) => {
                results.forEach((result, i) => {
                    if (result !== null) {
                        dirtyRows[i].saved = true;
                        dirtyRows[i].form.markAsPristine();
                    }
                });
                this.savingAll = false;
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('COMMON.SUCCESS')
                });
            },
            error: () => {
                this.savingAll = false;
            }
        });
    }

    saveRow(row: DataEntryRow): void {
        row.saving = true;
        this.gesReportService.upsertDailyData(this.buildPayload(row)).pipe(
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
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('COMMON.ERROR'),
                    detail: err.message
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

    private buildCascadeGroups(): void {
        const map = new Map<number, { cascade_id: number; cascade_name: string; rows: DataEntryRow[] }>();
        for (const row of this.rows) {
            const id = row.config.cascade_id;
            if (!map.has(id)) {
                map.set(id, { cascade_id: id, cascade_name: row.config.cascade_name, rows: [] });
            }
            map.get(id)!.rows.push(row);
        }
        this.cascadeGroups = Array.from(map.values());
    }

    private createForm(data: GesDailyData | null): FormGroup {
        return this.fb.group({
            daily_production_mln_kwh: [data?.daily_production_mln_kwh ?? null],
            working_aggregates: [data?.working_aggregates ?? null],
            water_level_m: [data?.water_level_m ?? null],
            water_volume_mln_m3: [data?.water_volume_mln_m3 ?? null],
            water_head_m: [data?.water_head_m ?? null],
            reservoir_income_m3s: [data?.reservoir_income_m3s ?? null],
            total_outflow_m3s: [data?.total_outflow_m3s ?? null],
            ges_flow_m3s: [data?.ges_flow_m3s ?? null],
            temperature: [data?.temperature ?? null],
            weather_condition: [data?.weather_condition ?? null]
        });
    }

    private buildPayload(row: DataEntryRow) {
        const val = row.form.getRawValue();
        return {
            organization_id: row.config.organization_id,
            date: this.timeService.dateToYMD(this.selectedDate),
            ...val
        };
    }

}
