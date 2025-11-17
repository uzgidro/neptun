import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Cascade, IdleDischargeResponse, WaterDischargePayload } from '@/core/interfaces/discharge';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

const DISCHARGES = '/discharges';
const FLAT = '/flat';

@Injectable({
    providedIn: 'root'
})
export class DischargeService extends ApiService {
    addDischarge(payload: WaterDischargePayload): Observable<any> {
        return this.http.post(BASE_URL + DISCHARGES, payload);
    }

    getDischarges(): Observable<Cascade[]> {
        return this.http.get<Cascade[]>(BASE_URL + DISCHARGES);
    }

    getFlatDischarges(date?: Date): Observable<IdleDischargeResponse[]> {
        let params = new HttpParams();
        if (date) {
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);

            params = params.set('start_date', this.dateToYMD(date));
            params = params.set('end_date', this.dateToYMD(endDate));
            console.log(params);
        }
        return this.http.get<IdleDischargeResponse[]>(BASE_URL + DISCHARGES + FLAT, { params: params });
    }

    editDischarge(id: number, payload: WaterDischargePayload): Observable<any> {
        return this.http.patch(BASE_URL + DISCHARGES + '/' + id.toString(), payload);
    }

    approveDischarge(id: number): Observable<any> {
        return this.http.patch(BASE_URL + DISCHARGES + '/' + id.toString(), { approved: true });
    }

    deleteDischarge(id: number): Observable<any> {
        return this.http.delete(BASE_URL + DISCHARGES + '/' + id.toString());
    }
}
