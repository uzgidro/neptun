import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ShutdownDischargeComponent } from './shutdown-discharge.component';
import { TimeService } from '@/core/services/time.service';
import { DischargeService } from '@/core/services/discharge.service';
import { OrganizationService } from '@/core/services/organization.service';
import { AuthService } from '@/core/services/auth.service';
import { ScService } from '@/core/services/sc.service';
import { GesReportService } from '@/core/services/ges-report.service';

describe('ShutdownDischargeComponent - 409 Conflict handling', () => {
    let component: ShutdownDischargeComponent;
    let fixture: ComponentFixture<ShutdownDischargeComponent>;
    let dischargeService: jasmine.SpyObj<DischargeService>;
    let messageService: jasmine.SpyObj<MessageService>;
    let translateService: TranslateService;

    beforeEach(async () => {
        const dischargeSpy = jasmine.createSpyObj('DischargeService', [
            'addDischarge', 'getFlatDischarges', 'editDischarge', 'deleteDischarge'
        ]);
        dischargeSpy.getFlatDischarges.and.returnValue(of([]));

        const orgSpy = jasmine.createSpyObj('OrganizationService', ['getCascades']);
        orgSpy.getCascades.and.returnValue(of([]));

        const authSpy = jasmine.createSpyObj('AuthService', ['hasPermission', 'isSc']);
        authSpy.hasPermission.and.returnValue(true);
        authSpy.isSc.and.returnValue(true);

        const scSpy = jasmine.createSpyObj('ScService', ['downloadScReport']);

        const gesReportSpy = jasmine.createSpyObj('GesReportService', ['getConfigs']);
        gesReportSpy.getConfigs.and.returnValue(of([]));

        const msgSpy = jasmine.createSpyObj('MessageService', ['add']);

        await TestBed.configureTestingModule({
            imports: [ShutdownDischargeComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: DischargeService, useValue: dischargeSpy },
                { provide: OrganizationService, useValue: orgSpy },
                { provide: AuthService, useValue: authSpy },
                { provide: ScService, useValue: scSpy },
                { provide: GesReportService, useValue: gesReportSpy },
                { provide: MessageService, useValue: msgSpy },
                { provide: ActivatedRoute, useValue: { queryParams: of({}), snapshot: { queryParamMap: { get: () => null } } } },
                { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
                { provide: TimeService, useValue: { getServerDate: () => of(new Date()) } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ShutdownDischargeComponent);
        component = fixture.componentInstance;
        dischargeService = TestBed.inject(DischargeService) as jasmine.SpyObj<DischargeService>;
        messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
        translateService = TestBed.inject(TranslateService);

        fixture.detectChanges();
    });

    function setupValidForm(): void {
        component.form.patchValue({
            organization: { id: 1, name: 'Test Org' },
            started_at: new Date('2026-04-01'),
            flow_rate: 10,
            reason: 'Тестовая причина'
        });
    }

    function make409Error(errorMessage: string): HttpErrorResponse {
        return new HttpErrorResponse({
            status: 409,
            statusText: 'Conflict',
            error: { error: errorMessage }
        });
    }

    function make500Error(): HttpErrorResponse {
        return new HttpErrorResponse({
            status: 500,
            statusText: 'Internal Server Error',
            error: { message: 'Server error' }
        });
    }

    it('should show confirm dialog on 409 and retry with force=true when user confirms', () => {
        setupValidForm();
        component.isEditMode = false;

        const conflictMsg = 'Для данной организации уже существует незавершенный холостой сброс';
        dischargeService.addDischarge.and.returnValues(
            throwError(() => make409Error(conflictMsg)),
            of({})
        );

        spyOn(window, 'confirm').and.returnValue(true);

        component.onSubmit();

        expect(window.confirm).toHaveBeenCalled();
        expect(dischargeService.addDischarge).toHaveBeenCalledTimes(2);
        // Second call should have force=true
        const secondCallArgs = dischargeService.addDischarge.calls.argsFor(1);
        expect(secondCallArgs[1]).toBeTrue();
        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'success' })
        );
    });

    it('should reset isLoading and keep form open when user cancels on 409', () => {
        setupValidForm();
        component.isEditMode = false;
        component.isFormOpen = true;

        dischargeService.addDischarge.and.returnValue(
            throwError(() => make409Error('Conflict'))
        );

        spyOn(window, 'confirm').and.returnValue(false);

        component.onSubmit();

        expect(window.confirm).toHaveBeenCalled();
        expect(dischargeService.addDischarge).toHaveBeenCalledTimes(1);
        expect(component.isLoading).toBeFalse();
        expect(component.isFormOpen).toBeTrue();
        expect(component.submitted).toBeFalse();
    });

    it('should show error toast on non-409 error without confirm dialog', () => {
        setupValidForm();
        component.isEditMode = false;
        component.isFormOpen = true;

        dischargeService.addDischarge.and.returnValue(
            throwError(() => make500Error())
        );

        spyOn(window, 'confirm');

        component.onSubmit();

        expect(window.confirm).not.toHaveBeenCalled();
        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'error' })
        );
        expect(component.isLoading).toBeFalse();
    });

    it('should use backend error message in confirm dialog', () => {
        setupValidForm();
        component.isEditMode = false;

        const backendMsg = 'Для данной организации уже существует незавершенный холостой сброс';
        dischargeService.addDischarge.and.returnValue(
            throwError(() => make409Error(backendMsg))
        );

        spyOn(window, 'confirm').and.returnValue(false);

        component.onSubmit();

        const confirmArg = (window.confirm as jasmine.Spy).calls.argsFor(0)[0];
        expect(confirmArg).toContain(backendMsg);
    });

    it('should show error toast if force retry also fails', () => {
        setupValidForm();
        component.isEditMode = false;

        dischargeService.addDischarge.and.returnValues(
            throwError(() => make409Error('Conflict')),
            throwError(() => make500Error())
        );

        spyOn(window, 'confirm').and.returnValue(true);

        component.onSubmit();

        expect(dischargeService.addDischarge).toHaveBeenCalledTimes(2);
        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'error' })
        );
        expect(component.isLoading).toBeFalse();
    });
});

