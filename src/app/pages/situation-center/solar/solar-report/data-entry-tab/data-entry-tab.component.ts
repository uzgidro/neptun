import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { SolarReportService } from '@/core/services/solar-report.service';
import { SolarConfig, SolarDailyData, SolarDailyDataPayload } from '@/core/interfaces/solar-report';

export interface DataEntryRow {
    config: SolarConfig;
    form: FormGroup;
    saving: boolean;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

@Component({
    selector: 'app-solar-data-entry-tab',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputNumberModule,
        DatePickerModule,
        TagModule,
        ProgressSpinnerModule,
        TranslateModule
    ],
    templateUrl: './data-entry-tab.component.html'
})
export class DataEntryTabComponent implements OnInit, OnDestroy {
    private solarService = inject(SolarReportService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private fb = inject(FormBuilder);
    private destroy$ = new Subject<void>();

    selectedDate: Date = new Date();
    rows: DataEntryRow[] = [];
    loading = false;

    ngOnInit(): void {
        this.loadData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadData(): void {
        this.loading = true;
        const dateStr = this.toIsoDate(this.selectedDate);

        forkJoin({
            configs: this.solarService.getConfigs(),
            data: this.solarService.getDailyData(dateStr)
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: ({ configs, data }) => {
                const sortedConfigs = [...configs].sort(
                    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
                );
                const dataMap = new Map<number, SolarDailyData>();
                for (const item of data) {
                    dataMap.set(item.organization_id, item);
                }
                this.rows = sortedConfigs.map(config =>
                    this.createRow(config, dataMap.get(config.organization_id) ?? null)
                );
                this.loading = false;
            },
            error: () => {
                this.rows = [];
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('COMMON.ERROR'),
                    detail: this.translate.instant('SOLAR_REPORT.LOAD_ERROR')
                });
            }
        });
    }

    onDateChange(): void {
        this.loadData();
    }

    onFieldBlur(row: DataEntryRow): void {
        if (!row.form.dirty) return;          // pristine — не сохраняем
        if (row.form.invalid) return;         // SECURITY: invalid — НЕ отправляем (defence-in-depth поверх backend CHECK ≥ 0)
        if (row.saving) return;               // SECURITY: guard от двойных запросов (auto-save может выстрелить blur дважды)
        this.saveRow(row);
    }

    saveRow(row: DataEntryRow): void {
        row.saving = true;
        row.saveStatus = 'saving';

        const payload = this.buildPayload(row);
        // Если только {organization_id, date} — нет dirty полей, защита от пустого batch.
        if (Object.keys(payload).length <= 2) {
            row.saving = false;
            row.saveStatus = 'idle';
            return;
        }

        this.solarService.upsertDailyData([payload]).pipe(
            takeUntil(this.destroy$),
            finalize(() => { row.saving = false; })
        ).subscribe({
            next: () => {
                row.form.markAsPristine();
                row.saveStatus = 'saved';
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('COMMON.SUCCESS'),
                    detail: this.translate.instant('SOLAR_REPORT.SAVED')
                });
            },
            error: (err: HttpErrorResponse) => {
                row.saveStatus = 'error';
                // SECURITY: НЕ markAsPristine на ошибке — сохраняем dirty state, чтобы юзер не потерял ввод.
                if (err?.status === 403) {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('SOLAR_REPORT.NO_ACCESS')
                    });
                    return;
                }
                // SECURITY: не leakим raw stack trace — только err.error?.error строкой если есть.
                const serverMsg = (err?.error && typeof err.error === 'object') ? err.error.error : null;
                const baseDetail = this.translate.instant('SOLAR_REPORT.SAVE_ERROR');
                const detail = serverMsg ? `${baseDetail}: ${serverMsg}` : baseDetail;
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('COMMON.ERROR'),
                    detail
                });
            }
        });
    }

    private createRow(config: SolarConfig, data: SolarDailyData | null): DataEntryRow {
        const form = this.fb.group({
            generation_kwh: [data?.generation_kwh ?? null, [Validators.min(0)]],
            grid_export_kwh: [data?.grid_export_kwh ?? null, [Validators.min(0)]]
        });
        return {
            config,
            form,
            saving: false,
            saveStatus: 'idle'
        };
    }

    private buildPayload(row: DataEntryRow): SolarDailyDataPayload {
        const payload: SolarDailyDataPayload = {
            // SECURITY: organization_id берётся из row.config (server-supplied), а НЕ из form,
            // чтобы юзер через DevTools не смог подменить org_id и записать в чужую org.
            organization_id: row.config.organization_id,
            // SECURITY: date — единая из toolbar selectedDate, а не из form, гарантирует консистентность batch.
            date: this.toIsoDate(this.selectedDate)
        };
        const fields: (keyof SolarDailyDataPayload)[] = ['generation_kwh', 'grid_export_kwh'];
        for (const f of fields) {
            const ctrl = row.form.get(f as string);
            // Optional-семантика: omit когда не dirty, чтобы preserve в БД и не затереть коллегины поля.
            if (ctrl?.dirty) {
                (payload as unknown as Record<string, unknown>)[f as string] = ctrl.value;
            }
        }
        return payload;
    }

    private toIsoDate(d: Date): string {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
}
