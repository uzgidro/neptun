export interface PerformanceReview {
    id: number;
    employee_id: number;
    employee_name: string;
    reviewer_id: number;
    reviewer_name?: string;
    type: ReviewType;
    status: ReviewStatus;
    period_start: string;
    period_end: string;
    goals: PerformanceGoal[];
    self_rating?: number | null;
    self_comment?: string;
    manager_rating?: number | null;
    manager_comment?: string;
    final_rating?: number | null;
    strengths?: string;
    improvements?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PerformanceGoal {
    id: number;
    review_id?: number;
    employee_id: number;
    title: string;
    target_value?: number;
    current_value?: number;
    weight: number;
    status: GoalStatus;
    due_date?: string;
    progress: number;
}

export interface KPI {
    id: number;
    employee_id: number;
    employee_name: string;
    kpi_name: string;
    description?: string;
    target_value: number;
    actual_value: number;
    unit: string;
    period_month: number;
    period_year: number;
    achievement_percent: number;
    status: KPIStatus;
    created_at?: string;
}

export interface PerformanceRating {
    id: number;
    employee_id: number;
    employee_name: string;
    period_year: number;
    overall_rating: number;
    rating_label: string;
    rank?: number;
    percentile?: number;
    notes?: string;
}

export interface PerformanceDashboard {
    total_reviews: number;
    completed_reviews: number;
    pending_reviews: number;
    avg_rating: number;
    goal_stats: {
        total: number;
        completed: number;
        in_progress: number;
        overdue: number;
        avg_progress: number;
    };
}

export type ReviewType = 'annual' | 'quarterly' | 'probation' | 'project' | 'mid_year';
export type ReviewStatus = 'draft' | 'self_review' | 'manager_review' | 'calibration' | 'completed' | 'acknowledged';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'exceeded' | 'not_achieved';
export type KPIStatus = 'on_track' | 'at_risk' | 'behind' | 'achieved' | 'exceeded';

export interface PerformanceReviewPayload {
    employee_id: number;
    reviewer_id: number;
    type: ReviewType;
    period_start: string;
    period_end: string;
}

export interface GoalPayload {
    employee_id: number;
    review_id?: number;
    title: string;
    target_value?: number;
    weight?: number;
    due_date?: string;
}

export interface SelfReviewPayload {
    self_rating: number;
    self_comment?: string;
}

export interface ManagerReviewPayload {
    manager_rating: number;
    manager_comment?: string;
    final_rating?: number;
    strengths?: string;
    improvements?: string;
}

export const REVIEW_TYPES: { value: ReviewType; label: string }[] = [
    { value: 'annual', label: 'Годовая' },
    { value: 'mid_year', label: 'Полугодовая' },
    { value: 'quarterly', label: 'Квартальная' },
    { value: 'probation', label: 'Испытательный срок' },
    { value: 'project', label: 'По проекту' }
];

export const REVIEW_STATUSES: { value: ReviewStatus; label: string }[] = [
    { value: 'draft', label: 'Черновик' },
    { value: 'self_review', label: 'Самооценка' },
    { value: 'manager_review', label: 'Оценка руководителя' },
    { value: 'calibration', label: 'Калибровка' },
    { value: 'completed', label: 'Завершена' },
    { value: 'acknowledged', label: 'Ознакомлен' }
];

export const GOAL_STATUSES: { value: GoalStatus; label: string }[] = [
    { value: 'not_started', label: 'Не начата' },
    { value: 'in_progress', label: 'В процессе' },
    { value: 'completed', label: 'Выполнена' },
    { value: 'exceeded', label: 'Перевыполнена' },
    { value: 'not_achieved', label: 'Не достигнута' }
];

export const RATING_LABELS: { value: number; label: string }[] = [
    { value: 1, label: 'Неудовлетворительно' },
    { value: 2, label: 'Требует улучшения' },
    { value: 3, label: 'Соответствует ожиданиям' },
    { value: 4, label: 'Превышает ожидания' },
    { value: 5, label: 'Исключительно' }
];
