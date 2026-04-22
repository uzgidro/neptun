import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';
import { cascadeOnlyGuard, gesReportGuard } from './auth.guard';

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
        authServiceSpy = jasmine.createSpyObj('AuthService', ['isCascade']);
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
        authServiceSpy.isCascade.and.returnValue(false);
        expect(run('/monitoring')).toBeTrue();
        expect(run('/hrm/dashboard')).toBeTrue();
        expect(run('/ges-daily-report')).toBeTrue();
        expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });

    it('allows cascade on /ges-daily-report', () => {
        authServiceSpy.isCascade.and.returnValue(true);
        expect(run('/ges-daily-report')).toBeTrue();
        expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });

    it('allows cascade on /ges-daily-report with query params', () => {
        authServiceSpy.isCascade.and.returnValue(true);
        expect(run('/ges-daily-report?tab=data-entry&date=2026-04-22')).toBeTrue();
        expect(routerSpy.createUrlTree).not.toHaveBeenCalled();
    });

    it('redirects cascade from /monitoring to /ges-daily-report', () => {
        authServiceSpy.isCascade.and.returnValue(true);
        const fakeTree = {} as any;
        routerSpy.createUrlTree.and.returnValue(fakeTree);
        expect(run('/monitoring')).toBe(fakeTree);
        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/ges-daily-report']);
    });

    it('redirects cascade from /notfound to /ges-daily-report', () => {
        authServiceSpy.isCascade.and.returnValue(true);
        const fakeTree = {} as any;
        routerSpy.createUrlTree.and.returnValue(fakeTree);
        expect(run('/notfound')).toBe(fakeTree);
        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/ges-daily-report']);
    });
});
