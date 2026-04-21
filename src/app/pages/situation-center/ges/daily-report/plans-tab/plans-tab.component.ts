import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { GesReportService } from '@/core/services/ges-report.service';
import { GesConfigResponse, GesCascadeConfig, GesProductionPlanPayload } from '@/core/interfaces/ges-report';

export interface PlanRow {
    config: GesConfigResponse;
    months: (number | null)[];
    original: (number | null)[];
    dirty: boolean[];
}

export type PlanItem =
    | { type: 'header'; cascade_name: string }
    | { type: 'row'; row: PlanRow };

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
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private destroy$ = new Subject<void>();

    selectedYear: number = this.readYearFromUrl() ?? new Date().getFullYear();
    planRows: PlanRow[] = [];
    planItems: PlanItem[] = [];
    collapsedCascades = new Set<string>();
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
            cascadeConfigs: this.gesReportService.getCascadeConfigs().pipe(catchError(() => of([] as GesCascadeConfig[]))),
            plans: this.gesReportService.getPlans(this.selectedYear)
        })
            .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
            .subscribe({
                next: ({ configs, cascadeConfigs, plans }) => {
                    const cascadeMap = new Map(cascadeConfigs.map(c => [c.organization_id, c]));
                    configs.sort((a, b) => {
                        const aCO = cascadeMap.get(a.cascade_id)?.sort_order ?? 999;
                        const bCO = cascadeMap.get(b.cascade_id)?.sort_order ?? 999;
                        return aCO - bCO || (a.sort_order ?? 0) - (b.sort_order ?? 0);
                    });
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
                    this.buildPlanItems();
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

    toggleCascade(cascadeName: string): void {
        if (this.collapsedCascades.has(cascadeName)) {
            this.collapsedCascades.delete(cascadeName);
        } else {
            this.collapsedCascades.add(cascadeName);
        }
    }

    private buildPlanItems(): void {
        const items: PlanItem[] = [];
        let currentCascade = '';
        for (const row of this.planRows) {
            if (row.config.cascade_name !== currentCascade) {
                currentCascade = row.config.cascade_name;
                items.push({ type: 'header', cascade_name: currentCascade });
            }
            items.push({ type: 'row', row });
        }
        this.planItems = items;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
