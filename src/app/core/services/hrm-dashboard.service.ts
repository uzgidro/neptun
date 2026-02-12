import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HRMDashboard, DashboardNotification, DashboardWidgets, DashboardTask, DashboardEvent, ActivityItem, BirthdayItem, ProbationItem } from '@/core/interfaces/hrm/dashboard';

// Мок-данные виджетов
const MOCK_WIDGETS: DashboardWidgets = {
    total_employees: 247,
    active_employees: 240,
    on_vacation: 3,
    on_sick_leave: 1,
    new_employees_month: 2,
    turnover_rate: 3.2,
    open_vacancies: 4,
    candidates_in_process: 8,
    pending_approvals: 5,
    planned_trainings: 3,
    assessments_in_progress: 2,
    salary_pending_approval: 1
};

// Мок-данные задач
const MOCK_TASKS: DashboardTask[] = [
    {
        id: 1,
        type: 'vacation_approval',
        title: 'Согласование отпуска — Назаров Ф.Б.',
        description: 'Ежегодный отпуск с 15.03.2026 по 28.03.2026 (14 дней)',
        count: 1,
        priority: 'high',
        due_date: '2026-03-10',
        link: '/hrm/vacations/5',
        icon: 'pi-calendar',
        color: 'orange'
    },
    {
        id: 2,
        type: 'candidate_review',
        title: 'Рассмотрение кандидата на вакансию «Инженер»',
        description: 'Собеседование назначено на 14.02.2026',
        count: 3,
        priority: 'medium',
        due_date: '2026-02-14',
        link: '/hrm/recruiting/candidates/15',
        icon: 'pi-user',
        color: 'cyan'
    },
    {
        id: 3,
        type: 'salary_approval',
        title: 'Согласование расчёта зарплаты за январь',
        description: 'Расчёт ФОТ за январь 2026 на согласовании',
        count: 1,
        priority: 'urgent',
        due_date: '2026-02-05',
        link: '/hrm/salary/payroll/2026-01',
        icon: 'pi-dollar',
        color: 'red'
    },
    {
        id: 4,
        type: 'probation_review',
        title: 'Оценка испытательного срока — Сафаров У.Ш.',
        description: 'Испытательный срок истекает 20.02.2026',
        count: 1,
        priority: 'high',
        due_date: '2026-02-20',
        link: '/hrm/personnel-records/11',
        icon: 'pi-clock',
        color: 'purple'
    },
    {
        id: 5,
        type: 'training_assignment',
        title: 'Назначить обучение по охране труда',
        description: 'Необходимо назначить обязательный курс для 12 сотрудников',
        count: 12,
        priority: 'medium',
        due_date: '2026-02-28',
        link: '/hrm/training/courses/5',
        icon: 'pi-book',
        color: 'blue'
    }
];

// Мок-данные событий
const MOCK_EVENTS: DashboardEvent[] = [
    {
        id: 1,
        type: 'training',
        title: 'Тренинг «Управление проектами»',
        description: 'Внутренний курс для руководителей отделов',
        date: '2026-02-18',
        time: '10:00',
        location: 'Конференц-зал А',
        participants: ['Юлдашев Б.К.', 'Рахимова Д.А.', 'Турсунов И.А.'],
        link: '/hrm/training/sessions/3',
        icon: 'pi-book',
        color: 'blue'
    },
    {
        id: 2,
        type: 'interview',
        title: 'Собеседование — Инженер-технолог',
        description: 'Кандидат: Алиев М.Р.',
        date: '2026-02-14',
        time: '14:00',
        location: 'Переговорная 2',
        participants: ['Юлдашев Б.К.', 'Ахмедова Н.Б.'],
        link: '/hrm/recruiting/interviews/8',
        icon: 'pi-user',
        color: 'cyan'
    },
    {
        id: 3,
        type: 'meeting',
        title: 'Совещание по итогам квартала',
        description: 'Обсуждение KPI и результатов Q4 2025',
        date: '2026-02-20',
        time: '09:00',
        location: 'Актовый зал',
        participants: ['Каримов Р.Ш.', 'Юлдашев Б.К.', 'Рахимова Д.А.', 'Ахмедова Н.Б.'],
        icon: 'pi-users',
        color: 'purple'
    },
    {
        id: 4,
        type: 'deadline',
        title: 'Срок подачи отчёта в налоговую',
        description: 'Квартальный отчёт по НДФЛ',
        date: '2026-02-28',
        time: '18:00',
        icon: 'pi-clock',
        color: 'red'
    }
];

