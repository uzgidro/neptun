import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Position, PositionPayload } from '@/core/interfaces/position';

const POSITIONS = '/positions';

@Injectable({
    providedIn: 'root'
})
export class PositionService extends ApiService {
    getPositions(): Observable<Position[]> {
        return this.http.get<Position[]>(BASE_URL + POSITIONS);
    }

    createPosition(payload: PositionPayload): Observable<Position> {
        return this.http.post<Position>(BASE_URL + POSITIONS, payload);
    }

    updatePosition(id: number, payload: PositionPayload): Observable<Position> {
        return this.http.patch<Position>(BASE_URL + POSITIONS + '/' + id, payload);
    }

    deletePosition(id: number): Observable<any> {
        return this.http.delete(BASE_URL + POSITIONS + '/' + id);
    }
}
