import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CalendarEvent, EventService } from '@/core/services/event.service';
import { DatePicker } from 'primeng/datepicker';

@Component({
    selector: 'app-planning',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, DialogModule, InputTextModule, TableModule, DatePicker],
    templateUrl: './planning.component.html'
})
export class PlanningComponent implements OnInit {
    eventService = inject(EventService);

    events = this.eventService.getEvents();
    displayAddDialog = false;
    newEvent: Omit<CalendarEvent, 'id'> = { title: '', type: 'Встреча', date: new Date() };
    eventTypes = ['Встреча', 'Созвон', 'Переговоры', 'ВКС'];

    ngOnInit() {}

    showAddDialog() {
        this.newEvent = { title: '', type: 'Встреча', date: new Date() };
        this.displayAddDialog = true;
    }

    saveNewEvent() {
        if (this.newEvent.title && this.newEvent.date) {
            this.eventService.addEvent(this.newEvent);
            this.displayAddDialog = false;
        }
    }

    getIconClass(type: string): string {
        switch (type) {
            case 'Встреча':
                return 'pi pi-users';
            case 'Созвон':
                return 'pi pi-phone';
            case 'Переговоры':
                return 'pi pi-comments';
            case 'ВКС':
                return 'pi pi-video';
            default:
                return 'pi pi-calendar';
        }
    }
}
