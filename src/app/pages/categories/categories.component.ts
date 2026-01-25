import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ApiService } from '@/core/services/api.service';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Categories } from '@/core/interfaces/categories';
import { Select } from 'primeng/select';

@Component({
    selector: 'app-categories',
    imports: [Button, ButtonDirective, ButtonIcon, ButtonLabel, Dialog, IconField, InputIcon, InputText, ReactiveFormsModule, TableModule, Select],
    templateUrl: './categories.component.html',
    styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit, OnDestroy {
    categories: Categories[] = [];
    loading = false;
    displayDialog = false;
    catForm: FormGroup;
    submitted: boolean = false;

    private apiService = inject(ApiService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.catForm = this.fb.group({
            name: ['', Validators.required],
            parent_id: [],
            description: ['']
        });
    }

    ngOnInit() {
        this.loading = true;
        this.loadCategories();
    }

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog(): void {
        this.submitted = false;
        this.catForm.reset();
        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
    }

    saveCategory() {
        this.submitted = true;

        if (this.catForm.invalid) {
            return;
        }

        const formValue = this.catForm.value;
        const payload = {
            name: formValue.name,
            description: formValue.description,
            parent_id: formValue.parent_id ? formValue.parent_id.id : null
        };

        this.apiService
            .createCategory(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Категоия успешно создана' });
                    this.loadCategories();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать категорию' });
                    console.error(err);
                }
            });
    }

    private loadCategories(): void {
        this.apiService.getCategories().subscribe({
            next: (data) => {
                this.categories = data;
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
