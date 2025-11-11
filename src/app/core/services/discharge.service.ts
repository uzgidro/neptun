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
export class DischargeService extends ApiService{

    addDischarge(payload: WaterDischargePayload): Observable<any> {
        return this.http.post(BASE_URL + DISCHARGES, payload);
    }

    getDischarges(): Observable<Cascade[]> {
        return this.http.get<Cascade[]>(BASE_URL + DISCHARGES);
    }

    getFlatDischarges(endDate?: Date): Observable<IdleDischargeResponse[]> {
        const params = new HttpParams();
        if (endDate) {
            params.set('date', endDate.toISOString());
        }
        return this.http.get<IdleDischargeResponse[]>(BASE_URL + DISCHARGES + FLAT, {params: params});
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
