import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ReservoirSummaryConfigApiService } from '../reservoir-summary-config-api.service';
import { ConfigService } from '../config.service';
import { ReservoirSummaryConfig, ReservoirSummaryConfigPayload } from '@/core/interfaces/reservoir-summary-config';

describe('ReservoirSummaryConfigApiService', () => {
    let service: ReservoirSummaryConfigApiService;
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
        service = TestBed.inject(ReservoirSummaryConfigApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getConfigs', () => {
        it('GETs /reservoir-summary/config', () => {
            const mock: ReservoirSummaryConfig[] = [{
                id: 1, organization_id: 101, organization_name: 'Андижон',
                sort_order: 1, include_in_total: true, modsnow_enabled: true, volume_source: 'static'
            }];
            service.getConfigs().subscribe(res => expect(res).toEqual(mock));
            const req = httpMock.expectOne(`${BASE_URL}/reservoir-summary/config`);
            expect(req.request.method).toBe('GET');
            req.flush(mock);
        });
    });

    describe('upsertConfig', () => {
        it('POSTs to /reservoir-summary/config with body (incl. modsnow_enabled + volume_source)', () => {
            const payload: ReservoirSummaryConfigPayload = {
                organization_id: 108, sort_order: 8, include_in_total: false,
                modsnow_enabled: true, volume_source: 'level_volume'
            };
            service.upsertConfig(payload).subscribe(r => expect(r.status).toBe('OK'));
            const req = httpMock.expectOne(`${BASE_URL}/reservoir-summary/config`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            req.flush({ status: 'OK' });
        });

        it('serializes include_in_total=false and modsnow_enabled=false (not dropped)', () => {
            service.upsertConfig({
                organization_id: 108, sort_order: 8, include_in_total: false,
                modsnow_enabled: false, volume_source: 'static'
            }).subscribe();
            const req = httpMock.expectOne(`${BASE_URL}/reservoir-summary/config`);
            expect(req.request.body.include_in_total).toBe(false);
            expect(req.request.body.modsnow_enabled).toBe(false);
            expect(req.request.body.volume_source).toBe('static');
            req.flush({ status: 'OK' });
        });
    });

    describe('deleteConfig', () => {
        it('DELETEs /reservoir-summary/config?organization_id=108', () => {
            service.deleteConfig(108).subscribe(r => expect(r).toBeNull());
            const req = httpMock.expectOne(r =>
                r.method === 'DELETE' &&
                r.url === `${BASE_URL}/reservoir-summary/config` &&
                r.params.get('organization_id') === '108'
            );
            req.flush(null);
        });

        it('propagates 404 not found', () => {
            let errorStatus: number | undefined;
            service.deleteConfig(99999).subscribe({
                next: () => fail('expected error'),
                error: (err) => { errorStatus = err.status; }
            });
            const req = httpMock.expectOne(r =>
                r.method === 'DELETE' && r.url === `${BASE_URL}/reservoir-summary/config`
            );
            req.flush({ error: 'config not found' }, { status: 404, statusText: 'Not Found' });
            expect(errorStatus).toBe(404);
        });
    });
});
