import { Contact } from '@/core/interfaces/contact';

export interface ReservoirMetricValues {
    income: number;
    release: number;
    level: number;
    volume: number;
}

export interface ReservoirMetrics {
    current: ReservoirMetricValues;
    diff?: ReservoirMetricValues;
}

export interface Reservoir {
    organization_id: number;
    organization_name: string;
    contacts: Contact[];
    current_discharge: number;
    reservoir_metrics: ReservoirMetrics;
}

export type ReservoirResponse = Reservoir[];
