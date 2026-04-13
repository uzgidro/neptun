// --- Config ---

export interface GesConfigPayload {
    organization_id: number;
    installed_capacity_mwt?: number;
    total_aggregates?: number;
    has_reservoir?: boolean;
    sort_order?: number;
}

export interface GesConfigResponse {
    id: number;
    organization_id: number;
    organization_name: string;
    cascade_id: number;
    cascade_name: string;
    installed_capacity_mwt: number;
    total_aggregates: number;
    has_reservoir: boolean;
    sort_order: number;
}

// --- Cascade Config ---

export interface GesCascadeConfigPayload {
    organization_id: number;
    latitude: number;
    longitude: number;
    sort_order?: number;
}

export interface GesCascadeConfig {
    id: number;
    organization_id: number;
    latitude: number;
    longitude: number;
    sort_order: number;
}

// --- Daily Data ---

export interface GesDailyDataPayload {
    organization_id: number;
    date: string;
    daily_production_mln_kwh?: number;
    working_aggregates?: number;
    water_level_m?: number | null;
    water_volume_mln_m3?: number | null;
    water_head_m?: number | null;
    reservoir_income_m3s?: number | null;
    total_outflow_m3s?: number | null;
    ges_flow_m3s?: number | null;
}

export interface GesDailyData extends GesDailyDataPayload {
    id: number;
}

// --- Production Plan ---

export interface GesProductionPlanPayload {
    organization_id: number;
    year: number;
    month: number;
    plan_mln_kwh?: number;
}

export interface GesProductionPlan extends GesProductionPlanPayload {
    id: number;
}

// --- Report ---

export interface GesDailyReport {
    date: string;
    cascades: ReportCascade[];
    grand_total: ReportGrandTotal;
}

export interface ReportWeather {
    temperature: number | null;
    weather_condition: string | null;
    prev_year_temperature: number | null;
    prev_year_condition: string | null;
}

export interface ReportCascade {
    cascade_id: number;
    cascade_name: string;
    weather: ReportWeather | null;
    summary: ReportGrandTotal;
    stations: ReportStation[];
}

export interface ReportStation {
    organization_id: number;
    name: string;
    config: {
        installed_capacity_mwt: number;
        total_aggregates: number;
        has_reservoir: boolean;
    };
    current: ReportCurrent;
    diffs: ReportDiffs;
    aggregations: ReportAggregations;
    plan: ReportPlan;
    previous_year: ReportPreviousYear;
    yoy: ReportYoY;
    idle_discharge: ReportIdleDischarge | null;
}

export interface ReportCurrent {
    daily_production_mln_kwh: number;
    power_mwt: number;
    working_aggregates: number;
    water_level_m: number | null;
    water_volume_mln_m3: number | null;
    water_head_m: number | null;
    reservoir_income_m3s: number | null;
    total_outflow_m3s: number | null;
    ges_flow_m3s: number | null;
    idle_discharge_m3s: number | null;
}

export interface ReportDiffs {
    level_change_cm: number | null;
    volume_change_mln_m3: number | null;
    income_change_m3s: number | null;
    ges_flow_change_m3s: number | null;
    power_change_mwt: number | null;
    production_change_mln_kwh: number | null;
}

export interface ReportAggregations {
    mtd_production_mln_kwh: number;
    ytd_production_mln_kwh: number;
}

export interface ReportPlan {
    monthly_plan_mln_kwh: number;
    quarterly_plan_mln_kwh: number;
    fulfillment_pct: number | null;
    difference_mln_kwh: number;
}

export interface ReportPreviousYear {
    water_level_m: number | null;
    water_volume_mln_m3: number | null;
    water_head_m: number | null;
    reservoir_income_m3s: number | null;
    ges_flow_m3s: number | null;
    power_mwt: number | null;
    daily_production_mln_kwh: number | null;
    mtd_production_mln_kwh: number | null;
    ytd_production_mln_kwh: number | null;
}

export interface ReportYoY {
    growth_rate: number | null;
    difference_mln_kwh: number | null;
}

export interface ReportIdleDischarge {
    flow_rate_m3s: number;
    volume_mln_m3: number;
    reason: string;
    is_ongoing: boolean;
}

export interface ReportGrandTotal {
    installed_capacity_mwt: number;
    total_aggregates: number;
    working_aggregates: number;
    power_mwt: number;
    daily_production_mln_kwh: number;
    production_change_mln_kwh: number;
    mtd_production_mln_kwh: number;
    ytd_production_mln_kwh: number;
    monthly_plan_mln_kwh: number;
    quarterly_plan_mln_kwh: number;
    fulfillment_pct: number;
    difference_mln_kwh: number;
    prev_year_ytd_mln_kwh: number;
    yoy_growth_rate: number;
    yoy_difference_mln_kwh: number;
    idle_discharge_total_m3s: number;
}
