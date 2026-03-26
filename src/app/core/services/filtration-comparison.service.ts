import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { ApiService } from './api.service';
import { OrgComparison, OrgSimilarDates, UpsertRequest } from '@/core/interfaces/filtration-comparison';

const FILTRATION = '/filtration';
const FILTER = '/filter';
const COMPARISON = '/comparison';
const MEASUREMENTS = '/measurements';
const EXPORT = '/export';

@Injectable({ providedIn: 'root' })
export class FiltrationComparisonService extends ApiService {

    getSimilarDates(date: string, limit?: number): Observable<OrgSimilarDates[]> {
        let params = new HttpParams().set('date', date);
        if (limit) params = params.set('limit', limit);
        return this.http.get<OrgSimilarDates[]>(`${this.BASE_URL}${FILTRATION}${COMPARISON}/similar-dates`, { params });
    }

    getComparisonData(date: string, filterDate?: string, piezoDate?: string): Observable<OrgComparison[]> {
        let params = new HttpParams().set('date', date);
        if (filterDate) params = params.set('filter_date', filterDate);
        if (piezoDate) params = params.set('piezo_date', piezoDate);
        return this.http.get<OrgComparison[]>(`${this.BASE_URL}${FILTRATION}${COMPARISON}/data`, { params });
    }

    saveMeasurements(payload: UpsertRequest): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(`${this.BASE_URL}${FILTRATION}${MEASUREMENTS}`, payload);
    }

    downloadExport(date: string, format: 'excel' | 'pdf', filterDate?: string, piezoDate?: string): Observable<HttpResponse<Blob>> {
        let params = new HttpParams().set('date', date).set('format', format);
        if (filterDate) params = params.set('filter_date', filterDate);
        if (piezoDate) params = params.set('piezo_date', piezoDate);
        return this.http.get(`${this.BASE_URL}${FILTER}${EXPORT}`, {
            params,
            responseType: 'blob',
            observe: 'response'
        });
    }
}
