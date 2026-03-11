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

    getAll(): Observable<Department[]> {
        if (!this.departments$) {
            this.departments$ = this.http.get<Department[]>(this.BASE_URL + DEPARTMENTS).pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
        }
        return this.departments$;
    }

    create(payload: DepartmentPayload): Observable<Department> {
        return this.http.post<Department>(this.BASE_URL + DEPARTMENTS, payload).pipe(
            tap(() => this.invalidateCache())
        );
    }

    update(id: number, payload: DepartmentPayload): Observable<Department> {
        return this.http.patch<Department>(this.BASE_URL + DEPARTMENTS + '/' + id, payload).pipe(
            tap(() => this.invalidateCache())
        );
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(this.BASE_URL + DEPARTMENTS + '/' + id).pipe(
            tap(() => this.invalidateCache())
        );
    }

    private invalidateCache(): void {
        this.departments$ = null;
    }
}
