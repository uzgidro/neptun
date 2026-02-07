import { Observable } from 'rxjs';

/**
 * Generic interface for CRUD services.
 * Ensures consistent API across all entity services.
 */
export interface CrudService<T, TPayload = Partial<T>> {
    getAll(): Observable<T[]>;
    getById?(id: number): Observable<T>;
    create(payload: TPayload): Observable<T>;
    update(id: number, payload: TPayload): Observable<T>;
    delete(id: number): Observable<void>;
}

/**
 * Interface for entities with an ID.
 */
export interface BaseEntity {
    id: number;
}
