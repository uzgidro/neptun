import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { Position, PositionPayload } from '@/core/interfaces/position';
import { PositionService } from '@/core/services/position.service';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { Tooltip } from 'primeng/tooltip';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';

@Component({
    selector: 'app-position',
    imports: [TableModule, ButtonDirective, IconField, InputIcon, InputText, ButtonLabel, ButtonIcon, ReactiveFormsModule, InputTextComponent, DeleteConfirmationComponent, Tooltip, DialogComponent],
    templateUrl: './position.component.html',
    styleUrl: './position.component.scss'
})
export class PositionComponent implements OnInit, OnDestroy {
    positions: Position[] = [];
    loading: boolean = true;
    displayDialog: boolean = false;
    displayDeleteDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    selectedPosition: Position | null = null;
    positionForm: FormGroup;

    private positionService = inject(PositionService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.positionForm = this.fb.group({
            name: ['', Validators.required],
            description: ['']
        });
    }

    ngOnInit() {
        this.loadPositions();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog(): void {
        this.isEditMode = false;
        this.selectedPosition = null;
        this.submitted = false;
        this.positionForm.reset();
        this.displayDialog = true;
    }

    openEditDialog(position: Position): void {
        this.isEditMode = true;
        this.selectedPosition = position;
        this.submitted = false;

        this.positionForm.patchValue({
            name: position.name,
            description: position.description || ''
        });

        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedPosition = null;
    }

    onSubmit() {
        this.submitted = true;

        if (this.positionForm.invalid) {
            return;
        }

        if (this.isEditMode && this.selectedPosition) {
            this.updatePosition();
        } else {
            this.createPosition();
        }
    }

    private createPosition() {
        const formValue = this.positionForm.value;
        const payload: PositionPayload = {
            name: formValue.name,
            description: formValue.description || undefined
        };

        this.positionService
            .createPosition(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Должность успешно создана' });
                    this.loadPositions();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать должность' });
                    console.error(err);
                }
            });
    }

    private updatePosition() {
        if (!this.selectedPosition) return;

        const formValue = this.positionForm.value;
        const payload: PositionPayload = {
            name: formValue.name,
            description: formValue.description || undefined
        };

        this.positionService
            .updatePosition(this.selectedPosition.id, payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Должность успешно обновлена' });
                    this.loadPositions();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить должность' });
                    console.error(err);
                }
            });
    }

    openDeleteDialog(position: Position): void {
        this.selectedPosition = position;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedPosition) return;

        this.positionService
            .deletePosition(this.selectedPosition.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Должность успешно удалена' });
                    this.loadPositions();
                    this.displayDeleteDialog = false;
                    this.selectedPosition = null;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить должность' });
                    console.error(err);
                }
            });
    }

    private loadPositions(): void {
        this.positionService.getPositions().subscribe({
            next: (data) => {
                this.positions = data;
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
