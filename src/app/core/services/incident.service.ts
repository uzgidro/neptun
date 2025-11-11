import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { IncidentDto, IncidentPayload, IncidentResponse } from '@/core/interfaces/incidents';
import { map } from 'rxjs/operators';

const INCIDENTS = '/incidents';

@Injectable({
    providedIn: 'root'
})
export class IncidentService extends ApiService {
    getIncidents(date?: Date): Observable<IncidentDto[]> {
        const params = new HttpParams();
        if (date) {
            params.set('date', date.toISOString());
        }
        return this.http.get<IncidentResponse[]>(BASE_URL + INCIDENTS, { params: params }).pipe(
            map(responseArray => {
                if (!responseArray) {
                    return [];
                }

                return responseArray.map(rawIncident => {
                    return {
                        ...rawIncident,
                        incident_date: new Date(rawIncident.incident_date),
                        created_at: new Date(rawIncident.created_at)
                    };
                });
            })
        );
    }

    addIncident(payload: IncidentPayload): Observable<any> {
        return this.http.post(BASE_URL + INCIDENTS, payload);
    }
}
