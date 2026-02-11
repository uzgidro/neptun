import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DateGroup, PastEventsByTypeResponse } from '@/core/interfaces/past-events';

// Мок-данные прошедших событий
const MOCK_PAST_EVENTS: DateGroup[] = [
    {
        date: new Date().toISOString().split('T')[0],
        events: [
            { type: 'warning', date: new Date().toISOString(), description: 'Остановка линии №2 - плановое обслуживание', organization_id: 1, organization_name: 'Молокозавод №1', entity_type: 'shutdown', entity_id: 1 },
            { type: 'info', date: new Date().toISOString(), description: 'Визит партнёров - делегация из региона Юг', organization_id: 1, organization_name: 'АО "МолокоПром"', entity_type: 'visit', entity_id: 2 }
        ]
    }
];

const MOCK_EVENTS_BY_TYPE: PastEventsByTypeResponse = {
    date: new Date().toISOString().split('T')[0],
    type: 'shutdown',
    events: [
        { type: 'warning', date: new Date().toISOString(), description: 'Остановка линии №2', organization_id: 1, organization_name: 'Молокозавод №1' },
        { type: 'danger', date: new Date().toISOString(), description: 'Аварийная остановка линии №3', organization_id: 2, organization_name: 'Филиал "Восток"' }
    ]
};

@Injectable({
    providedIn: 'root'
})
export class PastEventsService extends ApiService {
    getPastEvents(date?: Date): Observable<DateGroup[]> {
        return of(MOCK_PAST_EVENTS).pipe(delay(200));
    }

    getPastEventsByType(date: Date, type: 'incident' | 'shutdown' | 'discharge' | 'visit'): Observable<PastEventsByTypeResponse> {
        return of(MOCK_EVENTS_BY_TYPE).pipe(delay(200));
    }
}
