import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
    CompetencyScore,
    CompletedTraining,
    CurrentTraining,
    EmployeeProfile,
    LeaveBalance,
    MyCompetencies,
    MyDocument,
    MyNotification,
    MySalaryInfo,
    MyTask,
    MyTraining,
    MyVacationRequest,
    SalaryPayment
} from '@/core/interfaces/hrm/employee-cabinet';

// Мок-профиль — Ахмедова Нилуфар Бахтиёровна (id:2)
const MOCK_PROFILE: EmployeeProfile = {
    id: 2,
    employee_id: 'ТН-002',
    full_name: 'Ахмедова Нилуфар Бахтиёровна',
    first_name: 'Нилуфар',
    last_name: 'Ахмедова',
    middle_name: 'Бахтиёровна',
    photo: undefined,
    position_id: 2,
    position_name: 'Начальник отдела кадров',
    department_id: 7,
    department_name: 'Отдел кадров',
    email: 'akhmedova.n@company.uz',
    phone: '+998 90 123 45 67',
    internal_phone: '1002',
    hire_date: '2017-06-01',
    birth_date: '1990-08-15',
    employment_status: 'active',
    contract_type: 'permanent',
    is_on_probation: false,
    manager_id: 1,
    manager_name: 'Каримов Рустам Шарипович'
};

// Мок-баланс отпусков
const MOCK_LEAVE_BALANCE: LeaveBalance = {
    employee_id: 2,
    year: 2026,
    annual_leave_total: 24,
    annual_leave_used: 10,
    annual_leave_remaining: 14,
    additional_leave_total: 3,
    additional_leave_used: 0,
    additional_leave_remaining: 3,
    study_leave_total: 0,
    study_leave_used: 0,
    study_leave_remaining: 0,
    sick_leave_used_month: 0,
    sick_leave_used_year: 2,
    comp_days_available: 1
};

// Мок-заявки на отпуск
const MOCK_MY_VACATIONS: MyVacationRequest[] = [
    {
        id: 1,
        type: 'annual',
        start_date: '2025-07-01',
        end_date: '2025-07-10',
        days_count: 10,
        status: 'completed',
        reason: 'Семейный отдых',
        submitted_at: '2025-06-15T09:00:00Z',
        approved_by: 1,
        approved_by_name: 'Каримов Рустам Шарипович',
        approved_at: '2025-06-16T10:30:00Z',
        substitute_id: 10,
        substitute_name: 'Хасанова Малика Обидовна'
    },
    {
        id: 2,
        type: 'annual',
        start_date: '2026-04-14',
        end_date: '2026-04-27',
        days_count: 14,
        status: 'approved',
        reason: 'Весенний отпуск',
        submitted_at: '2026-02-01T08:30:00Z',
        approved_by: 1,
        approved_by_name: 'Каримов Рустам Шарипович',
        approved_at: '2026-02-03T11:00:00Z',
        substitute_id: 10,
        substitute_name: 'Хасанова Малика Обидовна'
    },
    {
        id: 3,
        type: 'comp_day',
        start_date: '2026-03-07',
        end_date: '2026-03-07',
        days_count: 1,
        status: 'pending',
        reason: 'Отгул за работу в выходной 22.02.2026',
        submitted_at: '2026-02-10T14:00:00Z'
    }
];

// Мок-данные зарплаты
const MOCK_PAYMENT_HISTORY: SalaryPayment[] = [
    { id: 1, period_month: 1, period_year: 2026, gross_salary: 14_400_000, total_deductions: 1_728_000, net_salary: 12_672_000, paid_at: '2026-02-05T10:00:00Z', status: 'paid' },
    { id: 2, period_month: 12, period_year: 2025, gross_salary: 14_400_000, total_deductions: 1_728_000, net_salary: 12_672_000, paid_at: '2026-01-05T10:00:00Z', status: 'paid' },
    { id: 3, period_month: 11, period_year: 2025, gross_salary: 14_400_000, total_deductions: 1_728_000, net_salary: 12_672_000, paid_at: '2025-12-05T10:00:00Z', status: 'paid' },
    { id: 4, period_month: 10, period_year: 2025, gross_salary: 14_400_000, total_deductions: 1_728_000, net_salary: 12_672_000, paid_at: '2025-11-05T10:00:00Z', status: 'paid' },
    { id: 5, period_month: 9, period_year: 2025, gross_salary: 14_400_000, total_deductions: 1_728_000, net_salary: 12_672_000, paid_at: '2025-10-05T10:00:00Z', status: 'paid' },
    { id: 6, period_month: 8, period_year: 2025, gross_salary: 14_400_000, total_deductions: 1_728_000, net_salary: 12_672_000, paid_at: '2025-09-05T10:00:00Z', status: 'paid' }
];

