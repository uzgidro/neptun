import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import { Salary, SalaryPayload, SalaryStructure, SalaryDeduction, SalaryBonus, EmployeeSalaryStructure, EmployeeBonus, EmployeeDeduction } from '@/core/interfaces/hrm/salary';

const API_URL = BASE_URL + '/hrm/salaries';
const USE_MOCK = !BASE_URL;

// ===================== MOCK DATA =====================

const MOCK_SALARIES: Salary[] = [
    {
        id: 1, employee_id: 101, employee_name: 'Каримов Бахтиёр Рустамович',
        department_id: 1, department_name: 'Управление производством', position_name: 'Главный инженер',
        period_month: 2, period_year: 2026,
        base_salary: 12000000, rank_allowance: 2400000, education_allowance: 1200000, seniority_allowance: 1800000,
        other_allowances: 600000, bonuses: 3000000, overtime_pay: 0, absence_deduction: 0,
        gross_salary: 21000000,
        income_tax: 2100000, social_fund: 105000, pension_fund: 630000, health_insurance: 420000,
        trade_union: 210000, other_deductions: 0, total_deductions: 3465000, net_salary: 17535000,
        working_days: 20, worked_days: 20, sick_days: 0, vacation_days: 0, absent_days: 0, overtime_hours: 0,
        status: 'paid', calculated_at: '2026-02-25T10:00:00Z', calculated_by: 'Система',
        approved_at: '2026-02-26T14:00:00Z', approved_by: 'Рахимов О.Ш.', paid_at: '2026-02-28T09:00:00Z',
        created_at: '2026-02-20T08:00:00Z', updated_at: '2026-02-28T09:00:00Z'
    },
    {
        id: 2, employee_id: 102, employee_name: 'Султанова Дилноза Камолидиновна',
        department_id: 2, department_name: 'Финансово-экономический отдел', position_name: 'Ведущий экономист',
        period_month: 2, period_year: 2026,
        base_salary: 8000000, rank_allowance: 1600000, education_allowance: 800000, seniority_allowance: 1200000,
        other_allowances: 400000, bonuses: 2000000, overtime_pay: 500000, absence_deduction: 0,
        gross_salary: 14500000,
        income_tax: 1450000, social_fund: 72500, pension_fund: 435000, health_insurance: 290000,
        trade_union: 145000, other_deductions: 0, total_deductions: 2392500, net_salary: 12107500,
        working_days: 20, worked_days: 20, sick_days: 0, vacation_days: 0, absent_days: 0, overtime_hours: 4,
        status: 'approved', calculated_at: '2026-02-25T10:05:00Z', calculated_by: 'Система',
        approved_at: '2026-02-26T14:30:00Z', approved_by: 'Рахимов О.Ш.',
        created_at: '2026-02-20T08:00:00Z', updated_at: '2026-02-26T14:30:00Z'
    },
    {
        id: 3, employee_id: 103, employee_name: 'Рахимов Отабек Шухратович',
        department_id: 3, department_name: 'Отдел кадров', position_name: 'Начальник отдела кадров',
        period_month: 2, period_year: 2026,
        base_salary: 10000000, rank_allowance: 2000000, education_allowance: 1000000, seniority_allowance: 2500000,
        other_allowances: 500000, bonuses: 2500000, overtime_pay: 0, absence_deduction: 400000,
        gross_salary: 18100000,
        income_tax: 1810000, social_fund: 90500, pension_fund: 543000, health_insurance: 362000,
        trade_union: 181000, other_deductions: 1500000, total_deductions: 4486500, net_salary: 13613500,
        working_days: 20, worked_days: 19, sick_days: 1, vacation_days: 0, absent_days: 0, overtime_hours: 0,
        status: 'calculated', calculated_at: '2026-02-25T10:10:00Z', calculated_by: 'Система',
        notes: 'Больничный 1 день', created_at: '2026-02-20T08:00:00Z', updated_at: '2026-02-25T10:10:00Z'
    },
    {
        id: 4, employee_id: 104, employee_name: 'Абдуллаев Жасур Тохирович',
        department_id: 1, department_name: 'Управление производством', position_name: 'Оператор производственной линии',
        period_month: 2, period_year: 2026,
        base_salary: 5000000, rank_allowance: 750000, education_allowance: 500000, seniority_allowance: 500000,
        other_allowances: 300000, bonuses: 1000000, overtime_pay: 1250000, absence_deduction: 0,
        gross_salary: 9300000,
        income_tax: 930000, social_fund: 46500, pension_fund: 279000, health_insurance: 186000,
        trade_union: 93000, other_deductions: 500000, total_deductions: 2034500, net_salary: 7265500,
        working_days: 20, worked_days: 20, sick_days: 0, vacation_days: 0, absent_days: 0, overtime_hours: 10,
        status: 'pending_approval', calculated_at: '2026-02-25T10:15:00Z', calculated_by: 'Система',
        notes: 'Ночные смены: 10 часов переработки',
        created_at: '2026-02-20T08:00:00Z', updated_at: '2026-02-25T10:15:00Z'
    },
    {
        id: 5, employee_id: 105, employee_name: 'Мирзаева Нодира Бахтиёровна',
        department_id: 4, department_name: 'Юридический отдел', position_name: 'Юрисконсульт',
        period_month: 2, period_year: 2026,
        base_salary: 7000000, rank_allowance: 1050000, education_allowance: 700000, seniority_allowance: 700000,
        other_allowances: 350000, bonuses: 1500000, overtime_pay: 0, absence_deduction: 1400000,
        gross_salary: 9900000,
        income_tax: 990000, social_fund: 49500, pension_fund: 297000, health_insurance: 198000,
        trade_union: 99000, other_deductions: 0, total_deductions: 1633500, net_salary: 8266500,
        working_days: 20, worked_days: 16, sick_days: 0, vacation_days: 4, absent_days: 0, overtime_hours: 0,
        status: 'draft', notes: 'Отпуск 4 дня',
        created_at: '2026-02-20T08:00:00Z', updated_at: '2026-02-20T08:00:00Z'
    }
];

