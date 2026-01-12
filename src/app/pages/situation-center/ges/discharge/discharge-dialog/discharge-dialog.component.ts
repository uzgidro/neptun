import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Organization } from '@/core/interfaces/organizations';
import { DischargeModel } from '@/core/interfaces/discharge';
import { dateRangeValidator } from '@/core/validators/date-range.validator';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { NgClass } from '@angular/common';
import { DischargeService } from '@/core/services/discharge.service';
import { OrganizationService } from '@/core/services/organization.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-discharge-dialog',
    standalone: true,
    imports: [Dialog, ReactiveFormsModule, Select, FormsModule, FloatLabel, DatePicker, InputNumber, Textarea, Message, PrimeTemplate, NgClass, Button, TranslateModule],
    templateUrl: './discharge-dialog.component.html'
})
export class DischargeDialogComponent implements OnInit, OnChanges {
    @Input() display: boolean = false;
    @Input() modelToEdit: DischargeModel | null = null;

    @Output() displayChange = new EventEmitter<boolean>();
    @Output() save = new EventEmitter<void>();

    organizations: Organization[] = [];
    waterDischargeForm!: FormGroup;
    submitted: boolean = false;
    loading: boolean = false;

    private dischargeService = inject(DischargeService);
    private organizationService = inject(OrganizationService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);
    private translate = inject(TranslateService);

    get maxDate(): Date {
        return new Date();
    }

    get isEditMode(): boolean {
        return !!this.modelToEdit;
    }

    ngOnInit() {
        this.waterDischargeForm = this.fb.group(
            {
                organization: this.fb.control<Organization | null>(null, [Validators.required]),
                started_at: this.fb.control<Date | null>(null, [Validators.required]),
                ended_at: this.fb.control<Date | null>(null),
                flow_rate: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
                reason: this.fb.control<string | null>(null)
            },
            {
                validators: [dateRangeValidator()]
            }
        );

        this.loadOrganizations();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['display'] && this.display) {
            this.onDialogShow();
        }
    }

    onDialogShow(): void {
        this.submitted = false;
        this.waterDischargeForm.reset();

        if (!this.modelToEdit) {
            return;
        }

        let organizationToSet: Organization | null = null;
        if (this.modelToEdit.organization && this.organizations) {
            for (const cascade of this.organizations) {
                const foundOrg = cascade.items?.find((org) => org.id === this.modelToEdit!.organization!.id);
                if (foundOrg) {
                    organizationToSet = foundOrg;
                    break;
                }
            }
        }

        this.waterDischargeForm.patchValue({
            organization: organizationToSet,
            started_at: new Date(this.modelToEdit.started_at),
            ended_at: this.modelToEdit.ended_at ? new Date(this.modelToEdit.ended_at) : null,
            flow_rate: this.modelToEdit.flow_rate,
            reason: this.modelToEdit.reason || ''
        });
    }

    closeDialog(): void {
        this.displayChange.emit(false);
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.waterDischargeForm.invalid) {
            console.warn('Form is invalid');
            return;
        }

        const rawValue = this.waterDischargeForm.getRawValue();
        const formData = new FormData();

        if (rawValue.reason) formData.append('reason', rawValue.reason);
        if (rawValue.ended_at) formData.append('ended_at', rawValue.ended_at.toISOString());
        if (rawValue.flow_rate) formData.append('flow_rate', rawValue.flow_rate.toString());

        if (this.isEditMode) {
            this.dischargeService.editDischarge(this.modelToEdit!.id, formData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('SITUATION_CENTER.DISCHARGE.UPDATED')
                    });
                    this.save.emit();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: err.error?.message || this.translate.instant('SITUATION_CENTER.DISCHARGE.UPDATE_ERROR')
                    });
                }
            });
        } else {
            if (rawValue.organization) formData.append('organization_id', rawValue.organization.id.toString());
            if (rawValue.started_at) formData.append('started_at', rawValue.started_at!.toISOString());

            this.dischargeService.addDischarge(formData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('SITUATION_CENTER.DISCHARGE.CREATED')
                    });
                    this.save.emit();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: err.error?.message || this.translate.instant('SITUATION_CENTER.DISCHARGE.CREATE_ERROR')
                    });
                }
            });
        }
    }

    private loadOrganizations() {
        this.organizationService.getCascades().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            error: () => {
                this.messageService.add({
                    severity: 'warning',
                    summary: this.translate.instant('COMMON.ERROR'),
                    detail: this.translate.instant('SITUATION_CENTER.COMMON.DATA_NOT_FOUND')
                });
            },
            complete: () => {
                this.loading = false;
            }
        });
    }
}
