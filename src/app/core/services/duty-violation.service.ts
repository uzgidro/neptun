import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '@/core/services/api.service';
import {
    DutyViolationCreatePayload,
    DutyViolationDto,
    DutyViolationGroupResponse,
    DutyViolationResponse,
    DutyViolationUpdatePayload
} from '@/core/interfaces/duty-violations';

const DUTY_VIOLATIONS = '/duty-violations';

@Injectable({ providedIn: 'root' })
export class DutyViolationService extends ApiService {
    /**
     * GET returns records grouped by organization (groups by name ASC, intra-group
     * start_time DESC). We flatten into a single ordered list — the order is preserved
     * so the table's subheader grouping renders one header per organization.
     */
    getViolations(date?: Date): Observable<DutyViolationDto[]> {
        let params = new HttpParams();
        if (date) {
            params = params.set('date', this.dateToYMD(date));
        }
        return this.http.get<DutyViolationGroupResponse[]>(this.BASE_URL + DUTY_VIOLATIONS, { params }).pipe(
            map(groups => (groups ?? []).flatMap(g =>
                (g.violations ?? []).map(r => this.toDto(r, g))
            ))
        );
    }

    private toDto(r: DutyViolationResponse, group: DutyViolationGroupResponse): DutyViolationDto {
        return {
            ...r,
            organization_id: r.organization_id ?? group.id,
            organization_name: r.organization_name ?? group.name,
            start_time: new Date(r.start_time),
            end_time: new Date(r.end_time),
            created_at: new Date(r.created_at)
        };
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