const MOCK_SALARY_INFO: MySalaryInfo = {
    employee_id: 2,
    current_salary: {
        base_salary: 12_000_000,
        total_allowances: 2_400_000,
        gross_salary: 14_400_000
    },
    last_payment: MOCK_PAYMENT_HISTORY[0],
    payment_history: MOCK_PAYMENT_HISTORY
};

// Мок-данные обучения
const MOCK_COMPLETED_TRAININGS: CompletedTraining[] = [
    {
        id: 1,
        course_id: 10,
        course_name: 'Трудовое законодательство Республики Узбекистан — 2025',
        course_type: 'Повышение квалификации',
        completed_at: '2025-09-20T16:00:00Z',
        score: 92,
        certificate_number: 'CERT-2025-0045',
        certificate_url: '/certificates/CERT-2025-0045.pdf'
    },
    {
        id: 2,
        course_id: 12,
        course_name: 'Кадровое делопроизводство',
        course_type: 'Внутренний курс',
        completed_at: '2025-05-10T14:00:00Z',
        score: 88
    }
];

const MOCK_CURRENT_TRAININGS: CurrentTraining[] = [
    {
        id: 3,
        course_id: 15,
        course_name: 'Управление персоналом: современные методы',
        course_type: 'Онлайн-курс',
        started_at: '2026-01-15T09:00:00Z',
        deadline: '2026-03-15',
        progress_percent: 45,
        modules_completed: 4,
        modules_total: 9
    }
];

const MOCK_TRAINING: MyTraining = {
    completed: MOCK_COMPLETED_TRAININGS,
    in_progress: MOCK_CURRENT_TRAININGS,
    assigned: []
};

// Мок-данные компетенций
const MOCK_COMPETENCY_SCORES: CompetencyScore[] = [
    {
        competency_id: 1,
        competency_name: 'Управление персоналом',
        category: 'Профессиональные',
        current_level: 4,
        max_level: 5,
        target_level: 5,
        target_date: '2026-12-31',
        last_assessed_at: '2025-12-15T10:00:00Z'
    },
    {
        competency_id: 2,
        competency_name: 'Трудовое право',
        category: 'Профессиональные',
        current_level: 5,
        max_level: 5,
        last_assessed_at: '2025-12-15T10:00:00Z'
    },
    {
        competency_id: 3,
        competency_name: 'Лидерство',
        category: 'Управленческие',
        current_level: 3,
        max_level: 5,
        target_level: 4,
        target_date: '2026-06-30',
        last_assessed_at: '2025-12-15T10:00:00Z'
    },
    {
        competency_id: 4,
        competency_name: 'Коммуникации',
        category: 'Личностные',
        current_level: 4,
        max_level: 5,
        last_assessed_at: '2025-12-15T10:00:00Z'
    },
    {
        competency_id: 5,
        competency_name: 'Работа с ИС',
        category: 'Цифровые',
        current_level: 3,
        max_level: 5,
        target_level: 4,
        target_date: '2026-09-30',
        last_assessed_at: '2025-12-15T10:00:00Z'
    }
];

const MOCK_COMPETENCIES: MyCompetencies = {
    employee_id: 2,
    last_assessment_date: '2025-12-15',
    next_assessment_date: '2026-06-15',
    competencies: MOCK_COMPETENCY_SCORES,
    development_plan: [
        {
            id: 1,
            competency_name: 'Лидерство',
            current_level: 3,
            target_level: 4,
            target_date: '2026-06-30',
            actions: ['Пройти курс «Управление персоналом: современные методы»', 'Менторинг от Каримова Р.Ш.'],
            status: 'in_progress'
        },
        {
            id: 2,
            competency_name: 'Работа с ИС',
            current_level: 3,
            target_level: 4,
            target_date: '2026-09-30',
            actions: ['Освоить модуль аналитики HRM', 'Курс «Power BI для HR»'],
            status: 'not_started'
        }
    ],
    average_score: 3.8
};

