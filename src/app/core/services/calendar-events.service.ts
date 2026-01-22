import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { CalendarResponse } from '@/core/interfaces/calendar-events';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// Мок-данные событий календаря
const MOCK_CALENDAR: CalendarResponse = {
    events: [
        { id: 1, title: 'Плановое ТО линии №1', date: new Date().toISOString(), type: 'maintenance' },
        { id: 2, title: 'Совещание руководства', date: new Date().toISOString(), type: 'meeting' },
        { id: 3, title: 'Приёмка сырья', date: new Date().toISOString(), type: 'delivery' }
    ]
} as CalendarResponse;

@Injectable({
    providedIn: 'root'
})
export class CalendarEventsService extends ApiService {
    getCalendarEvents(year: number, month: number): Observable<CalendarResponse> {
        return of(MOCK_CALENDAR).pipe(delay(200));
    }
}
