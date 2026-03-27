import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { ManualMeasurementsRequest, ManualMeasurementsResponse } from '@/core/interfaces/manual-comparison';

const MANUAL_COMPARISON = '/manual-comparison';
const MEASUREMENTS = '/measurements';

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
}
