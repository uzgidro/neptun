import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { ApiService } from './api.service';
import {
    ReservoirFloodConfig,
    ReservoirFloodConfigPayload,
    ReservoirFloodHourlyPayload,
    ReservoirFloodHourlyRecord
} from '@/core/interfaces/reservoir-flood';

const RESERVOIR_FLOOD = '/reservoir-flood';
const CONFIG = '/config';
const HOURLY = '/hourly';
const EXPORT = '/export';

@Injectable({ providedIn: 'root' })
export class ReservoirFloodService extends ApiService {

    getConfigs(): Observable<ReservoirFloodConfig[]> {
        return this.http.get<ReservoirFloodConfig[]>(`${this.BASE_URL}${RESERVOIR_FLOOD}${CONFIG}`);
    }

    upsertConfig(payload: ReservoirFloodConfigPayload): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(`${this.BASE_URL}${RESERVOIR_FLOOD}${CONFIG}`, payload);
    }

    deleteConfig(organizationId: number): Observable<void> {
        const params = new HttpParams().set('organization_id', organizationId);
        return this.http.delete<void>(`${this.BASE_URL}${RESERVOIR_FLOOD}${CONFIG}`, { params });
    }

    getHourly(date: string, organizationId?: number): Observable<ReservoirFloodHourlyRecord[]> {
        let params = new HttpParams().set('date', date);
        if (organizationId !== undefined) {
            params = params.set('organization_id', organizationId);
        }
        return this.http.get<ReservoirFloodHourlyRecord[]>(`${this.BASE_URL}${RESERVOIR_FLOOD}${HOURLY}`, { params });
    }

    upsertHourly(payload: ReservoirFloodHourlyPayload[]): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(`${this.BASE_URL}${RESERVOIR_FLOOD}${HOURLY}`, payload);
    }

    exportSel(opts: {
        date: string;
        hour: number;
        format: 'excel' | 'pdf';
    }): Observable<HttpResponse<Blob>> {
        const params = new HttpParams()
            .set('date', opts.date)
            .set('hour', opts.hour)
            .set('format', opts.format);
        return this.http.get(`${this.BASE_URL}${RESERVOIR_FLOOD}${EXPORT}`, {
            params, responseType: 'blob', observe: 'response'
        });
    }
}
