import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Event, EventStatus, EventType } from '../interfaces/event-management';

// Мок-данные типов мероприятий
const MOCK_EVENT_TYPES: EventType[] = [
    { id: 1, name: 'Совещание', description: 'Рабочие совещания и встречи' },
    { id: 2, name: 'Техническое обслуживание', description: 'Плановое ТО оборудования' },
    { id: 3, name: 'Аудит', description: 'Проверки и аудиты' },
    { id: 4, name: 'Обучение', description: 'Тренинги и обучение персонала' }
];

const MOCK_EVENT_STATUSES: EventStatus[] = [
    { id: 1, name: 'Запланировано', description: 'Мероприятие запланировано' },
    { id: 2, name: 'В процессе', description: 'Мероприятие проводится' },
    { id: 3, name: 'Завершено', description: 'Мероприятие завершено' },
    { id: 4, name: 'Отменено', description: 'Мероприятие отменено' }
];

// Мок-данные мероприятий
const MOCK_EVENTS: Event[] = [
    {
        id: 1,
        name: 'Совещание по производству',
        description: 'Обсуждение планов на квартал',
        event_date: new Date().toISOString(),
        responsible_contact_id: 1,
        responsible_contact: { id: 1, name: 'Иванов И.И.', phone: '+998901234567' },
        event_status_id: 1,
        event_status: MOCK_EVENT_STATUSES[0],
        event_type_id: 1,
        event_type: MOCK_EVENT_TYPES[0],
        organization_id: 1,
        created_by_user_id: 1,
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        name: 'Техническое обслуживание линии №3',
        description: 'Плановое ТО',
        event_date: new Date().toISOString(),
        responsible_contact_id: 2,
        responsible_contact: { id: 2, name: 'Петров П.П.', phone: '+998901234568' },
        event_status_id: 2,
        event_status: MOCK_EVENT_STATUSES[1],
        event_type_id: 2,
        event_type: MOCK_EVENT_TYPES[1],
        organization_id: 2,
        created_by_user_id: 1,
        created_at: new Date().toISOString()
    }
];

@Injectable({
    providedIn: 'root'
})
export class EventManagementService extends ApiService {
    getEvents(filters?: { statusId?: number; typeId?: number; organizationId?: number; start_date?: string; end_date?: string }): Observable<Event[]> {
        let result = [...MOCK_EVENTS];
        if (filters?.statusId) result = result.filter(e => e.event_status_id === filters.statusId);
        if (filters?.typeId) result = result.filter(e => e.event_type_id === filters.typeId);
        return of(result).pipe(delay(200));
    }

    getEventsShort(): Observable<Event[]> {
        return of(MOCK_EVENTS).pipe(delay(200));
    }

    getEventById(id: number): Observable<Event> {
        const event = MOCK_EVENTS.find(e => e.id === id) || MOCK_EVENTS[0];
        return of(event).pipe(delay(200));
    }

    getEventTypes(): Observable<EventType[]> {
        return of(MOCK_EVENT_TYPES).pipe(delay(200));
    }

    getEventStatuses(): Observable<EventStatus[]> {
        return of(MOCK_EVENT_STATUSES).pipe(delay(200));
    }

    createEvent(formData: FormData): Observable<{ id: number; error: string }> {
        return of({ id: Date.now(), error: '' }).pipe(delay(300));
    }

    updateEvent(id: number, formData: FormData): Observable<any> {
        return of({ success: true }).pipe(delay(300));
    }

    deleteEvent(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }
}
