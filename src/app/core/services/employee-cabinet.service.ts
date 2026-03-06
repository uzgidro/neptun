import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, map, of, delay } from 'rxjs';
import {
    EmployeeProfile,
    LeaveBalance,
    MyVacationRequest,
    MySalaryInfo,
    SalaryPayment,
    SalaryPaymentStatus,
    MyTraining,
    CompletedTraining,
    CurrentTraining,
    AssignedTraining,
    MyCompetencies,
    CompetencyScore,
    MyNotification,
    MyTask,
    MyDocument
} from '@/core/interfaces/hrm/employee-cabinet';
import { Salary, SalaryStatus } from '@/core/interfaces/hrm/salary';

const MY_PROFILE = '/my-profile';
const MY_LEAVE_BALANCE = '/my-leave-balance';
const MY_VACATIONS = '/my-vacations';
const MY_SALARY = '/my-salary';
const MY_TRAINING = '/my-training';
const MY_COMPETENCIES = '/my-competencies';
const MY_NOTIFICATIONS = '/my-notifications';
const MY_TASKS = '/my-tasks';
const MY_DOCUMENTS = '/my-documents';

const USE_MOCK = !BASE_URL;

// =====================
// MOCK DATA
// =====================

const MOCK_PROFILE: EmployeeProfile = {
    id: 1,
    employee_id: 'UGE-00472',
    full_name: 'Каримов Бахтиёр Рустамович',
    first_name: 'Бахтиёр',
    last_name: 'Каримов',
    middle_name: 'Рустамович',
    position_id: 101,
    position_name: 'Главный инженер',
    department_id: 10,
    department_name: 'Молокозавод «Чарвак»',
    email: 'karimov.b@molokoprom.uz',
    phone: '+998901001020',
    internal_phone: '2204',
    hire_date: '2015-03-15',
    birth_date: '1980-07-22',
    employment_status: 'active',
    contract_type: 'permanent',
    is_on_probation: false,
    manager_id: 5,
    manager_name: 'Сафаров Отабек Рашидович'
};

const MOCK_LEAVE_BALANCE: LeaveBalance = {
    employee_id: 1,
    year: 2026,
    annual_leave_total: 28,
    annual_leave_used: 7,
    annual_leave_remaining: 21,
    additional_leave_total: 5,
    additional_leave_used: 0,
    additional_leave_remaining: 5,
    study_leave_total: 0,
    study_leave_used: 0,
    study_leave_remaining: 0,
    sick_leave_used_month: 0,
    sick_leave_used_year: 3,
    comp_days_available: 2
};

const MOCK_VACATIONS: MyVacationRequest[] = [
    {
        id: 1,
        type: 'annual',
        start_date: '2026-06-15',
        end_date: '2026-06-28',
        days_count: 14,
        status: 'approved',
        reason: 'Ежегодный основной отпуск',
        submitted_at: '2026-02-10T09:00:00Z',
        approved_by: 5,
        approved_by_name: 'Сафаров Отабек Рашидович',
        approved_at: '2026-02-12T14:30:00Z',
        substitute_id: 15,
        substitute_name: 'Ташматов Рустам Ильхомович'
    },
    {
        id: 2,
        type: 'sick',
        start_date: '2026-01-20',
        end_date: '2026-01-22',
        days_count: 3,
        status: 'completed',
        reason: 'Больничный лист №1204',
        submitted_at: '2026-01-20T08:00:00Z',
        approved_by: 5,
        approved_by_name: 'Сафаров Отабек Рашидович',
        approved_at: '2026-01-20T08:30:00Z'
    },
    {
        id: 3,
        type: 'annual',
        start_date: '2026-08-01',
        end_date: '2026-08-07',
        days_count: 7,
        status: 'pending',
        reason: 'Вторая часть ежегодного отпуска',
        submitted_at: '2026-03-01T10:00:00Z',
        substitute_id: 15,
        substitute_name: 'Ташматов Рустам Ильхомович'
    }
];

