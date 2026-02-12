import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Department, DepartmentPayload } from '@/core/interfaces/department';
import { CrudService } from '@/core/interfaces/crud-service.interface';

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
export class DepartmentService extends ApiService implements CrudService<Department, DepartmentPayload> {
    getAll(): Observable<Department[]> {
        return of(MOCK_DEPARTMENTS).pipe(delay(200));
    }

    getById(id: number): Observable<Department> {
        return of(MOCK_DEPARTMENTS.find(d => d.id === id) || MOCK_DEPARTMENTS[0]).pipe(delay(200));
    }

    create(payload: DepartmentPayload): Observable<Department> {
        const newDept: Department = { id: Date.now(), ...payload } as Department;
        return of(newDept).pipe(delay(300));
    }

    update(id: number, payload: DepartmentPayload): Observable<Department> {
        const updated: Department = { id, ...payload } as Department;
        return of(updated).pipe(delay(300));
    }

    delete(id: number): Observable<void> {
        return of(undefined as void).pipe(delay(200));
    }

    // Legacy aliases
    getDepartments = this.getAll.bind(this);
    createDepartment = this.create.bind(this);
    updateDepartment = this.update.bind(this);
    deleteDepartment = this.delete.bind(this);
}
