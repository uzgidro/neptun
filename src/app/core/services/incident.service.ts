import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { IncidentCreatePayload, IncidentDto, IncidentPayload, IncidentResponse, IncidentUpdatePayload } from '@/core/interfaces/incidents';
import { map } from 'rxjs/operators';

const INCIDENTS = '/incidents';

@Injectable({
    providedIn: 'root'
})
export class IncidentService extends ApiService {
    getIncidents(date?: Date): Observable<IncidentDto[]> {
        let params = new HttpParams();
        if (date) {
            params = params.set('date', this.dateToYMD(date));
        }
        return this.http.get<IncidentResponse[]>(this.BASE_URL + INCIDENTS, { params: params }).pipe(
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

    addIncident(payload: IncidentCreatePayload): Observable<any> {
        return this.http.post(this.BASE_URL + INCIDENTS, payload);
    }

    editIncident(id: number, payload: IncidentUpdatePayload): Observable<any> {
        return this.http.patch(`${this.BASE_URL}${INCIDENTS}/${id}`, payload);
    }

    deleteIncident(id: number): Observable<any> {
        return this.http.delete(`${this.BASE_URL}${INCIDENTS}/${id}`);
    }
}
