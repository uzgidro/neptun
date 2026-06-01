import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '@/core/services/api.service';
import { ReservoirSummaryConfigSource } from '@/core/services/reservoir-summary-config.source';
import {
    ReservoirSummaryConfig,
    ReservoirSummaryConfigPayload
} from '@/core/interfaces/reservoir-summary-config';

const RESERVOIR_SUMMARY = '/reservoir-summary';
const CONFIG = '/config';

@Injectable({ providedIn: 'root' })
export class ReservoirSummaryConfigApiService extends ApiService implements ReservoirSummaryConfigSource {
    getConfigs(): Observable<ReservoirSummaryConfig[]> {
        return this.http.get<ReservoirSummaryConfig[]>(this.BASE_URL + RESERVOIR_SUMMARY + CONFIG);
    }

    upsertConfig(payload: ReservoirSummaryConfigPayload): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(this.BASE_URL + RESERVOIR_SUMMARY + CONFIG, payload);
    }

    deleteConfig(organizationId: number): Observable<void> {
        const params = new HttpParams().set('organization_id', organizationId);
        return this.http.delete<void>(this.BASE_URL + RESERVOIR_SUMMARY + CONFIG, { params });
    }
}
