import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import {
    RESERVOIR_SUMMARY_CONFIG_SOURCE,
    ReservoirSummaryConfigSource
} from '@/core/services/reservoir-summary-config.source';
import { OrganizationService } from '@/core/services/organization.service';
import {
    ReservoirSummaryConfig,
    ReservoirSummaryConfigPayload,
    VolumeSource
} from '@/core/interfaces/reservoir-summary-config';
import { Organization } from '@/core/interfaces/organizations';
import { GroupSelectComponent } from '@/layout/component/dialog/group-select/group-select.component';

@Component({
    selector: 'app-reservoir-summary-config-tab',
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
        SelectModule,
        TagModule,
        TooltipModule,
        TranslateModule,
        GroupSelectComponent
    ],
    templateUrl: './config-tab.component.html'
})
export class ReservoirSummaryConfigTabComponent implements OnInit, OnDestroy {
    private static readonly MAX_CONFIGS = 8;

    private destroy$ = new Subject<void>();
    private src = inject<ReservoirSummaryConfigSource>(RESERVOIR_SUMMARY_CONFIG_SOURCE);
    private organizationService = inject(OrganizationService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private fb = inject(FormBuilder);

    configs: ReservoirSummaryConfig[] = [];
    organizations: Organization[] = [];
    availableOrganizationGroups: { name: string; items: Organization[] }[] = [];
    orgsLoading = false;
    loading = false;
    saving = false;
    submitted = false;

    dialogVisible = false;
    isEditMode = false;
    editingConfig: ReservoirSummaryConfig | null = null;

    form: FormGroup = this.fb.group({
        organization: [null as Organization | null, Validators.required],
        sort_order: [1, [Validators.required, Validators.min(1)]],
        include_in_total: [true],
        modsnow_enabled: [true],
        volume_source: ['static' as VolumeSource]
    });

    readonly volumeSourceOptions: { value: VolumeSource; label: string }[] = [
        { value: 'static', label: 'SITUATION_CENTER.RESERVOIRS_SUMMARY.VOLUME_SOURCE_STATIC' },
        { value: 'level_volume', label: 'SITUATION_CENTER.RESERVOIRS_SUMMARY.VOLUME_SOURCE_LEVEL' }
    ];

    get isAddDisabled(): boolean {
        return this.configs.length >= ReservoirSummaryConfigTabComponent.MAX_CONFIGS;
    }

    get capacityHint(): string {
        return this.isAddDisabled
            ? this.translate.instant('SITUATION_CENTER.RESERVOIRS_SUMMARY.CONFIG_CAPACITY_REACHED')
            : '';
    }

    ngOnInit(): void {
        this.loadOrganizations();
        this.loadConfigs();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadOrganizations(): void {
        this.orgsLoading = true;
        this.organizationService.getOrganizationsFlat()
            .pipe(takeUntil(this.destroy$), finalize(() => this.orgsLoading = false))
            .subscribe(orgs => {
                this.organizations = orgs;
                this.updateAvailableOrganizations();
            });
    }

    loadConfigs(): void {
        this.loading = true;
        this.src.getConfigs()
            .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
            .subscribe({
                next: (configs) => {
                    this.configs = (configs || []).slice().sort(
                        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
                    );
                    this.updateAvailableOrganizations();
                },
                error: () => {
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
        const nextSortOrder = this.configs.length
            ? Math.max(...this.configs.map(c => c.sort_order)) + 1
            : 1;
        this.form.reset({
            organization: null,
            sort_order: nextSortOrder,
            include_in_total: true,
            modsnow_enabled: true,
            volume_source: 'static'
        });
        this.updateAvailableOrganizations();
        this.dialogVisible = true;
    }

    editConfig(cfg: ReservoirSummaryConfig): void {
        this.isEditMode = true;
        this.editingConfig = cfg;
        this.submitted = false;
        const foundOrg = this.organizations.find(o => o.id === cfg.organization_id) ?? null;
        this.form.reset();
        this.form.patchValue({
            organization: foundOrg,
            sort_order: cfg.sort_order,
            include_in_total: cfg.include_in_total,
            modsnow_enabled: cfg.modsnow_enabled,
            volume_source: cfg.volume_source
        });
        this.updateAvailableOrganizations();
        this.dialogVisible = true;
    }

    saveConfig(): void {
        this.submitted = true;
        if (this.form.invalid) return;

        const formVal = this.form.value;
        if (!formVal.organization) return;

        const payload: ReservoirSummaryConfigPayload = {
            organization_id: formVal.organization.id,
            sort_order: formVal.sort_order ?? 0,
            include_in_total: !!formVal.include_in_total,
            modsnow_enabled: !!formVal.modsnow_enabled,
            volume_source: formVal.volume_source ?? 'static'
        };

        this.saving = true;
        this.src.upsertConfig(payload)
            .pipe(takeUntil(this.destroy$), finalize(() => this.saving = false))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('SITUATION_CENTER.RESERVOIRS_SUMMARY.CONFIG_SAVED')
                    });
                    this.dialogVisible = false;
                    this.loadConfigs();
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('SITUATION_CENTER.RESERVOIRS_SUMMARY.ERROR_SAVE_FAILED')
                    });
                }
            });
    }

    deleteConfig(orgId: number): void {
        if (!confirm(this.translate.instant('SITUATION_CENTER.RESERVOIRS_SUMMARY.DELETE'))) return;

        this.src.deleteConfig(orgId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('SITUATION_CENTER.RESERVOIRS_SUMMARY.CONFIG_DELETED')
                    });
                    this.loadConfigs();
                },
                error: (err: HttpErrorResponse) => {
                    if (err?.status === 404) {
                        this.messageService.add({
                            severity: 'warn',
                            summary: this.translate.instant('COMMON.WARNING'),
                            detail: this.translate.instant('SITUATION_CENTER.RESERVOIRS_SUMMARY.ALREADY_DELETED')
                        });
                        this.loadConfigs();
                        return;
                    }
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('SITUATION_CENTER.RESERVOIRS_SUMMARY.ERROR_DELETE_FAILED')
                    });
                }
            });
    }

    hideDialog(): void {
        this.dialogVisible = false;
        this.editingConfig = null;
    }

    private updateAvailableOrganizations(): void {
        const usedIds = new Set(this.configs.map(c => c.organization_id));
        const editingId = this.isEditMode ? this.editingConfig?.organization_id : null;

        const filtered = this.organizations.filter(
            org => !usedIds.has(org.id) || org.id === editingId
        );
        this.availableOrganizationGroups = filtered.length
            ? [{
                name: this.translate.instant('SITUATION_CENTER.RESERVOIRS_SUMMARY.ORGANIZATION'),
                items: filtered
            }]
            : [];
    }
}
