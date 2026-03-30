import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { GesReportService } from '@/core/services/ges-report.service';
import { OrganizationService } from '@/core/services/organization.service';
import { GesConfigPayload, GesConfigResponse } from '@/core/interfaces/ges-report';
import { Organization } from '@/core/interfaces/organizations';

@Component({
    selector: 'app-ges-config-tab',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        DialogModule,
        SelectModule,
        InputNumberModule,
        CheckboxModule,
        TranslateModule
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
    organizations: Organization[] = [];
    loading = false;
    saving = false;

    dialogVisible = false;
    isEditMode = false;
    editingConfig: GesConfigResponse | null = null;

    form: FormGroup = this.fb.group({
        organization_id: [null, Validators.required],
        installed_capacity_mwt: [null],
        total_aggregates: [null],
        has_reservoir: [false],
        sort_order: [null]
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
        this.organizationService.getOrganizationsFlat()
            .pipe(takeUntil(this.destroy$))
            .subscribe(orgs => {
                this.organizations = orgs;
            });
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
        this.form.reset({ has_reservoir: false });
        this.dialogVisible = true;
    }

    editConfig(config: GesConfigResponse): void {
        this.isEditMode = true;
        this.editingConfig = config;
        this.form.reset();
        this.form.patchValue({
            organization_id: config.organization_id,
            installed_capacity_mwt: config.installed_capacity_mwt,
            total_aggregates: config.total_aggregates,
            has_reservoir: config.has_reservoir,
            sort_order: config.sort_order
        });
        this.dialogVisible = true;
    }

    saveConfig(): void {
        if (this.form.invalid) return;

        const payload: GesConfigPayload = this.form.value;
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
                        detail: this.translate.instant('COMMON.SAVE_SUCCESS')
                    });
                    this.dialogVisible = false;
                    this.loadConfigs();
                },
                error: (err) => {
                    console.error(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('COMMON.SAVE_ERROR')
                    });
                }
            });
    }

    deleteConfig(orgId: number): void {
        if (!confirm(this.translate.instant('COMMON.DELETE_CONFIRM'))) return;

        this.gesReportService.deleteConfig(orgId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('COMMON.DELETE_SUCCESS')
                    });
                    this.loadConfigs();
                },
                error: (err) => {
                    console.error(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('COMMON.DELETE_ERROR')
                    });
                }
            });
    }

    hideDialog(): void {
        this.dialogVisible = false;
        this.editingConfig = null;
    }
}
