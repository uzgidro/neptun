import { Injectable, signal } from '@angular/core';

export interface CalendarEvent {
    id: number;
    title: string;
    type: 'Встреча' | 'Созвон' | 'Переговоры' | 'ВКС';
    date: Date;
}

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private eventIdCounter = 3;
    private events = signal<CalendarEvent[]>([
        { id: 1, title: 'Встреча с начальником ГУВД', type: 'Встреча', date: new Date(2025, 10, 10, 13, 0) },
        { id: 2, title: 'Еженедельный созвон с командой', type: 'Созвон', date: new Date() }
    ]);

    getEvents() {
        return this.events.asReadonly();
    }

    addEvent(event: Omit<CalendarEvent, 'id'>) {
        const newEvent = { ...event, id: this.eventIdCounter++ };
        this.events.update(events => [...events, newEvent]);
    }

    getEventsForDate(date: Date): CalendarEvent[] {
        return this.events().filter(event => event.date.toDateString() === date.toDateString());
    }
}
