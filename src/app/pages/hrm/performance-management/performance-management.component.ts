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
import { ProgressBar } from 'primeng/progressbar';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { PerformanceGoal, GOAL_STATUSES, REVIEW_TYPES } from '@/core/interfaces/hrm/performance';

@Component({
    selector: 'app-performance-management',
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
        ProgressBar,
        DialogComponent,
        TextareaComponent
    ],
    templateUrl: './performance-management.component.html',
    styleUrl: './performance-management.component.scss'
})
export class PerformanceManagementComponent implements OnInit, OnDestroy {
    goals: PerformanceGoal[] = [];
    loading: boolean = true;
    displayDialog: boolean = false;
    displayDeleteDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    selectedGoal: PerformanceGoal | null = null;
    goalForm: FormGroup;
    private nextId = 100;

    // Mock data for employees
    employees = [
        { id: 1, name: 'Иванов Иван Иванович' },
        { id: 2, name: 'Петров Петр Петрович' },
        { id: 3, name: 'Сидорова Анна Михайловна' },
        { id: 4, name: 'Козлов Алексей Сергеевич' },
        { id: 5, name: 'Новикова Елена Владимировна' },
        { id: 6, name: 'Морозов Дмитрий Александрович' },
        { id: 7, name: 'Волкова Ольга Николаевна' },
        { id: 8, name: 'Соколов Андрей Викторович' }
    ];

