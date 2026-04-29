import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';

import { DataEntryTabComponent } from './data-entry-tab.component';
import { SolarReportService } from '@/core/services/solar-report.service';
import { SolarConfig, SolarDailyData } from '@/core/interfaces/solar-report';

function makeConfig(orgId: number, name: string, capacityKw = 100, sortOrder = 0): SolarConfig {
    return {
        id: orgId,
        organization_id: orgId,
        organization_name: name,
        installed_capacity_kw: capacityKw,
        sort_order: sortOrder,
        updated_at: '2026-04-29T00:00:00Z'
    };
}

function makeDaily(orgId: number, generation: number | null, gridExport: number | null): SolarDailyData {
    return {
        id: orgId,
        organization_id: orgId,
        organization_name: `Solar-${orgId}`,
        date: '2026-04-29',
        generation_kwh: generation,
        grid_export_kwh: gridExport,
        updated_at: '2026-04-29T00:00:00Z'
    };
}

describe('DataEntryTabComponent (solar)', () => {
    let component: DataEntryTabComponent;
    let fixture: ComponentFixture<DataEntryTabComponent>;
    let solarServiceSpy: jasmine.SpyObj<SolarReportService>;
    let messageService: jasmine.SpyObj<MessageService>;

    beforeEach(async () => {
        solarServiceSpy = jasmine.createSpyObj('SolarReportService', [
            'getConfigs', 'getDailyData', 'upsertDailyData'
        ]);
        solarServiceSpy.getConfigs.and.returnValue(of([]));
        solarServiceSpy.getDailyData.and.returnValue(of([]));
        solarServiceSpy.upsertDailyData.and.returnValue(of({ status: 'OK' }));

        messageService = jasmine.createSpyObj('MessageService', ['add']);

        await TestBed.configureTestingModule({
            imports: [DataEntryTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                provideRouter([]),
                { provide: SolarReportService, useValue: solarServiceSpy },
                { provide: MessageService, useValue: messageService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DataEntryTabComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // 1. should load data on init
    it('should load data on init', fakeAsync(() => {
        const configs = [makeConfig(10, 'Solar-1'), makeConfig(20, 'Solar-2')];
        solarServiceSpy.getConfigs.and.returnValue(of(configs));
        solarServiceSpy.getDailyData.and.returnValue(of([]));
        fixture.detectChanges();
        tick();
        expect(solarServiceSpy.getConfigs).toHaveBeenCalled();
        expect(solarServiceSpy.getDailyData).toHaveBeenCalled();
        expect(component.rows.length).toBe(2);
    }));

    // 2. should reload data when date changes
    it('should reload data when date changes', fakeAsync(() => {
        solarServiceSpy.getConfigs.and.returnValue(of([makeConfig(10, 'Solar-1')]));
        solarServiceSpy.getDailyData.and.returnValue(of([]));
        fixture.detectChanges();
        tick();
        const initialCalls = solarServiceSpy.getDailyData.calls.count();
        component.selectedDate = new Date(2026, 3, 28);
        component.onDateChange();
        tick();
        expect(solarServiceSpy.getDailyData.calls.count()).toBeGreaterThan(initialCalls);
    }));

    // 3. should not save row when form is pristine
    it('should not save row when form is pristine', fakeAsync(() => {
        solarServiceSpy.getConfigs.and.returnValue(of([makeConfig(10, 'Solar-1')]));
        solarServiceSpy.getDailyData.and.returnValue(of([]));
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        // form is pristine by default
        component.onFieldBlur(row);
        tick();
        expect(solarServiceSpy.upsertDailyData).not.toHaveBeenCalled();
    }));

    // 4. should save row on blur when dirty and valid
    it('should save row on blur when dirty and valid', fakeAsync(() => {
        solarServiceSpy.getConfigs.and.returnValue(of([makeConfig(10, 'Solar-1')]));
        solarServiceSpy.getDailyData.and.returnValue(of([]));
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        const ctrl = row.form.get('generation_kwh');
        ctrl?.setValue(620.5);
        ctrl?.markAsDirty();
        component.onFieldBlur(row);
        tick();
        expect(solarServiceSpy.upsertDailyData).toHaveBeenCalledTimes(1);
        const arg = solarServiceSpy.upsertDailyData.calls.mostRecent().args[0];
        expect(Array.isArray(arg)).toBeTrue();
        expect(arg[0].organization_id).toBe(10);
        expect(arg[0].generation_kwh).toBe(620.5);
        expect(row.saveStatus).toBe('saved');
    }));

    // 5. should NOT save when invalid (negative value)
    it('should NOT save when invalid (negative value)', fakeAsync(() => {
        solarServiceSpy.getConfigs.and.returnValue(of([makeConfig(10, 'Solar-1')]));
        solarServiceSpy.getDailyData.and.returnValue(of([]));
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        const ctrl = row.form.get('generation_kwh');
        ctrl?.setValue(-1);
        ctrl?.markAsDirty();
        expect(row.form.invalid).toBeTrue();
        component.onFieldBlur(row);
        tick();
        expect(solarServiceSpy.upsertDailyData).not.toHaveBeenCalled();
    }));

    // 6. should NOT double-save when blur fires twice (guard)
    it('should NOT double-save when blur fires twice (guard via row.saving)', fakeAsync(() => {
        solarServiceSpy.getConfigs.and.returnValue(of([makeConfig(10, 'Solar-1')]));
        solarServiceSpy.getDailyData.and.returnValue(of([]));
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        const ctrl = row.form.get('generation_kwh');
        ctrl?.setValue(100);
        ctrl?.markAsDirty();
        // ARRANGE: simulate save in flight (row.saving=true) — second blur must short-circuit.
        row.saving = true;
        component.onFieldBlur(row);
        tick();
        expect(solarServiceSpy.upsertDailyData).not.toHaveBeenCalled();
        // Reset and verify normal blur still works.
        row.saving = false;
        component.onFieldBlur(row);
        tick();
        expect(solarServiceSpy.upsertDailyData).toHaveBeenCalledTimes(1);
    }));

    // 7. should keep dirty on error
    it('should keep dirty on error (preserve unsaved state)', fakeAsync(() => {
        solarServiceSpy.getConfigs.and.returnValue(of([makeConfig(10, 'Solar-1')]));
        solarServiceSpy.getDailyData.and.returnValue(of([]));
        solarServiceSpy.upsertDailyData.and.returnValue(
            throwError(() => new HttpErrorResponse({ status: 500, error: { error: 'boom' } }))
        );
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        const ctrl = row.form.get('generation_kwh');
        ctrl?.setValue(620.5);
        ctrl?.markAsDirty();
        component.onFieldBlur(row);
        tick();
        expect(row.form.dirty).toBeTrue();
        expect(row.saveStatus).toBe('error');
    }));

    // 8. buildPayload omits field when not dirty (preserve in DB)
    it('buildPayload omits field when not dirty (preserve in DB)', fakeAsync(() => {
        solarServiceSpy.getConfigs.and.returnValue(of([makeConfig(10, 'Solar-1')]));
        solarServiceSpy.getDailyData.and.returnValue(of([makeDaily(10, 100, 80)]));
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        const genCtrl = row.form.get('generation_kwh');
        genCtrl?.setValue(620.5);
        genCtrl?.markAsDirty();
        // grid_export_kwh stays pristine.
        const payload = (component as any).buildPayload(row);
        expect(payload.generation_kwh).toBe(620.5);
        expect(Object.prototype.hasOwnProperty.call(payload, 'grid_export_kwh')).toBeFalse();
    }));

    // 9. buildPayload includes null when explicitly cleared
    it('buildPayload includes null when explicitly cleared', fakeAsync(() => {
        solarServiceSpy.getConfigs.and.returnValue(of([makeConfig(10, 'Solar-1')]));
        solarServiceSpy.getDailyData.and.returnValue(of([makeDaily(10, 100, 80)]));
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        const genCtrl = row.form.get('generation_kwh');
        genCtrl?.setValue(null);
        genCtrl?.markAsDirty();
        const payload = (component as any).buildPayload(row);
        expect(Object.prototype.hasOwnProperty.call(payload, 'generation_kwh')).toBeTrue();
        expect(payload.generation_kwh).toBeNull();
    }));

    // 10. SECURITY: buildPayload uses organization_id from config, NOT from form
    it('buildPayload uses organization_id from config, NOT from form (SECURITY)', fakeAsync(() => {
        solarServiceSpy.getConfigs.and.returnValue(of([makeConfig(42, 'Solar-42')]));
        solarServiceSpy.getDailyData.and.returnValue(of([]));
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        // Even if attacker manages to inject organization_id into the form group,
        // buildPayload must ignore it and use row.config.organization_id (server-supplied).
        // Inject malicious organization_id=99 into form — buildPayload must IGNORE it.
        (row.form as any).addControl?.('organization_id', new FormControl(99));
        const genCtrl = row.form.get('generation_kwh');
        genCtrl?.setValue(50);
        genCtrl?.markAsDirty();
        const payload = (component as any).buildPayload(row);
        expect(payload.organization_id).toBe(42);
    }));

    // 11. should display error toast on 403 with NO_ACCESS message
    it('should display error toast on 403 with NO_ACCESS message', fakeAsync(() => {
        solarServiceSpy.getConfigs.and.returnValue(of([makeConfig(10, 'Solar-1')]));
        solarServiceSpy.getDailyData.and.returnValue(of([]));
        solarServiceSpy.upsertDailyData.and.returnValue(
            throwError(() => new HttpErrorResponse({ status: 403, error: { error: 'forbidden' } }))
        );
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        const ctrl = row.form.get('generation_kwh');
        ctrl?.setValue(620.5);
        ctrl?.markAsDirty();
        component.onFieldBlur(row);
        tick();
        expect(messageService.add).toHaveBeenCalled();
        const lastCall = messageService.add.calls.mostRecent().args[0];
        expect(lastCall.severity).toBe('error');
        expect(lastCall.detail).toBe('SOLAR_REPORT.NO_ACCESS');
        expect(row.saveStatus).toBe('error');
    }));
});