// Мок-данные уведомлений
const MOCK_MY_NOTIFICATIONS: MyNotification[] = [
    {
        id: 1,
        type: 'vacation_approved',
        title: 'Отпуск одобрен',
        message: 'Ваша заявка на отпуск с 14.04.2026 по 27.04.2026 одобрена',
        created_at: '2026-02-03T11:00:00Z',
        read: true,
        read_at: '2026-02-03T11:15:00Z',
        link: '/hrm/my-cabinet/vacations',
        icon: 'pi-check-circle',
        severity: 'success'
    },
    {
        id: 2,
        type: 'task_assigned',
        title: 'Новая задача',
        message: 'Вам назначена задача: провести собеседование с кандидатом на должность Инженер-технолог',
        created_at: '2026-02-11T09:30:00Z',
        read: false,
        link: '/hrm/recruiting/interviews/8',
        icon: 'pi-briefcase',
        severity: 'info'
    },
    {
        id: 3,
        type: 'training_assigned',
        title: 'Назначено обучение',
        message: 'Вам назначен курс «Управление персоналом: современные методы» (дедлайн: 15.03.2026)',
        created_at: '2026-01-14T08:00:00Z',
        read: true,
        read_at: '2026-01-14T08:30:00Z',
        link: '/hrm/my-cabinet/training',
        icon: 'pi-book',
        severity: 'info'
    },
    {
        id: 4,
        type: 'salary_paid',
        title: 'Зарплата начислена',
        message: 'Зарплата за январь 2026 начислена. Сумма к выплате: 12 672 000 UZS',
        created_at: '2026-02-05T10:00:00Z',
        read: true,
        read_at: '2026-02-05T12:00:00Z',
        link: '/hrm/my-cabinet/salary',
        icon: 'pi-dollar',
        severity: 'success'
    }
];

// Мок-данные задач
const MOCK_MY_TASKS: MyTask[] = [
    {
        id: 1,
        type: 'approval',
        title: 'Согласовать заявку на отпуск — Назаров Ф.Б.',
        description: 'Ежегодный отпуск с 15.03.2026 по 28.03.2026',
        due_date: '2026-03-10',
        priority: 'high',
        status: 'pending',
        link: '/hrm/vacations/5'
    },
    {
        id: 2,
        type: 'meeting',
        title: 'Собеседование — Инженер-технолог',
        description: 'Кандидат: Алиев М.Р., 14.02.2026 в 14:00',
        due_date: '2026-02-14',
        priority: 'medium',
        status: 'pending',
        assigned_by_name: 'Каримов Рустам Шарипович',
        link: '/hrm/recruiting/interviews/8'
    },
    {
        id: 3,
        type: 'training',
        title: 'Завершить курс «Управление персоналом»',
        description: 'Прогресс: 45%, дедлайн 15.03.2026',
        due_date: '2026-03-15',
        priority: 'medium',
        status: 'in_progress',
        link: '/hrm/my-cabinet/training'
    }
];

// Мок-данные документов
const MOCK_MY_DOCUMENTS: MyDocument[] = [
    {
        id: 1,
        type: 'contract',
        name: 'Трудовой договор №ТД-002 от 01.06.2017',
        description: 'Основной трудовой договор',
        uploaded_at: '2017-06-01T09:00:00Z',
        file_url: '/documents/contracts/TD-002.pdf',
        file_size: 245_760,
        can_download: true
    },
    {
        id: 2,
        type: 'addendum',
        name: 'Доп. соглашение №1 от 15.01.2020',
        description: 'Изменение оклада',
        uploaded_at: '2020-01-15T09:00:00Z',
        file_url: '/documents/addendums/DS-002-1.pdf',
        file_size: 128_512,
        can_download: true
    },
    {
        id: 3,
        type: 'certificate',
        name: 'Сертификат: Трудовое законодательство РУз — 2025',
        description: 'Сертификат CERT-2025-0045',
        uploaded_at: '2025-09-20T16:00:00Z',
        file_url: '/certificates/CERT-2025-0045.pdf',
        file_size: 102_400,
        can_download: true
    },
    {
        id: 4,
        type: 'payslip',
        name: 'Расчётный лист за январь 2026',
        uploaded_at: '2026-02-05T10:00:00Z',
        file_url: '/documents/payslips/PS-002-2026-01.pdf',
        file_size: 61_440,
        can_download: true
    },
    {
        id: 5,
        type: 'order',
        name: 'Приказ о назначении №ПР-015 от 01.06.2017',
        description: 'Приказ о назначении на должность Начальник отдела кадров',
        uploaded_at: '2017-06-01T09:00:00Z',
        file_url: '/documents/orders/PR-015.pdf',
        file_size: 81_920,
        can_download: true
    }
];

