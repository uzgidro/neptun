import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { GesReportService } from '@/core/services/ges-report.service';
import { OrganizationService } from '@/core/services/organization.service';
import { GesConfigPayload, GesConfigResponse } from '@/core/interfaces/ges-report';
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
        CheckboxModule,
        TranslateModule,
        GroupSelectComponent
    ],
    templateUrl: './config-tab.component.html'
})
export class ConfigTabComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private gesReportService = inject(GesReportService);
    private organizationService = inject(OrganizationService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private fb = inject(FormBuilder);

    configs: GesConfigResponse[] = [];
    cascades: Organization[] = [];
    orgsLoading = false;
    loading = false;
    saving = false;
    submitted = false;

    dialogVisible = false;
    isEditMode = false;
    editingConfig: GesConfigResponse | null = null;

    form: FormGroup = this.fb.group({
        organization: [null as Organization | null, Validators.required],
        installed_capacity_mwt: [null],
        total_aggregates: [null],
        has_reservoir: [false],
        sort_order: [null]
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
            .subscribe(cascades => this.cascades = cascades);
    }

    loadConfigs(): void {
        this.loading = true;
        this.gesReportService.getConfigs()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading = false)
            )
            .subscribe({
                next: (configs) => {
                    this.configs = configs;
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

    openNew(): void {
        this.isEditMode = false;
        this.editingConfig = null;
        this.submitted = false;
        this.form.reset({ has_reservoir: false });
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
            sort_order: config.sort_order
        });
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
            sort_order: formVal.sort_order
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
                    this.loadConfigs();
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
                    this.loadConfigs();
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

    get availableCascades(): Organization[] {
        const usedIds = new Set(this.configs.map(c => c.organization_id));
        const editingId = this.isEditMode ? this.editingConfig?.organization_id : null;

        return this.cascades
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
