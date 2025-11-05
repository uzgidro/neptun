export interface WaterDischargePayload {
    organization_id: number;
    started_at: string;
    ended_at?: string;
    flow_rate: number;
    reason?: string;
}
