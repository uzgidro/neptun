export interface PerformanceReview {
    id: number;
    employee_id: number;
    employee_name: string;
    reviewer_id: number;
    reviewer_name?: string;
    review_period_start: string;
    review_period_end: string;
    review_type: ReviewType;
    status: ReviewStatus;
    overall_rating?: number;
    goals: PerformanceGoal[];
    strengths?: string;
    areas_for_improvement?: string;
    reviewer_comments?: string;
    employee_comments?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PerformanceGoal {
    id: number;
    review_id?: number;
    employee_id: number;
    employee_name?: string;
    title: string;
    description: string;
    metric: string;
    target_value: string;
    actual_value?: string;
    weight: number;
    start_date: string;
    due_date: string;
    status: GoalStatus;
    progress_percent: number;
    rating?: number;
    comments?: string;
    created_at?: string;
    updated_at?: string;
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

export type ReviewType = 'annual' | 'semi_annual' | 'quarterly' | 'probation' | 'project';
export type ReviewStatus = 'draft' | 'self_review' | 'manager_review' | 'calibration' | 'completed';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'exceeded' | 'not_achieved';
export type KPIStatus = 'on_track' | 'at_risk' | 'behind' | 'achieved' | 'exceeded';

export interface PerformanceReviewPayload {
    employee_id: number;
    review_period_start: string;
    review_period_end: string;
    review_type: ReviewType;
    goals: {
        title: string;
        description: string;
        metric: string;
        target_value: string;
        weight: number;
        due_date: string;
    }[];
}

export interface GoalPayload {
    employee_id?: number;
    title?: string;
    description?: string;
    metric?: string;
    target_value?: string;
    weight?: number;
    start_date?: string;
    due_date?: string;
}

export const REVIEW_TYPES: { value: ReviewType; label: string }[] = [
    { value: 'annual', label: 'Годовая' },
    { value: 'semi_annual', label: 'Полугодовая' },
    { value: 'quarterly', label: 'Квартальная' },
    { value: 'probation', label: 'Испытательный срок' },
    { value: 'project', label: 'По проекту' }
];

export const REVIEW_STATUSES: { value: ReviewStatus; label: string }[] = [
    { value: 'draft', label: 'Черновик' },
    { value: 'self_review', label: 'Самооценка' },
    { value: 'manager_review', label: 'Оценка руководителя' },
    { value: 'calibration', label: 'Калибровка' },
    { value: 'completed', label: 'Завершена' }
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
