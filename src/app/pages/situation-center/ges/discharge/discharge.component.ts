import { Component, inject, OnInit } from '@angular/core';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AuthService } from '@/core/services/auth.service';
import { Dialog } from 'primeng/dialog';
import { ApiService } from '@/core/services/api.service';
import { Organization } from '@/core/interfaces/organizations';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { Cascade, DischargeModel, WaterDischargePayload } from '@/core/interfaces/discharge';
import { MessageService } from 'primeng/api';
import { Message } from 'primeng/message';
import { dateRangeValidator } from '@/core/validators/date-range.validator';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { Tooltip } from 'primeng/tooltip';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-discharge',
    imports: [Button, ButtonDirective, ButtonIcon, ButtonLabel, ReactiveFormsModule, TableModule, Dialog, Select, FormsModule, FloatLabel, DatePicker, InputNumber, Textarea, Message, DatePipe, DecimalPipe, Ripple, Tooltip],
    templateUrl: './discharge.component.html',
    styleUrl: './discharge.component.scss'
})
export class DischargeComponent implements OnInit {
    organizations: Organization[] = [];
    expandedRows: expandedRows = {};
    dischargeByCascades: Cascade[] = [];
    loading = false;
    displayDialog = false;
    submitted: boolean = false;

    isEditMode: boolean = false;

    waterDischargeForm!: FormGroup;
    authService = inject(AuthService);
    private apiService = inject(ApiService);
    private messageService = inject(MessageService);

    get maxDate(): Date {
        return new Date();
    }

    constructor(private fb: FormBuilder) {}

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

        this.loading = true;
        this.apiService.getDischarges().subscribe({
            next: (data: Cascade[]) => {
                this.dischargeByCascades = data;
                const newExpandedRows: { [key: string]: boolean } = {};

                data.forEach((cascade) => {
                    newExpandedRows[cascade.id] = true;
                    cascade.hpps.forEach((hpp) => {
                        newExpandedRows[hpp.id] = true;
                    });
                });

                this.expandedRows = newExpandedRows;
                this.loading = false;
            },
            error: (err) => {
                console.error('Ошибка загрузки данных:', err);
                this.loading = false;
            }
        });

        this.apiService.getCascades().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            error: () => {
                this.messageService.add({
                    severity: 'warning',
                    summary: 'Ошибка',
                    detail: 'Не удалось загрузить данные'
                });
            },
            complete: () => {
                this.loading = false;
            }
        });
    }

    openDialog(): void {
        this.submitted = false;
        this.waterDischargeForm.reset();
        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.submitted = false;
    }

    approve(model: DischargeModel): void {}

    edit(model: DischargeModel): void {
        this.isEditMode = true;
        this.submitted = false;
        this.displayDialog = true;
        // this.waterDischargeForm.setValue()
        console.log(model);
    }

    delete(model: DischargeModel): void {}

    onSubmit(): void {
        this.submitted = true;

        if (this.waterDischargeForm.invalid) {
            console.warn('Форма невалидна');
            return;
        }

        const rawValue = this.waterDischargeForm.getRawValue();

        const payload: WaterDischargePayload = {
            organization_id: rawValue.organization!.id,
            started_at: rawValue.started_at!.toISOString(),
            flow_rate: rawValue.flow_rate!
        };

        if (rawValue.reason) {
            payload.reason = rawValue.reason;
        }
        if (rawValue.ended_at) {
            payload.ended_at = rawValue.ended_at.toISOString();
        }

        this.apiService.addDischarge(payload).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Успешно',
                    detail: 'Новая запись о водосбросе добавлена'
                });

                this.closeDialog();
            },
            error: (err) => {
                console.error('Ошибка при добавлении записи:', err);

                this.messageService.add({
                    severity: 'error',
                    summary: 'Ошибка сохранения',
                    detail: err.error?.message || 'Не удалось сохранить данные'
                });
            }
        });
    }
}