const MOCK_SALARY_INFO: MySalaryInfo = {
    employee_id: 1,
    current_salary: {
        base_salary: 18000000,
        total_allowances: 5400000,
        gross_salary: 23400000
    },
    last_payment: {
        id: 24,
        period_month: 2,
        period_year: 2026,
        gross_salary: 23400000,
        total_deductions: 2808000,
        net_salary: 20592000,
        paid_at: '2026-02-25T10:00:00Z',
        status: 'paid'
    },
    payment_history: [
        { id: 24, period_month: 2, period_year: 2026, gross_salary: 23400000, total_deductions: 2808000, net_salary: 20592000, paid_at: '2026-02-25T10:00:00Z', status: 'paid' },
        { id: 23, period_month: 1, period_year: 2026, gross_salary: 23400000, total_deductions: 2808000, net_salary: 20592000, paid_at: '2026-01-25T10:00:00Z', status: 'paid' },
        { id: 22, period_month: 12, period_year: 2025, gross_salary: 22100000, total_deductions: 2652000, net_salary: 19448000, paid_at: '2025-12-25T10:00:00Z', status: 'paid' },
        { id: 21, period_month: 11, period_year: 2025, gross_salary: 22100000, total_deductions: 2652000, net_salary: 19448000, paid_at: '2025-11-25T10:00:00Z', status: 'paid' },
        { id: 20, period_month: 10, period_year: 2025, gross_salary: 22100000, total_deductions: 2652000, net_salary: 19448000, paid_at: '2025-10-27T10:00:00Z', status: 'paid' }
    ]
};

const MOCK_TRAINING: MyTraining = {
    completed: [
        {
            id: 1,
            course_id: 101,
            course_name: 'Безопасность производственных объектов',
            course_type: 'mandatory',
            completed_at: '2025-11-15T16:00:00Z',
            score: 92,
            certificate_number: 'CERT-2025-0472-01',
            certificate_url: '/certificates/CERT-2025-0472-01.pdf'
        },
        {
            id: 2,
            course_id: 102,
            course_name: 'Современные методы диагностики оборудования',
            course_type: 'professional',
            completed_at: '2025-09-20T14:00:00Z',
            score: 88,
            certificate_number: 'CERT-2025-0472-02'
        }
    ],
    in_progress: [
        {
            id: 3,
            course_id: 103,
            course_name: 'Цифровая трансформация молочных предприятий',
            course_type: 'professional',
            started_at: '2026-02-01T09:00:00Z',
            deadline: '2026-04-30T23:59:59Z',
            progress_percent: 45,
            modules_completed: 5,
            modules_total: 11
        }
    ],
    assigned: [
        {
            id: 4,
            course_id: 104,
            course_name: 'Охрана труда и промышленная безопасность — 2026',
            course_type: 'mandatory',
            assigned_at: '2026-02-20T08:00:00Z',
            start_date: '2026-04-01',
            deadline: '2026-05-31',
            assigned_by_name: 'Отдел обучения и развития',
            is_mandatory: true
        }
    ]
};

const MOCK_COMPETENCIES: MyCompetencies = {
    employee_id: 1,
    last_assessment_date: '2025-12-10',
    competencies: [
        { competency_id: 1, competency_name: 'Управление производственным оборудованием', category: 'Техническая', current_level: 5, max_level: 5, last_assessed_at: '2025-12-10' },
        { competency_id: 2, competency_name: 'Техническое обслуживание и ремонт', category: 'Техническая', current_level: 4, max_level: 5, target_level: 5, target_date: '2026-12-31', last_assessed_at: '2025-12-10' },
        { competency_id: 3, competency_name: 'Управление персоналом', category: 'Управленческая', current_level: 4, max_level: 5, last_assessed_at: '2025-12-10' },
        { competency_id: 4, competency_name: 'Охрана труда и ТБ', category: 'Обязательная', current_level: 4, max_level: 5, last_assessed_at: '2025-12-10' },
        { competency_id: 5, competency_name: 'Цифровые технологии (SCADA, АСУ ТП)', category: 'Техническая', current_level: 3, max_level: 5, target_level: 4, target_date: '2026-06-30', last_assessed_at: '2025-12-10' },
        { competency_id: 6, competency_name: 'Планирование и бюджетирование', category: 'Управленческая', current_level: 3, max_level: 5, last_assessed_at: '2025-12-10' }
    ],
    development_plan: [],
    average_score: 3.83
};

