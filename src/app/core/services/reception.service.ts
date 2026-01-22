import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Reception } from '@/core/interfaces/reception';

// Мок-данные приёмов
const MOCK_RECEPTIONS: Reception[] = [
    { id: 1, name: 'Встреча с поставщиком', date: new Date().toISOString(), visitor: 'Алимов Бахтиёр', description: 'Обсуждение поставок', status: 'default', created_at: new Date().toISOString(), created_by_id: 1 },
    { id: 2, name: 'Подписание договора', date: new Date().toISOString(), visitor: 'Каримова Нигора', description: 'Договор о сотрудничестве', status: 'true', created_at: new Date().toISOString(), created_by_id: 1 }
];

@Injectable({
    providedIn: 'root'
})
export class ReceptionService extends ApiService {
    getReceptions(status?: string): Observable<Reception[]> {
        let result = MOCK_RECEPTIONS;
        if (status) {
            result = MOCK_RECEPTIONS.filter(r => r.status === status);
        }
        return of(result).pipe(delay(200));
    }

    getReception(id: number): Observable<Reception> {
        const reception = MOCK_RECEPTIONS.find(r => r.id === id) || MOCK_RECEPTIONS[0];
        return of(reception).pipe(delay(200));
    }

    createReception(reception: Partial<Reception>): Observable<Reception> {
        const newReception: Reception = { id: Date.now(), ...reception } as Reception;
        return of(newReception).pipe(delay(300));
    }

    updateReception(id: number, reception: Partial<Reception>): Observable<Reception> {
        const updated: Reception = { id, ...reception } as Reception;
        return of(updated).pipe(delay(300));
    }

    deleteReception(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }
}
