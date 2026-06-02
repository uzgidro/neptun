import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ReservoirSummaryConfig, ReservoirSummaryConfigPayload } from '@/core/interfaces/reservoir-summary-config';

export interface ReservoirSummaryConfigSource {
    getConfigs(): Observable<ReservoirSummaryConfig[]>;
    upsertConfig(payload: ReservoirSummaryConfigPayload): Observable<{ status: string }>;
    deleteConfig(organizationId: number): Observable<void>;
}

export const RESERVOIR_SUMMARY_CONFIG_SOURCE =
    new InjectionToken<ReservoirSummaryConfigSource>('RESERVOIR_SUMMARY_CONFIG_SOURCE');
