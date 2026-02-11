import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { CalendarResponse } from '@/core/interfaces/calendar-events';
import { Observable, of, delay } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CalendarEventsService extends ApiService {
    getCalendarEvents(year: number, month: number): Observable<CalendarResponse> {
        return of({ year, month, days: [] }).pipe(delay(100));
    }
}
