import * as XLSX from 'xlsx-js-style';
import { GesDailyReport, ReportStation, ReportGrandTotal } from '@/core/interfaces/ges-report';

export interface ExcelRow {
    type: 'cascade-header' | 'station' | 'cascade-summary' | 'grand-total';
    values: (string | number | null)[];
}

const HEADERS = [
    'ГЭС номи', 'Ўрн. қуввати, МВт', 'Ойлик режа', 'Режа Янв-Март',
    'Сув сатҳи, м', '+/- см', 'Сув ҳажми, млн.м³', '+/- млн.м³',
    'Сув босими, м', 'Келаётган сув, м³/с', '+/- м³/с', 'Чиқаётган сув, м³/с',
    'ГЭС орқали, м³/с', '+/- м³/с', 'Салт ташлама, м³/с',
    'Агрегатлар сони', 'Ишлаётган', 'Қуввати, МВт', '+/- МВт',
    '1 кунда, млн.кВт.ч', '+/- млн.кВт.ч', 'Ой бошидан', 'Йил бошидан',
    'Режага нисбатан, %', 'Фарқи +/-', 'Ўсиш суръати, %', 'Фарқи +/-'
];

function stationToRow(s: ReportStation): (string | number | null)[] {
    return [
        s.name,
        s.config.installed_capacity_mwt,
        s.plan.monthly_plan_mln_kwh,
        s.plan.quarterly_plan_mln_kwh,
        s.current.water_level_m,
        s.diffs.level_change_cm,
        s.current.water_volume_mln_m3,
        s.diffs.volume_change_mln_m3,
        s.current.water_head_m,
        s.current.reservoir_income_m3s,
        s.diffs.income_change_m3s,
        s.current.total_outflow_m3s,
        s.current.ges_flow_m3s,
        s.diffs.ges_flow_change_m3s,
        s.current.idle_discharge_m3s,
        s.config.total_aggregates,
        s.current.working_aggregates,
        s.current.power_mwt,
        s.diffs.power_change_mwt,
        s.current.daily_production_mln_kwh,
        s.diffs.production_change_mln_kwh,
        s.aggregations.mtd_production_mln_kwh,
        s.aggregations.ytd_production_mln_kwh,
        s.plan.fulfillment_pct != null ? s.plan.fulfillment_pct * 100 : null,
        s.plan.difference_mln_kwh,
        s.yoy.growth_rate != null ? s.yoy.growth_rate * 100 : null,
        s.yoy.difference_mln_kwh
    ];
}

function summaryToRow(label: string, t: ReportGrandTotal): (string | number | null)[] {
    return [
        label,
        t.installed_capacity_mwt,
        t.monthly_plan_mln_kwh,
        t.quarterly_plan_mln_kwh,
        null, null, null, null, null, null, null, null, null, null, null,
        t.total_aggregates,
        t.working_aggregates,
        t.power_mwt,
        null,
        t.daily_production_mln_kwh,
        t.production_change_mln_kwh,
        t.mtd_production_mln_kwh,
        t.ytd_production_mln_kwh,
        t.fulfillment_pct * 100,
        t.difference_mln_kwh,
        t.yoy_growth_rate * 100,
        t.yoy_difference_mln_kwh
    ];
}

export function buildExcelData(report: GesDailyReport): ExcelRow[] {
    const rows: ExcelRow[] = [];
    for (const cascade of report.cascades) {
        rows.push({ type: 'cascade-header', values: [cascade.cascade_name, ...new Array(26).fill(null)] });
        for (const station of cascade.stations) {
            rows.push({ type: 'station', values: stationToRow(station) });
        }
        rows.push({ type: 'cascade-summary', values: summaryToRow(cascade.cascade_name + ' - Итого', cascade.summary) });
    }
    rows.push({ type: 'grand-total', values: summaryToRow('ЖАМИ', report.grand_total) });
    return rows;
}

export function exportReportToExcel(report: GesDailyReport): void {
    const excelRows = buildExcelData(report);
    const wsData: (string | number | null)[][] = [HEADERS];
    for (const row of excelRows) {
        wsData.push(row.values);
    }
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = HEADERS.map((h, i) => ({ wch: i === 0 ? 25 : 14 }));
    for (let c = 0; c < HEADERS.length; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c })];
        if (cell) {
            cell.s = { font: { bold: true }, alignment: { horizontal: 'center', wrapText: true } };
        }
    }
    let dataRowIdx = 1;
    for (const row of excelRows) {
        if (row.type === 'cascade-summary' || row.type === 'grand-total' || row.type === 'cascade-header') {
            for (let c = 0; c < HEADERS.length; c++) {
                const cell = ws[XLSX.utils.encode_cell({ r: dataRowIdx, c })];
                if (cell) {
                    cell.s = {
                        font: { bold: true },
                        ...(row.type === 'grand-total' ? { fill: { fgColor: { rgb: 'D6EAF8' } } } : {})
                    };
                }
            }
        }
        dataRowIdx++;
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Отчёт');
    XLSX.writeFile(wb, `ges-report-${report.date}.xlsx`);
}
