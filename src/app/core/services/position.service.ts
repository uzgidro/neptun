import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Position, PositionPayload } from '@/core/interfaces/position';
import { CrudService } from '@/core/interfaces/crud-service.interface';

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
export class PositionService extends ApiService implements CrudService<Position, PositionPayload> {
    getAll(): Observable<Position[]> {
        return of(MOCK_POSITIONS).pipe(delay(200));
    }

    getById(id: number): Observable<Position> {
        return of(MOCK_POSITIONS.find(p => p.id === id) || MOCK_POSITIONS[0]).pipe(delay(200));
    }

    create(payload: PositionPayload): Observable<Position> {
        const newPos: Position = { id: Date.now(), ...payload } as Position;
        return of(newPos).pipe(delay(300));
    }

    update(id: number, payload: PositionPayload): Observable<Position> {
        const updated: Position = { id, ...payload } as Position;
        return of(updated).pipe(delay(300));
    }

    delete(id: number): Observable<void> {
        return of(undefined as void).pipe(delay(200));
    }

    // Legacy aliases
    getPositions = this.getAll.bind(this);
    createPosition = this.create.bind(this);
    updatePosition = this.update.bind(this);
    deletePosition = this.delete.bind(this);
}
