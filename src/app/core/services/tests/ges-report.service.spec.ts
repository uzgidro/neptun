import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GesReportService } from '../ges-report.service';
import { ConfigService } from '../config.service';
import { GesConfigPayload, GesConfigResponse, GesDailyData, GesDailyDataPayload, GesDailyReport, GesProductionPlan, GesProductionPlanPayload } from '@/core/interfaces/ges-report';

describe('GesReportService', () => {
    let service: GesReportService;
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
        service = TestBed.inject(GesReportService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('upsertConfig', () => {
        it('should POST to /ges-report/config', () => {
            const payload: GesConfigPayload = {
                organization_id: 10, installed_capacity_mwt: 50.0,
                total_aggregates: 4, has_reservoir: true, sort_order: 1
            };
            service.upsertConfig(payload).subscribe(result => {
                expect(result.status).toBe('OK');
            });
            const req = httpMock.expectOne(`${BASE_URL}/ges-report/config`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            req.flush({ status: 'OK' });
        });
    });

    describe('getConfigs', () => {
        it('should GET /ges-report/config', () => {
            const mockConfigs: GesConfigResponse[] = [{
                id: 1, organization_id: 10, organization_name: 'ГЭС-1',
                cascade_id: 5, cascade_name: 'Каскад', installed_capacity_mwt: 50,
                total_aggregates: 4, has_reservoir: true, sort_order: 1
            }];
            service.getConfigs().subscribe(result => {
                expect(result).toEqual(mockConfigs);
            });
            const req = httpMock.expectOne(`${BASE_URL}/ges-report/config`);
            expect(req.request.method).toBe('GET');
            req.flush(mockConfigs);
        });
    });

    describe('deleteConfig', () => {
        it('should DELETE /ges-report/config with organization_id param', () => {
            service.deleteConfig(10).subscribe();
            const req = httpMock.expectOne(r =>
                r.url === `${BASE_URL}/ges-report/config` &&
                r.params.get('organization_id') === '10'
            );
            expect(req.request.method).toBe('DELETE');
            req.flush(null, { status: 204, statusText: 'No Content' });
        });
    });

    describe('upsertDailyData', () => {
        it('should POST an array to /ges-report/daily-data', () => {
            const payload: GesDailyDataPayload = {
                organization_id: 10, date: '2026-03-13',
                daily_production_mln_kwh: 3.389, working_aggregates: 3, water_level_m: 846.05
            };
            service.upsertDailyData([payload]).subscribe(result => {
                expect(result.status).toBe('OK');
            });
            const req = httpMock.expectOne(`${BASE_URL}/ges-report/daily-data`);
            expect(req.request.method).toBe('POST');
            expect(Array.isArray(req.request.body)).toBeTrue();
            expect(req.request.body).toEqual([payload]);
            req.flush({ status: 'OK' });
        });

        it('should POST multiple items in a single request', () => {
            const payloads: GesDailyDataPayload[] = [
                { organization_id: 10, date: '2026-03-13', daily_production_mln_kwh: 3.389 },
                { organization_id: 20, date: '2026-03-13', water_level_m: 846.05 }
            ];
            service.upsertDailyData(payloads).subscribe(result => {
                expect(result.status).toBe('OK');
            });
            const req = httpMock.expectOne(`${BASE_URL}/ges-report/daily-data`);
            expect(req.request.method).toBe('POST');
            expect(Array.isArray(req.request.body)).toBeTrue();
            expect((req.request.body as GesDailyDataPayload[]).length).toBe(2);
            expect(req.request.body).toEqual(payloads);
            req.flush({ status: 'OK' });
        });
    });

    describe('getDailyData', () => {
        it('should GET /ges-report/daily-data with params', () => {
            const mockData: GesDailyData = {
                id: 42, organization_id: 10, date: '2026-03-13',
                daily_production_mln_kwh: 3.389, working_aggregates: 3, water_level_m: 846.05
            };
            service.getDailyData(10, '2026-03-13').subscribe(result => {
                expect(result).toEqual(mockData);
            });
            const req = httpMock.expectOne(r =>
                r.url === `${BASE_URL}/ges-report/daily-data` &&
                r.params.get('organization_id') === '10' &&
                r.params.get('date') === '2026-03-13'
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockData);
        });
    });

    describe('bulkUpsertPlans', () => {
        it('should POST to /ges-report/plans with plans array', () => {
            const plans: GesProductionPlanPayload[] = [
                { organization_id: 10, year: 2026, month: 1, plan_mln_kwh: 100.0 },
                { organization_id: 10, year: 2026, month: 2, plan_mln_kwh: 110.0 }
            ];
            service.bulkUpsertPlans(plans).subscribe(result => {
                expect(result.status).toBe('OK');
            });
            const req = httpMock.expectOne(`${BASE_URL}/ges-report/plans`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ plans });
            req.flush({ status: 'OK' });
        });
    });

    describe('getPlans', () => {
        it('should GET /ges-report/plans with year param', () => {
            const mockPlans: GesProductionPlan[] = [
                { id: 1, organization_id: 10, year: 2026, month: 1, plan_mln_kwh: 100.0 }
            ];
            service.getPlans(2026).subscribe(result => {
                expect(result).toEqual(mockPlans);
            });
            const req = httpMock.expectOne(r =>
                r.url === `${BASE_URL}/ges-report/plans` &&
                r.params.get('year') === '2026'
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockPlans);
        });
    });

    describe('getReport', () => {
        it('should GET /ges-report with date param', () => {
            const mockReport: GesDailyReport = {
                date: '2026-03-13', cascades: [],
                grand_total: {
                    installed_capacity_mwt: 100, total_aggregates: 10,
                    working_aggregates: 8, power_mwt: 50,
                    daily_production_mln_kwh: 1.2, production_change_mln_kwh: 0.1,
                    mtd_production_mln_kwh: 15, ytd_production_mln_kwh: 150,
                    monthly_plan_mln_kwh: 50, quarterly_plan_mln_kwh: 150,
                    fulfillment_pct: 1.0, difference_mln_kwh: 0,
                    prev_year_ytd_mln_kwh: 140, yoy_growth_rate: 0.07,
                    yoy_difference_mln_kwh: 10, idle_discharge_total_m3s: 0
                }
            };
            service.getReport('2026-03-13').subscribe(result => {
                expect(result).toEqual(mockReport);
            });
            const req = httpMock.expectOne(r =>
                r.url === `${BASE_URL}/ges-report` &&
                r.params.get('date') === '2026-03-13'
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockReport);
        });
    });
});

describe('GesReportService.exportReport', () => {
    let service: GesReportService;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()]
        });
        service = TestBed.inject(GesReportService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('builds GET /ges-report/export with date/format only (no modernization/repair)', () => {
        service.exportReport({ date: '2026-04-17', format: 'excel' }).subscribe();
        const req = http.expectOne(r => r.url.endsWith('/ges-report/export'));
        expect(req.request.method).toBe('GET');
        expect(req.request.params.get('date')).toBe('2026-04-17');
        expect(req.request.params.get('format')).toBe('excel');
        expect(req.request.params.has('modernization')).toBeFalse();
        expect(req.request.params.has('repair')).toBeFalse();
        req.flush(new Blob());
    });

    it('supports pdf format', () => {
        service.exportReport({ date: '2026-04-17', format: 'pdf' }).subscribe();
        const req = http.expectOne(r => r.url.endsWith('/ges-report/export'));
        expect(req.request.params.get('format')).toBe('pdf');
        req.flush(new Blob());
    });
});
