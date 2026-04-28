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
