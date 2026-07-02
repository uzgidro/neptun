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
        it('should POST JSON to /discharges with force=false in body by default', () => {
            const payload: DischargeCreatePayload = { organization_id: 1, started_at: '2024-01-01T00:00:00Z' };

            service.addDischarge(payload).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/discharges`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ ...payload, force: false });
            req.flush({}, { status: 201, statusText: 'Created' });
        });

        it('should POST JSON to /discharges with force=true in body when force is true', () => {
            const payload: DischargeCreatePayload = { organization_id: 1 };

            service.addDischarge(payload, true).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/discharges`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ ...payload, force: true });
            req.flush({}, { status: 201, statusText: 'Created' });
        });

        it('should send force=false in body when force is explicitly false', () => {
            const payload: DischargeCreatePayload = { organization_id: 1 };

            service.addDischarge(payload, false).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/discharges`);
            expect(req.request.body.force).toBeFalse();
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

    describe('getSummary', () => {
        const emptyResponse = {
            from: '2026-01-01', to: '2026-02-28', granularity: 'month',
            cascades: [], grand_total: { buckets: [], total: { volume_mln_m3: 0, avg_flow_rate_m3_s: 0, generation_loss_mwh: 0 } }
        };

        it('should GET /discharges/summary with from, to and granularity params', () => {
            service.getSummary(new Date(2026, 0, 1), new Date(2026, 1, 28), 'day').subscribe();

            const req = httpMock.expectOne((r) => r.url === `${BASE_URL}/discharges/summary`);
            expect(req.request.method).toBe('GET');
            expect(req.request.params.get('from')).toBe('2026-01-01');
            expect(req.request.params.get('to')).toBe('2026-02-28');
            expect(req.request.params.get('granularity')).toBe('day');
            req.flush(emptyResponse);
        });

        it('should default granularity to month when omitted', () => {
            service.getSummary(new Date(2026, 0, 1), new Date(2026, 11, 31)).subscribe();

            const req = httpMock.expectOne((r) => r.url === `${BASE_URL}/discharges/summary`);
            expect(req.request.params.get('granularity')).toBe('month');
            req.flush(emptyResponse);
        });

        it('should serialize dates as zero-padded local YYYY-MM-DD', () => {
            service.getSummary(new Date(2026, 2, 5), new Date(2026, 8, 9), 'year').subscribe();

            const req = httpMock.expectOne((r) => r.url === `${BASE_URL}/discharges/summary`);
            expect(req.request.params.get('from')).toBe('2026-03-05');
            expect(req.request.params.get('to')).toBe('2026-09-09');
            req.flush(emptyResponse);
        });
    });
});
