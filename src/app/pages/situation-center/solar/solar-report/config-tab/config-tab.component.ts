import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { AuthService } from '@/core/services/auth.service';
import { SolarReportService } from '@/core/services/solar-report.service';
import { OrganizationService } from '@/core/services/organization.service';
import { SolarConfig, SolarConfigPayload } from '@/core/interfaces/solar-report';
import { Organization } from '@/core/interfaces/organizations';
import { GroupSelectComponent } from '@/layout/component/dialog/group-select/group-select.component';

@Component({
    selector: 'app-solar-config-tab',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        InputNumberModule,
        TranslateModule,
        GroupSelectComponent
    ],
    templateUrl: './config-tab.component.html'
})
export class ConfigTabComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private solarReportService = inject(SolarReportService);
    private organizationService = inject(OrganizationService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private authService = inject(AuthService);
    private fb = inject(FormBuilder);

    isScOrRais = this.authService.isScOrRais();

    configs: SolarConfig[] = [];
    cascades: Organization[] = [];
    availableCascades: Organization[] = [];
    orgsLoading = false;
    loading = false;
    saving = false;
    submitted = false;

    dialogVisible = false;
    isEditMode = false;
    editingConfig: SolarConfig | null = null;

    form: FormGroup = this.fb.group({
        organization: [null as Organization | null, Validators.required],
        installed_capacity_kw: [null, [Validators.min(0)]],
        sort_order: [0, [Validators.min(0)]]
    });

    ngOnInit(): void {
        this.loadCascades();
        this.loadConfigs();
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

    loadConfigs(): void {
        this.loading = true;
        forkJoin({
            configs: this.solarReportService.getConfigs()
        })
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading = false)
            )
            .subscribe({
                next: ({ configs }) => {
                    this.configs = configs.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                    this.updateAvailableCascades();
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

    openNew(): void {
        this.isEditMode = false;
        this.editingConfig = null;
        this.submitted = false;
        this.form.reset({ sort_order: 0 });
        this.updateAvailableCascades();
        this.dialogVisible = true;
    }

    editConfig(config: SolarConfig): void {
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
            installed_capacity_kw: config.installed_capacity_kw,
            sort_order: config.sort_order
        });
        this.updateAvailableCascades();
        this.dialogVisible = true;
    }

    saveConfig(): void {
        this.submitted = true;
        if (this.form.invalid) return;

        const formVal = this.form.value;
        const payload: SolarConfigPayload = {
            organization_id: formVal.organization.id,
            installed_capacity_kw: formVal.installed_capacity_kw ?? 0,
            sort_order: formVal.sort_order ?? 0
        };
        this.saving = true;

        this.solarReportService.upsertConfig(payload)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.saving = false)
            )
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('SOLAR_REPORT.SAVED')
                    });
                    this.dialogVisible = false;
                    this.loadConfigs();
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('SOLAR_REPORT.SAVE_ERROR')
                    });
                }
            });
    }

    deleteConfig(orgId: number): void {
        if (!confirm(this.translate.instant('SOLAR_REPORT.DELETE_CONFIRM'))) return;

        this.solarReportService.deleteConfig(orgId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('SOLAR_REPORT.DELETED')
                    });
                    this.loadConfigs();
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('SOLAR_REPORT.DELETE_ERROR')
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

    hideDialog(): void {
        this.dialogVisible = false;
        this.editingConfig = null;
    }
}
