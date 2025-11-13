import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Button } from 'primeng/button';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DatePipe } from '@angular/common';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { GroupSelectComponent } from '@/layout/component/dialog/group-select/group-select.component';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { AddVisitRequest, EditVisitRequest, VisitDto } from '@/core/interfaces/visits';
import { ApiService } from '@/core/services/api.service';
import { VisitService } from '@/core/services/visit.service';
import { Organization } from '@/core/interfaces/organizations';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { AuthService } from '@/core/services/auth.service';

@Component({
    selector: 'app-visit',
    imports: [Button, DatePickerComponent, DatePipe, DialogComponent, GroupSelectComponent, PrimeTemplate, ReactiveFormsModule, TableModule, TextareaComponent, TooltipModule, InputTextComponent],
    templateUrl: './visit.component.html',
    styleUrl: './visit.component.scss'
})
export class VisitComponent implements OnInit, OnChanges {
    @Input() date: Date | null = null;

    isFormOpen = false;
    submitted = false;
    isLoading = false;
    isEditMode = false;
    currentVisitId: number | null = null;

    form!: FormGroup;

    organizations: any[] = [];
    visits: VisitDto[] = [];
    loading: boolean = false;
    orgsLoading = false;
    authService = inject(AuthService);
    private fb: FormBuilder = inject(FormBuilder);
    private api: ApiService = inject(ApiService);
    private visitService: VisitService = inject(VisitService);
    private messageService: MessageService = inject(MessageService);

    ngOnInit(): void {
        this.form = this.fb.group({
            organization: this.fb.control<Organization | null>(null, [Validators.required]),
            visit_date: this.fb.control<Date | null>(null, [Validators.required]),
            description: this.fb.control<string | null>(null, [Validators.required]),
            responsible_name: this.fb.control<string | null>(null, [Validators.required])
        });

        this.loadVisits();

        this.orgsLoading = true;
        this.api.getCascades().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            complete: () => (this.orgsLoading = false)
        });
    }

    private loadVisits() {
        this.loading = true;
        const dateToUse = this.date || new Date();
        this.visitService.getVisits(dateToUse).subscribe({
            next: (data) => {
                this.visits = data;
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

        if (this.isEditMode && this.currentVisitId) {
            const payload: EditVisitRequest = {};

            if (rawPayload.organization) payload.organization_id = rawPayload.organization.id;
            if (rawPayload.visit_date) payload.visit_date = rawPayload.visit_date.toISOString();
            if (rawPayload.description) payload.description = rawPayload.description;
            if (rawPayload.responsible_name) payload.responsible_name = rawPayload.responsible_name;

            this.visitService.editVisit(this.currentVisitId, payload).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Визит обновлен' });
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка обновления визита', detail: err.message });
                },
                complete: () => {
                    this.isLoading = false;
                    this.submitted = false;
                }
            });
        } else {
            const payload: AddVisitRequest = {
                organization_id: rawPayload.organization.id,
                visit_date: rawPayload.visit_date.toISOString(),
                description: rawPayload.description,
                responsible_name: rawPayload.responsible_name
            };

            this.visitService.addVisit(payload).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Визит добавлен' });
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка добавления визита', detail: err.message });
                },
                complete: () => {
                    this.isLoading = false;
                    this.submitted = false;
                }
            });
        }
    }

    closeDialog() {
        this.isFormOpen = false;
        this.submitted = false;
        this.isEditMode = false;
        this.currentVisitId = null;
        this.form.reset();
        this.loadVisits();
    }

    openNew() {
        this.isEditMode = false;
        this.currentVisitId = null;
        this.form.reset();
        this.submitted = false;
        this.isFormOpen = true;
    }

    editVisit(visit: VisitDto) {
        this.isEditMode = true;
        this.currentVisitId = visit.id;

        let organizationToSet: any = null;
        if (visit.organization_id && this.organizations) {
            for (const cascade of this.organizations) {
                const foundOrg = cascade.items?.find((org: any) => org.id === visit.organization_id);
                if (foundOrg) {
                    organizationToSet = foundOrg;
                    break;
                }
            }
        }

        this.form.patchValue({
            organization: organizationToSet,
            visit_date: visit.visit_date,
            description: visit.description,
            responsible_name: visit.responsible_name
        });

        this.isFormOpen = true;
    }

    deleteVisit(id: number) {
        if (confirm('Вы уверены, что хотите удалить этот визит?')) {
            this.visitService.deleteVisit(id).subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Визит удален' });
                    this.loadVisits();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка удаления визита', detail: err.message });
                }
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['date'] && !changes['date'].firstChange) {
            this.loadVisits();
        }
    }
}
