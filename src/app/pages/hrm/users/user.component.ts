import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Users } from '@/core/interfaces/users';
import { ApiService } from '@/core/services/api.service';
import { UserService } from '@/core/services/user.service';
import { ContactService } from '@/core/services/contact.service';
import { OrganizationService } from '@/core/services/organization.service';
import { DepartmentService } from '@/core/services/department.service';
import { PositionService } from '@/core/services/position.service';
import { Contact } from '@/core/interfaces/contact';
import { Organization } from '@/core/interfaces/organizations';
import { Department } from '@/core/interfaces/department';
import { Position } from '@/core/interfaces/position';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Chip } from 'primeng/chip';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Roles } from '@/core/interfaces/roles';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Password } from 'primeng/password';
import { MultiSelect } from 'primeng/multiselect';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { Tooltip } from 'primeng/tooltip';
import { SelectButton } from 'primeng/selectbutton';
import { Select } from 'primeng/select';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';

@Component({
    selector: 'app-users',
    imports: [
        TableModule,
        ButtonDirective,
        IconField,
        InputIcon,
        InputText,
        ButtonLabel,
        ButtonIcon,
        Chip,
        Button,
        ReactiveFormsModule,
        FormsModule,
        Password,
        MultiSelect,
        InputTextComponent,
        SelectComponent,
        DatePickerComponent,
        DeleteConfirmationComponent,
        FileUploadComponent,
        Tooltip,
        SelectButton,
        Select,
        DialogComponent
    ],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss'
})
export class User implements OnInit, OnDestroy {
    users: Users[] = [];
    allRoles: Roles[] = [];
    allContacts: Contact[] = [];
    organizations: Organization[] = [];
    departments: Department[] = [];
    positions: Position[] = [];
    loading: boolean = true;
    displayDialog: boolean = false;
    displayDeleteDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    selectedUser: Users | null = null;
    userForm: FormGroup;
    contactModeOptions = [
        { label: 'Новый контакт', value: 'new' },
        { label: 'Существующий контакт', value: 'existing' }
    ];
    contactMode: 'new' | 'existing' = 'new';
    selectedFiles: File[] = [];