const MOCK_NOTIFICATIONS: MyNotification[] = [
    {
        id: 1,
        type: 'vacation_approved',
        title: 'Отпуск одобрен',
        message: 'Ваш запрос на ежегодный отпуск с 15.06.2026 по 28.06.2026 одобрен руководителем.',
        created_at: '2026-02-12T14:30:00Z',
        read: true,
        read_at: '2026-02-12T15:00:00Z',
        icon: 'pi pi-check-circle',
        severity: 'success',
        link: '/hrm/my-cabinet/vacations'
    },
    {
        id: 2,
        type: 'training_assigned',
        title: 'Назначено обучение',
        message: 'Вам назначен обязательный курс «Охрана труда и промышленная безопасность — 2026». Срок: до 31.05.2026.',
        created_at: '2026-02-20T08:00:00Z',
        read: true,
        read_at: '2026-02-20T09:15:00Z',
        icon: 'pi pi-book',
        severity: 'info',
        link: '/hrm/my-cabinet/training'
    },
    {
        id: 3,
        type: 'salary_paid',
        title: 'Зарплата зачислена',
        message: 'Заработная плата за февраль 2026 в размере 20 592 000 сум зачислена на ваш счёт.',
        created_at: '2026-02-25T10:05:00Z',
        read: false,
        icon: 'pi pi-wallet',
        severity: 'success',
        link: '/hrm/my-cabinet/salary'
    },
    {
        id: 4,
        type: 'task_assigned',
        title: 'Новая задача',
        message: 'Подготовить отчёт по техническому состоянию линий №3 и №4 к плановому совещанию.',
        created_at: '2026-03-03T09:00:00Z',
        read: false,
        icon: 'pi pi-clipboard',
        severity: 'warn',
        link: '/hrm/my-cabinet/tasks'
    }
];

const MOCK_TASKS: MyTask[] = [
    {
        id: 1,
        type: 'document',
        title: 'Отчёт по техсостоянию линий №3 и №4',
        description: 'Подготовить детальный отчёт по результатам диагностики линий №3 и №4 Молокозавода «Чарвак» для планового совещания.',
        due_date: '2026-03-10',
        priority: 'high',
        status: 'in_progress',
        assigned_by_name: 'Сафаров Отабек Рашидович'
    },
    {
        id: 2,
        type: 'approval',
        title: 'Согласовать график планового ремонта',
        description: 'Проверить и согласовать график планового ремонта оборудования на II квартал 2026 года.',
        due_date: '2026-03-15',
        priority: 'medium',
        status: 'pending',
        assigned_by_name: 'Отдел планирования'
    },
    {
        id: 3,
        type: 'training',
        title: 'Пройти модуль 6 курса «Цифровая трансформация»',
        description: 'Завершить модуль 6 — «Внедрение SCADA-систем на молочных предприятиях».',
        due_date: '2026-03-20',
        priority: 'low',
        status: 'pending',
        assigned_by_name: 'Отдел обучения и развития',
        link: '/hrm/my-cabinet/training'
    }
];