const MOCK_STRUCTURES: EmployeeSalaryStructure[] = [
    {
        id: 1, employee_id: 101, employee_name: 'Каримов Бахтиёр Рустамович',
        department_id: 1, department_name: 'Управление производством',
        position_id: 10, position_name: 'Главный инженер',
        base_salary: 12000000, rank_allowance: 2400000, education_allowance: 1200000,
        seniority_allowance: 1800000, seniority_years: 15, effective_date: '2025-01-01', currency: 'UZS'
    },
    {
        id: 2, employee_id: 102, employee_name: 'Султанова Дилноза Камолидиновна',
        department_id: 2, department_name: 'Финансово-экономический отдел',
        position_id: 20, position_name: 'Ведущий экономист',
        base_salary: 8000000, rank_allowance: 1600000, education_allowance: 800000,
        seniority_allowance: 1200000, seniority_years: 10, effective_date: '2024-07-01', currency: 'UZS'
    },
    {
        id: 3, employee_id: 103, employee_name: 'Рахимов Отабек Шухратович',
        department_id: 3, department_name: 'Отдел кадров',
        position_id: 30, position_name: 'Начальник отдела кадров',
        base_salary: 10000000, rank_allowance: 2000000, education_allowance: 1000000,
        seniority_allowance: 2500000, seniority_years: 20, effective_date: '2023-03-01', currency: 'UZS'
    },
    {
        id: 4, employee_id: 104, employee_name: 'Абдуллаев Жасур Тохирович',
        department_id: 1, department_name: 'Управление производством',
        position_id: 11, position_name: 'Оператор производственной линии',
        base_salary: 5000000, rank_allowance: 750000, education_allowance: 500000,
        seniority_allowance: 500000, seniority_years: 4, effective_date: '2025-06-01', currency: 'UZS'
    },
    {
        id: 5, employee_id: 105, employee_name: 'Мирзаева Нодира Бахтиёровна',
        department_id: 4, department_name: 'Юридический отдел',
        position_id: 40, position_name: 'Юрисконсульт',
        base_salary: 7000000, rank_allowance: 1050000, education_allowance: 700000,
        seniority_allowance: 700000, seniority_years: 6, effective_date: '2024-01-01', currency: 'UZS'
    }
];

const MOCK_DEDUCTIONS: EmployeeDeduction[] = [
    { id: 1, employee_id: 103, deduction_type: 'loan', amount: 1500000, is_percentage: false, start_date: '2025-06-01', end_date: '2027-06-01', description: 'Потребительский кредит (Ипотека-банк)', is_active: true },
    { id: 2, employee_id: 104, deduction_type: 'advance', amount: 500000, is_percentage: false, start_date: '2026-02-01', end_date: '2026-02-28', description: 'Аванс за февраль', is_active: true },
    { id: 3, employee_id: 101, deduction_type: 'other', amount: 200000, is_percentage: false, start_date: '2026-01-01', description: 'Добровольное медицинское страхование', is_active: true }
];

