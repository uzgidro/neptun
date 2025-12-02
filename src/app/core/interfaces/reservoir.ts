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

export interface Contact {
    id: number;
    name: string;
    phone?: string;
    position?: {
        description: string;
    };
}

export interface Reservoir {
    organization_id: number;
    organization_name: string;
    contacts: Contact[];
    reservoir_metrics: ReservoirMetrics;
}

export type ReservoirResponse = Reservoir[];
