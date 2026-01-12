import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { CalendarResponse } from '@/core/interfaces/calendar-events';
import { Observable } from 'rxjs';

const CALENDAR_EVENTS = '/calendar/events';

@Injectable({
    providedIn: 'root'
})
export class CalendarEventsService extends ApiService {
    getCalendarEvents(year: number, month: number): Observable<CalendarResponse> {
        return this.http.get<CalendarResponse>(BASE_URL + CALENDAR_EVENTS, {
            params: {
                year: year.toString(),
                month: month.toString()
            }
        });
    }
}
