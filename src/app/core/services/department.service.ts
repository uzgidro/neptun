import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Department, DepartmentPayload } from '@/core/interfaces/department';

const DEPARTMENTS = '/department';

@Injectable({
    providedIn: 'root'
})
export class DepartmentService extends ApiService {
    getDepartments(): Observable<Department[]> {
        return this.http.get<Department[]>(BASE_URL + DEPARTMENTS);
    }

    createDepartment(payload: DepartmentPayload): Observable<Department> {
        return this.http.post<Department>(BASE_URL + DEPARTMENTS, payload);
    }

    updateDepartment(id: number, payload: DepartmentPayload): Observable<Department> {
        return this.http.patch<Department>(BASE_URL + DEPARTMENTS + '/' + id, payload);
    }

    deleteDepartment(id: number): Observable<any> {
        return this.http.delete(BASE_URL + DEPARTMENTS + '/' + id);
    }
}