const MOCK_BONUSES: EmployeeBonus[] = [
    { id: 1, employee_id: 101, bonus_type: 'quarterly', amount: 3000000, period_month: 2, period_year: 2026, description: 'Квартальная премия Q1 2026', approved: true },
    { id: 2, employee_id: 102, bonus_type: 'performance', amount: 2000000, period_month: 2, period_year: 2026, description: 'За выполнение KPI на 110%', approved: true },
    { id: 3, employee_id: 103, bonus_type: 'holiday', amount: 2500000, period_month: 2, period_year: 2026, description: 'Праздничная премия (8 марта)', approved: true },
    { id: 4, employee_id: 104, bonus_type: 'one_time', amount: 1000000, period_month: 2, period_year: 2026, description: 'За успешный запуск линии №3', approved: true },
    { id: 5, employee_id: 105, bonus_type: 'performance', amount: 1500000, period_month: 2, period_year: 2026, description: 'За подготовку договоров с подрядчиками', approved: false }
];

// ===================== SERVICE =====================

@Injectable({
    providedIn: 'root'
})
export class HrmSalaryService {
    private http = inject(HttpClient);

    getAll(params?: { month?: number; year?: number; status?: string }): Observable<Salary[]> {
        if (USE_MOCK) {
            let result = [...MOCK_SALARIES];
            if (params?.month) result = result.filter((s) => s.period_month === params.month);
            if (params?.year) result = result.filter((s) => s.period_year === params.year);
            if (params?.status) result = result.filter((s) => s.status === params.status);
            return of(result).pipe(delay(200));
        }
        let httpParams = new HttpParams();
        if (params?.month) httpParams = httpParams.set('month', params.month.toString());
        if (params?.year) httpParams = httpParams.set('year', params.year.toString());
        if (params?.status) httpParams = httpParams.set('status', params.status);
        return this.http.get<Salary[]>(API_URL, { params: httpParams });
    }

    getById(id: number): Observable<Salary> {
        if (USE_MOCK) return of(MOCK_SALARIES.find((s) => s.id === id) || MOCK_SALARIES[0]).pipe(delay(200));
        return this.http.get<Salary>(`${API_URL}/${id}`);
    }

    create(payload: SalaryPayload): Observable<Salary> {
        if (USE_MOCK) {
            const newSalary: Salary = {
                ...MOCK_SALARIES[0],
                id: Date.now(),
                employee_id: payload.employee_id,
                period_month: payload.period_month,
                period_year: payload.period_year,
                status: 'draft',
                created_at: new Date().toISOString()
            };
            return of(newSalary).pipe(delay(200));
        }
        return this.http.post<Salary>(API_URL, payload);
    }

