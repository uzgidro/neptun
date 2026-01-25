export interface Salary {
    id: number;
    employee_id: number;
    employee_name: string;
    department_id?: number;
    department_name?: string;
    position_name?: string;
    period_month: number;
    period_year: number;

    // Gross salary components
    base_salary: number;
    rank_allowance: number;        // Надбавка за ранг
    education_allowance: number;   // Надбавка за образование
    seniority_allowance: number;   // Надбавка за выслугу лет
    other_allowances: number;      // Прочие надбавки
    bonuses: number;               // Премии
    overtime_pay: number;          // Сверхурочные
    absence_deduction: number;     // Вычеты за пропуски

    gross_salary: number;          // Итого начислено

    // Taxes and deductions (Uzbekistan rates)
    income_tax: number;            // НДФЛ 10%
    social_fund: number;           // Соц. фонд 0.5%
    pension_fund: number;          // Пенсионный фонд 3%
    health_insurance: number;      // Мед. страхование 2%
    trade_union: number;           // Профсоюз 1% (опционально)
    other_deductions: number;      // Другие удержания (кредиты, алименты)

    total_deductions: number;      // Всего удержаний
    net_salary: number;            // К выплате

    // Work time data
    working_days: number;          // Рабочих дней в месяце
    worked_days: number;           // Отработано дней
    sick_days: number;             // Больничные дни
    vacation_days: number;         // Отпускные дни
    absent_days: number;           // Дни отсутствия
    overtime_hours: number;        // Часов переработки

    status: SalaryStatus;
    calculated_at?: string;
    calculated_by?: string;
    approved_at?: string;
    approved_by?: string;
    paid_at?: string;
    rejection_reason?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface SalaryCalculationInput {
    employee_id: number;
    period_month: number;
    period_year: number;
}

export interface SalaryCalculationResult {
    success: boolean;
    salary?: Salary;
    errors?: string[];
    warnings?: string[];
}

export interface BatchCalculationResult {
    total: number;
    successful: number;
    failed: number;
    results: SalaryCalculationResult[];
    total_gross: number;
    total_net: number;
    total_taxes: number;
}

export interface EmployeeSalaryStructure {
    id: number;
    employee_id: number;
    employee_name: string;
    department_id: number;
    department_name: string;
    position_id: number;
    position_name: string;
    base_salary: number;
    rank_allowance: number;
    education_allowance: number;
    seniority_allowance: number;
    seniority_years: number;
    effective_date: string;
    currency: string;
}

export interface EmployeeAttendance {
    employee_id: number;
    period_month: number;
    period_year: number;
    working_days: number;
    worked_days: number;
    sick_days: number;
    vacation_days: number;
    absent_days: number;
    overtime_hours: number;
    late_minutes: number;
}

export interface EmployeeBonus {
    id: number;
    employee_id: number;
    bonus_type: BonusType;
    amount: number;
    period_month: number;
    period_year: number;
    description?: string;
    approved: boolean;
}

export interface EmployeeDeduction {
    id: number;
    employee_id: number;
    deduction_type: DeductionType;
    amount: number;
    is_percentage: boolean;
    start_date: string;
    end_date?: string;
    description?: string;
    is_active: boolean;
}

export interface TaxRates {
    income_tax: number;      // 10% в Узбекистане
    social_fund: number;     // 0.5%
    pension_fund: number;    // 3%
    health_insurance: number; // 2%
    trade_union: number;     // 1%
}

export const DEFAULT_TAX_RATES: TaxRates = {
    income_tax: 0.10,        // 10%
    social_fund: 0.005,      // 0.5%
    pension_fund: 0.03,      // 3%
    health_insurance: 0.02,  // 2%
    trade_union: 0.01        // 1%
};

export interface SalaryReport {
    period_month: number;
    period_year: number;
    generated_at: string;
    report_type: ReportType;
    total_employees: number;
    total_gross: number;
    total_taxes: number;
    total_deductions: number;
    total_net: number;
    details: Salary[];
}

export type SalaryStatus = 'draft' | 'calculated' | 'pending_approval' | 'approved' | 'rejected' | 'paid';
export type BonusType = 'performance' | 'holiday' | 'quarterly' | 'annual' | 'one_time' | 'other';
export type DeductionType = 'loan' | 'alimony' | 'fine' | 'advance' | 'other';
export type ReportType = 'payroll_register' | 'tax_report' | 'social_fund_report' | 'payslip';

export const SALARY_STATUSES: { value: SalaryStatus; label: string }[] = [
    { value: 'draft', label: 'Черновик' },
    { value: 'calculated', label: 'Рассчитан' },
    { value: 'pending_approval', label: 'На утверждении' },
    { value: 'approved', label: 'Утвержден' },
    { value: 'rejected', label: 'Отклонен' },
    { value: 'paid', label: 'Выплачен' }
];

export const BONUS_TYPES: { value: BonusType; label: string }[] = [
    { value: 'performance', label: 'За результаты' },
    { value: 'holiday', label: 'Праздничная' },
    { value: 'quarterly', label: 'Квартальная' },
    { value: 'annual', label: 'Годовая' },
    { value: 'one_time', label: 'Разовая' },
    { value: 'other', label: 'Прочая' }
];

export const DEDUCTION_TYPES: { value: DeductionType; label: string }[] = [
    { value: 'loan', label: 'Кредит' },
    { value: 'alimony', label: 'Алименты' },
    { value: 'fine', label: 'Штраф' },
    { value: 'advance', label: 'Аванс' },
    { value: 'other', label: 'Прочее' }
];
