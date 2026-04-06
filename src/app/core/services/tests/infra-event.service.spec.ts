import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { InfraEventService } from '../infra-event.service';
import { ConfigService } from '../config.service';
import { InfraEventCategoryPayload, InfraEventCreatePayload, InfraEventUpdatePayload } from '@/core/interfaces/infra-event';

describe('InfraEventService', () => {
    let service: InfraEventService;
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
        service = TestBed.inject(InfraEventService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    // --- Categories ---

    describe('getInfraCategories', () => {
        it('should GET /infra-event-categories', () => {
            service.getInfraCategories().subscribe((cats) => {
                expect(cats.length).toBe(2);
                expect(cats[0].slug).toBe('video');
            });

            const req = httpMock.expectOne(`${BASE_URL}/infra-event-categories`);
            expect(req.request.method).toBe('GET');
            req.flush([
                { id: 1, slug: 'video', display_name: 'Видеонаблюдение', label: 'label1', sort_order: 1, created_at: '2026-01-01T00:00:00Z' },
                { id: 2, slug: 'comms', display_name: 'Связь', label: 'label2', sort_order: 2, created_at: '2026-01-01T00:00:00Z' }
            ]);
        });
    });

    describe('createInfraCategory', () => {
        it('should POST /infra-event-categories with payload', () => {
            const payload: InfraEventCategoryPayload = {
                slug: 'scada',
                display_name: 'SCADA',
                label: 'SCADA tizimi',
                sort_order: 6
            };

            service.createInfraCategory(payload).subscribe((res) => {
                expect(res.id).toBe(6);
            });

            const req = httpMock.expectOne(`${BASE_URL}/infra-event-categories`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            req.flush({ id: 6 }, { status: 201, statusText: 'Created' });
        });
    });

    describe('updateInfraCategory', () => {
        it('should PATCH /infra-event-categories/{id} with payload', () => {
            const payload: InfraEventCategoryPayload = {
                slug: 'scada_v2',
                display_name: 'SCADA v2',
                label: 'Updated label',
                sort_order: 6
            };

            service.updateInfraCategory(3, payload).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/infra-event-categories/3`);
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual(payload);
            req.flush({});
        });
    });

    describe('deleteInfraCategory', () => {
        it('should DELETE /infra-event-categories/{id}', () => {
            service.deleteInfraCategory(3).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/infra-event-categories/3`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null, { status: 204, statusText: 'No Content' });
        });
    });

    // --- Events ---

    describe('getEvents', () => {
        it('should GET /infra-events with date param', () => {
            const date = new Date(2026, 2, 28); // March 28, 2026

            service.getEvents(date).subscribe((events) => {
                expect(events.length).toBe(1);
                expect(events[0].description).toBe('Camera down');
            });

            const req = httpMock.expectOne(`${BASE_URL}/infra-events?date=2026-03-28`);
            expect(req.request.method).toBe('GET');
            req.flush([
                {
                    id: 1,
                    category_id: 1,
                    category_slug: 'video',
                    category_name: 'Видеонаблюдение',
                    organization_id: 42,
                    organization_name: 'GES-34',
                    occurred_at: '2026-03-28T09:00:00+05:00',
                    restored_at: null,
                    description: 'Camera down',
                    remediation: null,
                    notes: null,
                    created_at: '2026-03-28T09:15:00+05:00',
                    created_by: { id: 5, name: 'Omonov A.' },
                    files: []
                }
            ]);
        });

        it('should GET /infra-events with date and category_id params', () => {
            const date = new Date(2026, 2, 28);

            service.getEvents(date, 1).subscribe();

            const req = httpMock.expectOne(
                (r) => r.url === `${BASE_URL}/infra-events` && r.params.get('date') === '2026-03-28' && r.params.get('category_id') === '1'
            );
            expect(req.request.method).toBe('GET');
            req.flush([]);
        });

        it('should GET /infra-events without date param when date is omitted', () => {
            service.getEvents().subscribe();

            const req = httpMock.expectOne((r) => r.url === `${BASE_URL}/infra-events` && !r.params.has('date') && !r.params.has('category_id'));
            expect(req.request.method).toBe('GET');
            req.flush([]);
        });

        it('should pad single-digit month and day correctly', () => {
            const date = new Date(2026, 0, 5); // January 5, 2026

            service.getEvents(date).subscribe();

            const req = httpMock.expectOne((r) => r.url === `${BASE_URL}/infra-events` && r.params.get('date') === '2026-01-05');
            expect(req.request.method).toBe('GET');
            req.flush([]);
        });
    });

    describe('createEvent', () => {
        it('should POST /infra-events with JSON payload', () => {
            const payload: InfraEventCreatePayload = {
                category_id: 1,
                organization_id: 42,
                occurred_at: '2026-03-28T09:00:00+05:00',
                description: 'Camera offline',
                file_ids: [10, 11]
            };

            service.createEvent(payload).subscribe((res) => {
                expect(res.id).toBe(1);
            });

            const req = httpMock.expectOne(`${BASE_URL}/infra-events`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(payload);
            req.flush({ id: 1 }, { status: 201, statusText: 'Created' });
        });
    });

    describe('updateEvent', () => {
        it('should PATCH /infra-events/{id} with partial payload', () => {
            const payload: InfraEventUpdatePayload = {
                description: 'Updated description',
                restored_at: '2026-03-28T13:00:00+05:00'
            };

            service.updateEvent(1, payload).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/infra-events/1`);
            expect(req.request.method).toBe('PATCH');
            expect(req.request.body).toEqual(payload);
            req.flush({});
        });

        it('should support clear_restored_at in PATCH payload', () => {
            const payload: InfraEventUpdatePayload = {
                clear_restored_at: true
            };

            service.updateEvent(1, payload).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/infra-events/1`);
            expect(req.request.body.clear_restored_at).toBeTrue();
            req.flush({});
        });
    });

    describe('deleteEvent', () => {
        it('should DELETE /infra-events/{id}', () => {
            service.deleteEvent(1).subscribe();

            const req = httpMock.expectOne(`${BASE_URL}/infra-events/1`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null, { status: 204, statusText: 'No Content' });
        });
    });
});
