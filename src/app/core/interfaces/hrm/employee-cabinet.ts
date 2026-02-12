// Employee Personal Cabinet Interfaces

export interface EmployeeProfile {
    id: number;
    employee_id: string; // Табельный номер
    full_name: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    photo?: string;

    // Должность и отдел
    position_id: number;
    position_name: string;
    department_id: number;
    department_name: string;

    // Контакты
    email: string;
    phone?: string;
    internal_phone?: string;

    // Даты
    hire_date: string;
    birth_date?: string;

    // Статус
    employment_status: EmploymentStatus;
    contract_type: ContractType;
    probation_end_date?: string;
    is_on_probation: boolean;

    // Руководитель
    manager_id?: number;
    manager_name?: string;
}

export interface LeaveBalance {
    employee_id: number;
    year: number;

    // Основной отпуск
    annual_leave_total: number;
    annual_leave_used: number;
    annual_leave_remaining: number;

    // Дополнительный отпуск
    additional_leave_total: number;
    additional_leave_used: number;
    additional_leave_remaining: number;

    // Учебный отпуск
    study_leave_total: number;
    study_leave_used: number;
    study_leave_remaining: number;

    // Больничные
    sick_leave_used_month: number;
    sick_leave_used_year: number;

    // Отгулы
    comp_days_available: number;
}

export interface MyVacationRequest {
    id: number;
    type: VacationType;
    start_date: string;
    end_date: string;
    days_count: number;
    status: VacationStatus;
    reason?: string;

    // Согласование
    submitted_at: string;
    approved_by?: number;
    approved_by_name?: string;
    approved_at?: string;
    rejected_by?: number;
    rejected_by_name?: string;
    rejected_at?: string;
    rejection_reason?: string;

    // Замещение
    substitute_id?: number;
    substitute_name?: string;
}

export interface MySalaryInfo {
    employee_id: number;

    // Текущая зарплата
    current_salary: {
        base_salary: number;
        total_allowances: number;
        gross_salary: number;
    };

    // Последняя выплата
    last_payment: SalaryPayment;

    // История выплат (последние 12 месяцев)
    payment_history: SalaryPayment[];
}

export interface SalaryPayment {
    id: number;
    period_month: number;
    period_year: number;
    gross_salary: number;
    total_deductions: number;
    net_salary: number;
    paid_at?: string;
    status: SalaryPaymentStatus;
}

export interface MyTraining {
    // Завершенные курсы
    completed: CompletedTraining[];

    // Текущие курсы
    in_progress: CurrentTraining[];

    // Назначенные (будущие)
    assigned: AssignedTraining[];
}

export interface CompletedTraining {
    id: number;
    course_id: number;
    course_name: string;
    course_type: string;
    completed_at: string;
    score?: number;
    certificate_number?: string;
    certificate_url?: string;
}

export interface CurrentTraining {
    id: number;
    course_id: number;
    course_name: string;
    course_type: string;
    started_at: string;
    deadline?: string;
    progress_percent: number;
    modules_completed: number;
    modules_total: number;
}

export interface AssignedTraining {
    id: number;
    course_id: number;
    course_name: string;
    course_type: string;
    assigned_at: string;
    start_date: string;
    deadline: string;
    assigned_by_name: string;
    is_mandatory: boolean;
}

export interface MyCompetencies {
    employee_id: number;
    last_assessment_date?: string;
    next_assessment_date?: string;

    // Текущие оценки
    competencies: CompetencyScore[];

    // План развития
    development_plan?: DevelopmentGoal[];

    // Средний балл
    average_score: number;
}

export interface CompetencyScore {
    competency_id: number;
    competency_name: string;
    category: string;
    current_level: number;
    max_level: number;
    target_level?: number;
    target_date?: string;
    last_assessed_at?: string;
}

export interface DevelopmentGoal {
    id: number;
    competency_name: string;
    current_level: number;
    target_level: number;
    target_date: string;
    actions: string[];
    status: 'not_started' | 'in_progress' | 'completed';
}

export interface MyNotification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    created_at: string;
    read: boolean;
    read_at?: string;
    link?: string;
    icon: string;
    severity: 'info' | 'success' | 'warn' | 'danger';
}

export interface MyTask {
    id: number;
    type: TaskType;
    title: string;
    description?: string;
    due_date?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    assigned_by_name?: string;
    link?: string;
}

export interface MyDocument {
    id: number;
    type: DocumentType;
    name: string;
    description?: string;
    uploaded_at: string;
    file_url?: string;
    file_size?: number;
    can_download: boolean;
}

// Types
export type EmploymentStatus = 'active' | 'on_leave' | 'on_sick_leave' | 'suspended' | 'terminated';
export type ContractType = 'permanent' | 'fixed_term' | 'probation' | 'contractor';
export type VacationType = 'annual' | 'additional' | 'study' | 'unpaid' | 'sick' | 'maternity' | 'paternity' | 'comp_day';
export type VacationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type SalaryPaymentStatus = 'calculated' | 'approved' | 'paid' | 'pending';
export type NotificationType = 'vacation_approved' | 'vacation_rejected' | 'salary_paid' | 'training_assigned' | 'assessment_scheduled' | 'task_assigned' | 'document_ready' | 'system' | 'other';
export type TaskType = 'training' | 'assessment' | 'document' | 'approval' | 'meeting' | 'other';
export type DocumentType = 'contract' | 'addendum' | 'certificate' | 'payslip' | 'reference' | 'order' | 'other';

// Constants
export const VACATION_TYPES: { value: VacationType; label: string }[] = [
    { value: 'annual', label: 'Основной отпуск' },
    { value: 'additional', label: 'Дополнительный отпуск' },
    { value: 'study', label: 'Учебный отпуск' },
    { value: 'unpaid', label: 'Отпуск без сохранения з/п' },
    { value: 'sick', label: 'Больничный' },
    { value: 'maternity', label: 'Декретный отпуск' },
    { value: 'paternity', label: 'Отпуск по уходу за ребенком' },
    { value: 'comp_day', label: 'Отгул' }
];

export const VACATION_STATUSES: { value: VacationStatus; label: string; severity: string }[] = [
    { value: 'draft', label: 'Черновик', severity: 'secondary' },
    { value: 'pending', label: 'На согласовании', severity: 'warn' },
    { value: 'approved', label: 'Одобрено', severity: 'success' },
    { value: 'rejected', label: 'Отклонено', severity: 'danger' },
    { value: 'cancelled', label: 'Отменено', severity: 'secondary' },
    { value: 'completed', label: 'Завершено', severity: 'info' }
];

export const DOCUMENT_TYPES: { value: DocumentType; label: string; icon: string }[] = [
    { value: 'contract', label: 'Трудовой договор', icon: 'pi-file' },
    { value: 'addendum', label: 'Дополнительное соглашение', icon: 'pi-file-edit' },
    { value: 'certificate', label: 'Сертификат', icon: 'pi-verified' },
    { value: 'payslip', label: 'Расчетный лист', icon: 'pi-dollar' },
    { value: 'reference', label: 'Справка', icon: 'pi-file-export' },
    { value: 'order', label: 'Приказ', icon: 'pi-bookmark' },
    { value: 'other', label: 'Прочее', icon: 'pi-paperclip' }
];
