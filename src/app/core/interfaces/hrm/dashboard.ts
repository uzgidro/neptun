// HRM Dashboard Interfaces

export interface HRMDashboard {
    // Быстрая информация (виджеты)
    widgets: DashboardWidgets;

    // Мои задачи
    tasks: DashboardTask[];

    // Календарь событий
    events: DashboardEvent[];

    // Уведомления
    notifications: DashboardNotification[];

    // Недавняя активность
    recentActivity: ActivityItem[];

    // Дни рождения
    upcomingBirthdays: BirthdayItem[];

    // Истекающие испытательные сроки
    expiringProbations: ProbationItem[];
}

export interface DashboardWidgets {
    total_employees: number;
    active_employees: number;
    on_vacation: number;
    on_sick_leave: number;
    new_employees_month: number;
    turnover_rate: number;
    open_vacancies: number;
    candidates_in_process: number;
    pending_approvals: number;
    planned_trainings: number;
    assessments_in_progress: number;
    salary_pending_approval: number;
}

export interface DashboardTask {
    id: number;
    type: TaskType;
    title: string;
    description?: string;
    count?: number;
    priority: TaskPriority;
    due_date?: string;
    link: string;
    icon: string;
    color: string;
}

export interface DashboardEvent {
    id: number;
    type: EventType;
    title: string;
    description?: string;
    date: string;
    time?: string;
    location?: string;
    participants?: string[];
    link?: string;
    icon: string;
    color: string;
}

export interface DashboardNotification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    created_at: string;
    read: boolean;
    link?: string;
    icon: string;
    severity: 'info' | 'warn' | 'success' | 'danger';
}

export interface ActivityItem {
    id: number;
    type: ActivityType;
    title: string;
    description: string;
    user_name: string;
    user_avatar?: string;
    timestamp: string;
    icon: string;
    color: string;
}

export interface BirthdayItem {
    employee_id: number;
    employee_name: string;
    department_name: string;
    position_name: string;
    birth_date: string;
    days_until: number;
    photo?: string;
}

export interface ProbationItem {
    employee_id: number;
    employee_name: string;
    department_name: string;
    position_name: string;
    probation_end_date: string;
    days_remaining: number;
    mentor_name?: string;
    status: 'on_track' | 'at_risk' | 'extended';
}

export interface QuickAction {
    id: string;
    label: string;
    icon: string;
    link: string;
    color: string;
    permission?: string;
}

// Types
export type TaskType = 'vacation_approval' | 'salary_approval' | 'vacancy_approval' | 'candidate_review' | 'assessment_review' | 'training_assignment' | 'document_review' | 'probation_review' | 'other';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type EventType = 'training' | 'meeting' | 'assessment' | 'interview' | 'deadline' | 'holiday' | 'birthday' | 'anniversary' | 'other';

export type NotificationType = 'approval_request' | 'approval_result' | 'deadline_reminder' | 'system_alert' | 'new_employee' | 'employee_leave' | 'training_reminder' | 'assessment_result' | 'other';

export type ActivityType =
    | 'employee_hired'
    | 'employee_terminated'
    | 'vacation_approved'
    | 'vacation_rejected'
    | 'salary_approved'
    | 'training_completed'
    | 'assessment_completed'
    | 'vacancy_published'
    | 'candidate_hired'
    | 'document_uploaded'
    | 'other';

// Constants
export const TASK_TYPES: { value: TaskType; label: string; icon: string }[] = [
    { value: 'vacation_approval', label: 'Согласование отпуска', icon: 'pi-calendar' },
    { value: 'salary_approval', label: 'Согласование зарплаты', icon: 'pi-dollar' },
    { value: 'vacancy_approval', label: 'Согласование вакансии', icon: 'pi-briefcase' },
    { value: 'candidate_review', label: 'Рассмотрение кандидата', icon: 'pi-user' },
    { value: 'assessment_review', label: 'Оценка компетенций', icon: 'pi-chart-bar' },
    { value: 'training_assignment', label: 'Назначение обучения', icon: 'pi-book' },
    { value: 'document_review', label: 'Проверка документов', icon: 'pi-file' },
    { value: 'probation_review', label: 'Оценка испытательного', icon: 'pi-clock' },
    { value: 'other', label: 'Прочее', icon: 'pi-list' }
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string; severity: string }[] = [
    { value: 'low', label: 'Низкий', severity: 'secondary' },
    { value: 'medium', label: 'Средний', severity: 'info' },
    { value: 'high', label: 'Высокий', severity: 'warn' },
    { value: 'urgent', label: 'Срочный', severity: 'danger' }
];

export const EVENT_TYPES: { value: EventType; label: string; icon: string; color: string }[] = [
    { value: 'training', label: 'Обучение', icon: 'pi-book', color: 'blue' },
    { value: 'meeting', label: 'Совещание', icon: 'pi-users', color: 'purple' },
    { value: 'assessment', label: 'Оценка', icon: 'pi-chart-bar', color: 'orange' },
    { value: 'interview', label: 'Собеседование', icon: 'pi-user', color: 'cyan' },
    { value: 'deadline', label: 'Дедлайн', icon: 'pi-clock', color: 'red' },
    { value: 'holiday', label: 'Праздник', icon: 'pi-star', color: 'yellow' },
    { value: 'birthday', label: 'День рождения', icon: 'pi-gift', color: 'pink' },
    { value: 'anniversary', label: 'Юбилей работы', icon: 'pi-heart', color: 'green' },
    { value: 'other', label: 'Прочее', icon: 'pi-calendar', color: 'gray' }
];

export const QUICK_ACTIONS: QuickAction[] = [
    { id: 'add_employee', label: 'Добавить сотрудника', icon: 'pi-user-plus', link: '/hrm/personnel-records', color: 'blue' },
    { id: 'create_vacancy', label: 'Создать вакансию', icon: 'pi-briefcase', link: '/hrm/recruiting', color: 'green' },
    { id: 'request_vacation', label: 'Заявка на отпуск', icon: 'pi-calendar', link: '/hrm/vacations', color: 'orange' },
    { id: 'view_salary', label: 'Расчет зарплаты', icon: 'pi-dollar', link: '/hrm/salary', color: 'purple' },
    { id: 'schedule_training', label: 'Назначить обучение', icon: 'pi-book', link: '/hrm/training', color: 'cyan' },
    { id: 'start_assessment', label: 'Провести оценку', icon: 'pi-chart-bar', link: '/hrm/competency', color: 'pink' }
];
