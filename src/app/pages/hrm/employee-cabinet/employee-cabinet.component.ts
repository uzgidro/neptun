import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Avatar } from 'primeng/avatar';
import { Badge } from 'primeng/badge';
import { Tooltip } from 'primeng/tooltip';
import { ProgressBar } from 'primeng/progressbar';
import { Dialog } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import {
    EmployeeProfile,
    LeaveBalance,
    MyVacationRequest,
    MySalaryInfo,
    SalaryPayment,
    MyTraining,
    MyCompetencies,
    MyNotification,
    MyTask,
    MyDocument,
    VACATION_TYPES,
    VACATION_STATUSES,
    DOCUMENT_TYPES,
    VacationStatus
} from '@/core/interfaces/hrm/employee-cabinet';

@Component({
    selector: 'app-employee-cabinet',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonDirective,
        Tag,
        Avatar,
        Badge,
        Tooltip,
        ProgressBar,
        Dialog,
        TabsModule,
        TableModule,
        Select,
        DatePicker,
        Textarea
    ],
    templateUrl: './employee-cabinet.component.html',
    styleUrl: './employee-cabinet.component.scss'
})
export class EmployeeCabinetComponent implements OnInit, OnDestroy {
    // Data
    profile: EmployeeProfile | null = null;
    leaveBalance: LeaveBalance | null = null;
    salaryInfo: MySalaryInfo | null = null;
    training: MyTraining | null = null;
    competencies: MyCompetencies | null = null;
    notifications: MyNotification[] = [];
    tasks: MyTask[] = [];
    documents: MyDocument[] = [];
    vacationRequests: MyVacationRequest[] = [];

    loading: boolean = true;
    activeTab: number = 0;

    // Dialogs
    displayVacationDialog: boolean = false;
    displayPayslipDialog: boolean = false;
    displayPaymentHistoryDialog: boolean = false;
    selectedPayslip: SalaryPayment | null = null;

    // Forms
    vacationForm: FormGroup;
    submitted: boolean = false;

