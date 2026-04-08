import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GesShutdownService } from '../ges-shutdown.service';
import { ConfigService } from '../config.service';
import { ShutdownCreatePayload, ShutdownUpdatePayload } from '@/core/interfaces/ges-shutdown';

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
        it('should POST JSON to /shutdowns without force by default', () => {
            const payload: ShutdownCreatePayload = { organization_id: 1, start_time: '2024-01-01T00:00:00Z' };

            service.addShutdown(payload).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/shutdowns`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            expect(req.request.params.has('force')).toBeFalse();
            req.flush({}, { status: 201, statusText: 'Created' });
        });

        it('should POST JSON to /shutdowns with force=true query param when force is true', () => {
            const payload: ShutdownCreatePayload = { organization_id: 1 };

            service.addShutdown(payload, true).subscribe();

            const req = httpMock.expectOne(r => r.url === `${BASE_URL}/shutdowns` && r.params.get('force') === 'true');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            req.flush({}, { status: 201, statusText: 'Created' });
        });

        it('should not add force query param when force is false', () => {
            const payload: ShutdownCreatePayload = { organization_id: 1 };

            service.addShutdown(payload, false).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/shutdowns`);
            expect(req.request.params.has('force')).toBeFalse();
            req.flush({}, { status: 201, statusText: 'Created' });
        });

        it('should include file_ids in JSON payload when present', () => {
            const payload: ShutdownCreatePayload = { organization_id: 1, file_ids: [10, 20, 30] };

            service.addShutdown(payload).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/shutdowns`);
            expect(req.request.body.file_ids).toEqual([10, 20, 30]);
            req.flush({}, { status: 201, statusText: 'Created' });
        });
    });

    describe('editShutdown', () => {
        it('should PATCH JSON to /shutdowns/:id', () => {
            const payload: ShutdownUpdatePayload = { reason: 'updated reason' };

            service.editShutdown(5, payload).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/shutdowns/5`);
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual(payload);
            req.flush({}, { status: 200, statusText: 'OK' });
        });

        it('should include file_ids in JSON payload when present', () => {
            const payload: ShutdownUpdatePayload = { reason: 'test', file_ids: [1, 2] };

            service.editShutdown(5, payload).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/shutdowns/5`);
            expect(req.request.body.file_ids).toEqual([1, 2]);
            req.flush({}, { status: 200, statusText: 'OK' });
        });

        it('should send empty file_ids array to remove all files', () => {
            const payload: ShutdownUpdatePayload = { file_ids: [] };

            service.editShutdown(5, payload).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/shutdowns/5`);
            expect(req.request.body.file_ids).toEqual([]);
            req.flush({}, { status: 200, statusText: 'OK' });
        });
    });
});
