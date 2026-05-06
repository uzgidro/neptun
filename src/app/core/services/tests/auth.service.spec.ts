import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '@/core/services/auth.service';
import { JwtService } from '@/core/services/jwt.service';

describe('AuthService', () => {
    let service: AuthService;
    let jwtServiceSpy: jasmine.SpyObj<JwtService>;

    beforeEach(() => {
        const jwtSpy = jasmine.createSpyObj<JwtService>('JwtService', ['getDecodedToken', 'saveToken', 'destroyToken', 'isAuthenticated', 'getToken']);

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: JwtService, useValue: jwtSpy }
            ]
        });
        service = TestBed.inject(AuthService);
        jwtServiceSpy = TestBed.inject(JwtService) as jasmine.SpyObj<JwtService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('isCascade returns true when token has cascade role', () => {
        jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['cascade'] } as any);
        expect(service.isCascade()).toBeTrue();
    });

    it('isCascade returns false when only sc/rais present', () => {
        jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['sc', 'rais'] } as any);
        expect(service.isCascade()).toBeFalse();
    });

    it('isScOrRais returns true for sc', () => {
        jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['sc'] } as any);
        expect(service.isScOrRais()).toBeTrue();
    });

    it('isScOrRais returns false for cascade-only', () => {
        jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['cascade'] } as any);
        expect(service.isScOrRais()).toBeFalse();
    });

    it('isOnlyCascade returns true when roles is exactly ["cascade"]', () => {
        jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['cascade'] } as any);
        expect(service.isOnlyCascade()).toBeTrue();
    });

    it('isOnlyCascade returns false when cascade is combined with another role', () => {
        jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['sc', 'cascade'] } as any);
        expect(service.isOnlyCascade()).toBeFalse();
    });

    it('isOnlyCascade returns false when roles does not include cascade', () => {
        jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['sc'] } as any);
        expect(service.isOnlyCascade()).toBeFalse();
    });

    it('isOnlyCascade returns false when token is missing', () => {
        jwtServiceSpy.getDecodedToken.and.returnValue(null as any);
        expect(service.isOnlyCascade()).toBeFalse();
    });

    it('isOnlyCascade returns false when roles field is absent', () => {
        jwtServiceSpy.getDecodedToken.and.returnValue({} as any);
        expect(service.isOnlyCascade()).toBeFalse();
    });

    describe('isOnlyReservoirDuty', () => {
        it('returns true when roles is exactly ["reservoir_duty"]', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['reservoir_duty'] } as any);
            expect(service.isOnlyReservoirDuty()).toBeTrue();
        });

        it('returns false when reservoir_duty is combined with another role', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['sc', 'reservoir_duty'] } as any);
            expect(service.isOnlyReservoirDuty()).toBeFalse();
        });

        it('returns false when roles does not include reservoir_duty', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['sc'] } as any);
            expect(service.isOnlyReservoirDuty()).toBeFalse();
        });

        it('returns false when token is missing', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue(null as any);
            expect(service.isOnlyReservoirDuty()).toBeFalse();
        });

        it('returns false when roles field is absent', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({} as any);
            expect(service.isOnlyReservoirDuty()).toBeFalse();
        });
    });

    describe('getHomeRoute', () => {
        it('returns /dashboard for admin', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['admin'] } as any);
            expect(service.getHomeRoute()).toBe('/dashboard');
        });

        it('returns /dashboard for sc', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['sc'] } as any);
            expect(service.getHomeRoute()).toBe('/dashboard');
        });

        it('returns /dashboard for rais', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['rais'] } as any);
            expect(service.getHomeRoute()).toBe('/dashboard');
        });

        it('returns /dashboard for combined sc+rais', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['sc', 'rais'] } as any);
            expect(service.getHomeRoute()).toBe('/dashboard');
        });

        it('returns /ges-daily-report for cascade-only', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['cascade'] } as any);
            expect(service.getHomeRoute()).toBe('/ges-daily-report');
        });

        it('privileged role wins when cascade is combined with sc', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['cascade', 'sc'] } as any);
            expect(service.getHomeRoute()).toBe('/dashboard');
        });

        it('returns /reservoir-flood for reservoir_duty', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['reservoir_duty'] } as any);
            expect(service.getHomeRoute()).toBe('/reservoir-flood');
        });

        it('returns /hrm/dashboard for hrm_admin', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['hrm_admin'] } as any);
            expect(service.getHomeRoute()).toBe('/hrm/dashboard');
        });

        it('returns /hrm/dashboard for hrm_manager', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['hrm_manager'] } as any);
            expect(service.getHomeRoute()).toBe('/hrm/dashboard');
        });

        it('returns /hrm/dashboard for hrm_employee', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['hrm_employee'] } as any);
            expect(service.getHomeRoute()).toBe('/hrm/dashboard');
        });

        it('returns /chancellery/orders for chancellery', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['chancellery'] } as any);
            expect(service.getHomeRoute()).toBe('/chancellery/orders');
        });

        it('returns /manual-comparison-entry for reservoir', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['reservoir'] } as any);
            expect(service.getHomeRoute()).toBe('/manual-comparison-entry');
        });

        it('returns /invest-active for investment', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['investment'] } as any);
            expect(service.getHomeRoute()).toBe('/invest-active');
        });

        it('returns /planning/events for assistant', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['assistant'] } as any);
            expect(service.getHomeRoute()).toBe('/planning/events');
        });

        it('returns /notfound when roles is empty', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: [] } as any);
            expect(service.getHomeRoute()).toBe('/notfound');
        });

        it('returns /notfound when token is missing', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue(null as any);
            expect(service.getHomeRoute()).toBe('/notfound');
        });
    });

    describe('canSeeOverview', () => {
        it('returns true for admin', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['admin'] } as any);
            expect(service.canSeeOverview()).toBeTrue();
        });

        it('returns true for sc', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['sc'] } as any);
            expect(service.canSeeOverview()).toBeTrue();
        });

        it('returns true for rais', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['rais'] } as any);
            expect(service.canSeeOverview()).toBeTrue();
        });

        it('returns false for cascade', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['cascade'] } as any);
            expect(service.canSeeOverview()).toBeFalse();
        });

        it('returns false for hrm_employee', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['hrm_employee'] } as any);
            expect(service.canSeeOverview()).toBeFalse();
        });

        it('returns false when token is missing', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue(null as any);
            expect(service.canSeeOverview()).toBeFalse();
        });
    });

    describe('getUserId', () => {
        it('returns null when token is missing', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue(null as any);
            expect(service.getUserId()).toBeNull();
        });

        it('returns null when uid claim is absent', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ roles: ['sc'] } as any);
            expect(service.getUserId()).toBeNull();
        });

        it('returns the numeric uid when present', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ uid: 42, roles: ['cascade'] } as any);
            expect(service.getUserId()).toBe(42);
        });

        it('returns null when uid is not a number (defensive)', () => {
            jwtServiceSpy.getDecodedToken.and.returnValue({ uid: '42' } as any);
            expect(service.getUserId()).toBeNull();
        });
    });
});