    // Constants
    vacationTypes = VACATION_TYPES;
    vacationStatuses = VACATION_STATUSES;
    documentTypes = DOCUMENT_TYPES;

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.vacationForm = this.fb.group({
            type: [null, Validators.required],
            start_date: [null, Validators.required],
            end_date: [null, Validators.required],
            reason: [''],
            substitute_id: [null]
        });
    }

    ngOnInit() {
        this.loadAllData();
    }

    private loadAllData(): void {
        this.loading = true;

        setTimeout(() => {
            this.loadProfile();
            this.loadLeaveBalance();
            this.loadSalaryInfo();
            this.loadTraining();
            this.loadCompetencies();
            this.loadNotifications();
            this.loadTasks();
            this.loadDocuments();
            this.loadVacationRequests();
            this.loading = false;
        }, 500);
    }

    private loadProfile(): void {
        this.profile = {
            id: 1,
            employee_id: 'EMP-2019-0234',
            full_name: 'Абдуллаев Азамбай Ахмадович',
            first_name: 'Азамбай',
            last_name: 'Абдуллаев',
            middle_name: 'Ахмадович',
            position_id: 15,
            position_name: 'Инженер по автоматизации',
            department_id: 1,
            department_name: 'IT-отдел',
            email: 'abdulaev.a@ministry.uz',
            phone: '+998 (71) 123-45-67',
            internal_phone: '1234',
            hire_date: '2019-02-15',
            birth_date: '1990-05-20',
            employment_status: 'active',
            contract_type: 'permanent',
            is_on_probation: false,
            manager_id: 5,
            manager_name: 'Каримов Бахтиёр Рустамович'
        };
    }

    private loadLeaveBalance(): void {
        this.leaveBalance = {
            employee_id: 1,
            year: 2025,
            annual_leave_total: 15,
            annual_leave_used: 3,
            annual_leave_remaining: 12,
            additional_leave_total: 5,
            additional_leave_used: 3,
            additional_leave_remaining: 2,
            study_leave_total: 3,
            study_leave_used: 3,
            study_leave_remaining: 0,
            sick_leave_used_month: 1,
            sick_leave_used_year: 5,
            comp_days_available: 2
        };
    }

    private loadSalaryInfo(): void {
        this.salaryInfo = {
            employee_id: 1,
            current_salary: {
                base_salary: 3000000,
                total_allowances: 500000,
                gross_salary: 3500000
            },
            last_payment: {
                id: 12,
                period_month: 12,
                period_year: 2024,
                gross_salary: 3500000,
                total_deductions: 525000,
                net_salary: 2975000,
                paid_at: '2025-01-02',
                status: 'paid'
            },
            payment_history: [
                { id: 12, period_month: 12, period_year: 2024, gross_salary: 3500000, total_deductions: 525000, net_salary: 2975000, paid_at: '2025-01-02', status: 'paid' },
                { id: 11, period_month: 11, period_year: 2024, gross_salary: 3500000, total_deductions: 525000, net_salary: 2975000, paid_at: '2024-12-03', status: 'paid' },
                { id: 10, period_month: 10, period_year: 2024, gross_salary: 3500000, total_deductions: 525000, net_salary: 2975000, paid_at: '2024-11-04', status: 'paid' },
                { id: 9, period_month: 9, period_year: 2024, gross_salary: 3500000, total_deductions: 525000, net_salary: 2975000, paid_at: '2024-10-02', status: 'paid' },
                { id: 8, period_month: 8, period_year: 2024, gross_salary: 3500000, total_deductions: 525000, net_salary: 2975000, paid_at: '2024-09-03', status: 'paid' },
                { id: 7, period_month: 7, period_year: 2024, gross_salary: 3200000, total_deductions: 480000, net_salary: 2720000, paid_at: '2024-08-02', status: 'paid' }
            ]
        };
    }

    private loadTraining(): void {
        this.training = {
            completed: [
                {
                    id: 1,
                    course_id: 10,
                    course_name: 'Управление проектами',
                    course_type: 'Профессиональное развитие',
                    completed_at: '2024-11-15',
                    score: 92,
                    certificate_number: 'ПМ-2024-001234',
                    certificate_url: '/certificates/pm-2024-001234.pdf'
                },
                {
                    id: 2,
                    course_id: 8,
                    course_name: 'Информационная безопасность',
                    course_type: 'Обязательное обучение',
                    completed_at: '2024-09-20',
                    score: 88,
                    certificate_number: 'ИБ-2024-005678'
                }
            ],
            in_progress: [
                {
                    id: 3,
                    course_id: 15,
                    course_name: 'Цифровая трансформация',
                    course_type: 'Профессиональное развитие',
                    started_at: '2025-01-20',
                    deadline: '2025-03-20',
                    progress_percent: 20,
                    modules_completed: 2,
                    modules_total: 10
                }
            ],
            assigned: [
                {
                    id: 4,
                    course_id: 20,
                    course_name: 'Agile и Scrum методологии',
                    course_type: 'Профессиональное развитие',
                    assigned_at: '2025-01-15',
                    start_date: '2025-02-01',
                    deadline: '2025-04-01',
                    assigned_by_name: 'Каримов Б.Р.',
                    is_mandatory: true
                }
            ]
        };
    }

    private loadCompetencies(): void {
        this.competencies = {
            employee_id: 1,
            last_assessment_date: '2024-10-15',
            next_assessment_date: '2025-04-15',
            average_score: 3.5,
            competencies: [
                { competency_id: 1, competency_name: 'Лидерство', category: 'Управленческие', current_level: 3, max_level: 5, target_level: 4, target_date: '2025-06-01' },
                { competency_id: 2, competency_name: 'Коммуникация', category: 'Личностные', current_level: 4, max_level: 5 },
                { competency_id: 3, competency_name: 'Аналитическое мышление', category: 'Профессиональные', current_level: 4, max_level: 5 },
                { competency_id: 4, competency_name: 'Управление проектами', category: 'Профессиональные', current_level: 3, max_level: 5, target_level: 4, target_date: '2025-06-01' },
                { competency_id: 5, competency_name: 'Техническая экспертиза', category: 'Профессиональные', current_level: 4, max_level: 5 },
                { competency_id: 6, competency_name: 'Работа в команде', category: 'Личностные', current_level: 4, max_level: 5 }
            ],
            development_plan: [
                {
                    id: 1,
                    competency_name: 'Лидерство',
                    current_level: 3,
                    target_level: 4,
                    target_date: '2025-06-01',
                    actions: ['Пройти курс "Эффективное лидерство"', 'Взять роль ментора для junior-специалиста'],
                    status: 'in_progress'
                },
                {
                    id: 2,
                    competency_name: 'Управление проектами',
                    current_level: 3,
                    target_level: 4,
                    target_date: '2025-06-01',
                    actions: ['Получить сертификацию PMP', 'Возглавить мини-проект'],
                    status: 'not_started'
                }
            ]
        };
    }

    private loadNotifications(): void {
        this.notifications = [
            {
                id: 1,
                type: 'vacation_approved',
                title: 'Отпуск одобрен',
                message: 'Ваша заявка на отпуск с 01.02.2025 по 05.02.2025 одобрена',
                created_at: '2025-01-24T10:30:00',
                read: false,
                icon: 'pi-calendar-plus',
                severity: 'success'
            },
            {
                id: 2,
                type: 'training_assigned',
                title: 'Назначено обучение',
                message: 'Вам назначен курс "Agile и Scrum методологии". Начало: 01.02.2025',
                created_at: '2025-01-15T09:00:00',
                read: true,
                icon: 'pi-book',
                severity: 'info'
            },
            {
                id: 3,
                type: 'salary_paid',
                title: 'Зарплата выплачена',
                message: 'Зарплата за декабрь 2024 зачислена на ваш счет',
                created_at: '2025-01-02T12:00:00',
                read: true,
                icon: 'pi-wallet',
                severity: 'success'
            }
        ];
    }

    private loadTasks(): void {
        this.tasks = [
            {
                id: 1,
                type: 'training',
                title: 'Пройти курс "Цифровая трансформация"',
                description: 'Завершить все модули курса',
                due_date: '2025-03-20',
                priority: 'medium',
                status: 'in_progress',
                link: '/hrm/training'
            },
            {
                id: 2,
                type: 'document',
                title: 'Подписать дополнительное соглашение',
                description: 'Соглашение о повышении оклада',
                due_date: '2025-01-30',
                priority: 'high',
                status: 'pending',
                assigned_by_name: 'Отдел кадров'
            }
        ];
    }

    private loadDocuments(): void {
        this.documents = [
            {
                id: 1,
                type: 'contract',
                name: 'Трудовой договор №234 от 15.02.2019',
                uploaded_at: '2019-02-15',
                can_download: true
            },
            {
                id: 2,
                type: 'addendum',
                name: 'Доп. соглашение №12 (повышение) от 01.07.2024',
                uploaded_at: '2024-07-01',
                can_download: true
            },
            {
                id: 3,
                type: 'certificate',
                name: 'Сертификат "Управление проектами"',
                uploaded_at: '2024-11-15',
                can_download: true
            },
            {
                id: 4,
                type: 'payslip',
                name: 'Расчетный лист за декабрь 2024',
                uploaded_at: '2025-01-02',
                can_download: true
            }
        ];
    }

    private loadVacationRequests(): void {
        this.vacationRequests = [
            {
                id: 1,
                type: 'annual',
                start_date: '2025-02-01',
                end_date: '2025-02-05',
                days_count: 5,
                status: 'approved',
                submitted_at: '2025-01-20T10:00:00',
                approved_by: 5,
                approved_by_name: 'Каримов Б.Р.',
                approved_at: '2025-01-24T10:30:00'
            },
            {
                id: 2,
                type: 'annual',
                start_date: '2024-08-01',
                end_date: '2024-08-14',
                days_count: 14,
                status: 'completed',
                submitted_at: '2024-07-15T09:00:00',
                approved_by: 5,
                approved_by_name: 'Каримов Б.Р.',
                approved_at: '2024-07-16T11:00:00'
            }
        ];
    }

    // Actions
    openVacationDialog(): void {
        this.submitted = false;
        this.vacationForm.reset();
        this.displayVacationDialog = true;
    }

    submitVacationRequest(): void {
        this.submitted = true;
        if (this.vacationForm.invalid) return;

        const formValue = this.vacationForm.value;

        const newRequest: MyVacationRequest = {
            id: this.vacationRequests.length + 1,
            type: formValue.type?.value,
            start_date: formValue.start_date instanceof Date ? formValue.start_date.toISOString().split('T')[0] : formValue.start_date,
            end_date: formValue.end_date instanceof Date ? formValue.end_date.toISOString().split('T')[0] : formValue.end_date,
            days_count: this.calculateDays(formValue.start_date, formValue.end_date),
            status: 'pending',
            reason: formValue.reason,
            submitted_at: new Date().toISOString()
        };

        this.vacationRequests = [newRequest, ...this.vacationRequests];
        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Заявка на отпуск отправлена на согласование' });
        this.displayVacationDialog = false;
    }

    cancelVacationRequest(request: MyVacationRequest): void {
        const index = this.vacationRequests.findIndex(r => r.id === request.id);
        if (index !== -1) {
            this.vacationRequests[index].status = 'cancelled';
            this.vacationRequests = [...this.vacationRequests];
            this.messageService.add({ severity: 'info', summary: 'Отменено', detail: 'Заявка на отпуск отменена' });
        }
    }

    openPayslipDialog(payment: SalaryPayment): void {
        this.selectedPayslip = payment;
        this.displayPayslipDialog = true;
    }

    downloadPayslip(payment: SalaryPayment): void {
        this.messageService.add({ severity: 'info', summary: 'Скачивание', detail: `Расчетный лист за ${this.getMonthName(payment.period_month)} ${payment.period_year}` });
    }

    downloadDocument(document: MyDocument): void {
        this.messageService.add({ severity: 'info', summary: 'Скачивание', detail: document.name });
    }

    downloadCertificate(training: any): void {
        this.messageService.add({ severity: 'info', summary: 'Скачивание', detail: `Сертификат: ${training.certificate_number}` });
    }

    markNotificationAsRead(notification: MyNotification): void {
        notification.read = true;
        notification.read_at = new Date().toISOString();
    }

    markAllNotificationsAsRead(): void {
        this.notifications.forEach(n => {
            n.read = true;
            n.read_at = new Date().toISOString();
        });
    }

    // Helpers
    getInitials(name: string): string {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2);
    }

    calculateDays(start: Date | string, end: Date | string): number {
        const startDate = start instanceof Date ? start : new Date(start);
        const endDate = end instanceof Date ? end : new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    getMonthName(month: number): string {
        const months = ['', 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        return months[month] || '';
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU');
    }

    formatDateTime(dateStr: string): string {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('ru-RU').format(value) + ' сум';
    }

    getVacationTypeLabel(type: string): string {
        const found = this.vacationTypes.find(t => t.value === type);
        return found ? found.label : type;
    }

    getVacationStatusSeverity(status: VacationStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const found = this.vacationStatuses.find(s => s.value === status);
        return (found?.severity as any) || 'info';
    }

    getVacationStatusLabel(status: VacationStatus): string {
        const found = this.vacationStatuses.find(s => s.value === status);
        return found ? found.label : status;
    }

    getDocumentIcon(type: string): string {
        const found = this.documentTypes.find(d => d.value === type);
        return found ? found.icon : 'pi-file';
    }

    getUnreadNotificationsCount(): number {
        return this.notifications.filter(n => !n.read).length;
    }

    getCompetencyStars(level: number): string[] {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(i <= level ? 'pi-star-fill' : 'pi-star');
        }
        return stars;
    }

    getRelativeTime(timestamp: string): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} мин. назад`;
        if (diffHours < 24) return `${diffHours} ч. назад`;
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дн. назад`;
        return date.toLocaleDateString('ru-RU');
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
