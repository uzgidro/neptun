import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { ReservoirSummaryResponse } from '@/core/interfaces/reservoir-summary';
import { HttpParams } from '@angular/common/http';

const RESERVOIR_SUMMARY = '/reservoir-summary';

@Injectable({
    providedIn: 'root'
})
export class ReservoirSummaryService extends ApiService {
    getReservoirSummary(date: Date): Observable<ReservoirSummaryResponse[]> {
        let params = new HttpParams();
        params = params.set('date', this.dateToYMD(date));
        return this.http.get<ReservoirSummaryResponse[]>(BASE_URL + RESERVOIR_SUMMARY, { params: params });
    }
}
