import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DataEntryTabComponent } from './data-entry-tab.component';
import { GesReportService } from '@/core/services/ges-report.service';
import { GesConfigResponse, GesDailyReport, ReportCurrent, ReportGrandTotal, ReportStation, ReportWeather } from '@/core/interfaces/ges-report';
import { HttpErrorResponse } from '@angular/common/http';

function makeConfig(orgId: number, name: string, hasReservoir = true): GesConfigResponse {
    return {
        id: orgId, organization_id: orgId, organization_name: name,
        cascade_id: 1, cascade_name: 'Каскад',
        installed_capacity_mwt: 50, total_aggregates: 4,
        has_reservoir: hasReservoir, sort_order: orgId,
        max_daily_production_mln_kwh: 0
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

function makeReportCurrent(overrides: Partial<ReportCurrent> = {}): ReportCurrent {
    return {
        daily_production_mln_kwh: 0, power_mwt: 0,
        working_aggregates: 0, repair_aggregates: 0,
        modernization_aggregates: 0, reserve_aggregates: 0,
        water_level_m: null, water_volume_mln_m3: null, water_head_m: null,
        reservoir_income_m3s: null, total_outflow_m3s: null,
        ges_flow_m3s: null, consumption_m3_s: null, idle_discharge_m3s: null,
        ...overrides
    };
}

function makeStation(orgId: number, previousDay: ReportCurrent | null): ReportStation {
    return {
        organization_id: orgId, name: `ГЭС-${orgId}`,
        config: { installed_capacity_mwt: 50, total_aggregates: 4, has_reservoir: true },
        current: makeReportCurrent(),
        diffs: {} as any,
        aggregations: {} as any,
        plan: {} as any,
        previous_year: {} as any,
        yoy: {} as any,
        idle_discharge: null,
        previous_day: previousDay
    };
}

function makeReportWithStation(orgId: number, previousDay: ReportCurrent | null): GesDailyReport {
    return {
        date: '2026-03-30',
        cascades: [{
            cascade_id: 1, cascade_name: 'Каскад',
            weather: null,
            summary: makeGrandTotal(),
            stations: [makeStation(orgId, previousDay)]
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
            'getConfigs', 'getDailyData', 'upsertDailyData', 'getCascadeConfigs', 'getReport',
            'listFrozenDefaults', 'upsertFrozenDefault', 'deleteFrozenDefault'
        ]);
        spy.getConfigs.and.returnValue(of([]));
        spy.getCascadeConfigs.and.returnValue(of([]));
        spy.getReport.and.returnValue(of(null));
        spy.listFrozenDefaults.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [DataEntryTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                provideRouter([]),
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

    it('buildPayload includes repair_aggregates and modernization_aggregates when dirty', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        row.form.get('repair_aggregates')!.setValue(2);
        row.form.get('repair_aggregates')!.markAsDirty();
        const payload = (component as unknown as { buildPayload: (r: typeof row) => Record<string, unknown> }).buildPayload(row);
        expect(payload['repair_aggregates']).toBe(2);
    }));

    it('blocks save when working + repair + modernization > total_aggregates', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        gesReportService.upsertDailyData.and.returnValue(of({ status: 'OK' }));
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        row.config.total_aggregates = 4;
        row.form.patchValue({ working_aggregates: 3, repair_aggregates: 1, modernization_aggregates: 1 });
        row.form.markAsDirty();
        row.form.get('working_aggregates')!.markAsDirty();
        const messageService = TestBed.inject(MessageService);
        const addSpy = spyOn(messageService, 'add');
        component.saveRow(row);
        tick();
        expect(gesReportService.upsertDailyData).not.toHaveBeenCalled();
        expect(addSpy).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
    }));

    it('surfaces 400 aggregates sum exceeds total error from backend', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        gesReportService.upsertDailyData.and.returnValue(
            throwError(() => ({ status: 400, error: { message: 'aggregates sum exceeds total for organization_id=10: 4+2+1=7 > 6' } }))
        );
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        row.config.total_aggregates = 10; // so client-side guard passes
        row.form.patchValue({ working_aggregates: 1 });
        row.form.get('working_aggregates')!.markAsDirty();
        row.form.markAsDirty();
        const messageService = TestBed.inject(MessageService);
        const addSpy = spyOn(messageService, 'add');
        component.saveRow(row);
        tick();
        expect(addSpy).toHaveBeenCalledWith(jasmine.objectContaining({
            severity: 'error'
        }));
    }));

    describe('own_consumption_kwh field', () => {
        it('createForm includes own_consumption_kwh control with default null', fakeAsync(() => {
            const configs = [makeConfig(10, 'ГЭС-1')];
            gesReportService.getConfigs.and.returnValue(of(configs));
            gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            const ctrl = row.form.get('own_consumption_kwh');
            expect(ctrl).toBeTruthy();
            expect(ctrl!.value).toBeNull();
        }));

        it('buildPayload omits own_consumption_kwh when not dirty', fakeAsync(() => {
            const configs = [makeConfig(10, 'ГЭС-1')];
            gesReportService.getConfigs.and.returnValue(of(configs));
            gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('daily_production_mln_kwh')!.setValue(5.0);
            row.form.get('daily_production_mln_kwh')!.markAsDirty();
            const payload = (component as unknown as { buildPayload: (r: typeof row) => Record<string, unknown> }).buildPayload(row);
            expect('own_consumption_kwh' in payload).toBeFalse();
        }));

        it('buildPayload includes own_consumption_kwh when set and dirty', fakeAsync(() => {
            const configs = [makeConfig(10, 'ГЭС-1')];
            gesReportService.getConfigs.and.returnValue(of(configs));
            gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('own_consumption_kwh')!.setValue(1250.0);
            row.form.get('own_consumption_kwh')!.markAsDirty();
            const payload = (component as unknown as { buildPayload: (r: typeof row) => Record<string, unknown> }).buildPayload(row);
            expect(payload['own_consumption_kwh']).toBe(1250.0);
        }));

        it('buildPayload includes own_consumption_kwh:null when explicitly cleared', fakeAsync(() => {
            const configs = [makeConfig(10, 'ГЭС-1')];
            gesReportService.getConfigs.and.returnValue(of(configs));
            gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('own_consumption_kwh')!.setValue(null);
            row.form.get('own_consumption_kwh')!.markAsDirty();
            const payload = (component as unknown as { buildPayload: (r: typeof row) => Record<string, unknown> }).buildPayload(row);
            expect('own_consumption_kwh' in payload).toBeTrue();
            expect(payload['own_consumption_kwh']).toBeNull();
        }));
    });

    describe('frozen defaults', () => {
        function loadWithFrozen(orgId = 100, frozen: any[] = []) {
            const configs = [makeConfig(orgId, `ГЭС-${orgId}`)];
            gesReportService.getConfigs.and.returnValue(of(configs));
            gesReportService.getDailyData.and.returnValue(of(null));
            gesReportService.listFrozenDefaults.and.returnValue(of(frozen));
            fixture.detectChanges();
            tick();
        }

        it('wave-1 loads frozen defaults and populates frozenMap', fakeAsync(() => {
            loadWithFrozen(100, [{
                organization_id: 100, cascade_id: 1, field_name: 'water_head_m',
                frozen_value: 45.0, frozen_at: '2026-04-23T00:00:00Z', updated_at: '2026-04-24T00:00:00Z'
            }]);
            expect((component as any).frozenMap[100]?.water_head_m?.frozen_value).toBe(45.0);
        }));

        it('isFrozen returns false when map empty and true when entry present', fakeAsync(() => {
            loadWithFrozen(100, [{
                organization_id: 100, cascade_id: 1, field_name: 'water_head_m',
                frozen_value: 45.0, frozen_at: 't', updated_at: 't'
            }]);
            const row = component.rows[0];
            expect((component as any).isFrozen(row, 'water_head_m')).toBeTrue();
            expect((component as any).isFrozen(row, 'water_level_m')).toBeFalse();
        }));

        it('getFrozenValue returns number when frozen, null otherwise', fakeAsync(() => {
            loadWithFrozen(100, [{
                organization_id: 100, cascade_id: 1, field_name: 'water_head_m',
                frozen_value: 45.0, frozen_at: 't', updated_at: 't'
            }]);
            const row = component.rows[0];
            expect((component as any).getFrozenValue(row, 'water_head_m')).toBe(45.0);
            expect((component as any).getFrozenValue(row, 'water_level_m')).toBeNull();
        }));

        it('getFrozenPlaceholder returns frozen value only when form value is null', fakeAsync(() => {
            loadWithFrozen(100, [{
                organization_id: 100, cascade_id: 1, field_name: 'water_head_m',
                frozen_value: 45.0, frozen_at: 't', updated_at: 't'
            }]);
            const row = component.rows[0];
            expect((component as any).getFrozenPlaceholder(row, 'water_head_m')).toBe('45');
            row.form.get('water_head_m')?.setValue(50);
            expect((component as any).getFrozenPlaceholder(row, 'water_head_m')).toBe('');
            expect((component as any).getFrozenPlaceholder(row, 'water_level_m')).toBe('');
        }));

        it('openFreezeDialog sets context to freeze mode when no frozen entry', fakeAsync(() => {
            loadWithFrozen(100, []);
            (component as any).canFreeze = true;
            const row = component.rows[0];
            row.form.get('water_head_m')?.setValue(50);
            (component as any).openFreezeDialog(row, 'water_head_m');
            expect((component as any).freezeDialogVisible).toBeTrue();
            expect((component as any).freezeDialogContext?.mode).toBe('freeze');
            expect((component as any).freezeDialogContext?.currentValue).toBe(50);
            expect((component as any).freezeDialogContext?.frozenValue).toBeNull();
        }));

        it('openFreezeDialog sets context to manage mode when frozen entry exists', fakeAsync(() => {
            loadWithFrozen(100, [{
                organization_id: 100, cascade_id: 1, field_name: 'water_head_m',
                frozen_value: 45.0, frozen_at: 't', updated_at: 't'
            }]);
            (component as any).canFreeze = true;
            const row = component.rows[0];
            (component as any).openFreezeDialog(row, 'water_head_m');
            expect((component as any).freezeDialogContext?.mode).toBe('manage');
            expect((component as any).freezeDialogContext?.frozenValue).toBe(45.0);
        }));

        it('openFreezeDialog no-op when canFreeze is false', fakeAsync(() => {
            loadWithFrozen(100, []);
            (component as any).canFreeze = false;
            const row = component.rows[0];
            (component as any).openFreezeDialog(row, 'water_head_m');
            expect((component as any).freezeDialogVisible).toBeFalse();
        }));

        it('confirmFreeze success updates frozenMap and closes dialog', fakeAsync(() => {
            loadWithFrozen(100, []);
            gesReportService.upsertFrozenDefault.and.returnValue(of({ status: 'OK' }));
            (component as any).canFreeze = true;
            const row = component.rows[0];
            row.form.get('water_head_m')?.setValue(50);
            (component as any).openFreezeDialog(row, 'water_head_m');
            (component as any).confirmFreeze();
            tick();
            expect(gesReportService.upsertFrozenDefault).toHaveBeenCalledWith({
                organization_id: 100, field_name: 'water_head_m', frozen_value: 50
            });
            expect((component as any).isFrozen(row, 'water_head_m')).toBeTrue();
            expect((component as any).frozenMap[100]?.water_head_m?.frozen_value).toBe(50);
            expect((component as any).freezeDialogVisible).toBeFalse();
        }));

        it('confirmFreeze error rolls back optimistic update and keeps dialog open', fakeAsync(() => {
            loadWithFrozen(100, []);
            gesReportService.upsertFrozenDefault.and.returnValue(
                throwError(() => new HttpErrorResponse({ status: 403 }))
            );
            (component as any).canFreeze = true;
            const row = component.rows[0];
            row.form.get('water_head_m')?.setValue(50);
            (component as any).openFreezeDialog(row, 'water_head_m');
            const addSpy = spyOn(TestBed.inject(MessageService), 'add');
            (component as any).confirmFreeze();
            tick();
            expect((component as any).isFrozen(row, 'water_head_m')).toBeFalse();
            expect((component as any).freezeDialogVisible).toBeTrue();
            expect(addSpy).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
        }));

        it('confirmUnfreeze success removes entry from frozenMap', fakeAsync(() => {
            loadWithFrozen(100, [{
                organization_id: 100, cascade_id: 1, field_name: 'water_head_m',
                frozen_value: 45.0, frozen_at: 't', updated_at: 't'
            }]);
            gesReportService.deleteFrozenDefault.and.returnValue(of(null));
            (component as any).canFreeze = true;
            const row = component.rows[0];
            (component as any).openFreezeDialog(row, 'water_head_m');
            (component as any).confirmUnfreeze();
            tick();
            expect(gesReportService.deleteFrozenDefault).toHaveBeenCalledWith({
                organization_id: 100, field_name: 'water_head_m'
            });
            expect((component as any).isFrozen(row, 'water_head_m')).toBeFalse();
            expect((component as any).freezeDialogVisible).toBeFalse();
        }));

        it('shouldShowNotNullHint is true only for NOT NULL fields with frozen entry', fakeAsync(() => {
            loadWithFrozen(100, [
                { organization_id: 100, cascade_id: 1, field_name: 'water_head_m',
                  frozen_value: 45, frozen_at: 't', updated_at: 't' },
                { organization_id: 100, cascade_id: 1, field_name: 'working_aggregates',
                  frozen_value: 3, frozen_at: 't', updated_at: 't' }
            ]);
            const row = component.rows[0];
            // NOT NULL + frozen → true
            expect((component as any).shouldShowNotNullHint(row, 'working_aggregates')).toBeTrue();
            // nullable + frozen → false
            expect((component as any).shouldShowNotNullHint(row, 'water_head_m')).toBeFalse();
            // NOT NULL but not frozen → false
            expect((component as any).shouldShowNotNullHint(row, 'repair_aggregates')).toBeFalse();
        }));

        it('saveRow success triggers refreshFrozenAfterSave via listFrozenDefaults', fakeAsync(() => {
            loadWithFrozen(100, []);
            gesReportService.listFrozenDefaults.calls.reset();
            gesReportService.upsertDailyData.and.returnValue(of({ status: 'OK' }));
            gesReportService.listFrozenDefaults.and.returnValue(of([]));
            const row = component.rows[0];
            row.form.get('water_head_m')?.setValue(50);
            row.form.get('water_head_m')?.markAsDirty();
            component.saveRow(row);
            tick();
            expect(gesReportService.listFrozenDefaults).toHaveBeenCalled();
        }));
    });

    // ─── outflow=income lock toggle ───

    describe('toggleOutflowLock (manual)', () => {
        beforeEach(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(of(null));
            gesReportService.getReport.and.returnValue(of(null as any));
        });

        it('lock copies income into outflow, disables outflow control, marks row dirty', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('reservoir_income_m3s')?.setValue(150);
            (component as any).toggleOutflowLock(row);
            expect((row as any).outflowLockedToIncome).toBeTrue();
            const outflow = row.form.get('total_outflow_m3s')!;
            expect(outflow.value).toBe(150);
            expect(outflow.disabled).toBeTrue();
            expect(outflow.dirty).toBeTrue();
        }));

        it('lock when income is null mirrors null into outflow and disables it', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('total_outflow_m3s')?.setValue(99);
            // income stays null
            (component as any).toggleOutflowLock(row);
            const outflow = row.form.get('total_outflow_m3s')!;
            expect((row as any).outflowLockedToIncome).toBeTrue();
            expect(outflow.value).toBeNull();
            expect(outflow.disabled).toBeTrue();
            expect(outflow.dirty).toBeTrue();
        }));

        it('unlock re-enables outflow control without changing the value', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('reservoir_income_m3s')?.setValue(150);
            (component as any).toggleOutflowLock(row); // lock → outflow=150 disabled
            (component as any).toggleOutflowLock(row); // unlock
            const outflow = row.form.get('total_outflow_m3s')!;
            expect((row as any).outflowLockedToIncome).toBeFalse();
            expect(outflow.enabled).toBeTrue();
            expect(outflow.value).toBe(150);
        }));

        it('lock triggers ges_flow recompute (outflow - idle)', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.idleDischarge = { flow_rate_m3s: 5 } as any;
            row.form.get('reservoir_income_m3s')?.setValue(150);
            (component as any).toggleOutflowLock(row);
            expect(row.form.get('ges_flow_m3s')!.value).toBe(145);
        }));
    });

    describe('wireOutflowMirror (live)', () => {
        beforeEach(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(of(null));
            gesReportService.getReport.and.returnValue(of(null as any));
        });

        it('mirrors income changes into outflow when locked', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('reservoir_income_m3s')?.setValue(150);
            (component as any).toggleOutflowLock(row);
            row.form.get('reservoir_income_m3s')?.setValue(200);
            const outflow = row.form.get('total_outflow_m3s')!;
            expect(outflow.value).toBe(200);
            expect(outflow.dirty).toBeTrue();
        }));

        it('does NOT mirror when unlocked', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('total_outflow_m3s')?.setValue(99);
            row.form.get('reservoir_income_m3s')?.setValue(200);
            expect(row.form.get('total_outflow_m3s')!.value).toBe(99);
        }));

        it('mirror triggers ges_flow recompute', fakeAsync(() => {
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.idleDischarge = { flow_rate_m3s: 5 } as any;
            row.form.get('reservoir_income_m3s')?.setValue(150);
            (component as any).toggleOutflowLock(row);
            row.form.get('reservoir_income_m3s')?.setValue(300);
            expect(row.form.get('ges_flow_m3s')!.value).toBe(295);
        }));
    });

    describe('initOutflowLock from previous_day', () => {
        it('auto-locks when yesterday income === outflow (both non-null)', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(of(null));
            gesReportService.getReport.and.returnValue(of(makeReportWithStation(10,
                makeReportCurrent({ reservoir_income_m3s: 100, total_outflow_m3s: 100 })
            )));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            expect((row as any).outflowLockedToIncome).toBeTrue();
            expect(row.form.get('total_outflow_m3s')!.disabled).toBeTrue();
        }));

        it('auto-locks and copies today income into outflow when today outflow empty', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(of({
                id: 1, organization_id: 10, date: '2026-03-30',
                reservoir_income_m3s: 120, total_outflow_m3s: null
            } as any));
            gesReportService.getReport.and.returnValue(of(makeReportWithStation(10,
                makeReportCurrent({ reservoir_income_m3s: 100, total_outflow_m3s: 100 })
            )));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            const outflow = row.form.get('total_outflow_m3s')!;
            expect(outflow.value).toBe(120);
            expect(outflow.dirty).toBeTrue();
            expect(outflow.disabled).toBeTrue();
        }));

        it('auto-locks and leaves matching today outflow untouched (not dirty)', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(of({
                id: 1, organization_id: 10, date: '2026-03-30',
                reservoir_income_m3s: 120, total_outflow_m3s: 120
            } as any));
            gesReportService.getReport.and.returnValue(of(makeReportWithStation(10,
                makeReportCurrent({ reservoir_income_m3s: 100, total_outflow_m3s: 100 })
            )));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            const outflow = row.form.get('total_outflow_m3s')!;
            expect(outflow.value).toBe(120);
            expect(outflow.dirty).toBeFalse();
            expect(outflow.disabled).toBeTrue();
        }));

        it('does NOT auto-lock when yesterday income !== outflow', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(of(null));
            gesReportService.getReport.and.returnValue(of(makeReportWithStation(10,
                makeReportCurrent({ reservoir_income_m3s: 100, total_outflow_m3s: 90 })
            )));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            expect((row as any).outflowLockedToIncome).toBeFalse();
            expect(row.form.get('total_outflow_m3s')!.enabled).toBeTrue();
        }));

        it('does NOT auto-lock when previous_day is null', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(of(null));
            gesReportService.getReport.and.returnValue(of(makeReportWithStation(10, null)));
            fixture.detectChanges();
            tick();
            expect((component.rows[0] as any).outflowLockedToIncome).toBeFalse();
        }));

        it('does NOT auto-lock when yesterday income is null', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(of(null));
            gesReportService.getReport.and.returnValue(of(makeReportWithStation(10,
                makeReportCurrent({ reservoir_income_m3s: null, total_outflow_m3s: 100 })
            )));
            fixture.detectChanges();
            tick();
            expect((component.rows[0] as any).outflowLockedToIncome).toBeFalse();
        }));

        it('does NOT auto-lock when yesterday outflow is null', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(of(null));
            gesReportService.getReport.and.returnValue(of(makeReportWithStation(10,
                makeReportCurrent({ reservoir_income_m3s: 100, total_outflow_m3s: null })
            )));
            fixture.detectChanges();
            tick();
            expect((component.rows[0] as any).outflowLockedToIncome).toBeFalse();
        }));
    });

    describe('persistence (saveRow with locked outflow)', () => {
        it('saveRow includes total_outflow_m3s even when control is disabled (locked)', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(of(null));
            gesReportService.getReport.and.returnValue(of(null as any));
            gesReportService.upsertDailyData.and.returnValue(of({ status: 'ok' } as any));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('reservoir_income_m3s')?.setValue(150);
            row.form.get('reservoir_income_m3s')?.markAsDirty();
            (component as any).toggleOutflowLock(row);
            component.saveRow(row);
            tick();
            const args = gesReportService.upsertDailyData.calls.mostRecent().args[0] as any;
            // upsertDailyData accepts an array of payloads
            const payload = Array.isArray(args) ? args[0] : args;
            expect(payload.total_outflow_m3s).toBe(150);
        }));
    });

    describe('consumption_m3_s field', () => {
        it('loads consumption_m3_s from server into the form', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(of({
                id: 1, organization_id: 10, date: '2026-03-30',
                consumption_m3_s: 1.5
            } as any));
            fixture.detectChanges();
            tick();
            expect(component.rows[0].form.get('consumption_m3_s')?.value).toBe(1.5);
        }));

        it('includes consumption_m3_s in buildPayload when dirty', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
            gesReportService.upsertDailyData.and.returnValue(of({ status: 'OK' }));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('consumption_m3_s')?.setValue(2.5);
            row.form.get('consumption_m3_s')?.markAsDirty();
            component.saveRow(row);
            tick();
            const arg = gesReportService.upsertDailyData.calls.mostRecent().args[0];
            const item = (arg as unknown as Record<string, unknown>[])[0];
            expect(item['consumption_m3_s']).toBe(2.5);
        }));

        it('omits consumption_m3_s from buildPayload when pristine', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
            gesReportService.upsertDailyData.and.returnValue(of({ status: 'OK' }));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('daily_production_mln_kwh')?.setValue(5.0);
            row.form.get('daily_production_mln_kwh')?.markAsDirty();
            // consumption_m3_s left untouched (pristine)
            component.saveRow(row);
            tick();
            const arg = gesReportService.upsertDailyData.calls.mostRecent().args[0];
            const item = (arg as unknown as Record<string, unknown>[])[0];
            expect('consumption_m3_s' in item).toBeFalse();
        }));
    });

    describe('parseStructuredError', () => {
        function makeErr(body: unknown): HttpErrorResponse {
            return new HttpErrorResponse({ status: 400, error: body });
        }

        it('returns null when response has no code', () => {
            const result = (component as any).parseStructuredError(makeErr({ error: 'plain text' }));
            expect(result).toBeNull();
        });

        it('returns null when there is no error body at all', () => {
            const result = (component as any).parseStructuredError({} as HttpErrorResponse);
            expect(result).toBeNull();
        });

        it('formats save.field_negative with field label and value', () => {
            const translate = TestBed.inject(TranslateService);
            spyOn(translate, 'instant').and.callFake((key: string | string[], params?: any) => {
                if (key === 'GES_REPORT.FIELD_LABELS.consumption_m3_s') return 'Полезный попуск';
                if (key === 'GES_REPORT.ERRORS.FIELD_NEGATIVE') return `NEG ${params.field}=${params.value}`;
                return key as string;
            });
            const result = (component as any).parseStructuredError(makeErr({
                error: '...', code: 'save.field_negative',
                details: [{ organization_id: 16, field: 'consumption_m3_s', value: -1.5 }]
            }));
            expect(result).toBe('NEG Полезный попуск=-1.5');
        });

        it('falls back to raw field name when FIELD_LABELS key is missing', () => {
            const translate = TestBed.inject(TranslateService);
            spyOn(translate, 'instant').and.callFake((key: string | string[], params?: any) => {
                if (key === 'GES_REPORT.ERRORS.FIELD_NEGATIVE') return `NEG ${params.field}=${params.value}`;
                return key as string; // mimic missing key: returns key string unchanged
            });
            const result = (component as any).parseStructuredError(makeErr({
                error: '...', code: 'save.field_negative',
                details: [{ field: 'unknown_field', value: -1 }]
            }));
            expect(result).toBe('NEG unknown_field=-1');
        });

        it('formats save.aggregates_exceed_total with all numbers', () => {
            const translate = TestBed.inject(TranslateService);
            spyOn(translate, 'instant').and.callFake((key: string | string[], params?: any) => {
                if (key === 'GES_REPORT.ERRORS.AGGREGATES_EXCEED_TOTAL') {
                    return `AGG ${params.working}+${params.repair}+${params.modernization}>${params.total}`;
                }
                return key as string;
            });
            const result = (component as any).parseStructuredError(makeErr({
                error: '...', code: 'save.aggregates_exceed_total',
                details: [{ organization_id: 10, working: 4, repair: 1, modernization: 0, sum: 5, total: 4 }]
            }));
            expect(result).toBe('AGG 4+1+0>4');
        });

        it('formats save.production_exceeds_max with station name', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(7, 'ГЭС-Семь')]));
            gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
            fixture.detectChanges();
            tick();
            const translate = TestBed.inject(TranslateService);
            spyOn(translate, 'instant').and.callFake((key: string | string[], params?: any) => {
                if (key === 'GES_REPORT.PRODUCTION_EXCEEDS_MAX_SERVER') {
                    return `MAX ${params.station} ${params.value}>${params.max}`;
                }
                return key as string;
            });
            const result = (component as any).parseStructuredError(makeErr({
                error: '...', code: 'save.production_exceeds_max',
                details: [{ organization_id: 7, field: 'daily_production_mln_kwh', value: 10, max: 5 }]
            }));
            expect(result).toBe('MAX ГЭС-Семь 10>5');
        }));

        it('joins multiple report.consumption_exceeds_idle rows with "; "', () => {
            const translate = TestBed.inject(TranslateService);
            spyOn(translate, 'instant').and.callFake((key: string | string[], params?: any) => {
                if (key === 'GES_REPORT.ERRORS.CONSUMPTION_EXCEEDS_IDLE_ROW') {
                    return `${params.station}: ${params.consumption}>${params.idle}`;
                }
                return key as string;
            });
            const result = (component as any).parseStructuredError(makeErr({
                error: '...', code: 'report.consumption_exceeds_idle',
                details: [
                    { organization_id: 16, organization_name: 'ГЭС-1', idle_m3_s: 2, consumption_m3_s: 5 },
                    { organization_id: 17, organization_name: 'ГЭС-2', idle_m3_s: 1, consumption_m3_s: 3 }
                ]
            }));
            expect(result).toBe('ГЭС-1: 5>2; ГЭС-2: 3>1');
        });

        it('returns null for unknown code', () => {
            const result = (component as any).parseStructuredError(makeErr({
                error: '...', code: 'some.unknown.code', details: []
            }));
            expect(result).toBeNull();
        });
    });

    describe('saveRow with structured error', () => {
        it('shows structured-error toast on 400 save.field_negative', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
            const errResp = new HttpErrorResponse({
                status: 400,
                error: {
                    error: 'consumption_m3_s must be >= 0 for organization_id=10, got -1',
                    code: 'save.field_negative',
                    details: [{ organization_id: 10, field: 'consumption_m3_s', value: -1 }]
                }
            });
            gesReportService.upsertDailyData.and.returnValue(throwError(() => errResp));
            fixture.detectChanges();
            tick();
            const translate = TestBed.inject(TranslateService);
            spyOn(translate, 'instant').and.callFake((key: string | string[], params?: any) => {
                if (key === 'GES_REPORT.ERRORS.FIELD_NEGATIVE') return `NEG ${params.value}`;
                return key as string;
            });
            const msgService = TestBed.inject(MessageService);
            const addSpy = spyOn(msgService, 'add');
            const row = component.rows[0];
            row.form.get('consumption_m3_s')?.setValue(-1);
            row.form.get('consumption_m3_s')?.markAsDirty();
            component.saveRow(row);
            tick();
            expect(addSpy).toHaveBeenCalled();
            const call = addSpy.calls.mostRecent().args[0];
            expect(call.severity).toBe('error');
            expect(call.detail).toBe('NEG -1');
        }));

        it('falls back to legacy parseProductionCapError when no code in envelope', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
            const errResp = new HttpErrorResponse({
                status: 400,
                error: { message: 'daily_production_mln_kwh exceeds max for organization_id=10: 10 > 5' }
            });
            gesReportService.upsertDailyData.and.returnValue(throwError(() => errResp));
            fixture.detectChanges();
            tick();
            const translate = TestBed.inject(TranslateService);
            spyOn(translate, 'instant').and.callFake((key: string | string[], params?: any) => {
                if (key === 'GES_REPORT.PRODUCTION_EXCEEDS_MAX_SERVER') {
                    return `MAX ${params.station} ${params.value}>${params.max}`;
                }
                return key as string;
            });
            const msgService = TestBed.inject(MessageService);
            const addSpy = spyOn(msgService, 'add');
            const row = component.rows[0];
            row.form.get('daily_production_mln_kwh')?.setValue(10);
            row.form.get('daily_production_mln_kwh')?.markAsDirty();
            component.saveRow(row);
            tick();
            const call = addSpy.calls.mostRecent().args[0];
            expect(call.detail).toBe('MAX ГЭС-1 10>5');
        }));
    });

    describe('loadData with report.consumption_exceeds_idle', () => {
        it('shows warn toast and continues to load configs/data on 400 with structured code', fakeAsync(() => {
            gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 'ГЭС-1')]));
            gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
            const errResp = new HttpErrorResponse({
                status: 400,
                error: {
                    error: 'useful consumption exceeds idle discharge',
                    code: 'report.consumption_exceeds_idle',
                    details: [
                        { organization_id: 10, organization_name: 'ГЭС-1', idle_m3_s: 1, consumption_m3_s: 3 }
                    ]
                }
            });
            gesReportService.getReport.and.returnValue(throwError(() => errResp));
            const translate = TestBed.inject(TranslateService);
            spyOn(translate, 'instant').and.callFake((key: string | string[], params?: any) => {
                if (key === 'GES_REPORT.ERRORS.CONSUMPTION_EXCEEDS_IDLE_ROW') {
                    return `${params.station}:${params.consumption}>${params.idle}`;
                }
                return key as string;
            });
            const msgService = TestBed.inject(MessageService);
            const addSpy = spyOn(msgService, 'add');
            fixture.detectChanges();
            tick();
            expect(component.rows.length).toBe(1); // still built from configs
            expect(addSpy).toHaveBeenCalled();
            const warnCall = addSpy.calls.allArgs().find(a => a[0].severity === 'warn');
            expect(warnCall).toBeDefined();
            expect(warnCall![0].detail).toBe('ГЭС-1:3>1');
        }));
    });
});

