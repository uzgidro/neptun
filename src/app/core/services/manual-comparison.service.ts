import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { ApiService } from './api.service';
import { ManualMeasurementsRequest, ManualMeasurementsResponse } from '@/core/interfaces/manual-comparison';
import { OrgComparison } from '@/core/interfaces/filtration-comparison';

const MANUAL_COMPARISON = '/manual-comparison';
const MEASUREMENTS = '/measurements';
const DATA = '/data';
const EXPORT = '/export';

@Injectable({ providedIn: 'root' })
export class ManualComparisonService extends ApiService {

    getMeasurements(organizationId: number, date: string): Observable<ManualMeasurementsResponse> {
        const params = new HttpParams().set('organization_id', organizationId).set('date', date);
        return this.http.get<ManualMeasurementsResponse>(`${this.BASE_URL}${MANUAL_COMPARISON}${MEASUREMENTS}`, { params });
    }

    saveMeasurements(payload: ManualMeasurementsRequest): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(`${this.BASE_URL}${MANUAL_COMPARISON}${MEASUREMENTS}`, payload);
    }

    deleteMeasurements(organizationId: number, date: string): Observable<{ status: string }> {
        const params = new HttpParams().set('organization_id', organizationId).set('date', date);
        return this.http.delete<{ status: string }>(`${this.BASE_URL}${MANUAL_COMPARISON}${MEASUREMENTS}`, { params });
    }

    getData(date: string): Observable<OrgComparison[]> {
        const params = new HttpParams().set('date', date);
        return this.http.get<OrgComparison[]>(`${this.BASE_URL}${MANUAL_COMPARISON}${DATA}`, { params });
    }

    downloadExport(date: string, format: 'excel' | 'pdf'): Observable<HttpResponse<Blob>> {
        const params = new HttpParams().set('date', date).set('format', format);
        return this.http.get(`${this.BASE_URL}${MANUAL_COMPARISON}${EXPORT}`, {
            params,
            responseType: 'blob',
            observe: 'response'
        });
    }
}
