export interface Training {
    id: number;
    title: string;
    description: string;
    training_type: TrainingType;
    provider?: string;
    start_date: string;
    end_date: string;
    duration_hours: number;
    location?: string;
    is_online: boolean;
    max_participants?: number;
    current_participants?: number;
    status: TrainingStatus;
    cost?: number;
    certificate_provided: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface TrainingParticipant {
    id: number;
    training_id: number;
    training_title?: string;
    employee_id: number;
    employee_name: string;
    enrollment_date: string;
    completion_date?: string;
    status: ParticipantStatus;
    score?: number;
    certificate_url?: string;
    feedback?: string;
}

export interface Certificate {
    id: number;
    employee_id: number;
    employee_name: string;
    certificate_name: string;
    issuing_organization: string;
    issue_date: string;
    expiry_date?: string;
    certificate_number?: string;
    file_url?: string;
    created_at?: string;
}

export interface DevelopmentPlan {
    id: number;
    employee_id: number;
    employee_name: string;
    title: string;
    description: string;
    start_date: string;
    target_date: string;
    status: PlanStatus;
    goals?: DevelopmentGoal[];
    created_at?: string;
    updated_at?: string;
}

export interface DevelopmentGoal {
    id: number;
    plan_id: number;
    title: string;
    description?: string;
    target_date: string;
    status: GoalStatus;
    progress_percent: number;
}

export type TrainingType = 'course' | 'workshop' | 'seminar' | 'certification' | 'mentoring' | 'self_study';
export type TrainingStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type ParticipantStatus = 'enrolled' | 'in_progress' | 'completed' | 'dropped';
export type PlanStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';

export interface TrainingPayload {
    title?: string;
    description?: string;
    training_type?: TrainingType | string;
    provider?: string;
    start_date?: string;
    end_date?: string;
    duration_hours?: number;
    location?: string;
    is_online?: boolean;
    max_participants?: number;
    cost?: number;
    certificate_provided?: boolean;
}

export const TRAINING_TYPES: { value: TrainingType; label: string }[] = [
    { value: 'course', label: 'Курс' },
    { value: 'workshop', label: 'Воркшоп' },
    { value: 'seminar', label: 'Семинар' },
    { value: 'certification', label: 'Сертификация' },
    { value: 'mentoring', label: 'Менторинг' },
    { value: 'self_study', label: 'Самообучение' }
];

export const TRAINING_STATUSES: { value: TrainingStatus; label: string }[] = [
    { value: 'planned', label: 'Запланировано' },
    { value: 'in_progress', label: 'В процессе' },
    { value: 'completed', label: 'Завершено' },
    { value: 'cancelled', label: 'Отменено' }
];
