import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ApiService } from '@/core/services/api.service';
import { Roles } from '@/core/interfaces/roles';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-roles',
    imports: [TableModule, ButtonDirective, ButtonIcon, ButtonLabel, IconField, InputIcon, InputText, Button, Dialog, ReactiveFormsModule],
    templateUrl: './roles.html',
    styleUrl: './roles.scss'
})
export class Role implements OnInit, OnDestroy {
    roles: Roles[] = [];
    loading = false;
    displayDialog = false;
    roleForm: FormGroup;
    submitted: boolean = false;

    private apiService = inject(ApiService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.roleForm = this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });
    }

    ngOnInit() {
        this.loading = true;
        this.loadRoles();
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog(): void {
        this.submitted = false;
        this.roleForm.reset();
        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
    }

    saveRole() {
        this.submitted = true;

        if (this.roleForm.invalid) {
            return;
        }

        const { name, description } = this.roleForm.value;

        this.apiService
            .createRole(name, description)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Роль успешно создана' });
                    this.loadRoles();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать роль' });
                    console.error(err);
                }
            });
    }

    private loadRoles(): void {
        this.apiService.getRoles().subscribe({
            next: (data) => {
                this.roles = data;
            },
            error: () => {},
            complete: () => {
                this.loading = false;
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
