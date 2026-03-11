import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { Position, PositionPayload } from '@/core/interfaces/position';
import { CrudService } from '@/core/interfaces/crud-service.interface';

const POSITIONS = '/positions';

@Injectable({
    providedIn: 'root'
})
export class PositionService extends ApiService implements CrudService<Position, PositionPayload> {
    private positions$: Observable<Position[]> | null = null;

    // Legacy methods (keep for backward compatibility)
    getPositions(): Observable<Position[]> {
        if (!this.positions$) {
            this.positions$ = this.http.get<Position[]>(this.BASE_URL + POSITIONS).pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
        }
        return this.positions$;
    }

    invalidatePositionsCache(): void {
        this.positions$ = null;
    }

    createPosition(payload: PositionPayload): Observable<Position> {
        return this.http.post<Position>(this.BASE_URL + POSITIONS, payload).pipe(
            tap(() => this.invalidatePositionsCache())
        );
    }

    updatePosition(id: number, payload: PositionPayload): Observable<Position> {
        return this.http.patch<Position>(this.BASE_URL + POSITIONS + '/' + id, payload).pipe(
            tap(() => this.invalidatePositionsCache())
        );
    }

    deletePosition(id: number): Observable<void> {
        return this.http.delete<void>(this.BASE_URL + POSITIONS + '/' + id).pipe(
            tap(() => this.invalidatePositionsCache())
        );
    }

    // CrudService interface implementation
    getAll(): Observable<Position[]> {
        return this.getPositions();
    }

    create(payload: PositionPayload): Observable<Position> {
        return this.createPosition(payload);
    }

    update(id: number, payload: PositionPayload): Observable<Position> {
        return this.updatePosition(id, payload);
    }

    delete(id: number): Observable<void> {
        return this.deletePosition(id);
    }
}
