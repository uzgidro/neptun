import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Cascade, IdleDischargeResponse } from '@/core/interfaces/discharge';
import { Observable } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';

const DISCHARGES = '/discharges';
const FLAT = '/flat';

@Injectable({
    providedIn: 'root'
})
export class DischargeService extends ApiService {
    addDischarge(formData: FormData): Observable<any> {
        return this.http.post(BASE_URL + DISCHARGES, formData);
    }

    getDischarges(): Observable<Cascade[]> {
        return this.http.get<Cascade[]>(BASE_URL + DISCHARGES);
    }

    getFlatDischarges(date?: Date): Observable<IdleDischargeResponse[]> {
        let params = new HttpParams();
        if (date) {
            params = params.set('start_date', this.dateToYMD(date));
            params = params.set('end_date', this.dateToYMD(date));
        }
        return this.http.get<IdleDischargeResponse[]>(BASE_URL + DISCHARGES + FLAT, { params: params });
    }

    editDischarge(id: number, formData: FormData): Observable<any> {
        return this.http.patch(BASE_URL + DISCHARGES + '/' + id.toString(), formData);
    }

    approveDischarge(id: number): Observable<any> {
        return this.http.patch(BASE_URL + DISCHARGES + '/' + id.toString(), { approved: true });
    }

    deleteDischarge(id: number): Observable<any> {
        return this.http.delete(BASE_URL + DISCHARGES + '/' + id.toString());
    }

    downloadDischarges(date: Date, format: 'excel' | 'pdf'): Observable<HttpResponse<Blob>> {
        return this.http.get(BASE_URL + DISCHARGES + '/export', {
            params: {
                date: this.dateToYMD(date),
                format: format
            },
            responseType: 'blob',
            observe: 'response'
        });
    }
}
