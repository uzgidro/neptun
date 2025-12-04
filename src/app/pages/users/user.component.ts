import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { AddUserRequest, EditUserRequest, Users } from '@/core/interfaces/users';
import { ApiService } from '@/core/services/api.service';
import { UserService } from '@/core/services/user.service';
import { ContactService } from '@/core/services/contact.service';
import { Contact } from '@/core/interfaces/contact';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Chip } from 'primeng/chip';
import { Dialog } from 'primeng/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Roles } from '@/core/interfaces/roles';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Password } from 'primeng/password';
import { MultiSelect } from 'primeng/multiselect';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { InputNumberdComponent } from '@/layout/component/dialog/input-number/input-number.component';
import {
    DeleteConfirmationComponent
} from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { Tooltip } from 'primeng/tooltip';
import { SelectButton } from 'primeng/selectbutton';
import { Select } from 'primeng/select';

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
        Dialog,
        ReactiveFormsModule,
        FormsModule,
        Password,
        MultiSelect,
        InputTextComponent,
        DatePickerComponent,
        InputNumberdComponent,
        DeleteConfirmationComponent,
        Tooltip,
        SelectButton,
        Select
    ],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss'
})
export class User implements OnInit, OnDestroy {
    users: Users[] = [];
    allRoles: Roles[] = [];
    allContacts: Contact[] = [];
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

    private apiService = inject(ApiService);
    private userService = inject(UserService);
    private contactService = inject(ContactService);

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
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog(): void {
        this.isEditMode = false;
        this.selectedUser = null;
        this.submitted = false;
        this.contactMode = 'new';
        this.userForm.reset({ roles: [], contact_id: null });
        this.userForm.get('login')?.enable();
        this.userForm.get('password')?.setValidators([Validators.required]);
        this.userForm.get('password')?.updateValueAndValidity();
        this.updateContactValidators();
        this.displayDialog = true;
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
        const selectedRoles = this.allRoles.filter((role) => user.role_ids?.includes(role.id));

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
            organization_id: user.contact?.organization_id || null,
            department_id: user.contact?.department_id || null,
            position_id: user.contact?.position_id || null
        });

        console.log(this.userForm.value);

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

    saveUser() {
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
        const payload: AddUserRequest = {
            login: formValue.login,
            password: formValue.password,
            role_ids: formValue.roles.map((role: Roles) => role.id)
        };

        if (this.contactMode === 'existing') {
            payload.contact_id = formValue.contact_id;
        } else {
            payload.contact = {
                name: formValue.name,
                email: formValue.email || null,
                phone: formValue.phone || null,
                ip_phone: formValue.ip_phone || null,
                dob: formValue.dob ? this.apiService['dateToYMD'](formValue.dob) : null,
                external_organization_name: formValue.external_organization_name || null,
                organization_id: formValue.organization_id || null,
                department_id: formValue.department_id || null,
                position_id: formValue.position_id || null
            };
        }

        this.userService
            .createUser(payload)
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
        const payload: EditUserRequest = {
            login: formValue.login,
            role_ids: formValue.roles.map((role: Roles) => role.id)
        };

        // Only include password if it was changed
        if (formValue.password) {
            payload.password = formValue.password;
        }

        this.userService
            .editUser(this.selectedUser.id, payload)
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
                console.log(data);
                this.users = data;
            },
            error: (err) => console.log(err),
            complete: () => (this.loading = false)
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