@Injectable({
    providedIn: 'root'
})
export class EmployeeCabinetService extends ApiService {
    // Profile
    getMyProfile(): Observable<EmployeeProfile> {
        return of(MOCK_PROFILE).pipe(delay(300));
    }

    updateMyProfile(payload: Partial<EmployeeProfile>): Observable<EmployeeProfile> {
        const updated: EmployeeProfile = { ...MOCK_PROFILE, ...payload };
        return of(updated).pipe(delay(200));
    }

    // Leave Balance
    getMyLeaveBalance(): Observable<LeaveBalance> {
        return of(MOCK_LEAVE_BALANCE).pipe(delay(300));
    }

    // Vacations
    getMyVacations(): Observable<MyVacationRequest[]> {
        return of(MOCK_MY_VACATIONS).pipe(delay(300));
    }

    createVacationRequest(payload: Partial<MyVacationRequest>): Observable<MyVacationRequest> {
        const newRequest: MyVacationRequest = {
            id: Date.now(),
            type: payload.type || 'annual',
            start_date: payload.start_date || '',
            end_date: payload.end_date || '',
            days_count: payload.days_count || 0,
            status: 'draft',
            reason: payload.reason,
            submitted_at: new Date().toISOString()
        };
        return of(newRequest).pipe(delay(200));
    }

    cancelVacationRequest(id: number): Observable<MyVacationRequest> {
        const vacation = MOCK_MY_VACATIONS.find((v) => v.id === id);
        const cancelled: MyVacationRequest = vacation ? { ...vacation, status: 'cancelled' } : { id, type: 'annual', start_date: '', end_date: '', days_count: 0, status: 'cancelled', submitted_at: '' };
        return of(cancelled).pipe(delay(200));
    }

    // Salary
    getMySalaryInfo(): Observable<MySalaryInfo> {
        return of(MOCK_SALARY_INFO).pipe(delay(300));
    }

    downloadPayslip(paymentId: number): Observable<Blob> {
        const blob = new Blob(['mock payslip data'], { type: 'application/pdf' });
        return of(blob).pipe(delay(200));
    }

    // Training
    getMyTraining(): Observable<MyTraining> {
        return of(MOCK_TRAINING).pipe(delay(300));
    }

    // Competencies
    getMyCompetencies(): Observable<MyCompetencies> {
        return of(MOCK_COMPETENCIES).pipe(delay(300));
    }

    // Notifications
    getMyNotifications(): Observable<MyNotification[]> {
        return of(MOCK_MY_NOTIFICATIONS).pipe(delay(300));
    }

    markNotificationAsRead(id: number): Observable<MyNotification> {
        const notification = MOCK_MY_NOTIFICATIONS.find((n) => n.id === id);
        const updated: MyNotification = notification ? { ...notification, read: true, read_at: new Date().toISOString() } : { id, type: 'other', title: '', message: '', created_at: '', read: true, icon: 'pi-bell', severity: 'info' };
        return of(updated).pipe(delay(200));
    }

    markAllNotificationsAsRead(): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    // Tasks
    getMyTasks(): Observable<MyTask[]> {
        return of(MOCK_MY_TASKS).pipe(delay(300));
    }

    // Documents
    getMyDocuments(): Observable<MyDocument[]> {
        return of(MOCK_MY_DOCUMENTS).pipe(delay(300));
    }

    downloadDocument(id: number): Observable<Blob> {
        const blob = new Blob(['mock document data'], { type: 'application/pdf' });
        return of(blob).pipe(delay(200));
    }
}
