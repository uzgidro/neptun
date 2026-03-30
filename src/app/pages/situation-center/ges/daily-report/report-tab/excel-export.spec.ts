import { buildExcelData, ExcelRow } from './excel-export';
import { GesDailyReport, ReportGrandTotal, ReportStation } from '@/core/interfaces/ges-report';

function makeGrandTotal(): ReportGrandTotal {
    return {
        installed_capacity_mwt: 100, total_aggregates: 10, working_aggregates: 8,
        power_mwt: 50, daily_production_mln_kwh: 1.2, production_change_mln_kwh: 0.1,
        mtd_production_mln_kwh: 15, ytd_production_mln_kwh: 150,
        monthly_plan_mln_kwh: 50, quarterly_plan_mln_kwh: 150,
        fulfillment_pct: 1.0, difference_mln_kwh: 0,
        prev_year_ytd_mln_kwh: 140, yoy_growth_rate: 0.07,
        yoy_difference_mln_kwh: 10, idle_discharge_total_m3s: 5
    };
}

function makeStation(orgId: number, name: string): ReportStation {
    return {
        organization_id: orgId, name,
        config: { installed_capacity_mwt: 50, total_aggregates: 4, has_reservoir: true },
        current: {
            daily_production_mln_kwh: 3.389, power_mwt: 141.208, working_aggregates: 3,
            water_level_m: 846.05, water_volume_mln_m3: 634, water_head_m: 104,
            reservoir_income_m3s: 85.5, total_outflow_m3s: 95, ges_flow_m3s: 85,
            idle_discharge_m3s: 10, temperature: 1.2, weather_condition: 'Облачно'
        },
        diffs: {
            level_change_cm: 8, volume_change_mln_m3: -1.5, income_change_m3s: 5,
            ges_flow_change_m3s: -2, power_change_mwt: 12.5, production_change_mln_kwh: 0.3
        },
        aggregations: { mtd_production_mln_kwh: 42.5, ytd_production_mln_kwh: 280 },
        plan: { monthly_plan_mln_kwh: 120, quarterly_plan_mln_kwh: 330, fulfillment_pct: 0.8485, difference_mln_kwh: -50 },
        previous_year: {
            temperature: 3.5, water_level_m: 840.2, water_volume_mln_m3: 580,
            water_head_m: 100, reservoir_income_m3s: 70, ges_flow_m3s: 75,
            power_mwt: 130, daily_production_mln_kwh: 3.12,
            mtd_production_mln_kwh: 40, ytd_production_mln_kwh: 310
        },
        yoy: { growth_rate: -0.0968, difference_mln_kwh: -30 },
        idle_discharge: null
    };
}

describe('buildExcelData', () => {
    it('should produce correct number of rows', () => {
        const report: GesDailyReport = {
            date: '2026-03-13',
            cascades: [{
                cascade_id: 5, cascade_name: 'Каскад-1',
                summary: makeGrandTotal(),
                stations: [makeStation(10, 'ГЭС-1'), makeStation(20, 'ГЭС-2')]
            }],
            grand_total: makeGrandTotal()
        };
        const rows = buildExcelData(report);
        // 1 cascade header + 2 stations + 1 cascade summary + 1 grand total = 5
        expect(rows.length).toBe(5);
    });

    it('should mark station rows as station type', () => {
        const report: GesDailyReport = {
            date: '2026-03-13',
            cascades: [{
                cascade_id: 5, cascade_name: 'Каскад-1',
                summary: makeGrandTotal(),
                stations: [makeStation(10, 'ГЭС-1')]
            }],
            grand_total: makeGrandTotal()
        };
        const rows = buildExcelData(report);
        const stationRows = rows.filter(r => r.type === 'station');
        expect(stationRows.length).toBe(1);
        expect(stationRows[0].values[0]).toBe('ГЭС-1');
    });

    it('should include all 28 data columns for station rows', () => {
        const report: GesDailyReport = {
            date: '2026-03-13',
            cascades: [{
                cascade_id: 5, cascade_name: 'Каскад-1',
                summary: makeGrandTotal(),
                stations: [makeStation(10, 'ГЭС-1')]
            }],
            grand_total: makeGrandTotal()
        };
        const rows = buildExcelData(report);
        const station = rows.find(r => r.type === 'station')!;
        expect(station.values.length).toBe(28);
    });

    it('should handle multiple cascades', () => {
        const report: GesDailyReport = {
            date: '2026-03-13',
            cascades: [
                { cascade_id: 1, cascade_name: 'K1', summary: makeGrandTotal(), stations: [makeStation(10, 'A')] },
                { cascade_id: 2, cascade_name: 'K2', summary: makeGrandTotal(), stations: [makeStation(20, 'B')] }
            ],
            grand_total: makeGrandTotal()
        };
        const rows = buildExcelData(report);
        // 2 cascade headers + 2 stations + 2 cascade summaries + 1 grand total = 7
        expect(rows.length).toBe(7);
    });
});
