import { Component, inject, OnInit } from '@angular/core';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CurrencyPipe } from '@angular/common';
import { Rating } from 'primeng/rating';
import { Ripple } from 'primeng/ripple';
import { Tag } from 'primeng/tag';
import { AuthService } from '@/core/services/auth.service';
import { Dialog } from 'primeng/dialog';
import { ApiService } from '@/core/services/api.service';
import { Organization } from '@/core/interfaces/organizations';
import { Select } from 'primeng/select';
import { FloatLabel } from 'primeng/floatlabel';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { WaterDischargePayload } from '@/core/interfaces/discharge';
import { MessageService } from 'primeng/api';
import { Message } from 'primeng/message';
import { dateRangeValidator } from '@/core/validators/date-range.validator';

@Component({
    selector: 'app-discharge',
    imports: [Button, ButtonDirective, ButtonIcon, ButtonLabel, ReactiveFormsModule, TableModule, CurrencyPipe, Rating, Ripple, Tag, Dialog, Select, FormsModule, FloatLabel, DatePicker, InputNumber, Textarea, Message],
    templateUrl: './discharge.component.html',
    styleUrl: './discharge.component.scss'
})
export class DischargeComponent implements OnInit {
    organizations: Organization[] = [];
    loading = false;
    displayDialog = false;
    maxDate = new Date();
    submitted: boolean = false;
    waterDischargeForm!: FormGroup;
    authService = inject(AuthService);
    private apiService = inject(ApiService);
    private messageService = inject(MessageService);

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        this.waterDischargeForm = this.fb.group({
            organization: this.fb.control<Organization | null>(null, [Validators.required]),
            started_at: this.fb.control<Date | null>(null, [Validators.required]),
            ended_at: this.fb.control<Date | null>(null),
            flow_rate: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
            reason: this.fb.control<string | null>(null)
        }, {
            validators: [dateRangeValidator()]
        });

        this.loading = true;
        this.apiService.getCascades().subscribe({
            next: (data) => {
                this.organizations = data;
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
            flow_rate: rawValue.flow_rate!,
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
