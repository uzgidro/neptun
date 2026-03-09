import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { Department, DepartmentPayload } from '@/core/interfaces/department';
import { CrudService } from '@/core/interfaces/crud-service.interface';

const DEPARTMENTS = '/department';
const USE_MOCK = !BASE_URL;

const MOCK_DEPARTMENTS: Department[] = [
    { id: 1, name: 'Молокозавод «Чирчик»', description: 'Чирчик-Бозсуйский молочный комбинат', organization_id: 1 },
    { id: 2, name: 'Молокозавод «Джизак»', description: 'Джизакское производство', organization_id: 1 },
    { id: 3, name: 'Молокозавод «Газалкент»', description: null, organization_id: 1 },
    { id: 4, name: 'Молокозавод «Фергана»', description: 'Сырдарьинское производство', organization_id: 1 },
    { id: 5, name: 'Центральный аппарат', description: 'Головной офис', organization_id: 1 },
    { id: 6, name: 'Сырдарьинский молокозавод', description: 'Сырдарьинское молочное производство', organization_id: 1 },
    { id: 7, name: 'Зарафшанский молокозавод', description: 'Зарафшанское молочное производство', organization_id: 1 },
    { id: 8, name: 'Управление персоналом', description: 'HR департамент', organization_id: 1 },
    { id: 9, name: 'Финансовый департамент', description: null, organization_id: 1 },
    { id: 10, name: 'ИТ департамент', description: 'Информационные технологии', organization_id: 1 }
];

@Injectable({
    providedIn: 'root'
})
export class DepartmentService extends ApiService implements CrudService<Department, DepartmentPayload> {
    getDepartments(): Observable<Department[]> {
        if (USE_MOCK) return of(MOCK_DEPARTMENTS).pipe(delay(200));
        return this.http.get<Department[]>(BASE_URL + DEPARTMENTS);
    }

    createDepartment(payload: DepartmentPayload): Observable<Department> {
        if (USE_MOCK) return of({ id: Date.now(), ...payload } as Department).pipe(delay(200));
        return this.http.post<Department>(BASE_URL + DEPARTMENTS, payload);
    }

    updateDepartment(id: number, payload: DepartmentPayload): Observable<Department> {
        if (USE_MOCK) return of({ id, ...payload } as Department).pipe(delay(200));
        return this.http.patch<Department>(BASE_URL + DEPARTMENTS + '/' + id, payload);
    }

    deleteDepartment(id: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(BASE_URL + DEPARTMENTS + '/' + id);
    }

    getAll(): Observable<Department[]> {
        return this.getDepartments();
    }

    create(payload: DepartmentPayload): Observable<Department> {
        return this.createDepartment(payload);
    }

    update(id: number, payload: DepartmentPayload): Observable<Department> {
        return this.updateDepartment(id, payload);
    }

    delete(id: number): Observable<void> {
        return this.deleteDepartment(id);
    }
}
