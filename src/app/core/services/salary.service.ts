import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { EmployeeSalaryStructure, EmployeeBonus, EmployeeDeduction, BatchCalculationResult, BonusType, DeductionType } from '@/core/interfaces/hrm/salary';

const SALARY = '/hrm/salaries';
const USE_MOCK = !BASE_URL;

const MOCK_SALARY_STRUCTURES: EmployeeSalaryStructure[] = [
    {
        id: 1,
        employee_id: 101,
        employee_name: 'Каримов Азиз Бахтиёрович',
        department_id: 1,
        department_name: 'Департамент эксплуатации',
        position_id: 10,
        position_name: 'Ведущий инженер',
        base_salary: 12_000_000,
        rank_allowance: 1_800_000,
        education_allowance: 600_000,
        seniority_allowance: 1_200_000,
        seniority_years: 12,
        effective_date: '2025-01-01',
        currency: 'UZS'
    },
    {
        id: 2,
        employee_id: 102,
        employee_name: 'Юсупова Малика Рустамовна',
        department_id: 2,
        department_name: 'Финансовый отдел',
        position_id: 20,
        position_name: 'Главный бухгалтер',
        base_salary: 15_000_000,
        rank_allowance: 2_250_000,
        education_allowance: 750_000,
        seniority_allowance: 1_500_000,
        seniority_years: 15,
        effective_date: '2024-07-01',
        currency: 'UZS'
    },
    {
        id: 3,
        employee_id: 103,
        employee_name: 'Норматов Дильшод Камолович',
        department_id: 3,
        department_name: 'Юридический отдел',
        position_id: 30,
        position_name: 'Юрисконсульт',
        base_salary: 8_500_000,
        rank_allowance: 1_275_000,
        education_allowance: 425_000,
        seniority_allowance: 425_000,
        seniority_years: 5,
        effective_date: '2025-03-01',
        currency: 'UZS'
    },
    {
        id: 4,
        employee_id: 105,
        employee_name: 'Тошматов Бобур Эркинович',
        department_id: 4,
        department_name: 'Отдел кадров',
        position_id: 40,
        position_name: 'Специалист по кадрам',
        base_salary: 7_500_000,
        rank_allowance: 1_125_000,
        education_allowance: 375_000,
        seniority_allowance: 750_000,
        seniority_years: 8,
        effective_date: '2025-06-01',
        currency: 'UZS'
    },
    {
        id: 5,
        employee_id: 106,
        employee_name: 'Салимов Жасур Улугбекович',
        department_id: 5,
        department_name: 'Технический отдел',
        position_id: 50,
        position_name: 'Инженер-программист',
        base_salary: 10_000_000,
        rank_allowance: 1_500_000,
        education_allowance: 500_000,
        seniority_allowance: 500_000,
        seniority_years: 3,
        effective_date: '2025-09-01',
        currency: 'UZS'
    }
];

const MOCK_BONUSES: EmployeeBonus[] = [
    { id: 1, employee_id: 101, bonus_type: 'performance' as BonusType, amount: 3_000_000, period_month: 3, period_year: 2026, description: 'За перевыполнение плана Q1', approved: true },
    { id: 2, employee_id: 102, bonus_type: 'quarterly' as BonusType, amount: 4_500_000, period_month: 3, period_year: 2026, description: 'Квартальная премия Q1 2026', approved: true },
    { id: 3, employee_id: 103, bonus_type: 'holiday' as BonusType, amount: 2_000_000, period_month: 3, period_year: 2026, description: 'Праздничная премия к 8 марта', approved: false },
    { id: 4, employee_id: 106, bonus_type: 'one_time' as BonusType, amount: 5_000_000, period_month: 2, period_year: 2026, description: 'За успешное внедрение системы мониторинга', approved: true }
];

const MOCK_DEDUCTIONS: EmployeeDeduction[] = [
    { id: 1, employee_id: 101, deduction_type: 'loan' as DeductionType, amount: 1_500_000, is_percentage: false, start_date: '2025-06-01', end_date: '2026-06-01', description: 'Потребительский кредит', is_active: true },
    { id: 2, employee_id: 103, deduction_type: 'alimony' as DeductionType, amount: 25, is_percentage: true, start_date: '2024-01-01', description: 'Алименты по решению суда', is_active: true },
    { id: 3, employee_id: 105, deduction_type: 'advance' as DeductionType, amount: 2_000_000, is_percentage: false, start_date: '2026-02-01', end_date: '2026-04-01', description: 'Аванс за февраль', is_active: true }
];

const MOCK_BATCH_RESULT: BatchCalculationResult = {
    total: 5,
    successful: 5,
    failed: 0,
    results: [],
    total_gross: 78_850_000,
    total_net: 65_645_500,
    total_taxes: 13_204_500
};

