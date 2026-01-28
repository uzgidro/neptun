import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Position, PositionPayload } from '@/core/interfaces/position';
import { CrudService } from '@/core/interfaces/crud-service.interface';

const POSITIONS = '/positions';

@Injectable({
    providedIn: 'root'
})
export class PositionService extends ApiService implements CrudService<Position, PositionPayload> {
    // Legacy methods (keep for backward compatibility)
    getPositions(): Observable<Position[]> {
        return this.http.get<Position[]>(BASE_URL + POSITIONS);
    }

    createPosition(payload: PositionPayload): Observable<Position> {
        return this.http.post<Position>(BASE_URL + POSITIONS, payload);
    }

    updatePosition(id: number, payload: PositionPayload): Observable<Position> {
        return this.http.patch<Position>(BASE_URL + POSITIONS + '/' + id, payload);
    }

    deletePosition(id: number): Observable<void> {
        return this.http.delete<void>(BASE_URL + POSITIONS + '/' + id);
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
