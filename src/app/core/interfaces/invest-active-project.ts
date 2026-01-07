export interface InvestActiveProject {
    id: number;
    category: string;
    project_name: string;
    foreign_partner: string | null;
    implementation_period: string | null;
    capacity_mw: number | null;
    production_mln_kwh: number | null;
    cost_mln_usd: number | null;
    status_text: string | null;
    created_at: Date | string;
}
