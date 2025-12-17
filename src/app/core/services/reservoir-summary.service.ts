import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { ReservoirSummaryRequest, ReservoirSummaryResponse } from '@/core/interfaces/reservoir-summary';
import { HttpParams, HttpResponse } from '@angular/common/http';

const RESERVOIR_SUMMARY = '/reservoir-summary';
const EXPORT = '/export'

const EXCEL = 'excel'
const PDF = 'pdf';

@Injectable({
    providedIn: 'root'
})
export class ReservoirSummaryService extends ApiService {
    getReservoirSummary(date: Date): Observable<ReservoirSummaryResponse[]> {
        let params = new HttpParams();
        params = params.set('date', this.dateToYMD(date));
        return this.http.get<ReservoirSummaryResponse[]>(BASE_URL + RESERVOIR_SUMMARY, { params: params });
    }

    upsetReservoirData(data: ReservoirSummaryRequest[]): Observable<any> {
        return this.http.post(BASE_URL + RESERVOIR_SUMMARY, data);
    }

    downloadSummary(date: Date, format: string): Observable<HttpResponse<Blob>> {
        return this.http.get(BASE_URL + RESERVOIR_SUMMARY + EXPORT, {
            params: {
                date: this.dateToYMD(date),
                format: format
            },
            responseType: 'blob',
            observe: 'response'
        });
    }
}
