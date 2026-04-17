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
});
