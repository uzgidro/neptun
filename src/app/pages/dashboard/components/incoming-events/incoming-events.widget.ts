import { Component, OnInit, inject } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { EventManagementService } from '@/core/services/event-management.service';
import { Event } from '@/core/interfaces/event-management';
import { Router } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-incoming-events-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule, TooltipModule],
    templateUrl: './incoming-events.widget.html'
})
export class IncomingEventsWidget implements OnInit {
    private eventService = inject(EventManagementService);
    private router = inject(Router);

    events: Event[] = [];
    loading = false;

    ngOnInit() {
        this.loadIncomingEvents();
    }

    loadIncomingEvents() {
        this.loading = true;
        const now = new Date();
        const start_date = now.toISOString();

        this.eventService.getEvents({ start_date }).subscribe({
            next: (events) => {
                this.events = events;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load incoming events:', err);
                this.loading = false;
            }
        });
    }

    getIconClass(eventTypeId: number): object {
        // Map event type IDs to icon classes
        // Adjust these mappings based on your actual event type IDs
        switch (eventTypeId) {
            case 1: // Selector
                return { 'pi-calendar text-blue-500': true };
            case 2: // VKS
                return { 'pi-camera text-green-500': true };
            case 3: // Negotiation
                return { 'pi-comments text-orange-500': true };
            case 4: // Meeting
                return { 'pi-users text-purple-500': true };
            case 6: // Ride
                return { 'pi-car text-red-500': true };
            case 7: // Guests / Visit
                return { 'pi-building text-gray-500': true };
            default:
                return { 'pi-calendar text-gray-500': true };
        }
    }

    getLocationDisplay(event: Event): string {
        const parts: string[] = [];

        if (event.organization?.name) {
            parts.push(event.organization.name);
        }

        if (event.location) {
            parts.push(event.location);
        }

        return parts.length > 0 ? parts.join(' - ') : '-';
    }

    viewEventDetails(eventId: number) {
        this.router.navigate(['/event-management', eventId]);
    }
}
