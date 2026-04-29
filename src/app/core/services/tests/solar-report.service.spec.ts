import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SolarReportService } from '../solar-report.service';
import { ConfigService } from '../config.service';
import {
    SolarConfig, SolarConfigPayload,
    SolarDailyData, SolarDailyDataPayload,
    SolarPlan, SolarPlanPayload
} from '@/core/interfaces/solar-report';

describe('SolarReportService', () => {
    let service: SolarReportService;
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
        service = TestBed.inject(SolarReportService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('upsertConfig', () => {
        it('should POST to /solar/config', () => {
            const payload: SolarConfigPayload = {
                organization_id: 42,
                installed_capacity_kw: 150.0,
                sort_order: 1
            };
            service.upsertConfig(payload).subscribe(result => {
                expect(result.status).toBe('OK');
            });
            const req = httpMock.expectOne(`${BASE_URL}/solar/config`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            req.flush({ status: 'OK' });
        });

        it('propagates 403 (forbidden for cascade)', () => {
            const payload: SolarConfigPayload = {
                organization_id: 42, installed_capacity_kw: 150, sort_order: 1
            };
            let errorStatus: number | undefined;
            service.upsertConfig(payload).subscribe({
                next: () => fail('expected error'),
                error: (err) => { errorStatus = err.status; }
            });
            const req = httpMock.expectOne(`${BASE_URL}/solar/config`);
            req.flush({ error: 'forbidden' }, { status: 403, statusText: 'Forbidden' });
            expect(errorStatus).toBe(403);
        });
    });

    describe('getConfigs', () => {
        it('should GET /solar/config', () => {
            const mockConfigs: SolarConfig[] = [{
                id: 1, organization_id: 42, organization_name: 'ГЭС Alpha',
                installed_capacity_kw: 150.0, sort_order: 1,
                updated_at: '2026-04-25T08:00:00Z'
            }];
            service.getConfigs().subscribe(result => {
                expect(result).toEqual(mockConfigs);
            });
            const req = httpMock.expectOne(`${BASE_URL}/solar/config`);
            expect(req.request.method).toBe('GET');
            req.flush(mockConfigs);
        });
    });

    describe('deleteConfig', () => {
        it('should DELETE /solar/config with organization_id param', () => {
            service.deleteConfig(42).subscribe();
            const req = httpMock.expectOne(r =>
                r.url === `${BASE_URL}/solar/config` &&
                r.params.get('organization_id') === '42'
            );
            expect(req.request.method).toBe('DELETE');
            req.flush(null, { status: 204, statusText: 'No Content' });
        });

        it('propagates 404 not found', () => {
            let errorStatus: number | undefined;
            service.deleteConfig(999).subscribe({
                next: () => fail('expected error'),
                error: (err) => { errorStatus = err.status; }
            });
            const req = httpMock.expectOne(r => r.url === `${BASE_URL}/solar/config`);
            req.flush({ error: 'config not found' }, { status: 404, statusText: 'Not Found' });
            expect(errorStatus).toBe(404);
        });
    });

    describe('upsertDailyData', () => {
        it('should POST an array to /solar/daily-data', () => {
            const payload: SolarDailyDataPayload = {
                organization_id: 42, date: '2026-04-28',
                generation_kwh: 620.5, grid_export_kwh: 540.0
            };
            service.upsertDailyData([payload]).subscribe(result => {
                expect(result.status).toBe('OK');
            });
            const req = httpMock.expectOne(`${BASE_URL}/solar/daily-data`);
            expect(req.request.method).toBe('POST');
            expect(Array.isArray(req.request.body)).toBeTrue();
            expect(req.request.body).toEqual([payload]);
            req.flush({ status: 'OK' });
        });

        it('should POST multiple items in a single request', () => {
            const payloads: SolarDailyDataPayload[] = [
                { organization_id: 42, date: '2026-04-28', generation_kwh: 620.5 },
                { organization_id: 43, date: '2026-04-28', grid_export_kwh: 480.0 }
            ];
            service.upsertDailyData(payloads).subscribe(result => {
                expect(result.status).toBe('OK');
            });
            const req = httpMock.expectOne(`${BASE_URL}/solar/daily-data`);
            expect(req.request.method).toBe('POST');
            expect(Array.isArray(req.request.body)).toBeTrue();
            expect((req.request.body as SolarDailyDataPayload[]).length).toBe(2);
            expect(req.request.body).toEqual(payloads);
            req.flush({ status: 'OK' });
        });

        it('propagates 403 cross-org write', () => {
            const payload: SolarDailyDataPayload = {
                organization_id: 99, date: '2026-04-28', generation_kwh: 100
            };
            let errorStatus: number | undefined;
            service.upsertDailyData([payload]).subscribe({
                next: () => fail('expected error'),
                error: (err) => { errorStatus = err.status; }
            });
            const req = httpMock.expectOne(`${BASE_URL}/solar/daily-data`);
            req.flush(
                { error: 'access to target organization denied' },
                { status: 403, statusText: 'Forbidden' }
            );
            expect(errorStatus).toBe(403);
        });
    });

    describe('getDailyData', () => {
        it('should GET /solar/daily-data with date param', () => {
            const mockData: SolarDailyData[] = [{
                id: 1001, organization_id: 42, organization_name: 'ГЭС Alpha',
                date: '2026-04-28T00:00:00Z',
                generation_kwh: 620.5, grid_export_kwh: 540.0,
                updated_at: '2026-04-28T18:02:11Z'
            }];
            service.getDailyData('2026-04-28').subscribe(result => {
                expect(result).toEqual(mockData);
            });
            const req = httpMock.expectOne(r =>
                r.url === `${BASE_URL}/solar/daily-data` &&
                r.params.get('date') === '2026-04-28' &&
                !r.params.has('organization_id')
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockData);
        });

        it('should GET /solar/daily-data with date+organization_id params', () => {
            service.getDailyData('2026-04-28', 42).subscribe();
            const req = httpMock.expectOne(r =>
                r.url === `${BASE_URL}/solar/daily-data` &&
                r.params.get('date') === '2026-04-28' &&
                r.params.get('organization_id') === '42'
            );
            expect(req.request.method).toBe('GET');
            req.flush([]);
        });
    });

    describe('bulkUpsertPlans', () => {
        it('should POST to /solar/plans with plans array wrapped in {plans}', () => {
            const plans: SolarPlanPayload[] = [
                { organization_id: 42, year: 2026, month: 4, plan_thousand_kwh: 18.5 },
                { organization_id: 42, year: 2026, month: 5, plan_thousand_kwh: 22.0 }
            ];
            service.bulkUpsertPlans(plans).subscribe(result => {
                expect(result.status).toBe('OK');
            });
            const req = httpMock.expectOne(`${BASE_URL}/solar/plans`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ plans });
            req.flush({ status: 'OK' });
        });
    });

    describe('getPlans', () => {
        it('should GET /solar/plans with year param', () => {
            const mockPlans: SolarPlan[] = [{
                id: 10, organization_id: 42, organization_name: 'ГЭС Alpha',
                year: 2026, month: 4, plan_thousand_kwh: 18.5
            }];
            service.getPlans(2026).subscribe(result => {
                expect(result).toEqual(mockPlans);
            });
            const req = httpMock.expectOne(r =>
                r.url === `${BASE_URL}/solar/plans` &&
                r.params.get('year') === '2026'
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockPlans);
        });
    });
});
