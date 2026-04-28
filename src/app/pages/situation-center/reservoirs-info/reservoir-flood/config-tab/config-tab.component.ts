import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { ReservoirFloodService } from '@/core/services/reservoir-flood.service';
import { OrganizationService } from '@/core/services/organization.service';
import { ReservoirFloodConfig, ReservoirFloodConfigPayload } from '@/core/interfaces/reservoir-flood';
import { Organization } from '@/core/interfaces/organizations';
import { GroupSelectComponent } from '@/layout/component/dialog/group-select/group-select.component';

@Component({
    selector: 'app-reservoir-flood-config-tab',
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
        TagModule,
        TranslateModule,
        GroupSelectComponent
    ],
    templateUrl: './config-tab.component.html'
})
export class ConfigTabComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private svc = inject(ReservoirFloodService);
    private organizationService = inject(OrganizationService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private fb = inject(FormBuilder);

    configs: ReservoirFloodConfig[] = [];
    organizations: Organization[] = [];
    organizationGroups: { name: string; items: Organization[] }[] = [];
    availableOrganizationGroups: { name: string; items: Organization[] }[] = [];
    orgsLoading = false;
    loading = false;
    saving = false;
    submitted = false;

    dialogVisible = false;
    isEditMode = false;
    editingConfig: ReservoirFloodConfig | null = null;

    form: FormGroup = this.fb.group({
        organization: [null as Organization | null, Validators.required],
        sort_order: [0, [Validators.min(0)]],
        is_active: [true]
    });

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
                this.organizationGroups = [{
                    name: this.translate.instant('SITUATION_CENTER.RESERVOIR_FLOOD.ORGANIZATION'),
                    items: orgs
                }];
                this.updateAvailableOrganizations();
            });
    }

    loadConfigs(): void {
        this.loading = true;
        this.svc.getConfigs()
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
        this.form.reset({
            organization: null,
            sort_order: 0,
            is_active: true
        });
        this.updateAvailableOrganizations();
        this.dialogVisible = true;
    }

    editConfig(cfg: ReservoirFloodConfig): void {
        this.isEditMode = true;
        this.editingConfig = cfg;
        this.submitted = false;
        const foundOrg = this.organizations.find(o => o.id === cfg.organization_id) ?? null;
        this.form.reset();
        this.form.patchValue({
            organization: foundOrg,
            sort_order: cfg.sort_order,
            is_active: cfg.is_active
        });
        this.updateAvailableOrganizations();
        this.dialogVisible = true;
    }

    saveConfig(): void {
        this.submitted = true;
        if (this.form.invalid) return;

        const formVal = this.form.value;
        if (!formVal.organization) return;

        const payload: ReservoirFloodConfigPayload = {
            organization_id: formVal.organization.id,
            sort_order: formVal.sort_order ?? 0,
            is_active: !!formVal.is_active
        };
        this.saving = true;

        this.svc.upsertConfig(payload)
            .pipe(takeUntil(this.destroy$), finalize(() => this.saving = false))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('SITUATION_CENTER.RESERVOIR_FLOOD.CONFIG_SAVED')
                    });
                    this.dialogVisible = false;
                    this.loadConfigs();
                },
                error: (err: HttpErrorResponse) => {
                    let detail = this.translate.instant('SITUATION_CENTER.RESERVOIR_FLOOD.ERROR_SAVE_FAILED');
                    if (err?.status === 403) {
                        detail = this.translate.instant('SITUATION_CENTER.RESERVOIR_FLOOD.ERROR_FORBIDDEN_ORG');
                    }
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail
                    });
                }
            });
    }

    deleteConfig(orgId: number): void {
        if (!confirm(this.translate.instant('SITUATION_CENTER.RESERVOIR_FLOOD.DELETE'))) return;

        this.svc.deleteConfig(orgId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('SITUATION_CENTER.RESERVOIR_FLOOD.CONFIG_DELETED')
                    });
                    this.loadConfigs();
                },
                error: (err: HttpErrorResponse) => {
                    if (err?.status === 404) {
                        this.messageService.add({
                            severity: 'warn',
                            summary: this.translate.instant('COMMON.WARNING'),
                            detail: this.translate.instant('SITUATION_CENTER.RESERVOIR_FLOOD.ALREADY_DELETED')
                        });
                        this.loadConfigs();
                        return;
                    }
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('SITUATION_CENTER.RESERVOIR_FLOOD.ERROR_DELETE_FAILED')
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
                name: this.translate.instant('SITUATION_CENTER.RESERVOIR_FLOOD.ORGANIZATION'),
                items: filtered
            }]
            : [];
    }
}
