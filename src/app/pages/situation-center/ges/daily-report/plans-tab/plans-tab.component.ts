import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { GesReportService } from '@/core/services/ges-report.service';
import { GesConfigResponse, GesProductionPlanPayload } from '@/core/interfaces/ges-report';

export interface PlanRow {
    config: GesConfigResponse;
    months: (number | null)[];
    original: (number | null)[];
    dirty: boolean[];
}

@Component({
    selector: 'app-ges-plans-tab',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        TableModule,
        InputNumberModule,
        ButtonModule
    ],
    templateUrl: './plans-tab.component.html'
})
export class PlansTabComponent implements OnInit, OnDestroy {
    private gesReportService = inject(GesReportService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    selectedYear: number = new Date().getFullYear();
    planRows: PlanRow[] = [];
    loading = false;
    saving = false;

    readonly monthKeys: string[] = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        forkJoin({
            configs: this.gesReportService.getConfigs(),
            plans: this.gesReportService.getPlans(this.selectedYear)
        })
            .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
            .subscribe({
                next: ({ configs, plans }) => {
                    this.planRows = configs.map((config) => {
                        const months: (number | null)[] = Array(12).fill(null);
                        const original: (number | null)[] = Array(12).fill(null);
                        const dirty: boolean[] = Array(12).fill(false);

                        plans
                            .filter((p) => p.organization_id === config.organization_id)
                            .forEach((p) => {
                                const idx = p.month - 1;
                                months[idx] = p.plan_mln_kwh ?? null;
                                original[idx] = p.plan_mln_kwh ?? null;
                            });

                        return { config, months, original, dirty };
                    });
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: err.message
                    });
                }
            });
    }

    onYearChange(): void {
        this.loadData();
    }

    onMonthChange(row: PlanRow, monthIndex: number): void {
        row.dirty[monthIndex] = row.months[monthIndex] !== row.original[monthIndex];
    }

    get hasChanges(): boolean {
        return this.planRows.some((row) => row.dirty.some(Boolean));
    }

    savePlans(): void {
        const payload: GesProductionPlanPayload[] = [];

        for (const row of this.planRows) {
            for (let i = 0; i < 12; i++) {
                if (row.dirty[i]) {
                    payload.push({
                        organization_id: row.config.organization_id,
                        year: this.selectedYear,
                        month: i + 1,
                        plan_mln_kwh: row.months[i] ?? undefined
                    });
                }
            }
        }

        if (payload.length === 0) return;

        this.saving = true;
        this.gesReportService
            .bulkUpsertPlans(payload)
            .pipe(takeUntil(this.destroy$), finalize(() => this.saving = false))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS')
                    });
                    // sync original and clear dirty
                    for (const row of this.planRows) {
                        for (let i = 0; i < 12; i++) {
                            if (row.dirty[i]) {
                                row.original[i] = row.months[i];
                                row.dirty[i] = false;
                            }
                        }
                    }
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: err.message
                    });
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
