import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { DatePipe, NgClass } from '@angular/common';
import { Popover } from 'primeng/popover';
import { PrimeTemplate } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { EventManagementService } from '@/core/services/event-management.service';
import { Event } from '@/core/interfaces/event-management';
import { isSameDay, parseISO } from 'date-fns';

@Component({
    selector: 'app-topbar-calendar',
    imports: [DatePicker, DatePipe, Popover, PrimeTemplate, FormsModule, NgClass],
    templateUrl: './topbar-calendar.component.html',
    styleUrl: './topbar-calendar.component.scss'
})
export class TopbarCalendarComponent implements OnInit {
    eventManagementService = inject(EventManagementService);

    allEvents = signal<Event[]>([]);
    selectedDate: Date = new Date();
    selectedDayEvents = signal<Event[]>([]);
    loading = false;

    ngOnInit() {
        this.loadEvents();
    }

    loadEvents() {
        this.loading = true;
        this.eventManagementService.getEventsShort().subscribe({
            next: (events) => {
                this.allEvents.set(events);
                this.onDateSelect(this.selectedDate);
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load events:', err);
                this.loading = false;
            }
        });
    }

    onDateSelect(date: Date) {
        this.selectedDate = date;
        this.selectedDayEvents.set(this.getEventsForDate(date));
    }

    hasEvents(day: number, month: number, year: number): boolean {
        const date = new Date(year, month, day);
        return this.allEvents().some((event) => isSameDay(parseISO(event.event_date), date));
    }

    private getEventsForDate(date: Date): Event[] {
        return this.allEvents()
            .filter((event) => isSameDay(parseISO(event.event_date), date))
            .sort((a, b) => parseISO(a.event_date).getTime() - parseISO(b.event_date).getTime());
    }
}
