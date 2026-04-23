import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { GesReportService } from '@/core/services/ges-report.service';
import { WeatherService } from '@/core/services/weather.service';
import { OrganizationService } from '@/core/services/organization.service';
import { GesConfigPayload, GesConfigResponse, GesCascadeConfig, GesCascadeConfigPayload } from '@/core/interfaces/ges-report';
import { Organization } from '@/core/interfaces/organizations';
import { GroupSelectComponent } from '@/layout/component/dialog/group-select/group-select.component';

@Component({
    selector: 'app-ges-config-tab',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputNumberModule,
        InputTextModule,
        CheckboxModule,
        TranslateModule,
        GroupSelectComponent
    ],
    templateUrl: './config-tab.component.html'
})
export class ConfigTabComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private gesReportService = inject(GesReportService);
    private weatherService = inject(WeatherService);
    private organizationService = inject(OrganizationService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private fb = inject(FormBuilder);

    configs: GesConfigResponse[] = [];
    configItems: ({ type: 'header'; cascade_id: number; cascade_name: string } | { type: 'row'; config: GesConfigResponse })[] = [];
    cascades: Organization[] = [];
    availableCascades: Organization[] = [];
    orgsLoading = false;
    loading = false;
    saving = false;
    submitted = false;

    cascadeConfigMap = new Map<number, GesCascadeConfig>();
    weatherMap = new Map<number, { temperature: number; condition: string | null }>();

    collapsedCascades = new Set<string>();

    dialogVisible = false;
    isEditMode = false;
    editingConfig: GesConfigResponse | null = null;

    form: FormGroup = this.fb.group({
        organization: [null as Organization | null, Validators.required],
        installed_capacity_mwt: [null],
        total_aggregates: [null],
        has_reservoir: [false],
        sort_order: [null],
        max_daily_production_mln_kwh: [0, [Validators.min(0)]]
    });

    cascadeDialogVisible = false;
    editingCascadeId: number | null = null;
    cascadeSaving = false;
    cascadeForm: FormGroup = this.fb.group({
        latitude: [null, Validators.required],
        longitude: [null, Validators.required],
        sort_order: [null]
    });

    ngOnInit(): void {
        this.loadCascades();
        this.loadAllData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadCascades(): void {
        this.orgsLoading = true;
        this.organizationService.getCascades()
            .pipe(takeUntil(this.destroy$), finalize(() => this.orgsLoading = false))
            .subscribe(cascades => { this.cascades = cascades; this.updateAvailableCascades(); });
    }

    loadAllData(): void {
        this.loading = true;
        forkJoin({
            configs: this.gesReportService.getConfigs(),
            cascadeConfigs: this.gesReportService.getCascadeConfigs().pipe(catchError(() => of([] as GesCascadeConfig[])))
        })
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading = false)
            )
            .subscribe({
                next: ({ configs, cascadeConfigs }) => {
                    this.cascadeConfigMap = new Map(cascadeConfigs.map(c => [c.organization_id, c]));
                    this.configs = this.sortByCascade(configs);
                    this.buildConfigItems();
                    this.updateAvailableCascades();
                    this.loadAllWeather();
                },
                error: (err) => {
                    console.error(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('COMMON.LOAD_ERROR')
                    });
                }
            });
    }

    private buildConfigItems(): void {
        const items: typeof this.configItems = [];
        let currentCascade = -1;
        for (const config of this.configs) {
            if (config.cascade_id !== currentCascade) {
                currentCascade = config.cascade_id;
                items.push({ type: 'header', cascade_id: config.cascade_id, cascade_name: config.cascade_name });
            }
            items.push({ type: 'row', config });
        }
        this.configItems = items;
    }

    private sortByCascade(configs: GesConfigResponse[]): GesConfigResponse[] {
        return configs.sort((a, b) => {
            const aCascadeOrder = this.cascadeConfigMap.get(a.cascade_id)?.sort_order ?? 999;
            const bCascadeOrder = this.cascadeConfigMap.get(b.cascade_id)?.sort_order ?? 999;
            return aCascadeOrder - bCascadeOrder || (a.sort_order ?? 0) - (b.sort_order ?? 0);
        });
    }

    openNew(): void {
        this.isEditMode = false;
        this.editingConfig = null;
        this.submitted = false;
        this.form.reset({ has_reservoir: false });
        this.updateAvailableCascades();
        this.dialogVisible = true;
    }

    editConfig(config: GesConfigResponse): void {
        this.isEditMode = true;
        this.editingConfig = config;
        this.submitted = false;
        this.form.reset();

        // Find the org object in cascades to set GroupSelect value
        let foundOrg: Organization | null = null;
        for (const cascade of this.cascades) {
            foundOrg = cascade.items?.find(o => o.id === config.organization_id) ?? null;
            if (foundOrg) break;
        }

        this.form.patchValue({
            organization: foundOrg,
            installed_capacity_mwt: config.installed_capacity_mwt,
            total_aggregates: config.total_aggregates,
            has_reservoir: config.has_reservoir,
            sort_order: config.sort_order,
            max_daily_production_mln_kwh: config.max_daily_production_mln_kwh ?? 0
        });
        this.updateAvailableCascades();
        this.dialogVisible = true;
    }

    saveConfig(): void {
        this.submitted = true;
        if (this.form.invalid) return;

        const formVal = this.form.value;
        const payload: GesConfigPayload = {
            organization_id: formVal.organization.id,
            installed_capacity_mwt: formVal.installed_capacity_mwt,
            total_aggregates: formVal.total_aggregates,
            has_reservoir: formVal.has_reservoir,
            sort_order: formVal.sort_order,
            max_daily_production_mln_kwh: formVal.max_daily_production_mln_kwh ?? 0
        };
        this.saving = true;

        this.gesReportService.upsertConfig(payload)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.saving = false)
            )
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('GES_REPORT.SAVED')
                    });
                    this.dialogVisible = false;
                    this.loadAllData();
                },
                error: (err) => {
                    console.error(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('GES_REPORT.SAVE_ERROR')
                    });
                }
            });
    }

    deleteConfig(orgId: number): void {
        if (!confirm(this.translate.instant('GES_REPORT.DELETE_CONFIRM'))) return;

        this.gesReportService.deleteConfig(orgId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('GES_REPORT.DELETED')
                    });
                    this.loadAllData();
                },
                error: (err) => {
                    console.error(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('GES_REPORT.DELETE_ERROR')
                    });
                }
            });
    }

    private updateAvailableCascades(): void {
        const usedIds = new Set(this.configs.map(c => c.organization_id));
        const editingId = this.isEditMode ? this.editingConfig?.organization_id : null;

        this.availableCascades = this.cascades
            .map(cascade => {
                const filtered = (cascade.items || []).filter(
                    org => !usedIds.has(org.id) || org.id === editingId
                );
                return filtered.length ? { ...cascade, items: filtered } : null;
            })
            .filter((c): c is Organization & { items: Organization[] } => c !== null);
    }

    toggleCascade(cascadeName: string): void {
        if (this.collapsedCascades.has(cascadeName)) {
            this.collapsedCascades.delete(cascadeName);
        } else {
            this.collapsedCascades.add(cascadeName);
        }
    }

    hideDialog(): void {
        this.dialogVisible = false;
        this.editingConfig = null;
    }

    // --- Cascade Config ---

    editCascadeConfig(cascadeId: number): void {
        this.editingCascadeId = cascadeId;
        const existing = this.cascadeConfigMap.get(cascadeId);
        this.cascadeForm.reset({
            latitude: existing?.latitude ?? null,
            longitude: existing?.longitude ?? null,
            sort_order: existing?.sort_order ?? null
        });
        this.cascadeDialogVisible = true;
    }

    saveCascadeConfig(): void {
        if (this.cascadeForm.invalid || !this.editingCascadeId) return;

        const val = this.cascadeForm.value;
        const payload: GesCascadeConfigPayload = {
            organization_id: this.editingCascadeId,
            latitude: val.latitude,
            longitude: val.longitude,
            sort_order: val.sort_order
        };

        this.cascadeSaving = true;
        this.gesReportService.upsertCascadeConfig(payload)
            .pipe(takeUntil(this.destroy$), finalize(() => this.cascadeSaving = false))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS')
                    });
                    this.hideCascadeDialog();
                    this.loadAllData();
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR')
                    });
                }
            });
    }

    deleteCascadeConfig(cascadeId: number): void {
        if (!confirm(this.translate.instant('GES_REPORT.DELETE_CONFIRM'))) return;

        this.gesReportService.deleteCascadeConfig(cascadeId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS')
                    });
                    this.hideCascadeDialog();
                    this.loadAllData();
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR')
                    });
                }
            });
    }

    hideCascadeDialog(): void {
        this.cascadeDialogVisible = false;
        this.editingCascadeId = null;
    }

    // --- Weather ---

    private loadAllWeather(): void {
        const entries = Array.from(this.cascadeConfigMap.entries());
        if (!entries.length) return;

        const requests = entries.map(([id, cc]) =>
            this.weatherService.getWeatherByCoords(cc.latitude, cc.longitude).pipe(
                catchError(() => [null])
            )
        );

        forkJoin(requests).pipe(takeUntil(this.destroy$)).subscribe(results => {
            this.weatherMap = new Map();
            results.forEach((weather: any, i) => {
                if (weather?.main) {
                    this.weatherMap.set(entries[i][0], {
                        temperature: Math.round(weather.main.temp),
                        condition: weather.weather?.[0]?.description ?? null
                    });
                }
            });
        });
    }
}
