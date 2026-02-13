import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import { Salary, SalaryPayload, SalaryStructure, SalaryDeduction, SalaryBonus } from '@/core/interfaces/hrm/salary';

const API_URL = BASE_URL + '/hrm/salaries';

@Injectable({
    providedIn: 'root'
})
export class HrmSalaryService {
    private http = inject(HttpClient);

    getAll(params?: { month?: number; year?: number; status?: string }): Observable<Salary[]> {
        let httpParams = new HttpParams();
        if (params?.month) httpParams = httpParams.set('month', params.month.toString());
        if (params?.year) httpParams = httpParams.set('year', params.year.toString());
        if (params?.status) httpParams = httpParams.set('status', params.status);
        return this.http.get<Salary[]>(API_URL, { params: httpParams });
    }

    getById(id: number): Observable<Salary> {
        return this.http.get<Salary>(`${API_URL}/${id}`);
    }

    create(payload: SalaryPayload): Observable<Salary> {
        return this.http.post<Salary>(API_URL, payload);
    }

    update(id: number, payload: Partial<SalaryPayload>): Observable<Salary> {
        return this.http.patch<Salary>(`${API_URL}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/${id}`);
    }

    calculate(id: number): Observable<Salary> {
        return this.http.post<Salary>(`${API_URL}/${id}/calculate`, {});
    }

    approve(id: number): Observable<Salary> {
        return this.http.post<Salary>(`${API_URL}/${id}/approve`, {});
    }

    markAsPaid(id: number): Observable<Salary> {
        return this.http.post<Salary>(`${API_URL}/${id}/pay`, {});
    }

    bulkCalculate(month: number, year: number): Observable<Salary[]> {
        return this.http.post<Salary[]>(`${API_URL}/bulk-calculate`, { month, year });
    }

    getStructure(employeeId: number): Observable<SalaryStructure> {
        return this.http.get<SalaryStructure>(`${API_URL}/structure/${employeeId}`);
    }

    updateStructure(employeeId: number, structure: Partial<SalaryStructure>): Observable<SalaryStructure> {
        return this.http.put<SalaryStructure>(`${API_URL}/structure/${employeeId}`, structure);
    }

    getDeductions(salaryId: number): Observable<SalaryDeduction[]> {
        return this.http.get<SalaryDeduction[]>(`${API_URL}/${salaryId}/deductions`);
    }

    addDeduction(salaryId: number, deduction: Partial<SalaryDeduction>): Observable<SalaryDeduction> {
        return this.http.post<SalaryDeduction>(`${API_URL}/${salaryId}/deductions`, deduction);
    }

    getBonuses(salaryId: number): Observable<SalaryBonus[]> {
        return this.http.get<SalaryBonus[]>(`${API_URL}/${salaryId}/bonuses`);
    }

    addBonus(salaryId: number, bonus: Partial<SalaryBonus>): Observable<SalaryBonus> {
        return this.http.post<SalaryBonus>(`${API_URL}/${salaryId}/bonuses`, bonus);
    }

    exportToExcel(month: number, year: number): Observable<Blob> {
        const params = new HttpParams().set('month', month.toString()).set('year', year.toString());
        return this.http.get(`${API_URL}/export`, { params, responseType: 'blob' });
    }
}
