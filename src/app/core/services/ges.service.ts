import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { GesResponse, GesContact, GesShutdown, GesDischarge, GesIncident, GesVisit, TelemetryEnvelope, DateRangeParams, ASCUEMetrics } from '@/core/interfaces/ges';
import { Department } from '@/core/interfaces/department';

const GES = '/ges';

@Injectable({
    providedIn: 'root'
})
export class GesService extends ApiService {
    // GET /ges/{id}
    getGesInfo(id: number): Observable<GesResponse> {
        return this.http.get<GesResponse>(`${BASE_URL}${GES}/${id}`);
    }

    // GET /ges/{id}/departments
    getDepartments(id: number): Observable<Department[]> {
        return this.http.get<Department[]>(`${BASE_URL}${GES}/${id}/departments`);
    }

    // GET /ges/{id}/contacts
    getContacts(id: number): Observable<GesContact[]> {
        return this.http.get<GesContact[]>(`${BASE_URL}${GES}/${id}/contacts`);
    }

    // GET /ges/{id}/shutdowns?start_date&end_date
    getShutdowns(id: number, dateRange?: DateRangeParams): Observable<GesShutdown[]> {
        let params = new HttpParams();
        if (dateRange?.start_date) {
            params = params.set('start_date', dateRange.start_date);
        }
        if (dateRange?.end_date) {
            params = params.set('end_date', dateRange.end_date);
        }
        return this.http.get<GesShutdown[]>(`${BASE_URL}${GES}/${id}/shutdowns`, { params });
    }

    // GET /ges/{id}/discharges?start_date&end_date
    getDischarges(id: number, dateRange?: DateRangeParams): Observable<GesDischarge[]> {
        let params = new HttpParams();
        if (dateRange?.start_date) {
            params = params.set('start_date', dateRange.start_date);
        }
        if (dateRange?.end_date) {
            params = params.set('end_date', dateRange.end_date);
        }
        return this.http.get<GesDischarge[]>(`${BASE_URL}${GES}/${id}/discharges`, { params });
    }

    // GET /ges/{id}/incidents?start_date&end_date
    getIncidents(id: number, dateRange?: DateRangeParams): Observable<GesIncident[]> {
        let params = new HttpParams();
        if (dateRange?.start_date) {
            params = params.set('start_date', dateRange.start_date);
        }
        if (dateRange?.end_date) {
            params = params.set('end_date', dateRange.end_date);
        }
        return this.http.get<GesIncident[]>(`${BASE_URL}${GES}/${id}/incidents`, { params });
    }

    // GET /ges/{id}/visits?start_date&end_date
    getVisits(id: number, dateRange?: DateRangeParams): Observable<GesVisit[]> {
        let params = new HttpParams();
        if (dateRange?.start_date) {
            params = params.set('start_date', dateRange.start_date);
        }
        if (dateRange?.end_date) {
            params = params.set('end_date', dateRange.end_date);
        }
        return this.http.get<GesVisit[]>(`${BASE_URL}${GES}/${id}/visits`, { params });
    }

    // GET /ges/{id}/telemetry
    getTelemetry(id: number): Observable<TelemetryEnvelope[]> {
        return this.http.get<TelemetryEnvelope[]>(`${BASE_URL}${GES}/${id}/telemetry`);
    }

    // GET /ges/{id}/telemetry/{device_id}
    getDeviceTelemetry(id: number, deviceId: string): Observable<TelemetryEnvelope> {
        return this.http.get<TelemetryEnvelope>(`${BASE_URL}${GES}/${id}/telemetry/${deviceId}`);
    }

    // GET /ges/{id}/askue
    getAskue(id: number): Observable<ASCUEMetrics> {
        return this.http.get<ASCUEMetrics>(`${BASE_URL}${GES}/${id}/askue`);
    }

    // CRUD операции для остановов
    addShutdown(gesId: number, formData: FormData): Observable<any> {
        return this.http.post(`${BASE_URL}${GES}/${gesId}/shutdowns`, formData);
    }

    editShutdown(gesId: number, shutdownId: number, formData: FormData): Observable<any> {
        return this.http.patch(`${BASE_URL}${GES}/${gesId}/shutdowns/${shutdownId}`, formData);
    }

    deleteShutdown(gesId: number, shutdownId: number): Observable<any> {
        return this.http.delete(`${BASE_URL}${GES}/${gesId}/shutdowns/${shutdownId}`);
    }

    // CRUD операции для сбросов
    addDischarge(gesId: number, formData: FormData): Observable<any> {
        return this.http.post(`${BASE_URL}${GES}/${gesId}/discharges`, formData);
    }

    editDischarge(gesId: number, dischargeId: number, formData: FormData): Observable<any> {
        return this.http.patch(`${BASE_URL}${GES}/${gesId}/discharges/${dischargeId}`, formData);
    }

    deleteDischarge(gesId: number, dischargeId: number): Observable<any> {
        return this.http.delete(`${BASE_URL}${GES}/${gesId}/discharges/${dischargeId}`);
    }

    // CRUD операции для инцидентов
    addIncident(gesId: number, formData: FormData): Observable<any> {
        return this.http.post(`${BASE_URL}${GES}/${gesId}/incidents`, formData);
    }

    editIncident(gesId: number, incidentId: number, formData: FormData): Observable<any> {
        return this.http.patch(`${BASE_URL}${GES}/${gesId}/incidents/${incidentId}`, formData);
    }

    deleteIncident(gesId: number, incidentId: number): Observable<any> {
        return this.http.delete(`${BASE_URL}${GES}/${gesId}/incidents/${incidentId}`);
    }

    // CRUD операции для посещений
    addVisit(gesId: number, formData: FormData): Observable<any> {
        return this.http.post(`${BASE_URL}${GES}/${gesId}/visits`, formData);
    }

    editVisit(gesId: number, visitId: number, formData: FormData): Observable<any> {
        return this.http.patch(`${BASE_URL}${GES}/${gesId}/visits/${visitId}`, formData);
    }

    deleteVisit(gesId: number, visitId: number): Observable<any> {
        return this.http.delete(`${BASE_URL}${GES}/${gesId}/visits/${visitId}`);
    }
}
