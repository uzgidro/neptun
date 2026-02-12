import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BatchCalculationResult, EmployeeBonus, EmployeeDeduction, EmployeeSalaryStructure } from '@/core/interfaces/hrm/salary';

// Мок-данные структур зарплат (12 сотрудников)
const MOCK_SALARY_STRUCTURES: EmployeeSalaryStructure[] = [
    {
        id: 1,
        employee_id: 1,
        employee_name: 'Каримов Рустам Шарипович',
        department_id: 1,
        department_name: 'Руководство',
        position_id: 1,
        position_name: 'Генеральный директор',
        base_salary: 25_000_000,
        rank_allowance: 5_000_000,
        education_allowance: 2_500_000,
        seniority_allowance: 3_750_000,
        seniority_years: 15,
        effective_date: '2025-01-01',
        currency: 'UZS'
    },
    {
        id: 2,
        employee_id: 2,
        employee_name: 'Ахмедова Нилуфар Бахтиёровна',
        department_id: 7,
        department_name: 'Отдел кадров',
        position_id: 2,
        position_name: 'Начальник отдела кадров',
        base_salary: 15_000_000,
        rank_allowance: 3_000_000,
        education_allowance: 1_500_000,
        seniority_allowance: 2_250_000,
        seniority_years: 10,
        effective_date: '2025-01-01',
        currency: 'UZS'
    },
    {
        id: 3,
        employee_id: 3,
        employee_name: 'Юлдашев Ботир Камолович',
        department_id: 2,
        department_name: 'Производственный отдел',
        position_id: 3,
        position_name: 'Начальник производства',
        base_salary: 20_000_000,
        rank_allowance: 4_000_000,
        education_allowance: 2_000_000,
        seniority_allowance: 3_000_000,
        seniority_years: 12,
        effective_date: '2025-01-01',
        currency: 'UZS'
    },
    {
        id: 4,
        employee_id: 4,
        employee_name: 'Рахимова Дилноза Алишеровна',
        department_id: 5,
        department_name: 'Финансовый отдел',
        position_id: 4,
        position_name: 'Главный бухгалтер',
        base_salary: 18_000_000,
        rank_allowance: 3_600_000,
        education_allowance: 1_800_000,
        seniority_allowance: 2_700_000,
        seniority_years: 11,
        effective_date: '2025-01-01',
        currency: 'UZS'
    },
    {
        id: 5,
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        department_id: 6,
        department_name: 'IT-отдел',
        position_id: 5,
        position_name: 'Системный администратор',
        base_salary: 12_000_000,
        rank_allowance: 2_400_000,
        education_allowance: 1_200_000,
        seniority_allowance: 1_200_000,
        seniority_years: 5,
        effective_date: '2025-01-01',
        currency: 'UZS'
    },
    {
        id: 6,
        employee_id: 6,
        employee_name: 'Абдуллаева Гулнора Тахировна',
        department_id: 8,
        department_name: 'Юридический отдел',
        position_id: 6,
        position_name: 'Юрист',
        base_salary: 14_000_000,
        rank_allowance: 2_800_000,
        education_allowance: 1_400_000,
        seniority_allowance: 2_100_000,
        seniority_years: 8,
        effective_date: '2025-01-01',
        currency: 'UZS'
    },
    {
        id: 7,
        employee_id: 7,
        employee_name: 'Мирзаев Жасур Хамидович',
        department_id: 2,
        department_name: 'Производственный отдел',
        position_id: 7,
        position_name: 'Технолог',
        base_salary: 11_000_000,
        rank_allowance: 2_200_000,
        education_allowance: 1_100_000,
        seniority_allowance: 1_650_000,
        seniority_years: 7,
        effective_date: '2025-01-01',
        currency: 'UZS'
    },
    {
        id: 8,
        employee_id: 8,
        employee_name: 'Исмоилова Шахло Равшановна',
        department_id: 3,
        department_name: 'Отдел контроля качества',
        position_id: 8,
        position_name: 'Инженер по качеству',
        base_salary: 10_000_000,
        rank_allowance: 2_000_000,
        education_allowance: 1_000_000,
        seniority_allowance: 1_500_000,
        seniority_years: 6,
        effective_date: '2025-01-01',
        currency: 'UZS'
    },
    {
        id: 9,
        employee_id: 9,
        employee_name: 'Турсунов Ильхом Адхамович',
        department_id: 4,
        department_name: 'Отдел логистики',
        position_id: 9,
        position_name: 'Менеджер по логистике',
        base_salary: 13_000_000,
        rank_allowance: 2_600_000,
        education_allowance: 1_300_000,
        seniority_allowance: 1_950_000,
        seniority_years: 9,
        effective_date: '2025-01-01',
        currency: 'UZS'
    },
    {
        id: 10,
        employee_id: 10,
        employee_name: 'Хасанова Малика Обидовна',
        department_id: 7,
        department_name: 'Отдел кадров',
        position_id: 10,
        position_name: 'Специалист по кадрам',
        base_salary: 9_000_000,
        rank_allowance: 1_800_000,
        education_allowance: 900_000,
        seniority_allowance: 900_000,
        seniority_years: 4,
        effective_date: '2025-01-01',
        currency: 'UZS'
    },
    {
        id: 11,
        employee_id: 11,
        employee_name: 'Сафаров Улугбек Шухратович',
        department_id: 2,
        department_name: 'Производственный отдел',
        position_id: 11,
        position_name: 'Оператор',
        base_salary: 7_000_000,
        rank_allowance: 1_400_000,
        education_allowance: 700_000,
        seniority_allowance: 700_000,
        seniority_years: 3,
        effective_date: '2025-01-01',
        currency: 'UZS'
    },
    {
        id: 12,
        employee_id: 12,
        employee_name: 'Каримова Зилола Бахтияровна',
        department_id: 5,
        department_name: 'Финансовый отдел',
        position_id: 12,
        position_name: 'Бухгалтер',
        base_salary: 8_000_000,
        rank_allowance: 1_600_000,
        education_allowance: 800_000,
        seniority_allowance: 800_000,
        seniority_years: 4,
        effective_date: '2025-01-01',
        currency: 'UZS'
    }
];

