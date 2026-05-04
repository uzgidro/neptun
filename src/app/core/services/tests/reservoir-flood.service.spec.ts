import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReservoirFloodService } from '../reservoir-flood.service';
import { ConfigService } from '../config.service';
import {
    ReservoirFloodConfig,
    ReservoirFloodConfigPayload,
    ReservoirFloodHourlyPayload,
    ReservoirFloodHourlyRecord
} from '@/core/interfaces/reservoir-flood';

describe('ReservoirFloodService', () => {
    let service: ReservoirFloodService;
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
        service = TestBed.inject(ReservoirFloodService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getConfigs', () => {
        it('GETs /reservoir-flood/config', () => {
            const mock: ReservoirFloodConfig[] = [{
                id: 1, organization_id: 42, organization_name: 'Чарвак',
                sort_order: 10, is_active: true, updated_at: '2026-04-25T08:00:00Z'
            }];
            service.getConfigs().subscribe(res => expect(res).toEqual(mock));
            const req = httpMock.expectOne(`${BASE_URL}/reservoir-flood/config`);
            expect(req.request.method).toBe('GET');
            req.flush(mock);
        });
    });

    describe('upsertConfig', () => {
        it('POSTs to /reservoir-flood/config with body', () => {
            const payload: ReservoirFloodConfigPayload = {
                organization_id: 42, sort_order: 10, is_active: true
            };
            service.upsertConfig(payload).subscribe(r => expect(r.status).toBe('OK'));
            const req = httpMock.expectOne(`${BASE_URL}/reservoir-flood/config`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            req.flush({ status: 'OK' });
        });
    });

    describe('deleteConfig', () => {
        it('DELETEs /reservoir-flood/config?organization_id=42', () => {
            service.deleteConfig(42).subscribe(r => expect(r).toBeNull());
            const req = httpMock.expectOne(r =>
                r.method === 'DELETE' &&
                r.url === `${BASE_URL}/reservoir-flood/config` &&
                r.params.get('organization_id') === '42'
            );
            req.flush(null);
        });
    });

    describe('getHourly', () => {
        it('GETs /reservoir-flood/hourly with date and organization_id', () => {
            const mock: ReservoirFloodHourlyRecord[] = [];
            service.getHourly('2026-04-27', 42).subscribe(r => expect(r).toEqual(mock));
            const req = httpMock.expectOne(r =>
                r.method === 'GET' &&
                r.url === `${BASE_URL}/reservoir-flood/hourly` &&
                r.params.get('date') === '2026-04-27' &&
                r.params.get('organization_id') === '42'
            );
            req.flush(mock);
        });

        it('GETs /reservoir-flood/hourly with only date when organization_id omitted', () => {
            service.getHourly('2026-04-27').subscribe();
            const req = httpMock.expectOne(r =>
                r.method === 'GET' &&
                r.url === `${BASE_URL}/reservoir-flood/hourly` &&
                r.params.get('date') === '2026-04-27' &&
                !r.params.has('organization_id')
            );
            req.flush([]);
        });
    });

    describe('upsertHourly', () => {
        it('POSTs an array of payloads', () => {
            const payload: ReservoirFloodHourlyPayload[] = [{
                organization_id: 42,
                recorded_at: '2026-04-27T15:00:00.000Z',
                water_level_m: 815.4
            }];
            service.upsertHourly(payload).subscribe(r => expect(r.status).toBe('OK'));
            const req = httpMock.expectOne(`${BASE_URL}/reservoir-flood/hourly`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            req.flush({ status: 'OK' });
        });
    });

    describe('exportSel', () => {
        it('GETs /reservoir-flood/export with date+hour+format=excel', () => {
            service.exportSel({ date: '2026-05-04', hour: 15, format: 'excel' }).subscribe();
            const req = httpMock.expectOne(r => r.url === `${BASE_URL}/reservoir-flood/export`);
            expect(req.request.method).toBe('GET');
            expect(req.request.params.get('date')).toBe('2026-05-04');
            expect(req.request.params.get('hour')).toBe('15');
            expect(req.request.params.get('format')).toBe('excel');
            req.flush(new Blob());
        });

        it('GETs /reservoir-flood/export with format=pdf', () => {
            service.exportSel({ date: '2026-05-04', hour: 0, format: 'pdf' }).subscribe();
            const req = httpMock.expectOne(r => r.url === `${BASE_URL}/reservoir-flood/export`);
            expect(req.request.params.get('format')).toBe('pdf');
            expect(req.request.params.get('hour')).toBe('0');
            req.flush(new Blob());
        });

        it('propagates 403 forbidden', () => {
            let errorStatus: number | undefined;
            service.exportSel({ date: '2026-05-04', hour: 15, format: 'excel' }).subscribe({
                next: () => fail('expected error'),
                error: (err) => { errorStatus = err.status; }
            });
            const req = httpMock.expectOne(r => r.url === `${BASE_URL}/reservoir-flood/export`);
            req.flush(new Blob([JSON.stringify({ error: 'forbidden' })], { type: 'application/json' }),
                { status: 403, statusText: 'Forbidden' });
            expect(errorStatus).toBe(403);
        });
    });
});