const MOCK_DOCUMENTS: MyDocument[] = [
    {
        id: 1,
        type: 'contract',
        name: 'Трудовой договор №472 от 15.03.2015',
        uploaded_at: '2015-03-15T10:00:00Z',
        file_size: 245760,
        can_download: true
    },
    {
        id: 2,
        type: 'addendum',
        name: 'Дополнительное соглашение — повышение оклада от 01.01.2026',
        uploaded_at: '2025-12-28T14:00:00Z',
        file_size: 102400,
        can_download: true
    },
    {
        id: 3,
        type: 'certificate',
        name: 'Сертификат — Безопасность производственных объектов (CERT-2025-0472-01)',
        uploaded_at: '2025-11-15T16:30:00Z',
        file_size: 512000,
        can_download: true
    }
];

// Flat backend response shapes for type safety (S4)
interface FlatTrainingItem {
    id: number;
    course_id?: number;
    course_name?: string;
    title?: string;
    course_type?: string;
    training_type?: string;
    status: string;
    score?: number;
    certificate_number?: string;
    certificate_url?: string;
    completed_at?: string;
    end_date?: string;
    started_at?: string;
    start_date?: string;
    deadline?: string;
    progress_percent?: number;
    progress?: number;
    modules_completed?: number;
    modules_total?: number;
    assigned_at?: string;
    created_at?: string;
    assigned_by_name?: string;
    is_mandatory?: boolean;
}

interface FlatCompetencyItem {
    id?: number;
    employee_id?: number;
    competency_id?: number;
    competency_name?: string;
    name?: string;
    category?: string;
    current_level?: number;
    level?: number;
    score?: number;
    max_level?: number;
    target_level?: number;
    target_date?: string;
    last_assessed_at?: string;
    assessed_at?: string;
}

// Mapper functions (S3)
const ASSIGNED_STATUSES = ['assigned', 'not_started', 'pending'];

function mapSalaryStatus(s: SalaryStatus): SalaryPaymentStatus {
    switch (s) {
        case 'paid': return 'paid';
        case 'approved': return 'approved';
        case 'calculated': return 'calculated';
        case 'rejected': return 'rejected';
        default: return 'pending';
    }
}

function salaryToPayment(s: Salary): SalaryPayment {
    return {
        id: s.id,
        period_month: s.period_month,
        period_year: s.period_year,
        gross_salary: s.gross_salary,
        total_deductions: s.total_deductions,
        net_salary: s.net_salary,
        paid_at: s.paid_at,
        status: mapSalaryStatus(s.status)
    };
}

function mapSalaryArrayToInfo(items: Salary[]): MySalaryInfo | null {
    if (items.length === 0) {
        return null;
    }
    const sorted = [...items].sort((a, b) => {
        if (b.period_year !== a.period_year) return b.period_year - a.period_year;
        return b.period_month - a.period_month;
    });
    const latest = sorted[0];
    return {
        employee_id: latest.employee_id,
        current_salary: {
            base_salary: latest.base_salary ?? 0,
            total_allowances: (latest.rank_allowance ?? 0) + (latest.education_allowance ?? 0) + (latest.seniority_allowance ?? 0) + (latest.other_allowances ?? 0),
            gross_salary: latest.gross_salary ?? 0
        },
        last_payment: salaryToPayment(latest),
        payment_history: sorted.map(salaryToPayment)
    };
}

