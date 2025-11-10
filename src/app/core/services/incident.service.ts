import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { IncidentPayload } from '@/core/interfaces/incidents';

const INCIDENTS = '/incidents';

@Injectable({
    providedIn: 'root'
})
export class IncidentService extends ApiService {
    // TODO(): Specify type for response
    getIncidents(date?: Date): Observable<any> {
        const params = new HttpParams();
        if (date) {
            params.set('date', date.toISOString());
        }
        return this.http.get(BASE_URL + INCIDENTS, { params: params });
    }

    addIncident(payload: IncidentPayload): Observable<any> {
        return this.http.post(BASE_URL + INCIDENTS, payload);
    }
}
