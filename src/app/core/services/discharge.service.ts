import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Cascade, DischargeCreatePayload, DischargeSummaryResponse, DischargeUpdatePayload, IdleDischargeResponse, SummaryGranularity } from '@/core/interfaces/discharge';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';

const DISCHARGES = '/discharges';
const FLAT = '/flat';
const SUMMARY = '/summary';

@Injectable({
    providedIn: 'root'
})
export class DischargeService extends ApiService {
    addDischarge(payload: DischargeCreatePayload, force = false): Observable<any> {
        return this.http.post(this.BASE_URL + DISCHARGES, { ...payload, force });
    }

    getDischarges(): Observable<Cascade[]> {
        return this.http.get<Cascade[]>(this.BASE_URL + DISCHARGES);
    }

    getFlatDischarges(date?: Date): Observable<IdleDischargeResponse[]> {
        let params = new HttpParams();
        if (date) {
            params = params.set('start_date', this.dateToYMD(date));
            params = params.set('end_date', this.dateToYMD(date));
        }
        return this.http.get<IdleDischargeResponse[]>(this.BASE_URL + DISCHARGES + FLAT, { params: params });
    }

    getSummary(from: Date, to: Date, granularity: SummaryGranularity = 'month'): Observable<DischargeSummaryResponse> {
        const params = new HttpParams()
            .set('from', this.dateToYMD(from))
            .set('to', this.dateToYMD(to))
            .set('granularity', granularity);
        return this.http.get<DischargeSummaryResponse>(this.BASE_URL + DISCHARGES + SUMMARY, { params });
    }

    editDischarge(id: number, payload: DischargeUpdatePayload): Observable<any> {
        return this.http.patch(this.BASE_URL + DISCHARGES + '/' + id.toString(), payload);
    }

    approveDischarge(id: number): Observable<any> {
        return this.http.patch(this.BASE_URL + DISCHARGES + '/' + id.toString(), { approved: true });
    }

    deleteDischarge(id: number): Observable<any> {
        return this.http.delete(this.BASE_URL + DISCHARGES + '/' + id.toString());
    }

    downloadDischarges(date: Date, format: 'excel' | 'pdf'): Observable<HttpResponse<Blob>> {
        return this.http.get(this.BASE_URL + DISCHARGES + '/export', {
            params: {
                date: this.dateToYMD(date),
                format: format
            },
            responseType: 'blob',
            observe: 'response'
        });
    }
}
