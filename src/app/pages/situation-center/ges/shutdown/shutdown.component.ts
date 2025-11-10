import { Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { GroupSelectComponent } from '@/layout/component/dialog/group-select/group-select.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { ApiService } from '@/core/services/api.service';
import { IncidentPayload } from '@/core/interfaces/incidents';
import { Organization } from '@/core/interfaces/organizations';
import { IncidentService } from '@/core/services/incident.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-shutdown',
    imports: [TableModule, Button, DialogComponent, ReactiveFormsModule, GroupSelectComponent, DatePickerComponent, TextareaComponent],
    templateUrl: './shutdown.component.html',
    styleUrl: './shutdown.component.scss'
})
export class ShutdownComponent implements OnInit {
    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;

    incidentForm!: FormGroup;

    organizations: any[] = [];
    orgsLoading = false;
    private fb: FormBuilder = inject(FormBuilder);
    private api: ApiService = inject(ApiService);
    private incidentService: IncidentService = inject(IncidentService);
    private messageService: MessageService = inject(MessageService);

    ngOnInit(): void {
        this.incidentForm = this.fb.group({
            organization: this.fb.control<Organization | null>(null, [Validators.required]),
            incident_time: this.fb.control<Date | null>(null, [Validators.required]),
            description: this.fb.control<string | null>(null, [Validators.required])
        });

        this.incidentService.getIncidents().subscribe({
            next: (data) => {
                console.log(data);
            }
        });

        this.orgsLoading = true;
        this.api.getCascades().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            complete: () => (this.orgsLoading = false)
        });
    }

    onSubmit() {
        this.submitted = true;

        if (this.incidentForm.invalid) {
            return;
        }

        this.isLoading = true;
        const rawPayload = this.incidentForm.getRawValue();
        const payload: IncidentPayload = {};

        if (rawPayload.organization) payload.organization_id = rawPayload.organization.id;
        if (rawPayload.incident_time) payload.incident_time = rawPayload.incident_time.toISOString();
        if (rawPayload.description) payload.description = rawPayload.description;

        this.incidentService.addIncident(payload).subscribe({
            next: () => {
                this.isLoading = false;
                this.isFormOpen = false;
                this.submitted = false;
                this.incidentForm.reset();
                this.messageService.add({ severity: 'success', summary: 'Инцидент добавлен' });
                this.closeDialog();
            },
            error: (err) => {
                this.submitted = false;
                this.isLoading = false;
                this.messageService.add({ severity: 'error', summary: 'Ошибка добавления инцидента', detail: err.message });
            }
        });
    }

    closeDialog() {
        this.isFormOpen = false;
        this.submitted = false;
        this.incidentForm.reset();
    }

    openNew() {
        this.isEditMode = false;
        this.incidentForm.reset();
        this.submitted = false;
        this.isFormOpen = true;
    }
}

//     implements OnInit {
//     loading: boolean = false;
//
//     authService: AuthService = inject(AuthService);
//     private incidentService: IncidentService = inject(IncidentService);
//     private messageService: MessageService = inject(MessageService);
//
//     ngOnInit() {
//         this.loading = true;
//         this.incidentService.getIncidents().subscribe({
//             next: (data) => {
//                 console.log(data);
//             },
//             error: (err) => {
//                 this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: err.message });
//             },
//             complete: () => (this.loading = false)
//         });
//     }
// }
