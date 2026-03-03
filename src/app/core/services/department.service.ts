import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Department, DepartmentPayload } from '@/core/interfaces/department';
import { CrudService } from '@/core/interfaces/crud-service.interface';

const DEPARTMENTS = '/department';

@Injectable({
    providedIn: 'root'
})
export class DepartmentService extends ApiService implements CrudService<Department, DepartmentPayload> {
    // Legacy methods (keep for backward compatibility)
    getDepartments(): Observable<Department[]> {
        return this.http.get<Department[]>(BASE_URL + DEPARTMENTS);
    }

    createDepartment(payload: DepartmentPayload): Observable<Department> {
        return this.http.post<Department>(BASE_URL + DEPARTMENTS, payload);
    }

    updateDepartment(id: number, payload: DepartmentPayload): Observable<Department> {
        return this.http.patch<Department>(BASE_URL + DEPARTMENTS + '/' + id, payload);
    }

    deleteDepartment(id: number): Observable<void> {
        return this.http.delete<void>(BASE_URL + DEPARTMENTS + '/' + id);
    }

    // CrudService interface implementation
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
