import { Component, inject, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { DatePipe, KeyValuePipe, NgClass } from '@angular/common';
import { PastEventsService } from '@/core/services/past-events.service';
import { Event, EventType } from '@/core/interfaces/past-events';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [ButtonModule, MenuModule, DatePipe, KeyValuePipe, NgClass],
    templateUrl: './notifications.widget.html'
})
export class NotificationsWidget implements OnInit {
    private pastEventsService = inject(PastEventsService);

    eventsByDate: Record<string, Event[]> = {};
    loading = false;

    items = [
        { label: 'Add New', icon: 'pi pi-fw pi-plus' },
        { label: 'Remove', icon: 'pi pi-fw pi-trash' }
    ];

    ngOnInit() {
        this.loadPastEvents();
    }

    loadPastEvents() {
        this.loading = true;
        this.pastEventsService.getPastEvents().subscribe({
            next: (response) => {
                this.eventsByDate = response.events_by_date;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading past events:', error);
                this.loading = false;
            }
        });
    }

    getEventIcon(type: EventType): string {
        const icons: Record<EventType, string> = {
            success: 'pi-check-circle',
            danger: 'pi-exclamation-circle',
            warning: 'pi-times-circle',
            info: 'pi-info-circle'
        };
        return icons[type] || 'pi-info-circle';
    }

    getEventColorClass(type: EventType): string {
        const colors: Record<EventType, string> = {
            success: 'bg-green-100 dark:bg-green-400/10',
            danger: 'bg-red-100 dark:bg-red-400/10',
            warning: 'bg-orange-100 dark:bg-orange-400/10',
            info: 'bg-blue-100 dark:bg-blue-400/10'
        };
        return colors[type] || 'bg-blue-100 dark:bg-blue-400/10';
    }

    getEventIconColor(type: EventType): string {
        const colors: Record<EventType, string> = {
            success: 'text-green-500',
            danger: 'text-red-500',
            warning: 'text-orange-500',
            info: 'text-blue-500'
        };
        return colors[type] || 'text-blue-500';
    }
}
