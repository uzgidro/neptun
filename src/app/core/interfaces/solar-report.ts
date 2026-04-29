// Config
export interface SolarConfigPayload {
    organization_id: number;
    installed_capacity_kw: number;   // кВт, >= 0
    sort_order: number;              // >= 0
}
export interface SolarConfig {
    id: number;
    organization_id: number;
    organization_name: string;
    installed_capacity_kw: number;
    sort_order: number;
    updated_at: string;
}

// Daily data
export interface SolarDailyDataPayload {
    organization_id: number;
    date: string;                    // YYYY-MM-DD
    generation_kwh?: number | null;  // Optional: omit/null/value
    grid_export_kwh?: number | null;
}
export interface SolarDailyData {
    id: number;
    organization_id: number;
    organization_name: string;
    date: string;
    generation_kwh: number | null;
    grid_export_kwh: number | null;
    updated_at: string;
}

// Plans
export interface SolarPlanPayload {
    organization_id: number;
    year: number;                    // 2020..2100
    month: number;                   // 1..12
    plan_thousand_kwh: number;       // тысячи кВтч (НЕ млн!), >= 0
}
export interface SolarPlan {
    id: number;
    organization_id: number;
    organization_name: string;
    year: number;
    month: number;
    plan_thousand_kwh: number;
}
