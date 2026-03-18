import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { ApiService } from './api.service';
import { OrgComparison, UpsertRequest } from '@/core/interfaces/filtration-comparison';

const FILTRATION = '/filtration';
const FILTER = '/filter';
const COMPARISON = '/comparison';
const MEASUREMENTS = '/measurements';
const EXPORT = '/export';

@Injectable({ providedIn: 'root' })
export class FiltrationComparisonService extends ApiService {

    getComparison(date: string): Observable<OrgComparison[]> {
        const params = new HttpParams().set('date', date);
        return this.http.get<OrgComparison[]>(`${this.BASE_URL}${FILTRATION}${COMPARISON}`, { params });
    }

    saveMeasurements(payload: UpsertRequest): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(`${this.BASE_URL}${FILTRATION}${MEASUREMENTS}`, payload);
    }

    downloadExport(date: string, format: 'excel' | 'pdf'): Observable<HttpResponse<Blob>> {
        return this.http.get(`${this.BASE_URL}${FILTER}${EXPORT}`, {
            params: { date, format },
            responseType: 'blob',
            observe: 'response'
        });
    }
}
