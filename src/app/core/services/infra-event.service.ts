import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from '@/core/services/api.service';
import { InfraEventCategory, InfraEventCategoryPayload, InfraEvent, InfraEventCreatePayload, InfraEventUpdatePayload } from '@/core/interfaces/infra-event';

const INFRA_EVENT_CATEGORIES = '/infra-event-categories';
const INFRA_EVENTS = '/infra-events';

@Injectable({
    providedIn: 'root'
})
export class InfraEventService extends ApiService {
    getInfraCategories(): Observable<InfraEventCategory[]> {
        return this.http.get<InfraEventCategory[]>(this.BASE_URL + INFRA_EVENT_CATEGORIES);
    }

    createInfraCategory(payload: InfraEventCategoryPayload): Observable<{ id: number }> {
        return this.http.post<{ id: number }>(this.BASE_URL + INFRA_EVENT_CATEGORIES, payload);
    }

    updateInfraCategory(id: number, payload: InfraEventCategoryPayload): Observable<{}> {
        return this.http.patch<{}>(this.BASE_URL + INFRA_EVENT_CATEGORIES + '/' + id, payload);
    }

    deleteInfraCategory(id: number): Observable<void> {
        return this.http.delete<void>(this.BASE_URL + INFRA_EVENT_CATEGORIES + '/' + id);
    }

    getEvents(date?: Date, categoryId?: number): Observable<InfraEvent[]> {
        let params = new HttpParams();
        if (date !== undefined) {
            params = params.set('date', this.dateToYMD(date));
        }
        if (categoryId !== undefined) {
            params = params.set('category_id', categoryId.toString());
        }
        return this.http.get<InfraEvent[]>(this.BASE_URL + INFRA_EVENTS, { params });
    }

    createEvent(payload: InfraEventCreatePayload): Observable<{ id: number }> {
        return this.http.post<{ id: number }>(this.BASE_URL + INFRA_EVENTS, payload);
    }

    updateEvent(id: number, payload: InfraEventUpdatePayload): Observable<{}> {
        return this.http.patch<{}>(this.BASE_URL + INFRA_EVENTS + '/' + id, payload);
    }

    deleteEvent(id: number): Observable<void> {
        return this.http.delete<void>(this.BASE_URL + INFRA_EVENTS + '/' + id);
    }
}
