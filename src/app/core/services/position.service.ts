import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Position, PositionPayload } from '@/core/interfaces/position';

// Мок-данные должностей
const MOCK_POSITIONS: Position[] = [
    { id: 1, name: 'Генеральный директор' },
    { id: 2, name: 'Заместитель генерального директора' },
    { id: 3, name: 'Начальник производства' },
    { id: 4, name: 'Технолог' },
    { id: 5, name: 'Оператор производственной линии' },
    { id: 6, name: 'Инженер по качеству' },
    { id: 7, name: 'Менеджер по логистике' },
    { id: 8, name: 'Бухгалтер' },
    { id: 9, name: 'Системный администратор' },
    { id: 10, name: 'Специалист по кадрам' }
] as Position[];

@Injectable({
    providedIn: 'root'
})
export class PositionService extends ApiService {
    getPositions(): Observable<Position[]> {
        return of(MOCK_POSITIONS).pipe(delay(200));
    }

    createPosition(payload: PositionPayload): Observable<Position> {
        const newPos: Position = { id: Date.now(), ...payload } as Position;
        return of(newPos).pipe(delay(300));
    }

    updatePosition(id: number, payload: PositionPayload): Observable<Position> {
        const updated: Position = { id, ...payload } as Position;
        return of(updated).pipe(delay(300));
    }

    deletePosition(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }
}
