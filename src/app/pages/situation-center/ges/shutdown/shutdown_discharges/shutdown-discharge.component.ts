import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DischargeService } from '@/core/services/discharge.service';
import { IdleDischargeResponse, WaterDischargePayload } from '@/core/interfaces/discharge';
import { Button } from 'primeng/button';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { GroupSelectComponent } from '@/layout/component/dialog/group-select/group-select.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { InputNumberdComponent } from '@/layout/component/dialog/input-number/input-number.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { Organization } from '@/core/interfaces/organizations';
import { ApiService } from '@/core/services/api.service';
import { AuthService } from '@/core/services/auth.service';
import { dateRangeValidator } from '@/core/validators/date-range.validator';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-shutdown-discharge',
    imports: [DatePipe, PrimeTemplate, ReactiveFormsModule, TableModule, DecimalPipe, Button, DialogComponent, GroupSelectComponent, DatePickerComponent, InputNumberdComponent, TextareaComponent, TooltipModule],
    templateUrl: './shutdown-discharge.component.html',
    styleUrl: './shutdown-discharge.component.scss'
})
export class ShutdownDischargeComponent implements OnInit, OnChanges {
    @Input() date: Date | null = null;

    discharges: IdleDischargeResponse[] = [];
    loading: boolean = false;
    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;
    currentDischargeId: number | null = null;

    form!: FormGroup;
    organizations: Organization[] = [];
    orgsLoading = false;

    authService = inject(AuthService);
    private fb: FormBuilder = inject(FormBuilder);
    private api: ApiService = inject(ApiService);
    private dischargeService: DischargeService = inject(DischargeService);
    private messageService: MessageService = inject(MessageService);

    ngOnInit(): void {
        this.form = this.fb.group(
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

        this.loadDischarges();
        this.loadOrganizations();
    }

    private loadDischarges() {
        this.loading = true;
        const dateToUse = this.date || new Date();
        this.dischargeService.getFlatDischarges(dateToUse).subscribe({
            next: (data) => {
                this.discharges = data;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
            },
            complete: () => (this.loading = false)
        });
    }

    private loadOrganizations() {
        this.orgsLoading = true;
        this.api.getCascades().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            complete: () => (this.orgsLoading = false)
        });
    }

    openNew() {
        this.isEditMode = false;
        this.currentDischargeId = null;
        this.form.reset();
        // Re-enable all fields
        this.form.get('organization')?.enable();
        this.form.get('started_at')?.enable();
        this.submitted = false;
        this.isLoading = false;
        this.isFormOpen = true;
    }

    closeDialog() {
        this.isFormOpen = false;
        this.submitted = false;
        this.isLoading = false;
        this.isEditMode = false;
        this.currentDischargeId = null;
        // Re-enable all fields
        this.form.get('organization')?.enable();
        this.form.get('started_at')?.enable();
        this.form.reset();
        this.loadDischarges();
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        const rawValue = this.form.getRawValue();
        const payload: WaterDischargePayload = {};

        if (rawValue.organization) payload.organization_id = rawValue.organization.id;
        if (rawValue.started_at) payload.started_at = rawValue.started_at.toISOString();
        if (rawValue.ended_at) payload.ended_at = rawValue.ended_at.toISOString();
        if (rawValue.flow_rate) payload.flow_rate = rawValue.flow_rate;
        if (rawValue.reason) payload.reason = rawValue.reason;

        this.isLoading = true;

        if (this.isEditMode && this.currentDischargeId) {
            this.dischargeService.editDischarge(this.currentDischargeId, payload).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Запись о водосбросе обновлена' });
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка сохранения', detail: err.error?.message || 'Не удалось сохранить данные' });
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                    this.submitted = false;
                }
            });
        } else {
            this.dischargeService.addDischarge(payload).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Новая запись о водосбросе добавлена' });
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка сохранения', detail: err.error?.message || 'Не удалось сохранить данные' });
                    this.isLoading = false;
                },
                complete: () => {
                    this.isLoading = false;
                    this.submitted = false;
                }
            });
        }
    }

    editDischarge(discharge: IdleDischargeResponse) {
        this.isEditMode = true;
        this.currentDischargeId = discharge.id;
        this.submitted = false;
        this.isLoading = false;

        let organizationToSet: any = null;
        if (discharge.organization && this.organizations) {
            for (const cascade of this.organizations) {
                const foundOrg = cascade.items?.find((org: any) => org.id === discharge.organization.id);
                if (foundOrg) {
                    organizationToSet = foundOrg;
                    break;
                }
            }
        }

        this.form.patchValue({
            organization: organizationToSet,
            started_at: new Date(discharge.started_at),
            ended_at: discharge.ended_at ? new Date(discharge.ended_at) : null,
            flow_rate: discharge.flow_rate,
            reason: discharge.reason || ''
        });

        // Disable organization and started_at in edit mode
        this.form.get('organization')?.enable();
        this.form.get('started_at')?.enable();

        this.isFormOpen = true;
    }

    deleteDischarge(discharge: IdleDischargeResponse) {
        if (confirm('Вы уверены, что хотите удалить этот водосброс?')) {
            this.dischargeService.deleteDischarge(discharge.id).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Водосброс удален' });
                    this.loadDischarges();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка удаления водосброса', detail: err.message });
                }
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['date'] && !changes['date'].firstChange) {
            this.loadDischarges();
        }
    }
}
