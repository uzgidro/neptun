import { Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Contact, ContactCreatePayload, ContactUpdatePayload } from '@/core/interfaces/contact';
import { ContactService } from '@/core/services/contact.service';
import { ApiService } from '@/core/services/api.service';
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
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';

import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { Tooltip } from 'primeng/tooltip';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { BaseCrudComponent } from '@/core/components/base-crud.component';
import { switchMap, takeUntil, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-employee',
    imports: [
        TableModule,
        ButtonDirective,
        IconField,
        InputIcon,
        InputText,
        ButtonLabel,
        ButtonIcon,
        ReactiveFormsModule,
        InputTextComponent,
        SelectComponent,
        DatePickerComponent,

        FileUploadComponent,
        Tooltip,
        DialogComponent,
        TranslateModule
    ],
    templateUrl: './employee.component.html',
    styleUrl: './employee.component.scss'
})
export class EmployeeComponent extends BaseCrudComponent<Contact, ContactCreatePayload | ContactUpdatePayload> implements OnInit {
    organizations: Organization[] = [];
    departments: Department[] = [];
    positions: Position[] = [];
    selectedFiles: File[] = [];

    private apiService = inject(ApiService);
    private organizationService = inject(OrganizationService);
    private departmentService = inject(DepartmentService);
    private positionService = inject(PositionService);

    constructor() {
        super(inject(ContactService), {
            createSuccess: 'HRM.EMPLOYEES.SUCCESS_CREATED',
            createError: 'HRM.EMPLOYEES.ERROR_CREATE',
            updateSuccess: 'HRM.EMPLOYEES.SUCCESS_UPDATED',
            updateError: 'HRM.EMPLOYEES.ERROR_UPDATE',
            deleteSuccess: 'HRM.EMPLOYEES.SUCCESS_DELETED',
            deleteError: 'HRM.EMPLOYEES.ERROR_DELETE'
        });
    }

    ngOnInit(): void {
        this.loadItems();
        this.loadOrganizations();
        this.loadDepartments();
        this.loadPositions();
    }

    protected buildForm(): FormGroup {
        return this.fb.group({
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

    protected buildPayload(): ContactCreatePayload | ContactUpdatePayload {
        const formValue = this.form.value;
        const payload: ContactCreatePayload | ContactUpdatePayload = {
            name: formValue.name
        };

        if (formValue.email) payload.email = formValue.email;
        if (formValue.phone) payload.phone = formValue.phone;
        if (formValue.ip_phone) payload.ip_phone = formValue.ip_phone;
        if (formValue.dob) payload.dob = this.dateToYMD(formValue.dob);
        if (formValue.external_organization_name) payload.external_organization_name = formValue.external_organization_name;
        if (formValue.organization_id?.id) payload.organization_id = formValue.organization_id.id;
        if (formValue.department_id?.id) payload.department_id = formValue.department_id.id;
        if (formValue.position_id?.id) payload.position_id = formValue.position_id.id;

        return payload;
    }

    protected override createItem(): void {
        const payload = this.buildPayload();

        const upload$ = this.selectedFiles.length > 0
            ? this.apiService.uploadFiles(this.selectedFiles, 1)
            : of(null as { ids: number[] } | null);

        upload$.pipe(
            switchMap((result: { ids: number[] } | null) => {
                if (result) {
                    payload.icon_id = result.ids[0];
                }
                return this.service.create(payload);
            }),
            takeUntil(this.destroy$)
        ).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('COMMON.SUCCESS'),
                    detail: this.translate.instant(this.messages.createSuccess)
                });
                this.loadItems();
                this.closeDialog();
            },
            error: (err: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('COMMON.ERROR'),
                    detail: this.translate.instant(this.messages.createError)
                });
                console.error(err);
            }
        });
    }

    protected override updateItem(): void {
        if (!this.selectedItem) return;

        const payload = this.buildPayload();

        const upload$ = this.selectedFiles.length > 0
            ? this.apiService.uploadFiles(this.selectedFiles, 1)
            : of(null as { ids: number[] } | null);

        upload$.pipe(
            switchMap((result: { ids: number[] } | null) => {
                if (result) {
                    payload.icon_id = result.ids[0];
                }
                return this.service.update(this.selectedItem!.id, payload);
            }),
            takeUntil(this.destroy$)
        ).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('COMMON.SUCCESS'),
                    detail: this.translate.instant(this.messages.updateSuccess)
                });
                this.loadItems();
                this.closeDialog();
            },
            error: (err: any) => {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('COMMON.ERROR'),
                    detail: this.translate.instant(this.messages.updateError)
                });
                console.error(err);
            }
        });
    }

    protected patchFormForEdit(contact: Contact): void {
        const selectedOrg = this.organizations.find((org) => org.id === contact.organization?.id);
        const selectedDept = this.departments.find((dept) => dept.id === contact.department?.id);
        const selectedPos = this.positions.find((pos) => pos.id === contact.position?.id);

        let dobDate = null;
        if (contact.dob) {
            dobDate = new Date(contact.dob);
        }

        this.form.patchValue({
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
    }

    // Override to clear files
    override openDialog(): void {
        this.selectedFiles = [];
        super.openDialog();
    }

    // File handling
    onFilesSelected(files: File[]): void {
        this.selectedFiles = files;
    }

    onFileRemoved(index: number): void {
        this.selectedFiles.splice(index, 1);
    }

    // Load related data
    private loadOrganizations(): void {
        this.organizationService.getOrganizationsFlat()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => this.organizations = data
            });
    }

    private loadDepartments(): void {
        this.departmentService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => this.departments = data
            });
    }

    private loadPositions(): void {
        this.positionService.getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => this.positions = data
            });
    }

    private dateToYMD(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Aliases for template compatibility
    get contacts(): Contact[] {
        return this.items;
    }

    get contactForm(): FormGroup {
        return this.form;
    }

    get selectedContact(): Contact | null {
        return this.selectedItem;
    }

    protected getDeleteConfirmMessage(item: Contact): string {
        return this.translate.instant('HRM.EMPLOYEES.DELETE_CONFIRM') + ' ' + (item.name || '') + '?';
    }
}
