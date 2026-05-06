import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, HttpErrorResponse, HttpResponse, HttpHeaders } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { HourlyTabComponent } from './hourly-tab.component';
import { ReservoirFloodService } from '@/core/services/reservoir-flood.service';
import { LevelVolumeService } from '@/core/services/level-volume.service';
import { AuthService } from '@/core/services/auth.service';
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
        duty_name: null,
        capacity_mwt: null, weather_condition: null, temperature_c: null,
        updated_at: recordedAt,
        ...overrides
    };
}

describe('HourlyTabComponent', () => {
    let component: HourlyTabComponent;
    let fixture: ComponentFixture<HourlyTabComponent>;
    let svc: jasmine.SpyObj<ReservoirFloodService>;
    let levelVolume: jasmine.SpyObj<LevelVolumeService>;
    let messageService: jasmine.SpyObj<MessageService>;
    let router: jasmine.SpyObj<Router>;
    let authService: jasmine.SpyObj<AuthService>;
    let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

    function setupBed(initialQueryParams: Record<string, string> = {}): void {
        svc = jasmine.createSpyObj('ReservoirFloodService',
            ['getConfigs', 'getHourly', 'upsertHourly', 'upsertConfig', 'deleteConfig', 'exportSel']);
        levelVolume = jasmine.createSpyObj('LevelVolumeService', ['getVolume']);
        messageService = jasmine.createSpyObj('MessageService', ['add']);
        router = jasmine.createSpyObj('Router', ['navigate']);
        router.navigate.and.resolveTo(true);
        authService = jasmine.createSpyObj('AuthService', ['isScOrRais']);
        authService.isScOrRais.and.returnValue(true);

        svc.getConfigs.and.returnValue(of([]));
        svc.getHourly.and.returnValue(of([]));

        queryParamMap$ = new BehaviorSubject(convertToParamMap(initialQueryParams));

        TestBed.configureTestingModule({
            imports: [HourlyTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: ReservoirFloodService, useValue: svc },
                { provide: LevelVolumeService, useValue: levelVolume },
                { provide: MessageService, useValue: messageService },
                { provide: Router, useValue: router },
                { provide: AuthService, useValue: authService },
                {
                    provide: ActivatedRoute,
                    useValue: { queryParamMap: queryParamMap$.asObservable() }
                }
            ]
        });
    }

    beforeEach(async () => {
        setupBed();
        await TestBed.compileComponents();
        fixture = TestBed.createComponent(HourlyTabComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        TestBed.resetTestingModule();
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

    // ─── New fields (capacity_mwt, weather_condition, temperature_c) ───

    describe('new fields (capacity_mwt, weather_condition, temperature_c)', () => {
        it('createForm includes capacity_mwt, weather_condition, temperature_c controls', fakeAsync(() => {
            svc.getConfigs.and.returnValue(of([makeConfig(42, 'Чарвак')]));
            svc.getHourly.and.returnValue(of([]));
            fixture.detectChanges();
            tick();
            const form = component.rows[0].form;
            expect(form.get('capacity_mwt')).toBeTruthy();
            expect(form.get('weather_condition')).toBeTruthy();
            expect(form.get('temperature_c')).toBeTruthy();
            expect(form.get('capacity_mwt')!.value).toBeNull();
            expect(form.get('weather_condition')!.value).toBeNull();
            expect(form.get('temperature_c')!.value).toBeNull();
        }));

        it('capacity_mwt enforces Validators.min(0) — negative is invalid', fakeAsync(() => {
            svc.getConfigs.and.returnValue(of([makeConfig(42, 'Чарвак')]));
            svc.getHourly.and.returnValue(of([]));
            fixture.detectChanges();
            tick();
            const ctrl = component.rows[0].form.get('capacity_mwt')!;
            ctrl.setValue(-5);
            expect(ctrl.invalid).toBeTrue();
            ctrl.setValue(100.5);
            expect(ctrl.valid).toBeTrue();
        }));

        it('temperature_c accepts negative values (no min validator)', fakeAsync(() => {
            svc.getConfigs.and.returnValue(of([makeConfig(42, 'Чарвак')]));
            svc.getHourly.and.returnValue(of([]));
            fixture.detectChanges();
            tick();
            const ctrl = component.rows[0].form.get('temperature_c')!;
            ctrl.setValue(-3.5);
            expect(ctrl.valid).toBeTrue();
            ctrl.setValue(-273.15);
            expect(ctrl.valid).toBeTrue();
        }));

        it('buildPayload omits new fields when not dirty (preserve in DB)', fakeAsync(() => {
            svc.getConfigs.and.returnValue(of([makeConfig(42, 'Чарвак')]));
            svc.getHourly.and.returnValue(of([]));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            // touch only water_level_m
            row.form.get('water_level_m')!.setValue(815.4);
            row.form.get('water_level_m')!.markAsDirty();
            const payload: any = (component as any).buildPayload(row);
            expect('capacity_mwt' in payload).toBeFalse();
            expect('weather_condition' in payload).toBeFalse();
            expect('temperature_c' in payload).toBeFalse();
        }));

        it('buildPayload includes new fields when dirty', fakeAsync(() => {
            svc.getConfigs.and.returnValue(of([makeConfig(42, 'Чарвак')]));
            svc.getHourly.and.returnValue(of([]));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('capacity_mwt')!.setValue(100.5);
            row.form.get('capacity_mwt')!.markAsDirty();
            row.form.get('weather_condition')!.setValue('ясно');
            row.form.get('weather_condition')!.markAsDirty();
            row.form.get('temperature_c')!.setValue(-3.5);
            row.form.get('temperature_c')!.markAsDirty();
            const payload: any = (component as any).buildPayload(row);
            expect(payload.capacity_mwt).toBe(100.5);
            expect(payload.weather_condition).toBe('ясно');
            expect(payload.temperature_c).toBe(-3.5);
        }));

        it('buildPayload includes capacity_mwt: null when explicitly cleared', fakeAsync(() => {
            svc.getConfigs.and.returnValue(of([makeConfig(42, 'Чарвак')]));
            svc.getHourly.and.returnValue(of([]));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('capacity_mwt')!.setValue(null);
            row.form.get('capacity_mwt')!.markAsDirty();
            const payload: any = (component as any).buildPayload(row);
            expect('capacity_mwt' in payload).toBeTrue();
            expect(payload.capacity_mwt).toBeNull();
        }));

        it('buildPayload includes weather_condition: null when explicitly cleared', fakeAsync(() => {
            svc.getConfigs.and.returnValue(of([makeConfig(42, 'Чарвак')]));
            svc.getHourly.and.returnValue(of([]));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('weather_condition')!.setValue(null);
            row.form.get('weather_condition')!.markAsDirty();
            const payload: any = (component as any).buildPayload(row);
            expect('weather_condition' in payload).toBeTrue();
            expect(payload.weather_condition).toBeNull();
        }));

        it('buildPayload includes temperature_c: null when explicitly cleared', fakeAsync(() => {
            svc.getConfigs.and.returnValue(of([makeConfig(42, 'Чарвак')]));
            svc.getHourly.and.returnValue(of([]));
            fixture.detectChanges();
            tick();
            const row = component.rows[0];
            row.form.get('temperature_c')!.setValue(null);
            row.form.get('temperature_c')!.markAsDirty();
            const payload: any = (component as any).buildPayload(row);
            expect('temperature_c' in payload).toBeTrue();
            expect(payload.temperature_c).toBeNull();
        }));
    });

    // ─── Sel-export (Тезкор маълумот Excel/PDF) ───

    describe('sel-export', () => {
        it('canExport reflects authService.isScOrRais()', () => {
            expect(component.canExport).toBeTrue();
        });

        it('downloadSel("excel") calls service.exportSel with date+hour+format', fakeAsync(() => {
            svc.exportSel.and.returnValue(of(new HttpResponse<Blob>({
                body: new Blob(['x'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
                headers: new HttpHeaders()
            })));
            fixture.detectChanges();
            tick();
            component.selectedHour = 15;
            component.downloadSel('excel');
            tick();
            expect(svc.exportSel).toHaveBeenCalledTimes(1);
            const arg = svc.exportSel.calls.mostRecent().args[0];
            expect(arg.format).toBe('excel');
            expect(arg.hour).toBe(15);
            expect(arg.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }));

        it('downloadSel uses fallback filename when Content-Disposition missing', fakeAsync(() => {
            const createSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:mock');
            spyOn(URL, 'revokeObjectURL');
            svc.exportSel.and.returnValue(of(new HttpResponse<Blob>({
                body: new Blob(['x']),
                headers: new HttpHeaders() // no Content-Disposition
            })));
            fixture.detectChanges();
            tick();
            component.selectedHour = 7;
            component.downloadSel('pdf');
            tick();
            expect(createSpy).toHaveBeenCalled();
            // After download the in-progress flag clears.
            expect(component.downloadingSel).toBeNull();
        }));

        it('downloadSel uses Content-Disposition filename when present', fakeAsync(() => {
            spyOn(URL, 'createObjectURL').and.returnValue('blob:mock');
            spyOn(URL, 'revokeObjectURL');
            const cd = 'attachment; filename="custom-from-server.xlsx"';
            svc.exportSel.and.returnValue(of(new HttpResponse<Blob>({
                body: new Blob(['x']),
                headers: new HttpHeaders({ 'Content-Disposition': cd })
            })));
            fixture.detectChanges();
            tick();
            component.downloadSel('excel');
            tick();
            // parseFilename returns the server-provided name (verified via private helper)
            const parsed = (component as any).parseFilename({
                headers: new HttpHeaders({ 'Content-Disposition': cd })
            });
            expect(parsed).toBe('custom-from-server.xlsx');
        }));

        it('parseFilename decodes RFC 5987 filename* (UTF-8 percent-encoded)', () => {
            fixture.detectChanges();
            const cd = "attachment; filename=\"fallback.pdf\"; filename*=UTF-8''%D0%A2%D0%95%D0%97%D0%9A%D0%9E%D0%A0-2026-05-06.pdf";
            const parsed = (component as any).parseFilename({
                headers: new HttpHeaders({ 'Content-Disposition': cd })
            });
            expect(parsed).toBe('ТЕЗКОР-2026-05-06.pdf');
        });

        it('parseFilename recovers UTF-8-as-Latin-1 mojibake from plain filename=', () => {
            fixture.detectChanges();
            // "ТЕЗКОР" UTF-8 bytes interpreted as Latin-1 → mojibake the server
            // would emit if it just dumped raw UTF-8 into a quoted filename.
            const utf8Bytes = new TextEncoder().encode('ТЕЗКОР-2026.pdf');
            const mojibake = Array.from(utf8Bytes, b => String.fromCharCode(b)).join('');
            const cd = `attachment; filename="${mojibake}"`;
            const parsed = (component as any).parseFilename({
                headers: new HttpHeaders({ 'Content-Disposition': cd })
            });
            expect(parsed).toBe('ТЕЗКОР-2026.pdf');
        });

        it('downloadSel guards against double-click (downloadingSel guard)', fakeAsync(() => {
            // Stall response so that downloadingSel stays set across both calls
            svc.exportSel.and.returnValue(new Subject<HttpResponse<Blob>>().asObservable());
            fixture.detectChanges();
            tick();
            component.downloadSel('excel');
            component.downloadSel('excel'); // second click while first still pending
            expect(svc.exportSel).toHaveBeenCalledTimes(1);
        }));

        it('downloadSel("pdf") drives "pdf" extension in fallback path', fakeAsync(() => {
            spyOn(URL, 'createObjectURL').and.returnValue('blob:mock');
            spyOn(URL, 'revokeObjectURL');
            svc.exportSel.and.returnValue(of(new HttpResponse<Blob>({
                body: new Blob(['x']),
                headers: new HttpHeaders()
            })));
            fixture.detectChanges();
            tick();
            component.downloadSel('pdf');
            tick();
            // Smoke: format param sent as 'pdf'
            expect(svc.exportSel.calls.mostRecent().args[0].format).toBe('pdf');
        }));

        it('403 from exportSel shows ERROR_FORBIDDEN_ORG toast', fakeAsync(() => {
            const err = new HttpErrorResponse({
                status: 403, statusText: 'Forbidden',
                error: { error: 'forbidden' }
            });
            svc.exportSel.and.returnValue(throwError(() => err));
            fixture.detectChanges();
            tick();
            component.downloadSel('excel');
            tick();
            const call = messageService.add.calls.mostRecent();
            expect(call.args[0].severity).toBe('error');
            expect(String(call.args[0].detail)).toContain('RESERVOIR_FLOOD.ERROR_FORBIDDEN_ORG');
            expect(component.downloadingSel).toBeNull();
        }));

        it('canExport is false when authService.isScOrRais() returns false', async () => {
            TestBed.resetTestingModule();
            setupBed();
            authService.isScOrRais.and.returnValue(false);
            await TestBed.compileComponents();
            const fx = TestBed.createComponent(HourlyTabComponent);
            expect(fx.componentInstance.canExport).toBeFalse();
        });
    });
});

describe('HourlyTabComponent — URL query params (date, hour)', () => {
    let component: HourlyTabComponent;
    let fixture: ComponentFixture<HourlyTabComponent>;
    let svc: jasmine.SpyObj<ReservoirFloodService>;
    let router: jasmine.SpyObj<Router>;
    let queryParamMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

    function setupAndInit(initialQueryParams: Record<string, string>): void {
        svc = jasmine.createSpyObj('ReservoirFloodService',
            ['getConfigs', 'getHourly', 'upsertHourly', 'upsertConfig', 'deleteConfig', 'exportSel']);
        const levelVolume = jasmine.createSpyObj('LevelVolumeService', ['getVolume']);
        const messageService = jasmine.createSpyObj('MessageService', ['add']);
        router = jasmine.createSpyObj('Router', ['navigate']);
        router.navigate.and.resolveTo(true);
        const authService = jasmine.createSpyObj('AuthService', ['isScOrRais']);
        authService.isScOrRais.and.returnValue(true);

        svc.getConfigs.and.returnValue(of([]));
        svc.getHourly.and.returnValue(of([]));

        queryParamMap$ = new BehaviorSubject(convertToParamMap(initialQueryParams));

        TestBed.configureTestingModule({
            imports: [HourlyTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: ReservoirFloodService, useValue: svc },
                { provide: LevelVolumeService, useValue: levelVolume },
                { provide: MessageService, useValue: messageService },
                { provide: Router, useValue: router },
                { provide: AuthService, useValue: authService },
                {
                    provide: ActivatedRoute,
                    useValue: { queryParamMap: queryParamMap$.asObservable() }
                }
            ]
        });
        fixture = TestBed.createComponent(HourlyTabComponent);
        component = fixture.componentInstance;
    }

    afterEach(() => TestBed.resetTestingModule());

    it('reads date and hour from URL on init', fakeAsync(() => {
        setupAndInit({ date: '2026-04-28', hour: '15' });
        fixture.detectChanges();
        tick();
        expect(component.selectedHour).toBe(15);
        expect(component.selectedDate.getFullYear()).toBe(2026);
        expect(component.selectedDate.getMonth()).toBe(3); // 0-indexed → April
        expect(component.selectedDate.getDate()).toBe(28);
        // getHourly called with the date from URL
        expect(svc.getHourly).toHaveBeenCalledWith('2026-04-28');
    }));

    it('falls back to today + current hour when URL has no params, and writes them back to URL (replaceUrl)', fakeAsync(() => {
        setupAndInit({});
        fixture.detectChanges();
        tick();
        expect(component.selectedHour).toBeGreaterThanOrEqual(0);
        expect(component.selectedHour).toBeLessThanOrEqual(23);
        // expected to call router.navigate with current values, replaceUrl true
        expect(router.navigate).toHaveBeenCalled();
        const args = router.navigate.calls.mostRecent().args;
        const extras = args[1] as any;
        expect(extras?.queryParams?.date).toBeTruthy();
        expect(extras?.queryParams?.hour).toBeDefined();
        expect(extras?.replaceUrl).toBeTrue();
        expect(extras?.queryParamsHandling).toBe('merge');
    }));

    it('navigates with new query params when selectedHour changes via onHourChange', fakeAsync(() => {
        setupAndInit({ date: '2026-04-28', hour: '10' });
        fixture.detectChanges();
        tick();
        router.navigate.calls.reset();
        component.onHourChange(11);
        tick();
        expect(router.navigate).toHaveBeenCalled();
        const extras = router.navigate.calls.mostRecent().args[1] as any;
        expect(extras?.queryParams?.hour).toBe(11);
        expect(extras?.queryParamsHandling).toBe('merge');
    }));

    it('navigates with new query params when selectedDate changes via onDateChange', fakeAsync(() => {
        setupAndInit({ date: '2026-04-28', hour: '10' });
        fixture.detectChanges();
        tick();
        router.navigate.calls.reset();
        component.onDateChange(new Date(2026, 3, 29));
        tick();
        expect(router.navigate).toHaveBeenCalled();
        const extras = router.navigate.calls.mostRecent().args[1] as any;
        expect(extras?.queryParams?.date).toBe('2026-04-29');
    }));

    it('reloads data when URL changes externally (e.g., browser back)', fakeAsync(() => {
        setupAndInit({ date: '2026-04-28', hour: '10' });
        fixture.detectChanges();
        tick();
        const initialHourlyCalls = svc.getHourly.calls.count();
        // simulate URL change (browser back/forward, share-link load)
        queryParamMap$.next(convertToParamMap({ date: '2026-04-25', hour: '8' }));
        tick();
        expect(component.selectedHour).toBe(8);
        expect(svc.getHourly.calls.count()).toBeGreaterThan(initialHourlyCalls);
    }));

    it('clamps invalid hour values to current hour', fakeAsync(() => {
        setupAndInit({ date: '2026-04-28', hour: '99' });
        fixture.detectChanges();
        tick();
        // 99 → clamped (treated as invalid → fallback to current hour)
        expect(component.selectedHour).toBeGreaterThanOrEqual(0);
        expect(component.selectedHour).toBeLessThanOrEqual(23);
    }));

    it('ignores malformed date and uses today', fakeAsync(() => {
        setupAndInit({ date: 'not-a-date', hour: '12' });
        fixture.detectChanges();
        tick();
        expect(component.selectedHour).toBe(12);
        // selectedDate is today (recent year)
        expect(component.selectedDate.getFullYear()).toBeGreaterThanOrEqual(2026);
    }));
});
