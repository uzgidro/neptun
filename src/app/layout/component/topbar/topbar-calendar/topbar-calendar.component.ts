import { Component, inject, signal } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { DatePipe, NgClass } from '@angular/common';
import { Popover } from 'primeng/popover';
import { PrimeTemplate } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { CalendarEvent, EventService } from '@/core/services/event.service';
import { isSameDay } from 'date-fns';

@Component({
    selector: 'app-topbar-calendar',
    imports: [DatePicker, DatePipe, Popover, PrimeTemplate, FormsModule, NgClass],
    templateUrl: './topbar-calendar.component.html',
    styleUrl: './topbar-calendar.component.scss'
})
export class TopbarCalendarComponent {
    eventService = inject(EventService);

    allEvents = this.eventService.getEvents();

    selectedDate: Date = new Date();
    selectedDayEvents = signal<CalendarEvent[]>([]);

    onDateSelect(date: Date) {
        this.selectedDate = date;
        this.selectedDayEvents.set(this.getEventsForDate(date));
    }

    hasEvents(day: number, month: number, year: number): boolean {
        const date = new Date(year, month, day);
        return this.allEvents().some((event) => isSameDay(event.date, date));
    }

    private getEventsForDate(date: Date): CalendarEvent[] {
        return this.allEvents()
            .filter((event) => isSameDay(event.date, date))
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }
}
