import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DataEntryTabComponent } from './data-entry-tab.component';
import { GesReportService } from '@/core/services/ges-report.service';
import { GesConfigResponse, GesDailyReport, ReportGrandTotal, ReportWeather } from '@/core/interfaces/ges-report';
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
});
