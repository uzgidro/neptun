import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { HourlyTabComponent } from './hourly-tab.component';
import { ReservoirFloodService } from '@/core/services/reservoir-flood.service';
import { LevelVolumeService } from '@/core/services/level-volume.service';
import { ReservoirFloodConfig, ReservoirFloodHourlyRecord } from '@/core/interfaces/reservoir-flood';

function makeConfig(orgId: number, name: string): ReservoirFloodConfig {
    return {
        id: orgId, organization_id: orgId, organization_name: name,
        sort_order: orgId, is_active: true, updated_at: '2026-04-25T08:00:00Z'
    };
}

function makeRecord(orgId: number, recordedAt: string, overrides: Partial<ReservoirFloodHourlyRecord> = {}): ReservoirFloodHourlyRecord {
    return {
        id: 100 + orgId, organization_id: orgId, organization_name: 'org',
        recorded_at: recordedAt,
        water_level_m: null, water_volume_mln_m3: null,
        inflow_m3s: null, outflow_m3s: null, ges_flow_m3s: null,
        filtration_m3s: null, idle_discharge_m3s: null,
        duty_name: null, updated_at: recordedAt,
        ...overrides
    };
}

describe('HourlyTabComponent', () => {
    let component: HourlyTabComponent;
    let fixture: ComponentFixture<HourlyTabComponent>;
    let svc: jasmine.SpyObj<ReservoirFloodService>;
    let levelVolume: jasmine.SpyObj<LevelVolumeService>;
    let messageService: jasmine.SpyObj<MessageService>;

    beforeEach(async () => {
        svc = jasmine.createSpyObj('ReservoirFloodService',
            ['getConfigs', 'getHourly', 'upsertHourly', 'upsertConfig', 'deleteConfig']);
        levelVolume = jasmine.createSpyObj('LevelVolumeService', ['getVolume']);
        messageService = jasmine.createSpyObj('MessageService', ['add']);

        svc.getConfigs.and.returnValue(of([]));
        svc.getHourly.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [HourlyTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: ReservoirFloodService, useValue: svc },
                { provide: LevelVolumeService, useValue: levelVolume },
                { provide: MessageService, useValue: messageService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(HourlyTabComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('loads configs and records on init and binds one row per config', fakeAsync(() => {
        const configs = [makeConfig(42, 'Чарвак'), makeConfig(43, 'Тюямуюн')];
        svc.getConfigs.and.returnValue(of(configs));
        svc.getHourly.and.returnValue(of([]));
        fixture.detectChanges();
        tick();
        expect(component.rows.length).toBe(2);
        expect(component.rows[0].config.organization_id).toBe(42);
    }));

    it('buildPayload includes only dirty fields plus organization_id and recorded_at', fakeAsync(() => {
        svc.getConfigs.and.returnValue(of([makeConfig(42, 'Чарвак')]));
        svc.getHourly.and.returnValue(of([]));
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        row.form.get('water_level_m')!.setValue(815.4);
        row.form.get('water_level_m')!.markAsDirty();
        // outflow not touched → must be omitted from payload
        const payload = (component as any).buildPayload(row);
        expect(payload.organization_id).toBe(42);
        expect(payload.recorded_at).toBeTruthy();
        expect(payload.water_level_m).toBe(815.4);
        expect('outflow_m3s' in payload).toBeFalse();
        expect('inflow_m3s' in payload).toBeFalse();
    }));

    it('saveRow posts a single-element array', fakeAsync(() => {
        svc.getConfigs.and.returnValue(of([makeConfig(42, 'Чарвак')]));
        svc.getHourly.and.returnValue(of([]));
        svc.upsertHourly.and.returnValue(of({ status: 'OK' }));
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        row.form.get('water_level_m')!.setValue(815.4);
        row.form.get('water_level_m')!.markAsDirty();
        component.saveRow(row);
        tick();
        expect(svc.upsertHourly).toHaveBeenCalledTimes(1);
        const arg = svc.upsertHourly.calls.mostRecent().args[0];
        expect(Array.isArray(arg)).toBeTrue();
        expect(arg.length).toBe(1);
        expect(arg[0].water_level_m).toBe(815.4);
        expect(row.form.dirty).toBeFalse();
    }));

    it('saveAll posts only dirty rows', fakeAsync(() => {
        svc.getConfigs.and.returnValue(of([makeConfig(42, 'A'), makeConfig(43, 'B')]));
        svc.getHourly.and.returnValue(of([]));
        svc.upsertHourly.and.returnValue(of({ status: 'OK' }));
        fixture.detectChanges();
        tick();
        component.rows[0].form.get('water_level_m')!.setValue(800);
        component.rows[0].form.get('water_level_m')!.markAsDirty();
        // row 1 untouched
        component.saveAll();
        tick();
        const arg = svc.upsertHourly.calls.mostRecent().args[0];
        expect(arg.length).toBe(1);
        expect(arg[0].organization_id).toBe(42);
    }));

    it('400 with details.item_index → toast mentions station name', fakeAsync(() => {
        svc.getConfigs.and.returnValue(of([makeConfig(42, 'Чарвак'), makeConfig(43, 'Тюямуюн')]));
        svc.getHourly.and.returnValue(of([]));
        const err = new HttpErrorResponse({
            status: 400, statusText: 'Bad Request',
            error: { error: 'invalid request', details: { item_index: 1 } }
        });
        svc.upsertHourly.and.returnValue(throwError(() => err));
        fixture.detectChanges();
        tick();
        component.rows[0].form.get('water_level_m')!.setValue(800);
        component.rows[0].form.get('water_level_m')!.markAsDirty();
        component.rows[1].form.get('water_level_m')!.setValue(900);
        component.rows[1].form.get('water_level_m')!.markAsDirty();
        component.saveAll();
        tick();
        const call = messageService.add.calls.mostRecent();
        expect(call.args[0].severity).toBe('error');
        // detail uses station name from row index 1 (Тюямуюн)
        expect(String(call.args[0].detail)).toContain('Тюямуюн');
    }));

    it('403 from upsertHourly → ERROR_FORBIDDEN_ORG toast', fakeAsync(() => {
        svc.getConfigs.and.returnValue(of([makeConfig(42, 'Чарвак')]));
        svc.getHourly.and.returnValue(of([]));
        const err = new HttpErrorResponse({
            status: 403, statusText: 'Forbidden',
            error: { error: 'access to target organization denied' }
        });
        svc.upsertHourly.and.returnValue(throwError(() => err));
        fixture.detectChanges();
        tick();
        component.rows[0].form.get('water_level_m')!.setValue(800);
        component.rows[0].form.get('water_level_m')!.markAsDirty();
        component.saveAll();
        tick();
        const call = messageService.add.calls.mostRecent();
        expect(call.args[0].severity).toBe('error');
        expect(String(call.args[0].detail)).toContain('RESERVOIR_FLOOD.ERROR_FORBIDDEN_ORG');
    }));

    it('binds existing record values when getHourly returns matching row', fakeAsync(() => {
        svc.getConfigs.and.returnValue(of([makeConfig(42, 'Чарвак')]));
        // Pick the same hour the component selects by default
        const now = new Date();
        now.setHours(now.getHours(), 0, 0, 0);
        const recordedAt = now.toISOString();
        svc.getHourly.and.returnValue(of([
            makeRecord(42, recordedAt, { water_level_m: 815.4, duty_name: 'Иванов' })
        ]));
        fixture.detectChanges();
        tick();
        const row = component.rows[0];
        expect(row.form.get('water_level_m')!.value).toBe(815.4);
        expect(row.form.get('duty_name')!.value).toBe('Иванов');
        expect(row.form.dirty).toBeFalse();
    }));
});
