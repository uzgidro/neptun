import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { Tooltip } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { Checkbox } from 'primeng/checkbox';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { Training, TRAINING_TYPES, TRAINING_STATUSES } from '@/core/interfaces/hrm/training';

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
        TextareaComponent
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
    private nextId = 100;

    trainingTypes = TRAINING_TYPES.map(t => ({ id: t.value, name: t.label }));
    trainingStatuses = TRAINING_STATUSES.map(s => ({ id: s.value, name: s.label }));

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
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
        this.loadMockData();
    }

    private loadMockData(): void {
        setTimeout(() => {
            this.trainings = [
                {
                    id: 1,
                    title: 'Angular Advanced: Продвинутый курс',
                    description: 'Углубленное изучение Angular: производительность, архитектура, тестирование',
                    training_type: 'course',
                    provider: 'IT Academy',
                    start_date: '2025-02-01',
                    end_date: '2025-02-28',
                    duration_hours: 40,
                    location: 'Онлайн',
                    is_online: true,
                    max_participants: 20,
                    current_participants: 15,
                    status: 'planned',
                    cost: 45000,
                    certificate_provided: true
                },
                {
                    id: 2,
                    title: 'Эффективная коммуникация',
                    description: 'Развитие навыков деловой коммуникации и презентации',
                    training_type: 'workshop',
                    provider: 'HR Solutions',
                    start_date: '2025-01-15',
                    end_date: '2025-01-16',
                    duration_hours: 16,
                    location: 'Конференц-зал А',
                    is_online: false,
                    max_participants: 15,
                    current_participants: 12,
                    status: 'in_progress',
                    cost: 25000,
                    certificate_provided: true
                },
                {
                    id: 3,
                    title: 'Управление проектами: Основы Agile',
                    description: 'Введение в Agile методологии, Scrum и Kanban',
                    training_type: 'seminar',
                    provider: 'Project Management Institute',
                    start_date: '2024-12-10',
                    end_date: '2024-12-12',
                    duration_hours: 24,
                    location: 'Онлайн',
                    is_online: true,
                    max_participants: 30,
                    current_participants: 28,
                    status: 'completed',
                    cost: 35000,
                    certificate_provided: true
                },
                {
                    id: 4,
                    title: 'AWS Solutions Architect',
                    description: 'Подготовка к сертификации AWS Solutions Architect Associate',
                    training_type: 'certification',
                    provider: 'Amazon Web Services',
                    start_date: '2025-03-01',
                    end_date: '2025-04-15',
                    duration_hours: 60,
                    location: 'Онлайн',
                    is_online: true,
                    max_participants: 10,
                    current_participants: 5,
                    status: 'planned',
                    cost: 80000,
                    certificate_provided: true
                },
                {
                    id: 5,
                    title: 'Менторская программа для руководителей',
                    description: 'Индивидуальный менторинг для развития лидерских качеств',
                    training_type: 'mentoring',
                    provider: 'Внутренний ресурс',
                    start_date: '2024-11-01',
                    end_date: '2025-02-28',
                    duration_hours: 20,
                    is_online: false,
                    max_participants: 5,
                    current_participants: 5,
                    status: 'in_progress',
                    cost: 0,
                    certificate_provided: false
                },
                {
                    id: 6,
                    title: 'Охрана труда: Ежегодный инструктаж',
                    description: 'Обязательное обучение по охране труда для всех сотрудников',
                    training_type: 'course',
                    provider: 'Центр охраны труда',
                    start_date: '2024-10-01',
                    end_date: '2024-10-15',
                    duration_hours: 8,
                    location: 'Учебный класс',
                    is_online: false,
                    max_participants: 50,
                    current_participants: 48,
                    status: 'completed',
                    cost: 15000,
                    certificate_provided: true
                },
                {
                    id: 7,
                    title: 'Python для аналитики данных',
                    description: 'Самостоятельное изучение Python с использованием корпоративной платформы',
                    training_type: 'self_study',
                    provider: 'Корпоративная платформа',
                    start_date: '2025-01-01',
                    end_date: '2025-06-30',
                    duration_hours: 100,
                    location: 'Онлайн',
                    is_online: true,
                    status: 'planned',
                    cost: 0,
                    certificate_provided: true
                },
                {
                    id: 8,
                    title: 'Тимбилдинг: Командная работа',
                    description: 'Воркшоп по развитию командного взаимодействия',
                    training_type: 'workshop',
                    provider: 'Team Building Pro',
                    start_date: '2024-09-20',
                    end_date: '2024-09-20',
                    duration_hours: 8,
                    location: 'Загородная база',
                    is_online: false,
                    max_participants: 40,
                    current_participants: 38,
                    status: 'completed',
                    cost: 60000,
                    certificate_provided: false
                },
                {
                    id: 9,
                    title: 'Информационная безопасность',
                    description: 'Курс по основам информационной безопасности для сотрудников',
                    training_type: 'course',
                    start_date: '2025-01-20',
                    end_date: '2025-01-20',
                    duration_hours: 4,
                    location: 'Онлайн',
                    is_online: true,
                    status: 'cancelled',
                    cost: 10000,
                    certificate_provided: true
                }
            ];
            this.loading = false;
        }, 500);
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

        const selectedType = this.trainingTypes.find(t => t.id === training.training_type);

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

        const formValue = this.trainingForm.value;

        if (this.isEditMode && this.selectedTraining) {
            const index = this.trainings.findIndex(t => t.id === this.selectedTraining!.id);
            if (index !== -1) {
                this.trainings[index] = {
                    ...this.trainings[index],
                    title: formValue.title,
                    description: formValue.description,
                    training_type: formValue.training_type?.id,
                    provider: formValue.provider || undefined,
                    start_date: formValue.start_date ? this.dateToYMD(formValue.start_date) : '',
                    end_date: formValue.end_date ? this.dateToYMD(formValue.end_date) : '',
                    duration_hours: formValue.duration_hours,
                    location: formValue.location || undefined,
                    is_online: formValue.is_online,
                    max_participants: formValue.max_participants || undefined,
                    cost: formValue.cost || undefined,
                    certificate_provided: formValue.certificate_provided
                };
                this.trainings = [...this.trainings];
            }
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Обучение обновлено' });
        } else {
            const newTraining: Training = {
                id: this.nextId++,
                title: formValue.title,
                description: formValue.description,
                training_type: formValue.training_type?.id,
                provider: formValue.provider || undefined,
                start_date: formValue.start_date ? this.dateToYMD(formValue.start_date) : '',
                end_date: formValue.end_date ? this.dateToYMD(formValue.end_date) : '',
                duration_hours: formValue.duration_hours,
                location: formValue.location || undefined,
                is_online: formValue.is_online,
                max_participants: formValue.max_participants || undefined,
                current_participants: 0,
                status: 'planned',
                cost: formValue.cost || undefined,
                certificate_provided: formValue.certificate_provided
            };
            this.trainings = [...this.trainings, newTraining];
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Обучение создано' });
        }

        this.closeDialog();
    }

    openDeleteDialog(training: Training): void {
        this.selectedTraining = training;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedTraining) return;

        this.trainings = this.trainings.filter(t => t.id !== this.selectedTraining!.id);
        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Обучение удалено' });
        this.displayDeleteDialog = false;
        this.selectedTraining = null;
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'info';
            case 'planned': return 'warn';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    }

    getStatusLabel(status: string): string {
        const found = this.trainingStatuses.find(s => s.id === status);
        return found ? found.name : status;
    }

    getTypeLabel(type: string): string {
        const found = this.trainingTypes.find(t => t.id === type);
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
