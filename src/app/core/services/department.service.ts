import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { Department, DepartmentPayload } from '@/core/interfaces/department';
import { CrudService } from '@/core/interfaces/crud-service.interface';

const DEPARTMENTS = '/department';

@Injectable({
    providedIn: 'root'
})
export class DepartmentService extends ApiService implements CrudService<Department, DepartmentPayload> {
    private departments$: Observable<Department[]> | null = null;

    // Legacy methods (keep for backward compatibility)
    getDepartments(): Observable<Department[]> {
        if (!this.departments$) {
            this.departments$ = this.http.get<Department[]>(this.BASE_URL + DEPARTMENTS).pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
        }
        return this.departments$;
    }

    invalidateDepartmentsCache(): void {
        this.departments$ = null;
    }

    createDepartment(payload: DepartmentPayload): Observable<Department> {
        return this.http.post<Department>(this.BASE_URL + DEPARTMENTS, payload).pipe(
            tap(() => this.invalidateDepartmentsCache())
        );
    }

    updateDepartment(id: number, payload: DepartmentPayload): Observable<Department> {
        return this.http.patch<Department>(this.BASE_URL + DEPARTMENTS + '/' + id, payload).pipe(
            tap(() => this.invalidateDepartmentsCache())
        );
    }

    deleteDepartment(id: number): Observable<void> {
        return this.http.delete<void>(this.BASE_URL + DEPARTMENTS + '/' + id).pipe(
            tap(() => this.invalidateDepartmentsCache())
        );
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
