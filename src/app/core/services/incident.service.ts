import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { IncidentPayload, IncidentResponse } from '@/core/interfaces/incidents';

const INCIDENTS = '/incidents';

@Injectable({
    providedIn: 'root'
})
export class IncidentService extends ApiService {
    getIncidents(date?: Date): Observable<IncidentResponse[]> {
        const params = new HttpParams();
        if (date) {
            params.set('date', date.toISOString());
        }
        return this.http.get<IncidentResponse[]>(BASE_URL + INCIDENTS, { params: params });
    }

    addIncident(payload: IncidentPayload): Observable<any> {
        return this.http.post(BASE_URL + INCIDENTS, payload);
    }
}
