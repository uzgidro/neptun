import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { EmployeeSalaryStructure, EmployeeBonus, EmployeeDeduction, BatchCalculationResult } from '@/core/interfaces/hrm/salary';

const SALARY = '/salary';

@Injectable({
    providedIn: 'root'
})
export class SalaryService extends ApiService {
    // Salary Structures
    getSalaryStructures(): Observable<EmployeeSalaryStructure[]> {
        return this.http.get<EmployeeSalaryStructure[]>(BASE_URL + SALARY + '/structures');
    }

    getSalaryStructure(employeeId: number): Observable<EmployeeSalaryStructure> {
        return this.http.get<EmployeeSalaryStructure>(BASE_URL + SALARY + '/structures/' + employeeId);
    }

    updateSalaryStructure(employeeId: number, data: Partial<EmployeeSalaryStructure>): Observable<EmployeeSalaryStructure> {
        return this.http.patch<EmployeeSalaryStructure>(BASE_URL + SALARY + '/structures/' + employeeId, data);
    }

    // Bonuses
    getBonuses(): Observable<EmployeeBonus[]> {
        return this.http.get<EmployeeBonus[]>(BASE_URL + SALARY + '/bonuses');
    }

    createBonus(data: Partial<EmployeeBonus>): Observable<EmployeeBonus> {
        return this.http.post<EmployeeBonus>(BASE_URL + SALARY + '/bonuses', data);
    }

    deleteBonus(id: number): Observable<any> {
        return this.http.delete(BASE_URL + SALARY + '/bonuses/' + id);
    }

    // Deductions
    getDeductions(): Observable<EmployeeDeduction[]> {
        return this.http.get<EmployeeDeduction[]>(BASE_URL + SALARY + '/deductions');
    }

    createDeduction(data: Partial<EmployeeDeduction>): Observable<EmployeeDeduction> {
        return this.http.post<EmployeeDeduction>(BASE_URL + SALARY + '/deductions', data);
    }

    deleteDeduction(id: number): Observable<any> {
        return this.http.delete(BASE_URL + SALARY + '/deductions/' + id);
    }

    // Calculations
    calculateSalary(month: number, year: number): Observable<BatchCalculationResult> {
        return this.http.post<BatchCalculationResult>(BASE_URL + SALARY + '/calculate', { month, year });
    }

    approveSalary(month: number, year: number): Observable<any> {
        return this.http.post(BASE_URL + SALARY + '/approve', { month, year });
    }

    // Export
    exportPayslips(month: number, year: number): Observable<Blob> {
        return this.http.get(BASE_URL + SALARY + '/export', {
            params: { month: month.toString(), year: year.toString() },
            responseType: 'blob'
        });
    }
}
