import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { Position, PositionPayload } from '@/core/interfaces/position';
import { CrudService } from '@/core/interfaces/crud-service.interface';

const POSITIONS = '/positions';
const USE_MOCK = !BASE_URL;

const MOCK_POSITIONS: Position[] = [
    { id: 1, name: 'Генеральный директор', description: 'Руководитель компании' },
    { id: 2, name: 'Заместитель генерального директора' },
    { id: 3, name: 'Главный инженер', description: 'Руководитель инженерной службы' },
    { id: 4, name: 'Начальник отдела' },
    { id: 5, name: 'Начальник смены' },
    { id: 6, name: 'Инженер-технолог' },
    { id: 7, name: 'Инженер-технолог' },
    { id: 8, name: 'Оператор производства' },
    { id: 9, name: 'Техник' },
    { id: 10, name: 'Диспетчер' },
    { id: 11, name: 'HR-специалист' },
    { id: 12, name: 'Бухгалтер' },
    { id: 13, name: 'Юрист' },
    { id: 14, name: 'Программист' },
    { id: 15, name: 'Наладчик оборудования' }
];

@Injectable({
    providedIn: 'root'
})
export class PositionService extends ApiService implements CrudService<Position, PositionPayload> {
    getPositions(): Observable<Position[]> {
        if (USE_MOCK) return of(MOCK_POSITIONS).pipe(delay(200));
        return this.http.get<Position[]>(BASE_URL + POSITIONS);
    }

    createPosition(payload: PositionPayload): Observable<Position> {
        if (USE_MOCK) return of({ id: Date.now(), name: '', ...payload } as Position).pipe(delay(200));
        return this.http.post<Position>(BASE_URL + POSITIONS, payload);
    }

    updatePosition(id: number, payload: PositionPayload): Observable<Position> {
        if (USE_MOCK) return of({ id, name: '', ...payload } as Position).pipe(delay(200));
        return this.http.patch<Position>(BASE_URL + POSITIONS + '/' + id, payload);
    }

    deletePosition(id: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(BASE_URL + POSITIONS + '/' + id);
    }

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
