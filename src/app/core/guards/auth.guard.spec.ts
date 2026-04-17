import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';
import { gesReportGuard } from './auth.guard';

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
