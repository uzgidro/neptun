import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { ReservoirResponse } from '@/core/interfaces/reservoir';

const DASHBOARD = '/dashboard';
const RESERVOIR = '/reservoir';

@Injectable({
    providedIn: 'root'
})
export class DashboardService extends ApiService {
    getReservoirs(): Observable<ReservoirResponse> {
        return this.http.get<ReservoirResponse>(BASE_URL + DASHBOARD + RESERVOIR);
    }
}
