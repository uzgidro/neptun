import { Injectable } from '@angular/core';
import { ApiService, API_V3 } from '@/core/services/api.service';
import { CalendarResponse } from '@/core/interfaces/calendar-events';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class CalendarEventsService extends ApiService {
    private readonly endpoint = `${API_V3}/calendar/events`;

    getCalendarEvents(year: number, month: number): Observable<CalendarResponse> {
        const params = new HttpParams().set('year', year.toString()).set('month', month.toString());

        return this.http.get<CalendarResponse>(this.endpoint, { params });
    }
}
