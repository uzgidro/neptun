import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '@/core/services/api.service';
import {
    DutyViolationCreatePayload,
    DutyViolationDto,
    DutyViolationResponse,
    DutyViolationUpdatePayload
} from '@/core/interfaces/duty-violations';

const DUTY_VIOLATIONS = '/duty-violations';

@Injectable({ providedIn: 'root' })
export class DutyViolationService extends ApiService {
    getViolations(date?: Date): Observable<DutyViolationDto[]> {
        let params = new HttpParams();
        if (date) {
            params = params.set('date', this.dateToYMD(date));
        }
        return this.http.get<DutyViolationResponse[]>(this.BASE_URL + DUTY_VIOLATIONS, { params }).pipe(
            map(arr => (arr ?? []).map(r => ({
                ...r,
                start_time: new Date(r.start_time),
                end_time: new Date(r.end_time),
                created_at: new Date(r.created_at)
            })))
        );
    }

    addViolation(payload: DutyViolationCreatePayload): Observable<any> {
        return this.http.post(this.BASE_URL + DUTY_VIOLATIONS, payload);
    }

    editViolation(id: number, payload: DutyViolationUpdatePayload): Observable<any> {
        return this.http.patch(`${this.BASE_URL}${DUTY_VIOLATIONS}/${id}`, payload);
    }

    deleteViolation(id: number): Observable<any> {
        return this.http.delete(`${this.BASE_URL}${DUTY_VIOLATIONS}/${id}`);
    }
}
