export interface HRAnalyticsDashboard {
    total_employees: number;
    active_employees: number;
    new_hires_this_month: number;
    terminations_this_month: number;
    turnover_rate: number;
    average_tenure: number;
    headcount_by_department: DepartmentHeadcount[];
    headcount_by_position: PositionHeadcount[];
    gender_distribution: GenderDistribution;
    age_distribution: AgeDistribution[];
    tenure_distribution: TenureDistribution[];
}

export interface DepartmentHeadcount {
    department_id: number;
    department_name: string;
    headcount: number;
    percentage: number;
}

export interface PositionHeadcount {
    position_id: number;
    position_name: string;
    headcount: number;
    percentage: number;
}

export interface GenderDistribution {
    male: number;
    female: number;
    male_percentage: number;
    female_percentage: number;
}

export interface AgeDistribution {
    age_group: string;
    count: number;
    percentage: number;
}

export interface TenureDistribution {
    tenure_group: string;
    count: number;
    percentage: number;
}

export interface TurnoverReport {
    period_start: string;
    period_end: string;
    total_employees_start: number;
    total_employees_end: number;
    new_hires: number;
    terminations: number;
    voluntary_terminations: number;
    involuntary_terminations: number;
    turnover_rate: number;
    retention_rate: number;
    terminations_by_department: DepartmentTermination[];
    terminations_by_reason: TerminationReason[];
}

export interface DepartmentTermination {
    department_id: number;
    department_name: string;
    terminations: number;
    turnover_rate: number;
}

export interface TerminationReason {
    reason: string;
    count: number;
    percentage: number;
}

export interface AttendanceReport {
    period_start: string;
    period_end: string;
    total_working_days: number;
    average_attendance_rate: number;
    total_absences: number;
    absence_by_type: AbsenceByType[];
    attendance_by_department: DepartmentAttendance[];
}

export interface AbsenceByType {
    type: string;
    days: number;
    percentage: number;
}

export interface DepartmentAttendance {
    department_id: number;
    department_name: string;
    attendance_rate: number;
    total_absences: number;
}

export interface SalaryReport {
    period_month: number;
    period_year: number;
    total_payroll: number;
    average_salary: number;
    median_salary: number;
    min_salary: number;
    max_salary: number;
    salary_by_department: DepartmentSalary[];
    salary_by_position: PositionSalary[];
    salary_distribution: SalaryDistribution[];
}

export interface DepartmentSalary {
    department_id: number;
    department_name: string;
    total_payroll: number;
    average_salary: number;
    headcount: number;
}

export interface PositionSalary {
    position_id: number;
    position_name: string;
    average_salary: number;
    min_salary: number;
    max_salary: number;
    headcount: number;
}

export interface SalaryDistribution {
    salary_range: string;
    count: number;
    percentage: number;
}

export interface ReportFilter {
    start_date?: string;
    end_date?: string;
    department_id?: number;
    position_id?: number;
    report_type: ReportType;
}

export type ReportType = 'headcount' | 'turnover' | 'attendance' | 'salary' | 'performance' | 'training';

export const REPORT_TYPES: { value: ReportType; label: string }[] = [
    { value: 'headcount', label: 'Кадровый состав' },
    { value: 'turnover', label: 'Текучесть кадров' },
    { value: 'attendance', label: 'Посещаемость' },
    { value: 'salary', label: 'Заработная плата' },
    { value: 'performance', label: 'Эффективность' },
    { value: 'training', label: 'Обучение' }
];
