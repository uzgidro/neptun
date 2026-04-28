import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';
import { cascadeOnlyGuard, gesReportGuard, raisGuard, reservoirDutyOnlyGuard } from './auth.guard';

describe('gesReportGuard', () => {
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole']);
        routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });
    });

    const run = () =>
        TestBed.runInInjectionContext(() => gesReportGuard({} as any, {} as any));

    it('allows sc', () => {
        authServiceSpy.hasRole.and.returnValue(true);
        expect(run()).toBeTrue();
    });

    it('allows cascade', () => {
        authServiceSpy.hasRole.and.callFake((r: string | string[]) =>
            Array.isArray(r) ? r.includes('cascade') : r === 'cascade'
        );
        expect(run()).toBeTrue();
    });

    it('denies random role', () => {
        authServiceSpy.hasRole.and.returnValue(false);
        const fakeTree = {} as any;
        routerSpy.createUrlTree.and.returnValue(fakeTree);
        expect(run()).toBe(fakeTree);
        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/notfound']);
    });
});

describe('cascadeOnlyGuard', () => {
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['isOnlyCascade']);
        routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });
    });

    const run = (url: string) =>
        TestBed.runInInjectionContext(() =>
            cascadeOnlyGuard({} as any, { url } as any)
        );

    it('allows non-cascade on any URL', () => {
        authServiceSpy.isOnlyCascade.and.returnValue(false);
        expect(run('/monitoring')).toBeTrue();
        expect(run('/hrm/dashboard')).toBeTrue();
        expect(run('/ges-daily-report')).toBeTrue();
        expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });

    it('allows cascade on /ges-daily-report', () => {
        authServiceSpy.isOnlyCascade.and.returnValue(true);
        expect(run('/ges-daily-report')).toBeTrue();
        expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });

    it('allows cascade on /ges-daily-report with query params', () => {
        authServiceSpy.isOnlyCascade.and.returnValue(true);
        expect(run('/ges-daily-report?tab=data-entry&date=2026-04-22')).toBeTrue();
        expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });

    it('allows cascade on /shutdowns', () => {
        authServiceSpy.isOnlyCascade.and.returnValue(true);
        expect(run('/shutdowns')).toBeTrue();
        expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });

    it('allows cascade on /shutdowns with query params', () => {
        authServiceSpy.isOnlyCascade.and.returnValue(true);
        expect(run('/shutdowns?filter=xxx')).toBeTrue();
        expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });

    it('redirects cascade from lookalike /shutdowns-evil to /ges-daily-report (strict allowlist)', () => {
        authServiceSpy.isOnlyCascade.and.returnValue(true);
        const fakeTree = {} as any;
        routerSpy.createUrlTree.and.returnValue(fakeTree);
        expect(run('/shutdowns-evil')).toBe(fakeTree);
        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/ges-daily-report']);
    });

    it('redirects cascade from /monitoring to /ges-daily-report', () => {
        authServiceSpy.isOnlyCascade.and.returnValue(true);
        const fakeTree = {} as any;
        routerSpy.createUrlTree.and.returnValue(fakeTree);
        expect(run('/monitoring')).toBe(fakeTree);
        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/ges-daily-report']);
    });

    it('redirects cascade from /notfound to /ges-daily-report', () => {
        authServiceSpy.isOnlyCascade.and.returnValue(true);
        const fakeTree = {} as any;
        routerSpy.createUrlTree.and.returnValue(fakeTree);
        expect(run('/notfound')).toBe(fakeTree);
        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/ges-daily-report']);
    });
});

describe('reservoirDutyOnlyGuard', () => {
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['isOnlyReservoirDuty']);
        routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });
    });

    const run = (url: string) =>
        TestBed.runInInjectionContext(() =>
            reservoirDutyOnlyGuard({} as any, { url } as any)
        );

    it('allows non-duty users on any URL', () => {
        authServiceSpy.isOnlyReservoirDuty.and.returnValue(false);
        expect(run('/dashboard')).toBeTrue();
        expect(run('/reservoir-flood')).toBeTrue();
        expect(run('/ges-daily-report')).toBeTrue();
        expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });

    it('allows only-duty user on /reservoir-flood', () => {
        authServiceSpy.isOnlyReservoirDuty.and.returnValue(true);
        expect(run('/reservoir-flood')).toBeTrue();
        expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });

    it('allows only-duty on /reservoir-flood with query params', () => {
        authServiceSpy.isOnlyReservoirDuty.and.returnValue(true);
        expect(run('/reservoir-flood?date=2026-04-28&hour=15')).toBeTrue();
        expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });

    it('redirects only-duty from /dashboard to /reservoir-flood', () => {
        authServiceSpy.isOnlyReservoirDuty.and.returnValue(true);
        const fakeTree = {} as any;
        routerSpy.createUrlTree.and.returnValue(fakeTree);
        expect(run('/dashboard')).toBe(fakeTree);
        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/reservoir-flood']);
    });

    it('redirects only-duty from /ges-daily-report to /reservoir-flood', () => {
        authServiceSpy.isOnlyReservoirDuty.and.returnValue(true);
        const fakeTree = {} as any;
        routerSpy.createUrlTree.and.returnValue(fakeTree);
        expect(run('/ges-daily-report')).toBe(fakeTree);
        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/reservoir-flood']);
    });

    it('redirects only-duty from /reservoir-flood-evil (lookalike) to /reservoir-flood', () => {
        authServiceSpy.isOnlyReservoirDuty.and.returnValue(true);
        const fakeTree = {} as any;
        routerSpy.createUrlTree.and.returnValue(fakeTree);
        expect(run('/reservoir-flood-evil')).toBe(fakeTree);
        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/reservoir-flood']);
    });
});

describe('raisGuard', () => {
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['hasRole']);
        routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy }
            ]
        });
    });

    const run = () =>
        TestBed.runInInjectionContext(() => raisGuard({} as any, {} as any));

    it('allows cascade role (so they can reach /shutdowns)', () => {
        authServiceSpy.hasRole.and.callFake((r: string | string[]) =>
            Array.isArray(r) ? r.includes('cascade') : r === 'cascade'
        );
        expect(run()).toBeTrue();
    });

    it('allows sc role (regression)', () => {
        authServiceSpy.hasRole.and.callFake((r: string | string[]) =>
            Array.isArray(r) ? r.includes('sc') : r === 'sc'
        );
        expect(run()).toBeTrue();
    });

    it('denies role outside whitelist', () => {
        authServiceSpy.hasRole.and.returnValue(false);
        const fakeTree = {} as any;
        routerSpy.createUrlTree.and.returnValue(fakeTree);
        expect(run()).toBe(fakeTree);
        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/notfound']);
    });
});
