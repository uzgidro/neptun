import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { DateGroup } from '@/core/interfaces/past-events';
import { HttpParams } from '@angular/common/http';

const PAST_EVENTS = '/past-events';

@Injectable({
    providedIn: 'root'
})
export class PastEventsService extends ApiService {
    getPastEvents(date?: Date): Observable<DateGroup[]> {
        let params = new HttpParams();
        if (date) {
            params = params.set('date', this.dateToYMD(date));
        }
        return this.http.get<DateGroup[]>(BASE_URL + PAST_EVENTS, { params });
    }
}
