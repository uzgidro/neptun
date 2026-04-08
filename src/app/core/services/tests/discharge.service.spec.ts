import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DischargeService } from '../discharge.service';
import { ConfigService } from '../config.service';
import { DischargeCreatePayload, DischargeUpdatePayload } from '@/core/interfaces/discharge';

describe('DischargeService', () => {
    let service: DischargeService;
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
        service = TestBed.inject(DischargeService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('addDischarge', () => {
        it('should POST JSON to /discharges without force by default', () => {
            const payload: DischargeCreatePayload = { organization_id: 1, started_at: '2024-01-01T00:00:00Z' };

            service.addDischarge(payload).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/discharges`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            expect(req.request.params.has('force')).toBeFalse();
            req.flush({}, { status: 201, statusText: 'Created' });
        });

        it('should POST JSON to /discharges with force=true query param when force is true', () => {
            const payload: DischargeCreatePayload = { organization_id: 1 };

            service.addDischarge(payload, true).subscribe();

            const req = httpMock.expectOne(r => r.url === `${BASE_URL}/discharges` && r.params.get('force') === 'true');
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            req.flush({}, { status: 201, statusText: 'Created' });
        });

        it('should not add force query param when force is false', () => {
            const payload: DischargeCreatePayload = { organization_id: 1 };

            service.addDischarge(payload, false).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/discharges`);
            expect(req.request.params.has('force')).toBeFalse();
            req.flush({}, { status: 201, statusText: 'Created' });
        });

        it('should include file_ids in JSON payload when present', () => {
            const payload: DischargeCreatePayload = { organization_id: 1, file_ids: [10, 20, 30] };

            service.addDischarge(payload).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/discharges`);
            expect(req.request.body.file_ids).toEqual([10, 20, 30]);
            req.flush({}, { status: 201, statusText: 'Created' });
        });
    });

    describe('editDischarge', () => {
        it('should PATCH JSON to /discharges/:id', () => {
            const payload: DischargeUpdatePayload = { reason: 'updated reason' };

            service.editDischarge(5, payload).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/discharges/5`);
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual(payload);
            req.flush({}, { status: 200, statusText: 'OK' });
        });

        it('should include file_ids in JSON payload when present', () => {
            const payload: DischargeUpdatePayload = { reason: 'test', file_ids: [1, 2] };

            service.editDischarge(5, payload).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/discharges/5`);
            expect(req.request.body.file_ids).toEqual([1, 2]);
            req.flush({}, { status: 200, statusText: 'OK' });
        });

        it('should send empty file_ids array to remove all files', () => {
            const payload: DischargeUpdatePayload = { file_ids: [] };

            service.editDischarge(5, payload).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/discharges/5`);
            expect(req.request.body.file_ids).toEqual([]);
            req.flush({}, { status: 200, statusText: 'OK' });
        });
    });
});
