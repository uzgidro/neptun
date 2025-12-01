import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { DateGroup } from '@/core/interfaces/past-events';

const PAST_EVENTS = '/past-events';

@Injectable({
    providedIn: 'root'
})
export class PastEventsService extends ApiService {
    getPastEvents(): Observable<DateGroup[]> {
        return this.http.get<DateGroup[]>(BASE_URL + PAST_EVENTS);
    }
}