    update(id: number, payload: Partial<SalaryPayload>): Observable<Salary> {
        if (USE_MOCK) {
            const salary = MOCK_SALARIES.find((s) => s.id === id) || MOCK_SALARIES[0];
            return of({ ...salary, ...payload, updated_at: new Date().toISOString() } as Salary).pipe(delay(200));
        }
        return this.http.patch<Salary>(`${API_URL}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(`${API_URL}/${id}`);
    }

    calculate(id: number): Observable<Salary> {
        if (USE_MOCK) {
            const salary = MOCK_SALARIES.find((s) => s.id === id) || MOCK_SALARIES[0];
            return of({ ...salary, status: 'calculated' as const, calculated_at: new Date().toISOString(), calculated_by: 'Система' }).pipe(delay(200));
        }
        return this.http.post<Salary>(`${API_URL}/${id}/calculate`, {});
    }

    approve(id: number): Observable<Salary> {
        if (USE_MOCK) {
            const salary = MOCK_SALARIES.find((s) => s.id === id) || MOCK_SALARIES[0];
            return of({ ...salary, status: 'approved' as const, approved_at: new Date().toISOString(), approved_by: 'Администратор' }).pipe(delay(200));
        }
        return this.http.post<Salary>(`${API_URL}/${id}/approve`, {});
    }

    markAsPaid(id: number): Observable<Salary> {
        if (USE_MOCK) {
            const salary = MOCK_SALARIES.find((s) => s.id === id) || MOCK_SALARIES[0];
            return of({ ...salary, status: 'paid' as const, paid_at: new Date().toISOString() }).pipe(delay(200));
        }
        return this.http.post<Salary>(`${API_URL}/${id}/pay`, {});
    }

    bulkCalculate(month: number, year: number): Observable<Salary[]> {
        if (USE_MOCK) {
            const calculated = MOCK_SALARIES.map((s) => ({ ...s, period_month: month, period_year: year, status: 'calculated' as const, calculated_at: new Date().toISOString(), calculated_by: 'Система' }));
            return of(calculated).pipe(delay(200));
        }
        return this.http.post<Salary[]>(`${API_URL}/bulk-calculate`, { month, year });
    }

    getStructure(employeeId: number): Observable<SalaryStructure> {
        if (USE_MOCK) return of(MOCK_STRUCTURES.find((s) => s.employee_id === employeeId) || MOCK_STRUCTURES[0]).pipe(delay(200));
        return this.http.get<SalaryStructure>(`${API_URL}/structure/${employeeId}`);
    }

    updateStructure(employeeId: number, structure: Partial<SalaryStructure>): Observable<SalaryStructure> {
        if (USE_MOCK) {
            const existing = MOCK_STRUCTURES.find((s) => s.employee_id === employeeId) || MOCK_STRUCTURES[0];
            return of({ ...existing, ...structure } as SalaryStructure).pipe(delay(200));
        }
        return this.http.put<SalaryStructure>(`${API_URL}/structure/${employeeId}`, structure);
    }

    getDeductions(salaryId: number): Observable<SalaryDeduction[]> {
        if (USE_MOCK) return of(MOCK_DEDUCTIONS.filter((d) => d.is_active)).pipe(delay(200));
        return this.http.get<SalaryDeduction[]>(`${API_URL}/${salaryId}/deductions`);
    }

    addDeduction(salaryId: number, deduction: Partial<SalaryDeduction>): Observable<SalaryDeduction> {
        if (USE_MOCK) {
            const newDeduction: SalaryDeduction = {
                id: Date.now(), employee_id: 0, deduction_type: 'other', amount: 0, is_percentage: false,
                start_date: new Date().toISOString(), is_active: true, ...deduction
            } as SalaryDeduction;
            return of(newDeduction).pipe(delay(200));
        }
        return this.http.post<SalaryDeduction>(`${API_URL}/${salaryId}/deductions`, deduction);
    }

    getBonuses(salaryId: number): Observable<SalaryBonus[]> {
        if (USE_MOCK) return of(MOCK_BONUSES).pipe(delay(200));
        return this.http.get<SalaryBonus[]>(`${API_URL}/${salaryId}/bonuses`);
    }

    addBonus(salaryId: number, bonus: Partial<SalaryBonus>): Observable<SalaryBonus> {
        if (USE_MOCK) {
            const newBonus: SalaryBonus = {
                id: Date.now(), employee_id: 0, bonus_type: 'one_time', amount: 0,
                period_month: 2, period_year: 2026, approved: false, ...bonus
            } as SalaryBonus;
            return of(newBonus).pipe(delay(200));
        }
        return this.http.post<SalaryBonus>(`${API_URL}/${salaryId}/bonuses`, bonus);
    }

    exportToExcel(month: number, year: number): Observable<Blob> {
        if (USE_MOCK) return of(new Blob(['mock-excel-data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })).pipe(delay(200));
        const params = new HttpParams().set('month', month.toString()).set('year', year.toString());
        return this.http.get(`${API_URL}/export`, { params, responseType: 'blob' });
    }

    // Global endpoints (all employees) — hrm_admin / hrm_manager
    getAllStructures(): Observable<EmployeeSalaryStructure[]> {
        if (USE_MOCK) return of(MOCK_STRUCTURES).pipe(delay(200));
        return this.http.get<EmployeeSalaryStructure[]>(`${API_URL}/structures`);
    }

    getAllBonuses(): Observable<EmployeeBonus[]> {
        if (USE_MOCK) return of(MOCK_BONUSES).pipe(delay(200));
        return this.http.get<EmployeeBonus[]>(`${API_URL}/bonuses`);
    }

    getAllDeductions(): Observable<EmployeeDeduction[]> {
        if (USE_MOCK) return of(MOCK_DEDUCTIONS).pipe(delay(200));
        return this.http.get<EmployeeDeduction[]>(`${API_URL}/deductions`);
    }
}
