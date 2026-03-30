import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ReportTabComponent } from './report-tab.component';
import { GesReportService } from '@/core/services/ges-report.service';
import { GesDailyReport, ReportStation, ReportGrandTotal } from '@/core/interfaces/ges-report';

function makeGrandTotal(): ReportGrandTotal {
    return {
        installed_capacity_mwt: 100, total_aggregates: 10, working_aggregates: 8,
        power_mwt: 50, daily_production_mln_kwh: 1.2, production_change_mln_kwh: 0.1,
        mtd_production_mln_kwh: 15, ytd_production_mln_kwh: 150,
        monthly_plan_mln_kwh: 50, quarterly_plan_mln_kwh: 150,
        fulfillment_pct: 1.0, difference_mln_kwh: 0,
        prev_year_ytd_mln_kwh: 140, yoy_growth_rate: 0.07,
        yoy_difference_mln_kwh: 10, idle_discharge_total_m3s: 0
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

function makeReport(): GesDailyReport {
    return {
        date: '2026-03-13',
        cascades: [{
            cascade_id: 5, cascade_name: 'Ўрта Чирчиқ каскади',
            summary: makeGrandTotal(),
            stations: [makeStation(10, 'ГЭС-1'), makeStation(20, 'ГЭС-2')]
        }],
        grand_total: makeGrandTotal()
    };
}

describe('ReportTabComponent', () => {
    let component: ReportTabComponent;
    let fixture: ComponentFixture<ReportTabComponent>;
    let gesReportService: jasmine.SpyObj<GesReportService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('GesReportService', ['getReport']);
        spy.getReport.and.returnValue(of(makeReport()));

        await TestBed.configureTestingModule({
            imports: [ReportTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: GesReportService, useValue: spy },
                MessageService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ReportTabComponent);
        component = fixture.componentInstance;
        gesReportService = TestBed.inject(GesReportService) as jasmine.SpyObj<GesReportService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load report on init', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        expect(gesReportService.getReport).toHaveBeenCalled();
        expect(component.report).toBeTruthy();
        expect(component.report!.cascades.length).toBe(1);
        expect(component.report!.cascades[0].stations.length).toBe(2);
    }));

    it('should reload on date change', fakeAsync(() => {
        fixture.detectChanges();
        tick();
        gesReportService.getReport.calls.reset();
        component.onDateChange(new Date(2026, 2, 14));
        tick();
        expect(gesReportService.getReport).toHaveBeenCalledWith('2026-03-14');
    }));

    it('should format percentage correctly', () => {
        fixture.detectChanges();
        expect(component.formatPct(0.8485)).toBe('84.85');
        expect(component.formatPct(null)).toBe('—');
    });

    it('should detect negative values', () => {
        expect(component.isNegative(-5)).toBeTrue();
        expect(component.isNegative(5)).toBeFalse();
        expect(component.isNegative(null)).toBeFalse();
    });
});