describe('ShutdownDischargeComponent - station ordering', () => {
    let component: ShutdownDischargeComponent;
    let fixture: ComponentFixture<ShutdownDischargeComponent>;
    let dischargeService: jasmine.SpyObj<DischargeService>;
    let gesReportService: jasmine.SpyObj<GesReportService>;

    function makeDischarge(id: number, orgId: number, orgName: string, startedAt: string): any {
        return {
            id,
            organization: { id: orgId, name: orgName },
            started_at: startedAt,
            ended_at: null,
            flow_rate: 1, total_volume: 1, reason: '',
            files: [], created_by: { id: 1, name: 'Tester' }
        };
    }

    function makeConfig(orgId: number, sortOrder: number): any {
        return {
            id: orgId, organization_id: orgId, organization_name: `Org-${orgId}`,
            cascade_id: 1, cascade_name: 'Cascade',
            installed_capacity_mwt: 0, total_aggregates: 0,
            has_reservoir: false, sort_order: sortOrder,
            max_daily_production_mln_kwh: 0
        };
    }

    beforeEach(async () => {
        const dischargeSpy = jasmine.createSpyObj('DischargeService',
            ['addDischarge', 'getFlatDischarges', 'editDischarge', 'deleteDischarge']);
        const orgSpy = jasmine.createSpyObj('OrganizationService', ['getCascades']);
        orgSpy.getCascades.and.returnValue(of([]));
        const authSpy = jasmine.createSpyObj('AuthService', ['hasPermission', 'isSc']);
        authSpy.hasPermission.and.returnValue(true);
        authSpy.isSc.and.returnValue(true);
        const scSpy = jasmine.createSpyObj('ScService', ['downloadScReport']);
        const gesReportSpy = jasmine.createSpyObj('GesReportService', ['getConfigs']);
        const msgSpy = jasmine.createSpyObj('MessageService', ['add']);

        await TestBed.configureTestingModule({
            imports: [ShutdownDischargeComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: DischargeService, useValue: dischargeSpy },
                { provide: OrganizationService, useValue: orgSpy },
                { provide: AuthService, useValue: authSpy },
                { provide: ScService, useValue: scSpy },
                { provide: GesReportService, useValue: gesReportSpy },
                { provide: MessageService, useValue: msgSpy },
                { provide: ActivatedRoute, useValue: { queryParams: of({}), snapshot: { queryParamMap: { get: () => null } } } },
                { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
                { provide: TimeService, useValue: { getServerDate: () => of(new Date()) } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ShutdownDischargeComponent);
        component = fixture.componentInstance;
        dischargeService = TestBed.inject(DischargeService) as jasmine.SpyObj<DischargeService>;
        gesReportService = TestBed.inject(GesReportService) as jasmine.SpyObj<GesReportService>;
    });

    it('attaches configSortKey from ges_config and MAX_SAFE_INTEGER for unconfigured stations', () => {
        dischargeService.getFlatDischarges.and.returnValue(of([
            makeDischarge(1, 10, 'Charvak', '2026-04-01T08:00:00Z'),
            makeDischarge(2, 99, 'Unknown', '2026-04-01T09:00:00Z')
        ]));
        gesReportService.getConfigs.and.returnValue(of([makeConfig(10, 5)]));

        fixture.detectChanges();

        expect(component.discharges[0].configSortKey).toBe(5);
        expect(component.discharges[1].configSortKey).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('customSort orders by configSortKey ascending', () => {
        component.discharges = [
            { ...makeDischarge(1, 10, 'B', '2026-04-01T00:00:00Z'), configSortKey: 5 },
            { ...makeDischarge(2, 20, 'A', '2026-04-01T00:00:00Z'), configSortKey: 1 },
            { ...makeDischarge(3, 30, 'C', '2026-04-01T00:00:00Z'), configSortKey: 3 }
        ];
        const event: any = { data: component.discharges };

        component.customSort(event);

        expect(component.discharges.map(d => d.id)).toEqual([2, 3, 1]);
    });

    it('customSort tie-breaks equal configSortKey by organization name (subheader stays grouped)', () => {
        // Two unconfigured stations both at MAX_SAFE_INTEGER. Without name tie-break
        // their rows would interleave by started_at and split the subheader.
        const MAX = Number.MAX_SAFE_INTEGER;
        component.discharges = [
            { ...makeDischarge(1, 99, 'Beta',  '2026-04-01T08:00:00Z'), configSortKey: MAX },
            { ...makeDischarge(2, 88, 'Alpha', '2026-04-01T09:00:00Z'), configSortKey: MAX },
            { ...makeDischarge(3, 99, 'Beta',  '2026-04-01T10:00:00Z'), configSortKey: MAX },
            { ...makeDischarge(4, 88, 'Alpha', '2026-04-01T11:00:00Z'), configSortKey: MAX }
        ];
        const event: any = { data: component.discharges };

        component.customSort(event);

        // Alpha rows must come consecutively, then Beta rows consecutively.
        expect(component.discharges.map(d => d.organization.name)).toEqual(['Alpha', 'Alpha', 'Beta', 'Beta']);
        // Within each station, ordered by started_at.
        expect(component.discharges.map(d => d.id)).toEqual([2, 4, 1, 3]);
    });
});

describe('ShutdownDischargeComponent - expandable completed periods', () => {
    let component: ShutdownDischargeComponent;
    let fixture: ComponentFixture<ShutdownDischargeComponent>;
    let dischargeService: jasmine.SpyObj<DischargeService>;

    function makeDischarge(
        id: number,
        orgId: number,
        orgName: string,
        startedAt: string,
        endedAt: string | null
    ): any {
        return {
            id,
            organization: { id: orgId, name: orgName },
            started_at: startedAt,
            ended_at: endedAt,
            flow_rate: 1, total_volume: 1, reason: '',
            files: [], created_by: { id: 1, name: 'Tester' }
        };
    }

    // Fixture:
    // A (id=1, 'Чарвак'): 3 completed (04:00, 06:00, 08:00) + 1 ongoing
    // B (id=2, 'Гиссарак'): 1 completed
    // C (id=3, 'Андижан'): 1 ongoing
    // D (id=4, 'ГЭС-4'): 2 completed (05:00, 07:00), 0 ongoing
    // E (id=5, 'ГЭС-18'): 3 completed (04:00, 09:00, 11:55), 0 ongoing
    const fixtureData = [
        // A
        makeDischarge(101, 1, 'Чарвак', '2026-04-01T04:00:00Z', '2026-04-01T05:00:00Z'),
        makeDischarge(102, 1, 'Чарвак', '2026-04-01T06:00:00Z', '2026-04-01T07:00:00Z'),
        makeDischarge(103, 1, 'Чарвак', '2026-04-01T08:00:00Z', '2026-04-01T09:00:00Z'),
        makeDischarge(104, 1, 'Чарвак', '2026-04-01T10:00:00Z', null),
        // B
        makeDischarge(201, 2, 'Гиссарак', '2026-04-01T05:00:00Z', '2026-04-01T06:00:00Z'),
        // C
        makeDischarge(301, 3, 'Андижан', '2026-04-01T08:00:00Z', null),
        // D
        makeDischarge(401, 4, 'ГЭС-4', '2026-04-01T05:00:00Z', '2026-04-01T06:00:00Z'),
        makeDischarge(402, 4, 'ГЭС-4', '2026-04-01T07:00:00Z', '2026-04-01T08:00:00Z'),
        // E
        makeDischarge(501, 5, 'ГЭС-18', '2026-04-01T04:00:00Z', '2026-04-01T05:00:00Z'),
        makeDischarge(502, 5, 'ГЭС-18', '2026-04-01T09:00:00Z', '2026-04-01T10:00:00Z'),
        makeDischarge(503, 5, 'ГЭС-18', '2026-04-01T11:55:00Z', '2026-04-01T12:30:00Z')
    ];

    beforeEach(async () => {
        const dischargeSpy = jasmine.createSpyObj('DischargeService',
            ['addDischarge', 'getFlatDischarges', 'editDischarge', 'deleteDischarge']);
        dischargeSpy.getFlatDischarges.and.returnValue(of(fixtureData));

        const orgSpy = jasmine.createSpyObj('OrganizationService', ['getCascades']);
        orgSpy.getCascades.and.returnValue(of([]));
        const authSpy = jasmine.createSpyObj('AuthService', ['hasPermission', 'isSc']);
        authSpy.hasPermission.and.returnValue(true);
        authSpy.isSc.and.returnValue(true);
        const scSpy = jasmine.createSpyObj('ScService', ['downloadScReport']);
        const gesReportSpy = jasmine.createSpyObj('GesReportService', ['getConfigs']);
        gesReportSpy.getConfigs.and.returnValue(of([]));
        const msgSpy = jasmine.createSpyObj('MessageService', ['add']);

        await TestBed.configureTestingModule({
            imports: [ShutdownDischargeComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: DischargeService, useValue: dischargeSpy },
                { provide: OrganizationService, useValue: orgSpy },
                { provide: AuthService, useValue: authSpy },
                { provide: ScService, useValue: scSpy },
                { provide: GesReportService, useValue: gesReportSpy },
                { provide: MessageService, useValue: msgSpy },
                { provide: ActivatedRoute, useValue: { queryParams: of({}), snapshot: { queryParamMap: { get: () => null } } } },
                { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
                { provide: TimeService, useValue: { getServerDate: () => of(new Date()) } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ShutdownDischargeComponent);
        component = fixture.componentInstance;
        dischargeService = TestBed.inject(DischargeService) as jasmine.SpyObj<DischargeService>;

        fixture.detectChanges();
    });

    it('getHiddenCount returns all completed when station has ongoing', () => {
        // A: 3 completed + 1 ongoing → all 3 completed get hidden
        expect(component.getHiddenCount(1)).toBe(3);
    });

    it('getHiddenCount returns completed minus 1 when no ongoing', () => {
        // E: 3 completed, 0 ongoing → 3 - 1 = 2 hidden (last completed stays)
        expect(component.getHiddenCount(5)).toBe(2);
    });

    it('getHiddenCount returns 0 when station has only 1 completed and no ongoing', () => {
        // B: 1 completed, 0 ongoing → 0 hidden
        expect(component.getHiddenCount(2)).toBe(0);
    });

    it('isRowHidden hides completed when station has ongoing', () => {
        const aCompleted = component.discharges.find(d => d.id === 101)!;
        const aOngoing = component.discharges.find(d => d.id === 104)!;
        expect(component.isRowHidden(aCompleted)).toBeTrue();
        expect(component.isRowHidden(aOngoing)).toBeFalse();
    });

    it('isRowHidden keeps last completed visible when no ongoing and >= 3 completed', () => {
        // E: max started_at is 11:55 → id 503 visible; others (501, 502) hidden
        const eLast = component.discharges.find(d => d.id === 503)!;
        const eOther1 = component.discharges.find(d => d.id === 501)!;
        const eOther2 = component.discharges.find(d => d.id === 502)!;
        expect(component.isRowHidden(eLast)).toBeFalse();
        expect(component.isRowHidden(eOther1)).toBeTrue();
        expect(component.isRowHidden(eOther2)).toBeTrue();
    });

    it('isRowHidden keeps both visible when no ongoing and 2 completed', () => {
        // D: 2 completed, would hide only 1 → below threshold, no hiding
        const d1 = component.discharges.find(d => d.id === 401)!;
        const d2 = component.discharges.find(d => d.id === 402)!;
        expect(component.isRowHidden(d1)).toBeFalse();
        expect(component.isRowHidden(d2)).toBeFalse();
    });

    it('isRowHidden keeps the only completed visible when 1 completed and no ongoing', () => {
        // B: 1 completed only → nothing to hide
        const b = component.discharges.find(d => d.id === 201)!;
        expect(component.isRowHidden(b)).toBeFalse();
    });

    it('isRowHidden returns false for all rows after toggleOrgExpansion', () => {
        // E rows initially have some hidden; after expansion, none are hidden
        component.toggleOrgExpansion(5);
        const eRows = component.discharges.filter(d => d.organization.id === 5);
        for (const row of eRows) {
            expect(component.isRowHidden(row)).toBeFalse();
        }
    });

    it('loadDischarges resets expandedOrgIds', () => {
        // Expand a station, then reload — set should be cleared.
        component.toggleOrgExpansion(5);
        expect(component.expandedOrgIds.has(5)).toBeTrue();

        component.loadDischarges();

        expect(component.expandedOrgIds.size).toBe(0);
    });
});

