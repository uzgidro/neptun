import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Contact, AddContactRequest, EditContactRequest } from '@/core/interfaces/contact';
import { ContactService } from '@/core/services/contact.service';
import { OrganizationService } from '@/core/services/organization.service';
import { DepartmentService } from '@/core/services/department.service';
import { PositionService } from '@/core/services/position.service';
import { Organization } from '@/core/interfaces/organizations';
import { Department } from '@/core/interfaces/department';
import { Position } from '@/core/interfaces/position';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { Tooltip } from 'primeng/tooltip';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';

@Component({
    selector: 'app-employee',
    imports: [TableModule, ButtonDirective, IconField, InputIcon, InputText, ButtonLabel, ButtonIcon, ReactiveFormsModule, InputTextComponent, SelectComponent, DatePickerComponent, DeleteConfirmationComponent, Tooltip, DialogComponent],
    templateUrl: './employee.component.html',
    styleUrl: './employee.component.scss'
})
export class EmployeeComponent implements OnInit, OnDestroy {
    contacts: Contact[] = [];
    organizations: Organization[] = [];
    departments: Department[] = [];
    positions: Position[] = [];
    loading: boolean = true;
    displayDialog: boolean = false;
    displayDeleteDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    selectedContact: Contact | null = null;
    contactForm: FormGroup;

    private contactService = inject(ContactService);
    private organizationService = inject(OrganizationService);
    private departmentService = inject(DepartmentService);
    private positionService = inject(PositionService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.contactForm = this.fb.group({
            name: ['', Validators.required],
            email: [''],
            phone: [''],
            ip_phone: [''],
            dob: [null],
            external_organization_name: [''],
            organization_id: [null],
            department_id: [null],
            position_id: [null]
        });
    }

    ngOnInit() {
        this.loadContacts();
        this.loadOrganizations();
        this.loadDepartments();
        this.loadPositions();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog(): void {
        this.isEditMode = false;
        this.selectedContact = null;
        this.submitted = false;
        this.contactForm.reset();
        this.displayDialog = true;
    }

    openEditDialog(contact: Contact): void {
        this.isEditMode = true;
        this.selectedContact = contact;
        this.submitted = false;

        // Find objects for select components
        const selectedOrg = this.organizations.find((org) => org.id === contact.organization?.id);
        const selectedDept = this.departments.find((dept) => dept.id === contact.department?.id);
        const selectedPos = this.positions.find((pos) => pos.id === contact.position?.id);

        // Parse date if present
        let dobDate = null;
        if (contact.dob) {
            dobDate = new Date(contact.dob);
        }

        this.contactForm.patchValue({
            name: contact.name,
            email: contact.email || '',
            phone: contact.phone || '',
            ip_phone: contact.ip_phone || '',
            dob: dobDate,
            external_organization_name: contact.external_organization_name || '',
            organization_id: selectedOrg || null,
            department_id: selectedDept || null,
            position_id: selectedPos || null
        });

        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedContact = null;
    }

    onSubmit() {
        this.submitted = true;

        if (this.contactForm.invalid) {
            return;
        }

        if (this.isEditMode && this.selectedContact) {
            this.updateContact();
        } else {
            this.createContact();
        }
    }

    private createContact() {
        const formValue = this.contactForm.value;
        const payload: AddContactRequest = {
            name: formValue.name,
            email: formValue.email || null,
            phone: formValue.phone || null,
            ip_phone: formValue.ip_phone || null,
            dob: formValue.dob ? this.dateToYMD(formValue.dob) : null,
            external_organization_name: formValue.external_organization_name || null,
            organization_id: formValue.organization_id?.id || null,
            department_id: formValue.department_id?.id || null,
            position_id: formValue.position_id?.id || null
        };

        this.contactService
            .createContact(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Сотрудник успешно создан' });
                    this.loadContacts();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать сотрудника' });
                    console.error(err);
                }
            });
    }

    private updateContact() {
        if (!this.selectedContact) return;

        const formValue = this.contactForm.value;
        const payload: EditContactRequest = {
            name: formValue.name || null,
            email: formValue.email || null,
            phone: formValue.phone || null,
            ip_phone: formValue.ip_phone || null,
            dob: formValue.dob ? this.dateToYMD(formValue.dob) : null,
            external_organization_name: formValue.external_organization_name || null,
            organization_id: formValue.organization_id?.id || null,
            department_id: formValue.department_id?.id || null,
            position_id: formValue.position_id?.id || null
        };

        this.contactService
            .updateContact(this.selectedContact.id, payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Сотрудник успешно обновлен' });
                    this.loadContacts();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить сотрудника' });
                    console.error(err);
                }
            });
    }

    openDeleteDialog(contact: Contact): void {
        this.selectedContact = contact;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedContact) return;

        this.contactService
            .deleteContact(this.selectedContact.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Сотрудник успешно удален' });
                    this.loadContacts();
                    this.displayDeleteDialog = false;
                    this.selectedContact = null;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить сотрудника' });
                    console.error(err);
                }
            });
    }

    private loadContacts(): void {
        this.contactService.getContacts().subscribe({
            next: (data) => {
                this.contacts = data;
            },
            error: (err) => console.log(err),
            complete: () => (this.loading = false)
        });
    }

    private loadOrganizations(): void {
        this.organizationService.getOrganizationsFlat().subscribe({
            next: (data) => {
                this.organizations = data;
            },
            error: (err) => console.log(err)
        });
    }

    private loadDepartments(): void {
        this.departmentService.getDepartments().subscribe({
            next: (data) => {
                this.departments = data;
            },
            error: (err) => console.log(err)
        });
    }

    private loadPositions(): void {
        this.positionService.getPositions().subscribe({
            next: (data) => {
                this.positions = data;
            },
            error: (err) => console.log(err)
        });
    }

    private dateToYMD(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
