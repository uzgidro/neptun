import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { ReservoirResponse } from '@/core/interfaces/reservoir';
import { Organization } from '@/core/interfaces/organizations';
import { HttpParams } from '@angular/common/http';

const DASHBOARD = '/dashboard';
const RESERVOIR = '/reservoir';
const CASCADES = '/cascades';

@Injectable({
    providedIn: 'root'
})
export class DashboardService extends ApiService {
    getReservoirs(date?: Date): Observable<ReservoirResponse> {
        let params = new HttpParams();
        if (date) {
            params = params.set('date', this.dateToYMD(date));
        }
        return this.http.get<ReservoirResponse>(BASE_URL + DASHBOARD + RESERVOIR, { params: params });
    }

    getOrganizationsCascades(): Observable<Organization[]> {
        return this.http.get<Organization[]>(BASE_URL + DASHBOARD + CASCADES);
    }
}
