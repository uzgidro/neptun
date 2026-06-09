import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DutyViolationService } from '../duty-violation.service';
import { ConfigService } from '../config.service';
import { DutyViolationCreatePayload, DutyViolationGroupResponse, DutyViolationResponse } from '@/core/interfaces/duty-violations';

describe('DutyViolationService', () => {
    let service: DutyViolationService;
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
        service = TestBed.inject(DutyViolationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    function makeResponse(id: number, orgId = 103, orgName = 'Пском', start = '2026-06-08T08:00:00+05:00'): DutyViolationResponse {
        return {
            id,
            organization_id: orgId,
            organization_name: orgName,
            start_time: start,
            end_time: '2026-06-08T20:00:00+05:00',
            duty_officer_name: 'Иванов И.И.',
            reason: 'Не вышел на смену',
            files: [],
            created_at: '2026-06-09T10:00:00Z',
            updated_at: '2026-06-09T10:00:00Z'
        };
    }

    function makeGroup(orgId: number, name: string, violations: DutyViolationResponse[]): DutyViolationGroupResponse {
        return { id: orgId, name, violations };
    }

    describe('getViolations', () => {
        it('GETs /duty-violations without params when no date', () => {
            service.getViolations().subscribe(res => expect(res.length).toBe(1));
            const req = httpMock.expectOne(r =>
                r.method === 'GET' && r.url === `${BASE_URL}/duty-violations` && !r.params.has('date'));
            req.flush([makeGroup(103, 'Пском', [makeResponse(7)])]);
        });

        it('GETs /duty-violations?date=YYYY-MM-DD when date provided', () => {
            service.getViolations(new Date('2026-06-08T12:00:00')).subscribe();
            const req = httpMock.expectOne(r =>
                r.method === 'GET' &&
                r.url === `${BASE_URL}/duty-violations` &&
                r.params.get('date') === '2026-06-08');
            req.flush([]);
        });

        it('flattens grouped response into a single ordered list, preserving group + intra-group order', () => {
            service.getViolations().subscribe(res => {
                expect(res.length).toBe(3);
                // group order (Андижон before Пском) then intra-group order preserved
                expect(res.map(v => v.id)).toEqual([7, 3, 5]);
            });
            const req = httpMock.expectOne(`${BASE_URL}/duty-violations`);
            req.flush([
                makeGroup(100, 'Андижон ГЭС', [makeResponse(7, 100, 'Андижон ГЭС'), makeResponse(3, 100, 'Андижон ГЭС')]),
                makeGroup(103, 'Пском', [makeResponse(5, 103, 'Пском')])
            ]);
        });

        it('fills organization_name on each flattened record from the group', () => {
            service.getViolations().subscribe(res => {
                expect(res[0].organization_name).toBe('Андижон ГЭС');
                expect(res[0].organization_id).toBe(100);
            });
            const req = httpMock.expectOne(`${BASE_URL}/duty-violations`);
            req.flush([makeGroup(100, 'Андижон ГЭС', [makeResponse(7, 100, 'Андижон ГЭС')])]);
        });

        it('maps date strings to Date objects', () => {
            service.getViolations().subscribe(res => {
                expect(res[0].start_time instanceof Date).toBeTrue();
                expect(res[0].end_time instanceof Date).toBeTrue();
                expect(res[0].created_at instanceof Date).toBeTrue();
            });
            const req = httpMock.expectOne(`${BASE_URL}/duty-violations`);
            req.flush([makeGroup(103, 'Пском', [makeResponse(7)])]);
        });

        it('maps null end_time to null (open shift)', () => {
            const open = makeResponse(7);
            open.end_time = null;
            service.getViolations().subscribe(res => {
                expect(res[0].end_time).toBeNull();
                expect(res[0].start_time instanceof Date).toBeTrue();
            });
            const req = httpMock.expectOne(`${BASE_URL}/duty-violations`);
            req.flush([makeGroup(103, 'Пском', [open])]);
        });

        it('returns [] when backend returns null', () => {
            service.getViolations().subscribe(res => expect(res).toEqual([]));
            const req = httpMock.expectOne(`${BASE_URL}/duty-violations`);
            req.flush(null);
        });

        it('returns [] when backend returns empty group array', () => {
            service.getViolations().subscribe(res => expect(res).toEqual([]));
            const req = httpMock.expectOne(`${BASE_URL}/duty-violations`);
            req.flush([]);
        });
    });

    describe('addViolation', () => {
        it('POSTs to /duty-violations with body', () => {
            const payload: DutyViolationCreatePayload = {
                organization_id: 103,
                start_time: '2026-06-08T08:00:00+05:00',
                end_time: '2026-06-08T20:00:00+05:00',
                duty_officer_name: 'Иванов И.И.',
                reason: 'Не вышел на смену',
                file_ids: [42, 43]
            };
            service.addViolation(payload).subscribe();
            const req = httpMock.expectOne(`${BASE_URL}/duty-violations`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            req.flush(makeResponse(7));
        });
    });

    describe('editViolation', () => {
        it('PATCHes /duty-violations/{id} with body', () => {
            const payload: DutyViolationCreatePayload = {
                organization_id: 103,
                start_time: '2026-06-08T08:00:00+05:00',
                end_time: '2026-06-08T20:00:00+05:00',
                duty_officer_name: 'Иванов И.И.',
                reason: 'Не вышел на смену',
                file_ids: []
            };
            service.editViolation(7, payload).subscribe();
            const req = httpMock.expectOne(`${BASE_URL}/duty-violations/7`);
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual(payload);
            req.flush(makeResponse(7));
        });
    });

    describe('deleteViolation', () => {
        it('DELETEs /duty-violations/{id}', () => {
            service.deleteViolation(7).subscribe();
            const req = httpMock.expectOne(`${BASE_URL}/duty-violations/7`);
            expect(req.request.method).toBe('DELETE');
            req.flush({ status: 'Deleted' });
        });
    });
});