// Мок-данные премий
const MOCK_BONUSES: EmployeeBonus[] = [
    { id: 1, employee_id: 1, bonus_type: 'quarterly', amount: 5_000_000, period_month: 3, period_year: 2025, description: 'Квартальная премия Q1', approved: true },
    { id: 2, employee_id: 3, bonus_type: 'performance', amount: 3_000_000, period_month: 1, period_year: 2025, description: 'За выполнение плана производства', approved: true },
    { id: 3, employee_id: 4, bonus_type: 'annual', amount: 4_500_000, period_month: 12, period_year: 2024, description: 'Годовая премия за 2024', approved: true },
    { id: 4, employee_id: 7, bonus_type: 'one_time', amount: 2_000_000, period_month: 2, period_year: 2025, description: 'За внедрение нового процесса', approved: true },
    { id: 5, employee_id: 5, bonus_type: 'performance', amount: 1_500_000, period_month: 1, period_year: 2025, description: 'За успешную миграцию серверов', approved: false },
    { id: 6, employee_id: 9, bonus_type: 'quarterly', amount: 2_500_000, period_month: 3, period_year: 2025, description: 'Квартальная премия Q1', approved: true },
    { id: 7, employee_id: 2, bonus_type: 'holiday', amount: 1_000_000, period_month: 3, period_year: 2025, description: 'Праздничная премия 8 марта', approved: true },
    { id: 8, employee_id: 10, bonus_type: 'holiday', amount: 1_000_000, period_month: 3, period_year: 2025, description: 'Праздничная премия 8 марта', approved: true }
];

// Мок-данные удержаний
const MOCK_DEDUCTIONS: EmployeeDeduction[] = [
    { id: 1, employee_id: 11, deduction_type: 'loan', amount: 500_000, is_percentage: false, start_date: '2024-06-01', end_date: '2025-06-01', description: 'Потребительский кредит', is_active: true },
    { id: 2, employee_id: 7, deduction_type: 'advance', amount: 2_000_000, is_percentage: false, start_date: '2025-01-15', end_date: '2025-02-15', description: 'Аванс на личные нужды', is_active: false },
    { id: 3, employee_id: 9, deduction_type: 'loan', amount: 800_000, is_percentage: false, start_date: '2024-09-01', end_date: '2025-09-01', description: 'Ипотечный кредит (удержание)', is_active: true },
    { id: 4, employee_id: 12, deduction_type: 'fine', amount: 200_000, is_percentage: false, start_date: '2025-01-10', description: 'Штраф за опоздание', is_active: true },
    { id: 5, employee_id: 6, deduction_type: 'other', amount: 1, is_percentage: true, start_date: '2025-01-01', description: 'Профсоюзные взносы (1%)', is_active: true }
];

