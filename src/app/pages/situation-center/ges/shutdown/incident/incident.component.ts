import { Component, inject, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DatePipe } from '@angular/common';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { GroupSelectComponent } from '@/layout/component/dialog/group-select/group-select.component';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { IncidentDto, IncidentPayload } from '@/core/interfaces/incidents';
import { ApiService } from '@/core/services/api.service';
import { IncidentService } from '@/core/services/incident.service';
import { Organization } from '@/core/interfaces/organizations';

@Component({
  selector: 'app-incident',
  imports: [
      Button,
      DatePickerComponent,
      DatePipe,
      DialogComponent,
      GroupSelectComponent,
      PrimeTemplate,
      ReactiveFormsModule,
      TableModule,
      TextareaComponent
  ],
  templateUrl: './incident.component.html',
  styleUrl: './incident.component.scss'
})
export class IncidentComponent implements OnInit {
    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;

    form!: FormGroup;

    organizations: any[] = [];
    incidents: IncidentDto[] = [];
    loading: boolean = false;
    orgsLoading = false;
    private fb: FormBuilder = inject(FormBuilder);
    private api: ApiService = inject(ApiService);
    private incidentService: IncidentService = inject(IncidentService);
    private messageService: MessageService = inject(MessageService);

    ngOnInit(): void {
        this.form = this.fb.group({
            organization: this.fb.control<Organization | null>(null, [Validators.required]),
            incident_time: this.fb.control<Date | null>(null, [Validators.required]),
            description: this.fb.control<string | null>(null, [Validators.required])
        });

        this.loadIncidents();

        this.orgsLoading = true;
        this.api.getCascades().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            complete: () => (this.orgsLoading = false)
        });
    }

    private loadIncidents() {
        this.loading = true;
        this.incidentService.getIncidents().subscribe({
            next: (data) => {
                this.incidents = data;
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
        const payload: IncidentPayload = {};

        if (rawPayload.organization) payload.organization_id = rawPayload.organization.id;
        if (rawPayload.incident_time) payload.incident_time = rawPayload.incident_time.toISOString();
        if (rawPayload.description) payload.description = rawPayload.description;

        this.incidentService.addIncident(payload).subscribe({
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
                this.isLoading = false;
                this.submitted = false;
            }
        });
    }

    closeDialog() {
        this.isFormOpen = false;
        this.submitted = false;
        this.form.reset();
        this.loadIncidents();
    }

    openNew() {
        this.isEditMode = false;
        this.form.reset();
        this.submitted = false;
        this.isFormOpen = true;
    }
}
