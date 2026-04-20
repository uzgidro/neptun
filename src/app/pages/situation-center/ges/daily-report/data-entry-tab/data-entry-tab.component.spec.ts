import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
        repair_aggregates: 0, modernization_aggregates: 0, reserve_aggregates: 2,
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
        const arg = gesReportService.upsertDailyData.calls.mostRecent().args[0];
        expect(Array.isArray(arg)).toBeTrue();
    }));

    it('saveAll: no POST when no rows are dirty', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        gesReportService.upsertDailyData.and.returnValue(of({ status: 'OK' }));
        fixture.detectChanges();
        tick();
        component.saveAll();
        tick();
        expect(gesReportService.upsertDailyData).not.toHaveBeenCalled();
    }));

    it('saveRow: sends only dirty fields + organization_id + date', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        gesReportService.upsertDailyData.and.returnValue(of({ status: 'OK' }));
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        row.form.get('daily_production_mln_kwh')?.setValue(5.0);
        row.form.get('daily_production_mln_kwh')?.markAsDirty();
        row.form.get('water_level_m')?.setValue(846.1);
        row.form.get('water_level_m')?.markAsDirty();
        component.saveRow(row);
        tick();
        expect(gesReportService.upsertDailyData).toHaveBeenCalledTimes(1);
        const arg = gesReportService.upsertDailyData.calls.mostRecent().args[0];
        expect(Array.isArray(arg)).toBeTrue();
        expect(arg.length).toBe(1);
        const item = arg[0] as unknown as Record<string, unknown>;
        expect(Object.keys(item).sort()).toEqual(
            ['daily_production_mln_kwh', 'date', 'organization_id', 'water_level_m'].sort()
        );
        expect(item['daily_production_mln_kwh']).toBe(5.0);
        expect(item['water_level_m']).toBe(846.1);
    }));

    it('saveAll: bulk 3 rows single POST with array of length 3', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1'), makeConfig(20, 'ГЭС-2'), makeConfig(30, 'ГЭС-3')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        gesReportService.upsertDailyData.and.returnValue(of({ status: 'OK' }));
        fixture.detectChanges();
        tick();
        component.rows[0].form.get('daily_production_mln_kwh')?.setValue(1.1);
        component.rows[0].form.get('daily_production_mln_kwh')?.markAsDirty();
        component.rows[1].form.get('working_aggregates')?.setValue(2);
        component.rows[1].form.get('working_aggregates')?.markAsDirty();
        component.rows[2].form.get('water_level_m')?.setValue(800);
        component.rows[2].form.get('water_level_m')?.markAsDirty();
        component.saveAll();
        tick();
        expect(gesReportService.upsertDailyData).toHaveBeenCalledTimes(1);
        const arg = gesReportService.upsertDailyData.calls.mostRecent().args[0];
        expect(Array.isArray(arg)).toBeTrue();
        expect(arg.length).toBe(3);
        const items = arg as unknown as Record<string, unknown>[];
        expect(Object.keys(items[0]).sort()).toEqual(
            ['daily_production_mln_kwh', 'date', 'organization_id'].sort()
        );
        expect(items[0]['daily_production_mln_kwh']).toBe(1.1);
        expect(items[0]['organization_id']).toBe(10);
        expect(Object.keys(items[1]).sort()).toEqual(
            ['date', 'organization_id', 'working_aggregates'].sort()
        );
        expect(items[1]['working_aggregates']).toBe(2);
        expect(items[1]['organization_id']).toBe(20);
        expect(Object.keys(items[2]).sort()).toEqual(
            ['date', 'organization_id', 'water_level_m'].sort()
        );
        expect(items[2]['water_level_m']).toBe(800);
        expect(items[2]['organization_id']).toBe(30);
    }));

    it('saveAll: item_index error shows failing station name in toast', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1'), makeConfig(20, 'ГЭС-2')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        gesReportService.upsertDailyData.and.returnValue(
            throwError(() => ({ error: { item_index: 1, message: 'bad value' } }))
        );
        const translate = TestBed.inject(TranslateService);
        spyOn(translate, 'instant').and.callFake((key: string | string[], params?: Record<string, unknown>) => {
            if (key === 'GES_REPORT.BATCH_FAILED_AT' && params) {
                return `Batch failed at station ${params['station']}`;
            }
            return key as string;
        });
        fixture.detectChanges();
        tick();
        component.rows[0].form.get('daily_production_mln_kwh')?.setValue(5.0);
        component.rows[0].form.get('daily_production_mln_kwh')?.markAsDirty();
        component.rows[1].form.get('water_level_m')?.setValue(846.1);
        component.rows[1].form.get('water_level_m')?.markAsDirty();
        const messageService = TestBed.inject(MessageService);
        const addSpy = spyOn(messageService, 'add');
        component.saveAll();
        tick();
        expect(addSpy).toHaveBeenCalled();
        const lastCallArg = addSpy.calls.mostRecent().args[0];
        expect(String(lastCallArg.detail)).toContain('ГЭС-2');
        expect(component.rows[0].form.dirty).toBeTrue();
        expect(component.rows[1].form.dirty).toBeTrue();
    }));

    it('saveAll: mixed dirty — pristine rows are filtered out', fakeAsync(() => {
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
        const arg = gesReportService.upsertDailyData.calls.mostRecent().args[0];
        expect(Array.isArray(arg)).toBeTrue();
        expect(arg.length).toBe(1);
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
