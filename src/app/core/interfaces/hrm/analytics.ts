// Unified distribution format: { label, count, percentage }
export interface Distribution {
    label: string;
    count: number;
    percentage: number;
}

// Unified trend format: { points: [{ year, month, value }] }
export interface TrendData {
    points: TrendPoint[];
}

export interface TrendPoint {
    year: number;
    month: number;
    value: number;
}

// --- Dashboard ---

export interface HRAnalyticsDashboard {
    total_employees: number;
    new_hires_month: number;
    terminations_month: number;
    turnover_rate: number;
    avg_tenure_years: number;
    avg_age: number;
    gender_distribution: GenderDistribution;
    age_distribution: Distribution[];
    tenure_distribution: Distribution[];
    department_headcount: DepartmentHeadcount[];
    position_headcount: PositionHeadcount[];
}

export interface GenderDistribution {
    male: number;
    female: number;
    total: number;
}

export interface DepartmentHeadcount {
    department_id: number;
    department_name: string;
    headcount: number;
}

export interface PositionHeadcount {
    position_id: number;
    position_name: string;
    count: number;
}

// --- Headcount ---

export interface HeadcountReport {
    total_employees: number;
    by_department: DepartmentHeadcount[];
    by_position: PositionHeadcount[];
}

// --- Turnover ---

export interface TurnoverReport {
    period_start: string;
    period_end: string;
    total_terminations: number;
    voluntary_terminations: number;
    involuntary_terminations: number;
    turnover_rate: number;
    retention_rate: number;
    avg_tenure_at_termination: number;
    by_reason: Distribution[];
    by_department: TurnoverByDepartment[];
}

export interface TurnoverByDepartment {
    department: string;
    terminations: number;
    turnover_rate: number;
}

// --- Attendance ---

export interface AttendanceReport {
    period_start: string;
    period_end: string;
    total_work_days: number;
    avg_attendance: number;
    avg_absence: number;
    by_status: Distribution[];
    by_department: AttendanceByDepartment[];
}

export interface AttendanceByDepartment {
    department: string;
    attendance_rate: number;
    absence_rate: number;
}

// --- Salary ---

export interface SalaryReport {
    period_start: string;
    period_end: string;
    total_payroll: number;
    avg_salary: number;
    median_salary: number;
    min_salary: number;
    max_salary: number;
    by_department: SalaryByDepartment[];
}

export interface SalaryByDepartment {
    department: string;
    avg_salary: number;
    total_payroll: number;
    headcount: number;
}

// --- Performance ---

export interface PerformanceReport {
    total_reviews: number;
    avg_rating: number;
    rating_distribution: Distribution[];
    goal_completion: {
        total: number;
        completed: number;
        rate: number;
    };
    by_department: PerformanceByDepartment[];
}

export interface PerformanceByDepartment {
    department: string;
    avg_rating: number;
    goal_rate: number;
}

// --- Training ---

export interface TrainingReport {
    total_trainings: number;
    total_participants: number;
    completion_rate: number;
    by_status: Distribution[];
    by_type: Distribution[];
}

// --- Demographics ---

export interface DemographicsReport {
    total_employees: number;
    avg_age: number;
    age_distribution: Distribution[];
    tenure_distribution: Distribution[];
}

// --- Filter ---

export interface AnalyticsFilter {
    start_date?: string;
    end_date?: string;
    department_id?: number;
    position_id?: number;
    report_type?: ReportType;
}

export type ReportType = 'headcount' | 'turnover' | 'attendance' | 'salary' | 'performance' | 'training' | 'demographics' | 'diversity';

export const REPORT_TYPES: { value: ReportType; label: string }[] = [
    { value: 'headcount', label: 'Кадровый состав' },
    { value: 'turnover', label: 'Текучесть кадров' },
    { value: 'attendance', label: 'Посещаемость' },
    { value: 'salary', label: 'Заработная плата' },
    { value: 'performance', label: 'Эффективность' },
    { value: 'training', label: 'Обучение' },
    { value: 'demographics', label: 'Демография' },
    { value: 'diversity', label: 'Разнообразие' }
];
