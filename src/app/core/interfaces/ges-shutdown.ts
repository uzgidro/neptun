export interface GesShutdownPayload {
    organization_id?: number;
    start_time?: string;
    end_time?: string;
    reason?: string;
    generation_loss?: string;
    idle_discharge_volume?: number;
}