@Injectable({
    providedIn: 'root'
})
export class SalaryService extends ApiService {
    // --- Salary Structures ---

    getSalaryStructures(): Observable<EmployeeSalaryStructure[]> {
        return of(MOCK_SALARY_STRUCTURES).pipe(delay(300));
    }

    getSalaryStructure(employeeId: number): Observable<EmployeeSalaryStructure> {
        const structure = MOCK_SALARY_STRUCTURES.find((s) => s.employee_id === employeeId);
        return of(structure as EmployeeSalaryStructure).pipe(delay(300));
    }

    updateSalaryStructure(employeeId: number, payload: Partial<EmployeeSalaryStructure>): Observable<EmployeeSalaryStructure> {
        const existing = MOCK_SALARY_STRUCTURES.find((s) => s.employee_id === employeeId);
        const updated = { ...existing, ...payload } as EmployeeSalaryStructure;
        return of(updated).pipe(delay(200));
    }

    // --- Bonuses ---

    getBonuses(): Observable<EmployeeBonus[]> {
        return of(MOCK_BONUSES).pipe(delay(300));
    }

    createBonus(payload: Partial<EmployeeBonus>): Observable<EmployeeBonus> {
        const newBonus: EmployeeBonus = { id: Date.now(), approved: false, ...payload } as EmployeeBonus;
        return of(newBonus).pipe(delay(200));
    }

    deleteBonus(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    // --- Deductions ---

    getDeductions(): Observable<EmployeeDeduction[]> {
        return of(MOCK_DEDUCTIONS).pipe(delay(300));
    }

    createDeduction(payload: Partial<EmployeeDeduction>): Observable<EmployeeDeduction> {
        const newDeduction: EmployeeDeduction = { id: Date.now(), is_active: true, ...payload } as EmployeeDeduction;
        return of(newDeduction).pipe(delay(200));
    }

    deleteDeduction(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    // --- Calculation & Approval ---

    calculateSalary(month: number, year: number): Observable<BatchCalculationResult> {
        const results = MOCK_SALARY_STRUCTURES.map((structure) => {
            const gross = structure.base_salary + structure.rank_allowance + structure.education_allowance + structure.seniority_allowance;
            const incomeTax = Math.round(gross * 0.12);
            const socialFund = Math.round(gross * 0.005);
            const pensionFund = Math.round(gross * 0.03);
            const totalTax = incomeTax + socialFund + pensionFund;
            return {
                success: true as const,
                salary: {
                    id: Date.now() + structure.employee_id,
                    employee_id: structure.employee_id,
                    employee_name: structure.employee_name,
                    period_month: month,
                    period_year: year,
                    base_salary: structure.base_salary,
                    rank_allowance: structure.rank_allowance,
                    education_allowance: structure.education_allowance,
                    seniority_allowance: structure.seniority_allowance,
                    other_allowances: 0,
                    bonuses: 0,
                    overtime_pay: 0,
                    absence_deduction: 0,
                    gross_salary: gross,
                    income_tax: incomeTax,
                    social_fund: socialFund,
                    pension_fund: pensionFund,
                    health_insurance: 0,
                    trade_union: 0,
                    other_deductions: 0,
                    total_deductions: totalTax,
                    net_salary: gross - totalTax,
                    working_days: 22,
                    worked_days: 22,
                    sick_days: 0,
                    vacation_days: 0,
                    absent_days: 0,
                    overtime_hours: 0,
                    status: 'calculated' as const
                }
            };
        });

        const totalGross = results.reduce((sum, r) => sum + (r.salary?.gross_salary || 0), 0);
        const totalTaxes = results.reduce((sum, r) => sum + (r.salary?.total_deductions || 0), 0);

        const batchResult: BatchCalculationResult = {
            total: results.length,
            successful: results.length,
            failed: 0,
            results,
            total_gross: totalGross,
            total_net: totalGross - totalTaxes,
            total_taxes: totalTaxes
        };
        return of(batchResult).pipe(delay(300));
    }

    approveSalary(month: number, year: number): Observable<any> {
        return of({ success: true, status: 'approved' }).pipe(delay(200));
    }

    // --- Export ---

    exportPayslips(month: number, year: number): Observable<Blob> {
        return of(new Blob()).pipe(delay(300));
    }
}