// Мок-данные уведомлений
const MOCK_NOTIFICATIONS: DashboardNotification[] = [
    {
        id: 1,
        type: 'approval_request',
        title: 'Новая заявка на отпуск',
        message: 'Назаров Фаррух Бахромович подал заявку на ежегодный отпуск с 15.03.2026 по 28.03.2026',
        created_at: '2026-02-12T09:15:00Z',
        read: false,
        link: '/hrm/vacations/5',
        icon: 'pi-calendar',
        severity: 'warn'
    },
    {
        id: 2,
        type: 'new_employee',
        title: 'Новый сотрудник оформлен',
        message: 'Каримова Зилола Бахтияровна принята на должность Бухгалтер в Финансовый отдел',
        created_at: '2026-02-11T14:30:00Z',
        read: false,
        link: '/hrm/personnel-records/12',
        icon: 'pi-user-plus',
        severity: 'success'
    },
    {
        id: 3,
        type: 'deadline_reminder',
        title: 'Истекает испытательный срок',
        message: 'Испытательный срок Сафарова Улугбека Шухратовича истекает через 8 дней (20.02.2026)',
        created_at: '2026-02-12T08:00:00Z',
        read: false,
        link: '/hrm/personnel-records/11',
        icon: 'pi-exclamation-triangle',
        severity: 'warn'
    },
    {
        id: 4,
        type: 'training_reminder',
        title: 'Начало обучения через 6 дней',
        message: 'Тренинг «Управление проектами» запланирован на 18.02.2026 в 10:00',
        created_at: '2026-02-12T07:00:00Z',
        read: true,
        link: '/hrm/training/sessions/3',
        icon: 'pi-book',
        severity: 'info'
    },
    {
        id: 5,
        type: 'system_alert',
        title: 'Обновление системы HRM',
        message: 'Плановое обновление модуля расчёта зарплат запланировано на 15.02.2026 в 22:00',
        created_at: '2026-02-10T16:00:00Z',
        read: true,
        icon: 'pi-cog',
        severity: 'info'
    },
    {
        id: 6,
        type: 'approval_result',
        title: 'Отпуск одобрен',
        message: 'Заявка на отпуск Мирзаева Жасура Хамидовича одобрена руководителем',
        created_at: '2026-02-09T11:45:00Z',
        read: true,
        link: '/hrm/vacations/3',
        icon: 'pi-check-circle',
        severity: 'success'
    }
];

// Мок-данные недавней активности
const MOCK_RECENT_ACTIVITY: ActivityItem[] = [
    {
        id: 1,
        type: 'vacation_approved',
        title: 'Отпуск одобрен',
        description: 'Заявка на отпуск Мирзаева Ж.Х. одобрена',
        user_name: 'Юлдашев Ботир Камолович',
        timestamp: '2026-02-12T10:30:00Z',
        icon: 'pi-check',
        color: 'green'
    },
    {
        id: 2,
        type: 'employee_hired',
        title: 'Новый сотрудник',
        description: 'Каримова Зилола Бахтияровна принята на работу',
        user_name: 'Ахмедова Нилуфар Бахтиёровна',
        timestamp: '2026-02-11T14:30:00Z',
        icon: 'pi-user-plus',
        color: 'blue'
    },
    {
        id: 3,
        type: 'training_completed',
        title: 'Обучение завершено',
        description: 'Хасанова М.О. завершила курс «Кадровое делопроизводство»',
        user_name: 'Хасанова Малика Обидовна',
        timestamp: '2026-02-10T16:00:00Z',
        icon: 'pi-book',
        color: 'cyan'
    },
    {
        id: 4,
        type: 'salary_approved',
        title: 'Зарплата утверждена',
        description: 'Расчёт ФОТ за декабрь 2025 утверждён',
        user_name: 'Каримов Рустам Шарипович',
        timestamp: '2026-02-08T09:00:00Z',
        icon: 'pi-dollar',
        color: 'purple'
    }
];

// Мок-данные дней рождений
const MOCK_BIRTHDAYS: BirthdayItem[] = [
    {
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        department_name: 'IT-отдел',
        position_name: 'Системный администратор',
        birth_date: '1992-02-20',
        days_until: 8
    },
    {
        employee_id: 9,
        employee_name: 'Турсунов Ильхом Адхамович',
        department_name: 'Отдел логистики',
        position_name: 'Менеджер по логистике',
        birth_date: '1988-03-05',
        days_until: 21
    }
];

// Мок-данные испытательных сроков
const MOCK_PROBATIONS: ProbationItem[] = [
    {
        employee_id: 11,
        employee_name: 'Сафаров Улугбек Шухратович',
        department_name: 'Производственный отдел',
        position_name: 'Оператор',
        probation_end_date: '2026-02-20',
        days_remaining: 8,
        mentor_name: 'Юлдашев Ботир Камолович',
        status: 'on_track'
    }
];

// Полный объект дашборда
const MOCK_DASHBOARD: HRMDashboard = {
    widgets: MOCK_WIDGETS,
    tasks: MOCK_TASKS,
    events: MOCK_EVENTS,
    notifications: MOCK_NOTIFICATIONS,
    recentActivity: MOCK_RECENT_ACTIVITY,
    upcomingBirthdays: MOCK_BIRTHDAYS,
    expiringProbations: MOCK_PROBATIONS
};

@Injectable({
    providedIn: 'root'
})
export class HRMDashboardService extends ApiService {
    getDashboard(): Observable<HRMDashboard> {
        return of(MOCK_DASHBOARD).pipe(delay(300));
    }

    markNotificationAsRead(notificationId: number): Observable<DashboardNotification> {
        const notification = MOCK_NOTIFICATIONS.find((n) => n.id === notificationId);
        const updated: DashboardNotification = notification ? { ...notification, read: true } : { id: notificationId, type: 'other', title: '', message: '', created_at: '', read: true, icon: 'pi-bell', severity: 'info' };
        return of(updated).pipe(delay(200));
    }

    markAllNotificationsAsRead(): Observable<DashboardNotification[]> {
        const updated = MOCK_NOTIFICATIONS.map((n) => ({ ...n, read: true }));
        return of(updated).pipe(delay(200));
    }
}