function mapTrainingArrayToMyTraining(items: FlatTrainingItem[]): MyTraining {
    const completed: CompletedTraining[] = items
        .filter((t) => t.status === 'completed')
        .map((t) => ({
            id: t.id,
            course_id: t.course_id ?? t.id,
            course_name: t.course_name ?? t.title ?? '',
            course_type: t.course_type ?? t.training_type ?? '',
            completed_at: t.completed_at ?? t.end_date ?? '',
            score: t.score,
            certificate_number: t.certificate_number,
            certificate_url: t.certificate_url
        }));
    const in_progress: CurrentTraining[] = items
        .filter((t) => t.status === 'in_progress')
        .map((t) => ({
            id: t.id,
            course_id: t.course_id ?? t.id,
            course_name: t.course_name ?? t.title ?? '',
            course_type: t.course_type ?? t.training_type ?? '',
            started_at: t.started_at ?? t.start_date ?? '',
            deadline: t.deadline,
            progress_percent: t.progress_percent ?? t.progress ?? 0,
            modules_completed: t.modules_completed ?? 0,
            modules_total: t.modules_total ?? 0
        }));
    const assigned: AssignedTraining[] = items
        .filter((t) => ASSIGNED_STATUSES.includes(t.status))
        .map((t) => ({
            id: t.id,
            course_id: t.course_id ?? t.id,
            course_name: t.course_name ?? t.title ?? '',
            course_type: t.course_type ?? t.training_type ?? '',
            assigned_at: t.assigned_at ?? t.created_at ?? '',
            start_date: t.start_date ?? '',
            deadline: t.deadline ?? '',
            assigned_by_name: t.assigned_by_name ?? '',
            is_mandatory: t.is_mandatory ?? false
        }));
    return { completed, in_progress, assigned };
}

function mapCompetencyArrayToMyCompetencies(items: FlatCompetencyItem[]): MyCompetencies {
    const competencies: CompetencyScore[] = items.map((c) => ({
        competency_id: c.competency_id ?? c.id ?? 0,
        competency_name: c.competency_name ?? c.name ?? '',
        category: c.category ?? '',
        current_level: c.current_level ?? c.level ?? c.score ?? 0,
        max_level: c.max_level ?? 5,
        target_level: c.target_level,
        target_date: c.target_date,
        last_assessed_at: c.last_assessed_at ?? c.assessed_at
    }));
    const dates = competencies.map((c) => c.last_assessed_at).filter(Boolean) as string[];
    const last_assessment_date = dates.length ? dates.sort()[dates.length - 1] : undefined;
    const average_score = competencies.length ? competencies.reduce((sum, c) => sum + c.current_level, 0) / competencies.length : 0;
    return {
        employee_id: 0,
        last_assessment_date,
        competencies,
        development_plan: [],
        average_score: Math.round(average_score * 100) / 100
    };
}

@Injectable({
    providedIn: 'root'
})
export class EmployeeCabinetService extends ApiService {
    // Profile
    getMyProfile(): Observable<EmployeeProfile> {
        if (USE_MOCK) return of(MOCK_PROFILE).pipe(delay(200));
        return this.http.get<EmployeeProfile>(BASE_URL + MY_PROFILE);
    }

    updateMyProfile(payload: Partial<EmployeeProfile>): Observable<EmployeeProfile> {
        if (USE_MOCK) return of({ ...MOCK_PROFILE, ...payload } as EmployeeProfile).pipe(delay(200));
        return this.http.patch<EmployeeProfile>(BASE_URL + MY_PROFILE, payload);
    }

    // Leave Balance
    getMyLeaveBalance(): Observable<LeaveBalance> {
        if (USE_MOCK) return of(MOCK_LEAVE_BALANCE).pipe(delay(200));
        return this.http.get<LeaveBalance>(BASE_URL + MY_LEAVE_BALANCE);
    }

    // Vacations
    getMyVacations(): Observable<MyVacationRequest[]> {
        if (USE_MOCK) return of(MOCK_VACATIONS).pipe(delay(200));
        return this.http.get<MyVacationRequest[]>(BASE_URL + MY_VACATIONS);
    }

    createVacationRequest(payload: Partial<MyVacationRequest>): Observable<MyVacationRequest> {
        if (USE_MOCK) return of({ ...MOCK_VACATIONS[0], ...payload, id: Date.now() } as MyVacationRequest).pipe(delay(200));
        return this.http.post<MyVacationRequest>(BASE_URL + MY_VACATIONS, payload);
    }

