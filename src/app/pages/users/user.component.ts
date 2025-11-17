import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Users, AddUserRequest } from '@/core/interfaces/users';
import { ApiService } from '@/core/services/api.service';
import { UserService } from '@/core/services/user.service';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Chip } from 'primeng/chip';
import { Dialog } from 'primeng/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Roles } from '@/core/interfaces/roles';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Password } from 'primeng/password';
import { MultiSelect } from 'primeng/multiselect';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { InputNumberdComponent } from '@/layout/component/dialog/input-number/input-number.component';

@Component({
    selector: 'app-users',
    imports: [TableModule, ButtonDirective, IconField, InputIcon, InputText, ButtonLabel, ButtonIcon, Chip, Button, Dialog, ReactiveFormsModule, Password, MultiSelect, InputTextComponent, DatePickerComponent, InputNumberdComponent],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss'
})
export class User implements OnInit, OnDestroy {
    users: Users[] = [];
    allRoles: Roles[] = [];
    loading: boolean = true;
    displayDialog: boolean = false;
    submitted: boolean = false;
    userForm: FormGroup;

    private apiService = inject(ApiService);
    private userService = inject(UserService);

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.userForm = this.fb.group({
            login: ['', Validators.required],
            password: ['', Validators.required],
            roles: [[]],
            // NewContactRequest fields
            fio: ['', Validators.required],
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
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog(): void {
        this.submitted = false;
        this.userForm.reset({ roles: [] });
        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
    }

    saveUser() {
        this.submitted = true;

        if (this.userForm.invalid) {
            return;
        }

        const formValue = this.userForm.value;
        const payload: AddUserRequest = {
            login: formValue.login,
            password: formValue.password,
            role_ids: formValue.roles.map((role: Roles) => role.id),
            contact: {
                fio: formValue.fio,
                email: formValue.email || null,
                phone: formValue.phone || null,
                ip_phone: formValue.ip_phone || null,
                dob: formValue.dob ? this.apiService['dateToYMD'](formValue.dob) : null,
                external_organization_name: formValue.external_organization_name || null,
                organization_id: formValue.organization_id || null,
                department_id: formValue.department_id || null,
                position_id: formValue.position_id || null
            }
        };

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

    private loadUsers(): void {
        this.apiService.getUsers().subscribe({
            next: (data) => {
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
