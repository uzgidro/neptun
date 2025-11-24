import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, BASE_URL } from './api.service';
import { Event, EventStatus, EventType } from '../interfaces/event-management';

@Injectable({
    providedIn: 'root'
})
export class EventManagementService extends ApiService {
    /**
     * Get all events with optional filters
     */
    getEvents(filters?: { statusId?: number; typeId?: number; organizationId?: number; start_date?: string; end_date?: string }): Observable<Event[]> {
        let url = `${BASE_URL}/events`;
        const params: string[] = [];

        if (filters) {
            if (filters.statusId) params.push(`status_id=${filters.statusId}`);
            if (filters.typeId) params.push(`type_id=${filters.typeId}`);
            if (filters.organizationId) params.push(`organization_id=${filters.organizationId}`);
            if (filters.start_date) params.push(`start_date=${filters.start_date}`);
            if (filters.end_date) params.push(`end_date=${filters.end_date}`);
        }

        if (params.length > 0) {
            url += '?' + params.join('&');
        }

        return this.http.get<Event[]>(url);
    }

    /**
     * Get all events (short format - lightweight)
     */
    getEventsShort(): Observable<Event[]> {
        return this.http.get<Event[]>(`${BASE_URL}/events/short`);
    }

    /**
     * Get single event by ID
     */
    getEventById(id: number): Observable<Event> {
        return this.http.get<Event>(`${BASE_URL}/events/${id}`);
    }

    /**
     * Get all event types
     */
    getEventTypes(): Observable<EventType[]> {
        return this.http.get<EventType[]>(`${BASE_URL}/events/types`);
    }

    /**
     * Get all event statuses
     */
    getEventStatuses(): Observable<EventStatus[]> {
        return this.http.get<EventStatus[]>(`${BASE_URL}/events/statuses`);
    }

    /**
     * Create new event with files
     * @param formData FormData containing event fields and files
     * @returns Observable with created event ID
     */
    createEvent(formData: FormData): Observable<{ id: number; error: string }> {
        return this.http.post<{ id: number; error: string }>(`${BASE_URL}/events`, formData);
    }

    /**
     * Update existing event
     * @param id Event ID
     * @param formData FormData containing updated fields and files
     */
    updateEvent(id: number, formData: FormData): Observable<any> {
        return this.http.patch(`${BASE_URL}/events/${id}`, formData);
    }

    /**
     * Delete event by ID
     * @param id Event ID to delete
     */
    deleteEvent(id: number): Observable<any> {
        return this.http.delete(`${BASE_URL}/events/${id}`);
    }
}
