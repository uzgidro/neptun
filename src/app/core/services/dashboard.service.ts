import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { ReservoirResponse } from '@/core/interfaces/reservoir';
import { Organization } from '@/core/interfaces/organizations';

const DASHBOARD = '/dashboard';
const RESERVOIR = '/reservoir';
const CASCADES = '/cascades';

@Injectable({
    providedIn: 'root'
})
export class DashboardService extends ApiService {
    getReservoirs(): Observable<ReservoirResponse> {
        return this.http.get<ReservoirResponse>(BASE_URL + DASHBOARD + RESERVOIR);
    }

    getOrganizationsCascades(): Observable<Organization[]> {
        return this.http.get<Organization[]>(BASE_URL + DASHBOARD + CASCADES);
    }
}
