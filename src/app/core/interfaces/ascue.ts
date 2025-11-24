export interface AscueMetricsDto {
    active: number;
    reactive: number;
    power_import?: number;
    power_export?: number;
    own_needs?: number;
    flow?: number;
    active_agg_count: number;
    pending_agg_count: number;
    repair_agg_count: number;
}
