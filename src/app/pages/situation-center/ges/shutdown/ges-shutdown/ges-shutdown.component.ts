import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Button } from 'primeng/button';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { GroupSelectComponent } from '@/layout/component/dialog/group-select/group-select.component';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { ApiService } from '@/core/services/api.service';
import { Organization } from '@/core/interfaces/organizations';
import { GesShutdownService } from '@/core/services/ges-shutdown.service';
import { InputNumberdComponent } from '@/layout/component/dialog/input-number/input-number.component';
import { GesShutdownDto, GesShutdownPayload } from '@/core/interfaces/ges-shutdown';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'app-ges-shutdown',
    imports: [Button, DatePickerComponent, DialogComponent, GroupSelectComponent, PrimeTemplate, ReactiveFormsModule, TableModule, TextareaComponent, InputNumberdComponent, DatePipe],
    templateUrl: './ges-shutdown.component.html',
    styleUrl: './ges-shutdown.component.scss'
})
export class GesShutdownComponent implements OnInit, OnChanges {
    @Input() date: Date | null = null;

    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;

    form!: FormGroup;

    organizations: any[] = [];
    shutdowns: GesShutdownDto = { ges: [], mini: [], micro: [] };
    loading: boolean = false;
    orgsLoading = false;
    private fb: FormBuilder = inject(FormBuilder);
    private api: ApiService = inject(ApiService);
    private gesShutdownService: GesShutdownService = inject(GesShutdownService);
    private messageService: MessageService = inject(MessageService);

    ngOnInit(): void {
        this.form = this.fb.group({
            organization: this.fb.control<Organization | null>(null, [Validators.required]),
            start_time: this.fb.control<Date | null>(null, [Validators.required]),
            end_time: this.fb.control<Date | null>(null),
            reason: this.fb.control<string | null>(null),
            generation_loss: this.fb.control<number | null>(null),
            idle_discharge_volume: this.fb.control<number | null>(null)
        });

        this.loadShutdowns();

        this.orgsLoading = true;
        this.api.getCascades().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            complete: () => (this.orgsLoading = false)
        });
    }

    private loadShutdowns() {
        this.loading = true;
        this.gesShutdownService.getShutdowns().subscribe({
            next: (data) => {
                this.shutdowns = data;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
            },
            complete: () => (this.loading = false)
        });
    }

    onSubmit() {
        this.submitted = true;

        if (this.form.invalid) {
            return;
        }

        this.isLoading = true;
        const rawPayload = this.form.getRawValue();
        const payload: GesShutdownPayload = {};

        if (rawPayload.organization) payload.organization_id = rawPayload.organization.id;
        if (rawPayload.start_time) payload.start_time = rawPayload.start_time.toISOString();
        if (rawPayload.end_time) payload.end_time = rawPayload.end_time.toISOString();
        if (rawPayload.reason) payload.reason = rawPayload.reason;
        if (rawPayload.generation_loss) payload.generation_loss = rawPayload.generation_loss;
        if (rawPayload.idle_discharge_volume) payload.idle_discharge_volume = rawPayload.idle_discharge_volume;

        this.submitted = false;
        this.isLoading = false;
        this.gesShutdownService.addShutdown(payload).subscribe({
            next: () => {
                this.isFormOpen = false;
                this.form.reset();
                this.messageService.add({ severity: 'success', summary: 'Инцидент добавлен' });
                this.closeDialog();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Ошибка добавления инцидента', detail: err.message });
            },
            complete: () => {
                this.submitted = false;
                this.isLoading = false;
            }
        });
    }

    closeDialog() {
        this.isFormOpen = false;
        this.submitted = false;
        this.form.reset();
        this.loadShutdowns();
    }

    openNew() {
        this.isEditMode = false;
        this.form.reset();
        this.submitted = false;
        this.isFormOpen = true;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['date'] && !changes['date'].firstChange) {
            this.loadShutdowns();
        }
    }
}
