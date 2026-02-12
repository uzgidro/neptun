import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Tooltip } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { Checkbox } from 'primeng/checkbox';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { Training, TrainingPayload, TRAINING_TYPES, TRAINING_STATUSES } from '@/core/interfaces/hrm/training';
import { TrainingService } from '@/core/services/training.service';

@Component({
    selector: 'app-training',
    standalone: true,
    imports: [
        CommonModule,
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
        DeleteConfirmationComponent,
        Tooltip,
        Tag,
        Checkbox,
        DialogComponent,
        TextareaComponent,
        TranslateModule
    ],
    templateUrl: './training.component.html',
    styleUrl: './training.component.scss'
})
export class TrainingComponent implements OnInit, OnDestroy {
    trainings: Training[] = [];
    loading: boolean = true;
    displayDialog: boolean = false;
    displayDeleteDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    selectedTraining: Training | null = null;
    trainingForm: FormGroup;

    trainingTypes = TRAINING_TYPES.map((t) => ({ id: t.value, name: t.label }));
    trainingStatuses = TRAINING_STATUSES.map((s) => ({ id: s.value, name: s.label }));

    private trainingService = inject(TrainingService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.trainingForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            training_type: [null, Validators.required],
            provider: [''],
            start_date: [null, Validators.required],
            end_date: [null, Validators.required],
            duration_hours: [0, [Validators.required, Validators.min(1)]],
            location: [''],
            is_online: [false],
            max_participants: [null],
            cost: [null],
            certificate_provided: [false]
        });
    }

    ngOnInit() {
        this.loadTrainings();
    }

    private loadTrainings(): void {
        this.trainingService
            .getTrainings()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.trainings = data;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.DASHBOARD.LOAD_ERROR') });
                    console.error(err);
                },
                complete: () => (this.loading = false)
            });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog(): void {
        this.isEditMode = false;
        this.selectedTraining = null;
        this.submitted = false;
        this.trainingForm.reset();
        this.trainingForm.patchValue({ is_online: false, certificate_provided: false, duration_hours: 0 });
        this.displayDialog = true;
    }

    openEditDialog(training: Training): void {
        this.isEditMode = true;
        this.selectedTraining = training;
        this.submitted = false;
        this.trainingForm.reset();

        const selectedType = this.trainingTypes.find((t) => t.id === training.training_type);

        this.trainingForm.patchValue({
            title: training.title,
            description: training.description,
            training_type: selectedType || null,
            provider: training.provider || '',
            start_date: training.start_date ? new Date(training.start_date) : null,
            end_date: training.end_date ? new Date(training.end_date) : null,
            duration_hours: training.duration_hours,
            location: training.location || '',
            is_online: training.is_online,
            max_participants: training.max_participants,
            cost: training.cost,
            certificate_provided: training.certificate_provided
        });

        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedTraining = null;
    }

    onSubmit() {
        this.submitted = true;
        if (this.trainingForm.invalid) return;

        if (this.isEditMode && this.selectedTraining) {
            this.updateTraining();
        } else {
            this.createTraining();
        }
    }

    private createTraining(): void {
        const formValue = this.trainingForm.value;
        const payload: TrainingPayload = {
            title: formValue.title,
            description: formValue.description,
            training_type: formValue.training_type?.id,
            provider: formValue.provider || undefined,
            start_date: formValue.start_date ? this.dateToYMD(formValue.start_date) : undefined,
            end_date: formValue.end_date ? this.dateToYMD(formValue.end_date) : undefined,
            duration_hours: formValue.duration_hours,
            location: formValue.location || undefined,
            is_online: formValue.is_online,
            max_participants: formValue.max_participants || undefined,
            cost: formValue.cost || undefined,
            certificate_provided: formValue.certificate_provided
        };

        this.trainingService
            .createTraining(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('COMMON.SUCCESS') });
                    this.loadTrainings();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('COMMON.ERROR') });
                    console.error(err);
                }
            });
    }

    private updateTraining(): void {
        if (!this.selectedTraining) return;

        const formValue = this.trainingForm.value;
        const payload: TrainingPayload = {
            title: formValue.title,
            description: formValue.description,
            training_type: formValue.training_type?.id,
            provider: formValue.provider || undefined,
            start_date: formValue.start_date ? this.dateToYMD(formValue.start_date) : undefined,
            end_date: formValue.end_date ? this.dateToYMD(formValue.end_date) : undefined,
            duration_hours: formValue.duration_hours,
            location: formValue.location || undefined,
            is_online: formValue.is_online,
            max_participants: formValue.max_participants || undefined,
            cost: formValue.cost || undefined,
            certificate_provided: formValue.certificate_provided
        };

        this.trainingService
            .updateTraining(this.selectedTraining.id, payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('COMMON.SUCCESS') });
                    this.loadTrainings();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('COMMON.ERROR') });
                    console.error(err);
                }
            });
    }

    openDeleteDialog(training: Training): void {
        this.selectedTraining = training;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedTraining) return;

        this.trainingService
            .deleteTraining(this.selectedTraining.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('COMMON.SUCCESS') });
                    this.loadTrainings();
                    this.displayDeleteDialog = false;
                    this.selectedTraining = null;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('COMMON.ERROR') });
                    console.error(err);
                }
            });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status) {
            case 'completed':
                return 'success';
            case 'in_progress':
                return 'info';
            case 'planned':
                return 'warn';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    getStatusLabel(status: string): string {
        const found = this.trainingStatuses.find((s) => s.id === status);
        return found ? found.name : status;
    }

    getTypeLabel(type: string): string {
        const found = this.trainingTypes.find((t) => t.id === type);
        return found ? found.name : type;
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
