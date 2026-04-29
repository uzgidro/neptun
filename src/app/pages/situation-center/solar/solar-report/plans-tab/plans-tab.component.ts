import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@/core/services/auth.service';
import { SolarReportService } from '@/core/services/solar-report.service';
import { SolarConfig, SolarPlanPayload } from '@/core/interfaces/solar-report';

export interface PlanRow {
    config: SolarConfig;
    months: (number | null)[];
    original: (number | null)[];
    dirty: boolean[];
}

@Component({
    selector: 'app-solar-plans-tab',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        TableModule,
        InputNumberModule,
        ButtonModule
    ],
    templateUrl: './plans-tab.component.html',
    styles: [`
        :host ::ng-deep .cell-dirty {
            background: var(--p-highlight-bg, var(--surface-hover));
        }
    `]
})
export class PlansTabComponent implements OnInit, OnDestroy {
    private solarReportService = inject(SolarReportService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private authService = inject(AuthService);
    private destroy$ = new Subject<void>();

    isScOrRais = this.authService.isScOrRais();

    selectedYear: number = this.readYearFromUrl() ?? new Date().getFullYear();
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
            configs: this.solarReportService.getConfigs(),
            plans: this.solarReportService.getPlans(this.selectedYear)
        })
            .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
            .subscribe({
                next: ({ configs, plans }) => {
                    configs.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                    this.planRows = configs.map((config) => {
                        const months: (number | null)[] = Array(12).fill(null);
                        const original: (number | null)[] = Array(12).fill(null);
                        const dirty: boolean[] = Array(12).fill(false);

                        plans
                            .filter((p) => p.organization_id === config.organization_id)
                            .forEach((p) => {
                                const idx = p.month - 1;
                                months[idx] = p.plan_thousand_kwh ?? null;
                                original[idx] = p.plan_thousand_kwh ?? null;
                            });

                        return { config, months, original, dirty };
                    });
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('SOLAR_REPORT.LOAD_ERROR')
                    });
                }
            });
    }

    onYearChange(): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { year: this.selectedYear },
            queryParamsHandling: 'merge'
        });
        this.loadData();
    }

    private readYearFromUrl(): number | null {
        const raw = this.route.snapshot.queryParamMap.get('year');
        if (!raw) return null;
        const y = Number(raw);
        return Number.isInteger(y) && y >= 2020 && y <= 2100 ? y : null;
    }

    onMonthChange(row: PlanRow, monthIndex: number): void {
        row.dirty[monthIndex] = row.months[monthIndex] !== row.original[monthIndex];
    }

    get hasChanges(): boolean {
        return this.planRows.some((row) => row.dirty.some(Boolean));
    }

    savePlans(): void {
        const payload: SolarPlanPayload[] = [];

        for (const row of this.planRows) {
            for (let i = 0; i < 12; i++) {
                if (row.dirty[i]) {
                    payload.push({
                        organization_id: row.config.organization_id,
                        year: this.selectedYear,
                        month: i + 1,
                        plan_thousand_kwh: row.months[i] ?? 0
                    });
                }
            }
        }

        if (payload.length === 0) return;

        this.saving = true;
        this.solarReportService
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
                    const detail = err?.status === 403
                        ? this.translate.instant('SOLAR_REPORT.NO_ACCESS')
                        : this.translate.instant('SOLAR_REPORT.SAVE_ERROR');
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail
                    });
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
