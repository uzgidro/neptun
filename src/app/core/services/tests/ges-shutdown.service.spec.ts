import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GesShutdownService } from '../ges-shutdown.service';
import { ConfigService } from '../config.service';

describe('GesShutdownService', () => {
    let service: GesShutdownService;
    let httpMock: HttpTestingController;
    const BASE_URL = 'https://test-api.example.com';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: ConfigService, useValue: { apiBaseUrl: BASE_URL } }
            ]
        });
        service = TestBed.inject(GesShutdownService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('addShutdown', () => {
        it('should POST to /shutdowns without force by default', () => {
            const formData = new FormData();
            formData.append('organization_id', '1');

            service.addShutdown(formData).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/shutdowns`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body.has('force')).toBeFalse();
            req.flush({}, { status: 201, statusText: 'Created' });
        });

        it('should POST to /shutdowns with force=true when force is true', () => {
            const formData = new FormData();
            formData.append('organization_id', '1');

            service.addShutdown(formData, true).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/shutdowns`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body.get('force')).toBe('true');
            req.flush({}, { status: 201, statusText: 'Created' });
        });

        it('should not append force when force is false', () => {
            const formData = new FormData();
            formData.append('organization_id', '1');

            service.addShutdown(formData, false).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/shutdowns`);
            expect(req.request.body.has('force')).toBeFalse();
            req.flush({}, { status: 201, statusText: 'Created' });
        });
    });
});
