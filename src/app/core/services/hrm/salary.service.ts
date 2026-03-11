import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@/core/services/config.service';
import { Salary, SalaryPayload, SalaryStructure, SalaryDeduction, SalaryBonus, EmployeeSalaryStructure, EmployeeBonus, EmployeeDeduction } from '@/core/interfaces/hrm/salary';

@Injectable({
    providedIn: 'root'
})
export class HrmSalaryService {
    private http = inject(HttpClient);
    private configService = inject(ConfigService);

    private get API_URL(): string {
        return this.configService.apiBaseUrl + '/hrm/salaries';
    }

    getAll(params?: { month?: number; year?: number; status?: string }): Observable<Salary[]> {
        let httpParams = new HttpParams();
        if (params?.month) httpParams = httpParams.set('month', params.month.toString());
        if (params?.year) httpParams = httpParams.set('year', params.year.toString());
        if (params?.status) httpParams = httpParams.set('status', params.status);
        return this.http.get<Salary[]>(this.API_URL, { params: httpParams });
    }

    getById(id: number): Observable<Salary> {
        return this.http.get<Salary>(`${this.API_URL}/${id}`);
    }

    create(payload: SalaryPayload): Observable<Salary> {
        return this.http.post<Salary>(this.API_URL, payload);
    }

    update(id: number, payload: Partial<SalaryPayload>): Observable<Salary> {
        return this.http.patch<Salary>(`${this.API_URL}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }

    calculate(id: number): Observable<Salary> {
        return this.http.post<Salary>(`${this.API_URL}/${id}/calculate`, {});
    }

    approve(id: number): Observable<Salary> {
        return this.http.post<Salary>(`${this.API_URL}/${id}/approve`, {});
    }

    markAsPaid(id: number): Observable<Salary> {
        return this.http.post<Salary>(`${this.API_URL}/${id}/pay`, {});
    }

    bulkCalculate(month: number, year: number): Observable<Salary[]> {
        return this.http.post<Salary[]>(`${this.API_URL}/bulk-calculate`, { month, year });
    }

    getStructure(employeeId: number): Observable<SalaryStructure> {
        return this.http.get<SalaryStructure>(`${this.API_URL}/structure/${employeeId}`);
    }

    updateStructure(employeeId: number, structure: Partial<SalaryStructure>): Observable<SalaryStructure> {
        return this.http.put<SalaryStructure>(`${this.API_URL}/structure/${employeeId}`, structure);
    }

    getDeductions(salaryId: number): Observable<SalaryDeduction[]> {
        return this.http.get<SalaryDeduction[]>(`${this.API_URL}/${salaryId}/deductions`);
    }

    addDeduction(salaryId: number, deduction: Partial<SalaryDeduction>): Observable<SalaryDeduction> {
        return this.http.post<SalaryDeduction>(`${this.API_URL}/${salaryId}/deductions`, deduction);
    }

    getBonuses(salaryId: number): Observable<SalaryBonus[]> {
        return this.http.get<SalaryBonus[]>(`${this.API_URL}/${salaryId}/bonuses`);
    }

    addBonus(salaryId: number, bonus: Partial<SalaryBonus>): Observable<SalaryBonus> {
        return this.http.post<SalaryBonus>(`${this.API_URL}/${salaryId}/bonuses`, bonus);
    }

    exportToExcel(month: number, year: number): Observable<Blob> {
        const params = new HttpParams().set('month', month.toString()).set('year', year.toString());
        return this.http.get(`${this.API_URL}/export`, { params, responseType: 'blob' });
    }

    // Global endpoints (all employees) — hrm_admin / hrm_manager
    getAllStructures(): Observable<EmployeeSalaryStructure[]> {
        return this.http.get<EmployeeSalaryStructure[]>(`${this.API_URL}/structures`);
    }

    getAllBonuses(): Observable<EmployeeBonus[]> {
        return this.http.get<EmployeeBonus[]>(`${this.API_URL}/bonuses`);
    }

    getAllDeductions(): Observable<EmployeeDeduction[]> {
        return this.http.get<EmployeeDeduction[]>(`${this.API_URL}/deductions`);
    }
}