    goalStatuses = GOAL_STATUSES.map(s => ({ id: s.value, name: s.label }));
    reviewTypes = REVIEW_TYPES.map(t => ({ id: t.value, name: t.label }));

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.goalForm = this.fb.group({
            employee_id: [null, Validators.required],
            title: ['', Validators.required],
            description: ['', Validators.required],
            metric: ['', Validators.required],
            target_value: ['', Validators.required],
            weight: [100, [Validators.required, Validators.min(1), Validators.max(100)]],
            start_date: [null, Validators.required],
            due_date: [null, Validators.required]
        });
    }

    ngOnInit() {
        this.loadMockData();
    }

    private loadMockData(): void {
        setTimeout(() => {
            this.goals = [
                {
                    id: 1,
                    employee_id: 1,
                    employee_name: 'Иванов Иван Иванович',
                    title: 'Разработка нового модуля отчетности',
                    description: 'Создание модуля для генерации отчетов в различных форматах',
                    metric: 'Количество реализованных отчетов',
                    target_value: '10',
                    actual_value: '12',
                    weight: 40,
                    start_date: '2024-01-01',
                    due_date: '2024-12-31',
                    status: 'exceeded',
                    progress_percent: 120,
                    rating: 5,
                    comments: 'Отличный результат, перевыполнение плана'
                },
                {
                    id: 2,
                    employee_id: 1,
                    employee_name: 'Иванов Иван Иванович',
                    title: 'Оптимизация производительности',
                    description: 'Улучшение времени отклика основных API эндпоинтов',
                    metric: 'Среднее время отклика (мс)',
                    target_value: '200',
                    actual_value: '180',
                    weight: 30,
                    start_date: '2024-01-01',
                    due_date: '2024-12-31',
                    status: 'completed',
                    progress_percent: 100,
                    rating: 5
                },
                {
                    id: 3,
                    employee_id: 2,
                    employee_name: 'Петров Петр Петрович',
                    title: 'Автоматизация бухгалтерской отчетности',
                    description: 'Настройка автоматической генерации ежемесячных отчетов',
                    metric: 'Количество автоматизированных отчетов',
                    target_value: '15',
                    actual_value: '12',
                    weight: 50,
                    start_date: '2024-01-01',
                    due_date: '2024-12-31',
                    status: 'in_progress',
                    progress_percent: 80
                },
                {
                    id: 4,
                    employee_id: 3,
                    employee_name: 'Сидорова Анна Михайловна',
                    title: 'Снижение текучести кадров',
                    description: 'Разработка и внедрение программы удержания сотрудников',
                    metric: 'Коэффициент текучести (%)',
                    target_value: '10',
                    actual_value: '12',
                    weight: 40,
                    start_date: '2024-01-01',
                    due_date: '2024-12-31',
                    status: 'in_progress',
                    progress_percent: 75
                },
                {
                    id: 5,
                    employee_id: 3,
                    employee_name: 'Сидорова Анна Михайловна',
                    title: 'Программа адаптации новых сотрудников',
                    description: 'Создание и внедрение структурированной программы онбординга',
                    metric: 'Удовлетворенность новых сотрудников (%)',
                    target_value: '85',
                    actual_value: '90',
                    weight: 30,
                    start_date: '2024-01-01',
                    due_date: '2024-12-31',
                    status: 'completed',
                    progress_percent: 100,
                    rating: 5
                },
                {
                    id: 6,
                    employee_id: 4,
                    employee_name: 'Козлов Алексей Сергеевич',
                    title: 'Правовой аудит договоров',
                    description: 'Проведение полного аудита всех действующих договоров',
                    metric: 'Количество проверенных договоров',
                    target_value: '100',
                    actual_value: '100',
                    weight: 50,
                    start_date: '2024-01-01',
                    due_date: '2024-12-31',
                    status: 'completed',
                    progress_percent: 100,
                    rating: 4
                },
                {
                    id: 7,
                    employee_id: 5,
                    employee_name: 'Новикова Елена Владимировна',
                    title: 'Увеличение объема продаж',
                    description: 'Достижение плановых показателей по объему продаж',
                    metric: 'Объем продаж (млн руб)',
                    target_value: '50',
                    actual_value: '35',
                    weight: 60,
                    start_date: '2024-01-01',
                    due_date: '2024-12-31',
                    status: 'in_progress',
                    progress_percent: 70
                },
                {
                    id: 8,
                    employee_id: 6,
                    employee_name: 'Морозов Дмитрий Александрович',
                    title: 'Миграция на новую архитектуру',
                    description: 'Перевод системы на микросервисную архитектуру',
                    metric: 'Количество мигрированных сервисов',
                    target_value: '8',
                    actual_value: '5',
                    weight: 50,
                    start_date: '2024-01-01',
                    due_date: '2024-12-31',
                    status: 'in_progress',
                    progress_percent: 62
                },
                {
                    id: 9,
                    employee_id: 7,
                    employee_name: 'Волкова Ольга Николаевна',
                    title: 'Привлечение новых клиентов',
                    description: 'Расширение клиентской базы в корпоративном сегменте',
                    metric: 'Количество новых клиентов',
                    target_value: '20',
                    actual_value: '8',
                    weight: 40,
                    start_date: '2024-01-01',
                    due_date: '2024-12-31',
                    status: 'not_achieved',
                    progress_percent: 40,
                    comments: 'Требуется дополнительная поддержка маркетинга'
                },
                {
                    id: 10,
                    employee_id: 8,
                    employee_name: 'Соколов Андрей Викторович',
                    title: 'Развитие команды',
                    description: 'Проведение обучающих мероприятий для команды',
                    metric: 'Количество проведенных тренингов',
                    target_value: '12',
                    actual_value: '10',
                    weight: 30,
                    start_date: '2024-01-01',
                    due_date: '2024-12-31',
                    status: 'in_progress',
                    progress_percent: 83
                },
                {
                    id: 11,
                    employee_id: 8,
                    employee_name: 'Соколов Андрей Викторович',
                    title: 'Стратегическое планирование 2025',
                    description: 'Разработка стратегии развития компании на 2025 год',
                    metric: 'Готовность стратегического плана (%)',
                    target_value: '100',
                    weight: 40,
                    start_date: '2024-10-01',
                    due_date: '2025-01-31',
                    status: 'not_started',
                    progress_percent: 0
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
        this.selectedGoal = null;
        this.submitted = false;
        this.goalForm.reset();
        this.goalForm.patchValue({ weight: 100 });
        this.displayDialog = true;
    }

    openEditDialog(goal: PerformanceGoal): void {
        this.isEditMode = true;
        this.selectedGoal = goal;
        this.submitted = false;
        this.goalForm.reset();

        const selectedEmployee = this.employees.find(e => e.id === goal.employee_id);

        this.goalForm.patchValue({
            employee_id: selectedEmployee || null,
            title: goal.title,
            description: goal.description,
            metric: goal.metric,
            target_value: goal.target_value,
            weight: goal.weight,
            start_date: goal.start_date ? new Date(goal.start_date) : null,
            due_date: goal.due_date ? new Date(goal.due_date) : null
        });

        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedGoal = null;
    }

    onSubmit() {
        this.submitted = true;
        if (this.goalForm.invalid) return;

        const formValue = this.goalForm.value;

        if (this.isEditMode && this.selectedGoal) {
            const index = this.goals.findIndex(g => g.id === this.selectedGoal!.id);
            if (index !== -1) {
                this.goals[index] = {
                    ...this.goals[index],
                    employee_id: formValue.employee_id?.id,
                    employee_name: formValue.employee_id?.name,
                    title: formValue.title,
                    description: formValue.description,
                    metric: formValue.metric,
                    target_value: formValue.target_value,
                    weight: formValue.weight,
                    start_date: formValue.start_date ? this.dateToYMD(formValue.start_date) : '',
                    due_date: formValue.due_date ? this.dateToYMD(formValue.due_date) : ''
                };
                this.goals = [...this.goals];
            }
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Цель обновлена' });
        } else {
            const newGoal: PerformanceGoal = {
                id: this.nextId++,
                employee_id: formValue.employee_id?.id,
                employee_name: formValue.employee_id?.name,
                title: formValue.title,
                description: formValue.description,
                metric: formValue.metric,
                target_value: formValue.target_value,
                weight: formValue.weight,
                start_date: formValue.start_date ? this.dateToYMD(formValue.start_date) : '',
                due_date: formValue.due_date ? this.dateToYMD(formValue.due_date) : '',
                status: 'not_started',
                progress_percent: 0
            };
            this.goals = [...this.goals, newGoal];
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Цель создана' });
        }

        this.closeDialog();
    }

    openDeleteDialog(goal: PerformanceGoal): void {
        this.selectedGoal = goal;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedGoal) return;

        this.goals = this.goals.filter(g => g.id !== this.selectedGoal!.id);
        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Цель удалена' });
        this.displayDeleteDialog = false;
        this.selectedGoal = null;
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status) {
            case 'completed': return 'success';
            case 'exceeded': return 'info';
            case 'in_progress': return 'warn';
            case 'not_achieved': return 'danger';
            case 'not_started': return 'secondary';
            default: return 'info';
        }
    }

    getStatusLabel(status: string): string {
        const found = this.goalStatuses.find(s => s.id === status);
        return found ? found.name : status;
    }

    getProgressColor(progress: number): string {
        if (progress >= 100) return 'green';
        if (progress >= 70) return 'blue';
        if (progress >= 40) return 'orange';
        return 'red';
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