    private apiService = inject(ApiService);
    private userService = inject(UserService);
    private contactService = inject(ContactService);
    private organizationService = inject(OrganizationService);
    private departmentService = inject(DepartmentService);
    private positionService = inject(PositionService);

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.userForm = this.fb.group({
            login: ['', Validators.required],
            password: [''],
            roles: [[]],
            // Contact selection
            contact_id: [null],
            // NewContactRequest fields
            name: [''],
            email: [''],
            phone: [''],
            ip_phone: [''],
            dob: [''],
            external_organization_name: [''],
            organization_id: [null],
            department_id: [null],
            position_id: [null]
        });
    }

    ngOnInit() {
        this.loadUsers();
        this.apiService.getRoles().subscribe((roles) => (this.allRoles = roles));
        this.contactService.getContacts().subscribe((contacts) => (this.allContacts = contacts));
        this.organizationService.getOrganizationsFlat().subscribe((orgs) => (this.organizations = orgs));
        this.departmentService.getDepartments().subscribe((depts) => (this.departments = depts));
        this.positionService.getPositions().subscribe((positions) => (this.positions = positions));
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog(): void {
        this.isEditMode = false;
        this.selectedUser = null;
        this.submitted = false;
        this.contactMode = 'new';
        this.selectedFiles = [];
        this.userForm.reset({ roles: [], contact_id: null });
        this.userForm.get('login')?.enable();
        this.userForm.get('password')?.setValidators([Validators.required]);
        this.userForm.get('password')?.updateValueAndValidity();
        this.updateContactValidators();
        this.displayDialog = true;
    }

    onFilesSelected(files: File[]): void {
        this.selectedFiles = files;
    }

    onFileRemoved(index: number): void {
        this.selectedFiles.splice(index, 1);
    }

    onContactModeChange(): void {
        this.updateContactValidators();
    }

    private updateContactValidators(): void {
        if (this.contactMode === 'new') {
            this.userForm.get('name')?.setValidators([Validators.required]);
            this.userForm.get('contact_id')?.clearValidators();
        } else {
            this.userForm.get('name')?.clearValidators();
            this.userForm.get('contact_id')?.setValidators([Validators.required]);
        }
        this.userForm.get('name')?.updateValueAndValidity();
        this.userForm.get('contact_id')?.updateValueAndValidity();
    }

    openEditDialog(user: Users): void {
        this.isEditMode = true;
        this.selectedUser = user;
        this.submitted = false;

        // Convert role_ids to role objects for multiselect
        const selectedRoles = this.allRoles.filter((role) => user.roles.includes(role.name));

        // Find objects for select components
        const selectedOrg = this.organizations.find((org) => org.id === user.contact?.organization?.id);
        const selectedDept = this.departments.find((dept) => dept.id === user.contact?.department?.id);
        const selectedPos = this.positions.find((pos) => pos.id === user.contact?.position?.id);

        // Parse date if present
        let dobDate = null;
        if (user.contact?.dob) {
            dobDate = new Date(user.contact.dob);
        }

        this.userForm.patchValue({
            login: user.login,
            password: '',
            roles: selectedRoles,
            name: user.contact?.name || '',
            email: user.contact?.email || '',
            phone: user.contact?.phone || '',
            ip_phone: user.contact?.ip_phone || '',
            dob: dobDate,
            external_organization_name: user.contact?.external_organization_name || '',
            organization_id: selectedOrg || null,
            department_id: selectedDept || null,
            position_id: selectedPos || null
        });

        this.userForm.get('login')?.enable();
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
        this.userForm.get('name')?.clearValidators();
        this.userForm.get('name')?.updateValueAndValidity();
        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedUser = null;
    }

    onSubmit() {
        this.submitted = true;

        if (this.userForm.invalid) {
            return;
        }

        if (this.isEditMode && this.selectedUser) {
            this.updateUser();
        } else {
            this.createUser();
        }
    }

    private createUser() {
        const formValue = this.userForm.value;
        const formData = new FormData();

        formData.append('login', formValue.login);
        formData.append('password', formValue.password);
        formData.append('role_ids', formValue.roles.map((role: Roles) => role.id).join(','));

        if (this.contactMode === 'existing') {
            formData.append('contact_id', formValue.contact_id.toString());
        } else {
            // Append contact fields
            if (formValue.name) {
                formData.append('contact.name', formValue.name);
            }
            if (formValue.email) {
                formData.append('contact.email', formValue.email);
            }
            if (formValue.phone) {
                formData.append('contact.phone', formValue.phone);
            }
            if (formValue.ip_phone) {
                formData.append('contact.ip_phone', formValue.ip_phone);
            }
            if (formValue.dob) {
                formData.append('contact.dob', this.apiService['dateToYMD'](formValue.dob));
            }
            if (formValue.external_organization_name) {
                formData.append('contact.external_organization_name', formValue.external_organization_name);
            }
            if (formValue.organization_id?.id) {
                formData.append('contact.organization_id', formValue.organization_id.id.toString());
            }
            if (formValue.department_id?.id) {
                formData.append('contact.department_id', formValue.department_id.id.toString());
            }
            if (formValue.position_id?.id) {
                formData.append('contact.position_id', formValue.position_id.id.toString());
            }
        }

        // Append icon file if selected
        if (this.selectedFiles.length > 0) {
            formData.append('icon', this.selectedFiles[0], this.selectedFiles[0].name);
        }

        this.userService
            .createUser(formData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Пользователь успешно создан' });
                    this.loadUsers();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать пользователя' });
                    console.error(err);
                }
            });
    }

    private updateUser() {
        if (!this.selectedUser) return;

        const formValue = this.userForm.getRawValue();
        const formData = new FormData();

        formData.append('login', formValue.login);
        formData.append('role_ids', formValue.roles.map((role: Roles) => role.id).join(','));

        // Only include password if it was changed
        if (formValue.password) {
            formData.append('password', formValue.password);
        }

        // Append icon file if selected
        if (this.selectedFiles.length > 0) {
            formData.append('icon', this.selectedFiles[0], this.selectedFiles[0].name);
        }

        this.userService
            .editUser(this.selectedUser.id, formData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Пользователь успешно обновлен' });
                    this.loadUsers();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить пользователя' });
                    console.error(err);
                }
            });
    }

    openDeleteDialog(user: Users): void {
        this.selectedUser = user;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedUser) return;

        this.userService
            .deleteUser(this.selectedUser.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Пользователь успешно удален' });
                    this.loadUsers();
                    this.displayDeleteDialog = false;
                    this.selectedUser = null;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить пользователя' });
                    console.error(err);
                }
            });
    }

    private loadUsers(): void {
        this.apiService.getUsers().subscribe({
            next: (data) => {
                this.users = data;
            },
            error: () => {},
            complete: () => (this.loading = false)
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