    cancelVacationRequest(id: number): Observable<MyVacationRequest> {
        if (USE_MOCK) return of({ ...(MOCK_VACATIONS.find((v) => v.id === id) ?? MOCK_VACATIONS[0]), status: 'cancelled' as const, id } as MyVacationRequest).pipe(delay(200));
        return this.http.post<MyVacationRequest>(BASE_URL + MY_VACATIONS + '/' + id + '/cancel', {});
    }

    // Salary
    getMySalaryInfo(): Observable<MySalaryInfo | null> {
        if (USE_MOCK) return of(MOCK_SALARY_INFO).pipe(delay(200));
        return this.http.get<MySalaryInfo | Salary[]>(BASE_URL + MY_SALARY).pipe(
            map((res) => {
                if (!Array.isArray(res)) {
                    return res as MySalaryInfo;
                }
                return mapSalaryArrayToInfo(res);
            })
        );
    }

    downloadPayslip(paymentId: number): Observable<Blob> {
        if (USE_MOCK) return of(new Blob(['mock'], { type: 'application/octet-stream' })).pipe(delay(200));
        return this.http.get(BASE_URL + MY_SALARY + '/payslip/' + paymentId, {
            responseType: 'blob'
        });
    }

    // Training
    getMyTraining(): Observable<MyTraining> {
        if (USE_MOCK) return of(MOCK_TRAINING).pipe(delay(200));
        return this.http.get<MyTraining | FlatTrainingItem[]>(BASE_URL + MY_TRAINING).pipe(
            map((res) => {
                if (!Array.isArray(res)) {
                    return res as MyTraining;
                }
                return mapTrainingArrayToMyTraining(res);
            })
        );
    }

    // Competencies
    getMyCompetencies(): Observable<MyCompetencies> {
        if (USE_MOCK) return of(MOCK_COMPETENCIES).pipe(delay(200));
        return this.http.get<MyCompetencies | FlatCompetencyItem[]>(BASE_URL + MY_COMPETENCIES).pipe(
            map((res) => {
                if (!Array.isArray(res)) {
                    return res as MyCompetencies;
                }
                return mapCompetencyArrayToMyCompetencies(res);
            })
        );
    }

    // Notifications
    getMyNotifications(): Observable<MyNotification[]> {
        if (USE_MOCK) return of(MOCK_NOTIFICATIONS).pipe(delay(200));
        return this.http.get<MyNotification[]>(BASE_URL + MY_NOTIFICATIONS);
    }

    markNotificationAsRead(id: number): Observable<MyNotification> {
        if (USE_MOCK) return of({ ...(MOCK_NOTIFICATIONS.find((n) => n.id === id) ?? MOCK_NOTIFICATIONS[0]), read: true, read_at: new Date().toISOString(), id } as MyNotification).pipe(delay(200));
        return this.http.patch<MyNotification>(BASE_URL + MY_NOTIFICATIONS + '/' + id + '/read', {});
    }

    markAllNotificationsAsRead(): Observable<any> {
        if (USE_MOCK) return of({ success: true }).pipe(delay(200));
        return this.http.post(BASE_URL + MY_NOTIFICATIONS + '/read-all', {});
    }

    // Tasks
    getMyTasks(): Observable<MyTask[]> {
        if (USE_MOCK) return of(MOCK_TASKS).pipe(delay(200));
        return this.http.get<MyTask[]>(BASE_URL + MY_TASKS);
    }

    // Documents
    getMyDocuments(): Observable<MyDocument[]> {
        if (USE_MOCK) return of(MOCK_DOCUMENTS).pipe(delay(200));
        return this.http.get<MyDocument[]>(BASE_URL + MY_DOCUMENTS);
    }

    downloadDocument(id: number): Observable<Blob> {
        if (USE_MOCK) return of(new Blob(['mock'], { type: 'application/octet-stream' })).pipe(delay(200));
        return this.http.get(BASE_URL + MY_DOCUMENTS + '/' + id + '/download', {
            responseType: 'blob'
        });
    }
}