describe('DataEntryTabComponent — date constraints', () => {
    function buildWith(dateParam: string | null): DataEntryTabComponent {
        const spy = jasmine.createSpyObj('GesReportService', [
            'getConfigs', 'getDailyData', 'upsertDailyData', 'getCascadeConfigs', 'getReport',
            'listFrozenDefaults', 'upsertFrozenDefault', 'deleteFrozenDefault'
        ]);
        spy.getConfigs.and.returnValue(of([]));
        spy.getCascadeConfigs.and.returnValue(of([]));
        spy.getReport.and.returnValue(of(null));
        spy.listFrozenDefaults.and.returnValue(of([]));

        const queryParamMap = convertToParamMap(dateParam ? { date: dateParam } : {});

        TestBed.configureTestingModule({
            imports: [DataEntryTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                provideRouter([]),
                { provide: GesReportService, useValue: spy },
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap } } },
                MessageService
            ]
        });
        return TestBed.createComponent(DataEntryTabComponent).componentInstance;
    }

    afterEach(() => TestBed.resetTestingModule());

    function startOfDay(d: Date): number {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }

    function yesterday(): number {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return startOfDay(d);
    }

    it('maxDate is set to yesterday', () => {
        const component = buildWith(null);
        expect(startOfDay(component.maxDate)).toBe(yesterday());
    });

    it('clamps a future URL date down to yesterday', () => {
        const component = buildWith('2099-01-01');
        expect(startOfDay(component.selectedDate)).toBe(yesterday());
    });

    it('clamps today from the URL down to yesterday', () => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const component = buildWith(todayStr);
        expect(startOfDay(component.selectedDate)).toBe(yesterday());
    });

    it('keeps a past URL date as-is', () => {
        const component = buildWith('2020-05-15');
        expect(component.selectedDate.getFullYear()).toBe(2020);
        expect(component.selectedDate.getMonth()).toBe(4);
        expect(component.selectedDate.getDate()).toBe(15);
    });

    it('defaults to yesterday when no URL date is present', () => {
        const component = buildWith(null);
        expect(startOfDay(component.selectedDate)).toBe(yesterday());
    });
});
