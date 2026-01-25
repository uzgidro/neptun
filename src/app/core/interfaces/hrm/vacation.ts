export interface Vacation {
    id: number;
    employee_id: number;
    employee_name: string;
    department_id?: number;
    department_name?: string;
    vacation_type: VacationType;
    start_date: string;
    end_date: string;
    days_count: number;
    status: VacationStatus;
    approver_id?: number;
    approver_name?: string;
    approved_at?: string;
    reason?: string;
    rejection_reason?: string;
    created_at?: string;
    updated_at?: string;
}

export interface VacationBalance {
    id: number;
    employee_id: number;
    employee_name: string;
    year: number;
    total_days: number;
    used_days: number;
    pending_days: number;
    remaining_days: number;
    carried_over_days: number;
}

export interface VacationValidationResult {
    isValid: boolean;
    errors: VacationValidationError[];
    warnings: VacationValidationWarning[];
}

export interface VacationValidationError {
    code: 'INSUFFICIENT_BALANCE' | 'DATE_OVERLAP' | 'INVALID_DATES' | 'DEPARTMENT_LIMIT';
    message: string;
    details?: any;
}

export interface VacationValidationWarning {
    code: 'DEPARTMENT_OVERLAP' | 'PEAK_SEASON' | 'SHORT_NOTICE';
    message: string;
    overlappingEmployees?: string[];
}

export interface DepartmentVacationSchedule {
    department_id: number;
    department_name: string;
    max_concurrent_vacations: number;
    blocked_periods: BlockedPeriod[];
}

export interface BlockedPeriod {
    start_date: string;
    end_date: string;
    reason: string;
}

export type VacationType = 'annual' | 'sick' | 'unpaid' | 'maternity' | 'study' | 'other';
export type VacationStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface VacationPayload {
    employee_id?: number;
    vacation_type?: VacationType | string;
    start_date?: string;
    end_date?: string;
    reason?: string;
}

export const VACATION_TYPES: { value: VacationType; label: string }[] = [
    { value: 'annual', label: 'Ежегодный' },
    { value: 'sick', label: 'Больничный' },
    { value: 'unpaid', label: 'Без содержания' },
    { value: 'maternity', label: 'Декретный' },
    { value: 'study', label: 'Учебный' },
    { value: 'other', label: 'Другой' }
];

export const VACATION_STATUSES: { value: VacationStatus; label: string }[] = [
    { value: 'draft', label: 'Черновик' },
    { value: 'pending', label: 'На согласовании' },
    { value: 'approved', label: 'Одобрен' },
    { value: 'rejected', label: 'Отклонен' },
    { value: 'cancelled', label: 'Отменен' }
];

// Types that require balance check
export const BALANCE_REQUIRED_TYPES: VacationType[] = ['annual', 'study'];
