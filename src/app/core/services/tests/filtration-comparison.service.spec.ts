import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FiltrationComparisonService } from '../filtration-comparison.service';
import { ConfigService } from '../config.service';
import { OrgComparison, OrgSimilarDates, UpsertRequest } from '@/core/interfaces/filtration-comparison';

describe('FiltrationComparisonService', () => {
    let service: FiltrationComparisonService;
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
        service = TestBed.inject(FiltrationComparisonService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getSimilarDates', () => {
        it('should call GET /filtration/comparison/similar-dates with date param', () => {
            const mockResponse: OrgSimilarDates[] = [{
                organization_id: 1,
                organization_name: 'Test Org',
                reference_date: '2026-03-20',
                reference_level: 895.2,
                reference_volume: 1234.5,
                similar_dates: [{ date: '2025-11-15', level: 895.2, volume: 1230.0 }]
            }];

            service.getSimilarDates('2026-03-20').subscribe(result => {
                expect(result).toEqual(mockResponse);
            });

            const req = httpMock.expectOne(r =>
                r.url === `${BASE_URL}/filtration/comparison/similar-dates` &&
                r.params.get('date') === '2026-03-20'
            );
            expect(req.request.method).toBe('GET');
            expect(req.request.params.has('limit')).toBeFalse();
            req.flush(mockResponse);
        });

        it('should pass limit param when provided', () => {
            service.getSimilarDates('2026-03-20', 10).subscribe(result => {
                expect(result).toEqual([]);
            });

            const req = httpMock.expectOne(r =>
                r.url === `${BASE_URL}/filtration/comparison/similar-dates` &&
                r.params.get('limit') === '10'
            );
            expect(req.request.params.get('limit')).toBe('10');
            req.flush([]);
        });
    });

    describe('getComparisonData', () => {
        it('should call GET /filtration/comparison/data with three date params', () => {
            const mockResponse: OrgComparison[] = [{
                organization_id: 1,
                organization_name: 'Test Org',
                current: {
                    date: '2026-03-20', level: 895.2, volume: 1234.5,
                    locations: [], piezometers: [],
                    piezometer_counts: { pressure: 0, non_pressure: 0 }
                },
                historical_filter: null,
                historical_piezo: null
            }];

            service.getComparisonData('2026-03-20', '2025-11-15', '2025-09-03').subscribe(result => {
                expect(result).toEqual(mockResponse);
            });

            const req = httpMock.expectOne(r =>
                r.url === `${BASE_URL}/filtration/comparison/data` &&
                r.params.get('date') === '2026-03-20' &&
                r.params.get('filter_date') === '2025-11-15' &&
                r.params.get('piezo_date') === '2025-09-03'
            );
            expect(req.request.method).toBe('GET');
            req.flush(mockResponse);
        });
    });

    describe('saveMeasurements', () => {
        it('should call POST /filtration/measurements', () => {
            const payload: UpsertRequest = {
                organization_id: 1,
                date: '2026-03-20',
                filtration_measurements: [{ location_id: 1, flow_rate: 0.42 }],
                piezometer_measurements: [{ piezometer_id: 1, level: 118.5, anomaly: false }]
            };

            service.saveMeasurements(payload).subscribe(result => {
                expect(result.status).toBe('ok');
            });

            const req = httpMock.expectOne(`${BASE_URL}/filtration/measurements`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            req.flush({ status: 'ok' });
        });
    });

    describe('downloadExport', () => {
        it('should call GET /filter/export with required params', () => {
            service.downloadExport('2026-03-20', 'excel').subscribe();

            const req = httpMock.expectOne(r =>
                r.url === `${BASE_URL}/filter/export` &&
                r.params.get('date') === '2026-03-20' &&
                r.params.get('format') === 'excel' &&
                !r.params.has('filter_date') &&
                !r.params.has('piezo_date')
            );
            expect(req.request.method).toBe('GET');
            expect(req.request.responseType).toBe('blob');
            req.flush(new Blob());
        });

        it('should include filter_date and piezo_date when provided', () => {
            service.downloadExport('2026-03-20', 'pdf', '2025-11-15', '2025-09-03').subscribe(response => {
                expect(response).toBeTruthy();
            });

            const req = httpMock.expectOne(r =>
                r.url === `${BASE_URL}/filter/export` &&
                r.params.get('filter_date') === '2025-11-15' &&
                r.params.get('piezo_date') === '2025-09-03'
            );
            expect(req.request.params.get('format')).toBe('pdf');
            req.flush(new Blob());
        });
    });
});
