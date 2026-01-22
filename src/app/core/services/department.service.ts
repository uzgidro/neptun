import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Department, DepartmentPayload } from '@/core/interfaces/department';

// Мок-данные отделов
const MOCK_DEPARTMENTS: Department[] = [
    { id: 1, name: 'Руководство', organization_id: 1 },
    { id: 2, name: 'Производственный отдел', organization_id: 1 },
    { id: 3, name: 'Отдел контроля качества', organization_id: 1 },
    { id: 4, name: 'Отдел логистики', organization_id: 1 },
    { id: 5, name: 'Финансовый отдел', organization_id: 1 },
    { id: 6, name: 'IT-отдел', organization_id: 1 },
    { id: 7, name: 'Отдел кадров', organization_id: 1 },
    { id: 8, name: 'Юридический отдел', organization_id: 1 }
] as Department[];

@Injectable({
    providedIn: 'root'
})
export class DepartmentService extends ApiService {
    getDepartments(): Observable<Department[]> {
        return of(MOCK_DEPARTMENTS).pipe(delay(200));
    }

    createDepartment(payload: DepartmentPayload): Observable<Department> {
        const newDept: Department = { id: Date.now(), ...payload } as Department;
        return of(newDept).pipe(delay(300));
    }

    updateDepartment(id: number, payload: DepartmentPayload): Observable<Department> {
        const updated: Department = { id, ...payload } as Department;
        return of(updated).pipe(delay(300));
    }

    deleteDepartment(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }
}
