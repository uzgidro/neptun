import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DataEntryTabComponent } from './data-entry-tab.component';
import { GesReportService } from '@/core/services/ges-report.service';
import { GesConfigResponse, GesDailyReport, ReportGrandTotal, ReportWeather } from '@/core/interfaces/ges-report';

function makeConfig(orgId: number, name: string, hasReservoir = true): GesConfigResponse {
    return {
        id: orgId, organization_id: orgId, organization_name: name,
        cascade_id: 1, cascade_name: 'Каскад',
        installed_capacity_mwt: 50, total_aggregates: 4,
        has_reservoir: hasReservoir, sort_order: orgId
    };
}

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

function makeReportWithWeather(weather: ReportWeather | null): GesDailyReport {
    return {
        date: '2026-03-30',
        cascades: [{
            cascade_id: 1, cascade_name: 'Каскад',
            weather,
            summary: makeGrandTotal(),
            stations: []
        }],
        grand_total: makeGrandTotal()
    };
}

describe('DataEntryTabComponent', () => {
    let component: DataEntryTabComponent;
    let fixture: ComponentFixture<DataEntryTabComponent>;
    let gesReportService: jasmine.SpyObj<GesReportService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('GesReportService', [
            'getConfigs', 'getDailyData', 'upsertDailyData', 'getCascadeConfigs', 'getReport'
        ]);
        spy.getConfigs.and.returnValue(of([]));
        spy.getCascadeConfigs.and.returnValue(of([]));
        spy.getReport.and.returnValue(of(null));

        await TestBed.configureTestingModule({
            imports: [DataEntryTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: GesReportService, useValue: spy },
                MessageService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DataEntryTabComponent);
        component = fixture.componentInstance;
        gesReportService = TestBed.inject(GesReportService) as jasmine.SpyObj<GesReportService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load configs and daily data on init', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1'), makeConfig(20, 'ГЭС-2')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        fixture.detectChanges();
        tick();
        expect(gesReportService.getConfigs).toHaveBeenCalled();
        expect(component.rows.length).toBe(2);
    }));

    it('should populate row with existing daily data', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(of({
            id: 1, organization_id: 10, date: '2026-03-30',
            daily_production_mln_kwh: 3.5, working_aggregates: 3, water_level_m: 846.05
        }));
        fixture.detectChanges();
        tick();
        expect(component.rows[0].form.get('daily_production_mln_kwh')?.value).toBe(3.5);
        expect(component.rows[0].saved).toBeTrue();
    }));

    it('should track dirty state per row', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        fixture.detectChanges();
        tick();
        expect(component.rows[0].dirty).toBeFalse();
        component.rows[0].form.get('daily_production_mln_kwh')?.setValue(5.0);
        component.rows[0].form.get('daily_production_mln_kwh')?.markAsDirty();
        expect(component.rows[0].dirty).toBeTrue();
    }));

    it('should save all dirty rows', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1'), makeConfig(20, 'ГЭС-2')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        gesReportService.upsertDailyData.and.returnValue(of({ status: 'OK' }));
        fixture.detectChanges();
        tick();
        component.rows[0].form.get('daily_production_mln_kwh')?.setValue(5.0);
        component.rows[0].form.get('daily_production_mln_kwh')?.markAsDirty();
        component.saveAll();
        tick();
        expect(gesReportService.upsertDailyData).toHaveBeenCalledTimes(1);
    }));

    it('should implement canDeactivate', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        fixture.detectChanges();
        tick();
        expect(component.canDeactivate()).toBeTrue();
        component.rows[0].form.get('daily_production_mln_kwh')?.setValue(5.0);
        component.rows[0].form.get('daily_production_mln_kwh')?.markAsDirty();
        spyOn(window, 'confirm').and.returnValue(true);
        expect(component.canDeactivate()).toBeTrue();
    }));

    it('should not have temperature or weather_condition in form', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        fixture.detectChanges();
        tick();
        expect(component.rows[0].form.get('temperature')).toBeNull();
        expect(component.rows[0].form.get('weather_condition')).toBeNull();
    }));

    it('should populate cascade group with weather from report API', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        const weather: ReportWeather = {
            temperature: 22.5, weather_condition: '01d',
            prev_year_temperature: 18, prev_year_condition: '02d'
        };
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        gesReportService.getReport.and.returnValue(of(makeReportWithWeather(weather)));
        fixture.detectChanges();
        tick();
        expect(component.cascadeGroups[0].weather).toBeTruthy();
        expect(component.cascadeGroups[0].weather?.temperature).toBe(22.5);
        expect(component.cascadeGroups[0].weather?.weather_condition).toBe('01d');
    }));

    it('should set cascade group weather to null when report weather is null', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        gesReportService.getReport.and.returnValue(of(makeReportWithWeather(null)));
        fixture.detectChanges();
        tick();
        expect(component.cascadeGroups[0].weather).toBeNull();
    }));

    it('should render OWM icon in cascade header when weather is present', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        const weather: ReportWeather = {
            temperature: 22.5, weather_condition: '01d',
            prev_year_temperature: 18, prev_year_condition: '02d'
        };
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        gesReportService.getReport.and.returnValue(of(makeReportWithWeather(weather)));
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
        const imgs = fixture.nativeElement.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
        const srcs = Array.from(imgs).map(img => img.src);
        expect(srcs.some(s => s.includes('openweathermap.org/img/wn/01d'))).toBeTrue();
        expect(srcs.some(s => s.includes('openweathermap.org/img/wn/02d'))).toBeTrue();
    }));

    it('should not render any weather icons when cascade weather is null', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        gesReportService.getReport.and.returnValue(of(makeReportWithWeather(null)));
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
        const imgs = fixture.nativeElement.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
        const owmImgs = Array.from(imgs).filter(img => img.src.includes('openweathermap.org'));
        expect(owmImgs.length).toBe(0);
    }));
});