@Injectable({
    providedIn: 'root'
})
export class SalaryService extends ApiService {
    // Salary Structures
    getSalaryStructures(): Observable<EmployeeSalaryStructure[]> {
        if (USE_MOCK) return of(MOCK_SALARY_STRUCTURES).pipe(delay(200));
        return this.http.get<EmployeeSalaryStructure[]>(BASE_URL + SALARY + '/structures');
    }

    getSalaryStructure(employeeId: number): Observable<EmployeeSalaryStructure> {
        if (USE_MOCK) return of(MOCK_SALARY_STRUCTURES.find((s) => s.employee_id === employeeId) || MOCK_SALARY_STRUCTURES[0]).pipe(delay(200));
        return this.http.get<EmployeeSalaryStructure>(BASE_URL + SALARY + '/structures/' + employeeId);
    }

    updateSalaryStructure(employeeId: number, data: Partial<EmployeeSalaryStructure>): Observable<EmployeeSalaryStructure> {
        if (USE_MOCK) {
            const existing = MOCK_SALARY_STRUCTURES.find((s) => s.employee_id === employeeId) || MOCK_SALARY_STRUCTURES[0];
            return of({ ...existing, ...data } as EmployeeSalaryStructure).pipe(delay(200));
        }
        return this.http.patch<EmployeeSalaryStructure>(BASE_URL + SALARY + '/structures/' + employeeId, data);
    }

    // Bonuses
    getBonuses(): Observable<EmployeeBonus[]> {
        if (USE_MOCK) return of(MOCK_BONUSES).pipe(delay(200));
        return this.http.get<EmployeeBonus[]>(BASE_URL + SALARY + '/bonuses');
    }

    createBonus(data: Partial<EmployeeBonus>): Observable<EmployeeBonus> {
        if (USE_MOCK) {
            const newBonus: EmployeeBonus = {
                id: MOCK_BONUSES.length + 1,
                employee_id: data.employee_id || 101,
                bonus_type: data.bonus_type || ('other' as BonusType),
                amount: data.amount || 0,
                period_month: data.period_month || 3,
                period_year: data.period_year || 2026,
                description: data.description,
                approved: false
            };
            return of(newBonus).pipe(delay(200));
        }
        return this.http.post<EmployeeBonus>(BASE_URL + SALARY + '/bonuses', data);
    }

    deleteBonus(id: number): Observable<any> {
        if (USE_MOCK) return of({ success: true }).pipe(delay(200));
        return this.http.delete(BASE_URL + SALARY + '/bonuses/' + id);
    }

    // Deductions
    getDeductions(): Observable<EmployeeDeduction[]> {
        if (USE_MOCK) return of(MOCK_DEDUCTIONS).pipe(delay(200));
        return this.http.get<EmployeeDeduction[]>(BASE_URL + SALARY + '/deductions');
    }

    createDeduction(data: Partial<EmployeeDeduction>): Observable<EmployeeDeduction> {
        if (USE_MOCK) {
            const newDeduction: EmployeeDeduction = {
                id: MOCK_DEDUCTIONS.length + 1,
                employee_id: data.employee_id || 101,
                deduction_type: data.deduction_type || ('other' as DeductionType),
                amount: data.amount || 0,
                is_percentage: data.is_percentage || false,
                start_date: data.start_date || '2026-03-01',
                end_date: data.end_date,
                description: data.description,
                is_active: true
            };
            return of(newDeduction).pipe(delay(200));
        }
        return this.http.post<EmployeeDeduction>(BASE_URL + SALARY + '/deductions', data);
    }

    deleteDeduction(id: number): Observable<any> {
        if (USE_MOCK) return of({ success: true }).pipe(delay(200));
        return this.http.delete(BASE_URL + SALARY + '/deductions/' + id);
    }

    // Calculations
    calculateSalary(month: number, year: number): Observable<BatchCalculationResult> {
        if (USE_MOCK) return of(MOCK_BATCH_RESULT).pipe(delay(200));
        return this.http.post<BatchCalculationResult>(BASE_URL + SALARY + '/calculate', { month, year });
    }

    approveSalary(month: number, year: number): Observable<any> {
        if (USE_MOCK) return of({ success: true }).pipe(delay(200));
        return this.http.post(BASE_URL + SALARY + '/approve', { month, year });
    }

    // Export
    exportPayslips(month: number, year: number): Observable<Blob> {
        if (USE_MOCK) return of(new Blob(['mock'], { type: 'application/octet-stream' })).pipe(delay(200));
        return this.http.get(BASE_URL + SALARY + '/export', {
            params: { month: month.toString(), year: year.toString() },
            responseType: 'blob'
        });
    }
}
