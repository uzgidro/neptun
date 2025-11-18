import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CalendarEvent, EventService } from '@/core/services/event.service';
import { AuthService } from '@/core/services/auth.service';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { ContactService } from '@/core/services/contact.service';
import { Contact } from '@/core/interfaces/contact';

@Component({
    selector: 'app-planning',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, DialogModule, InputTextModule, TableModule, ReactiveFormsModule, DatePickerComponent, InputTextComponent, SelectComponent],
    templateUrl: './planning.component.html'
})
export class PlanningComponent implements OnInit {
    eventService = inject(EventService);
    contacts: Contact[] = [];

    contactsLoading: boolean = false;
    submitted: boolean = false;

    events = this.eventService.getEvents();
    displayAddDialog = false;
    newEvent: Omit<CalendarEvent, 'id'> = { title: '', type: 'Встреча', date: new Date() };
    eventTypes = ['Встреча', 'Созвон', 'Переговоры', 'ВКС'];
    authService: AuthService = inject(AuthService);
    private contactService: ContactService = inject(ContactService);

    ngOnInit() {
        this.contactsLoading = true;
        this.contactService.getContacts().subscribe({
            next: (contacts) => {
                this.contacts = contacts;
            },
            error: (error) => {
                console.log(error);
            },
            complete: () => {
                this.contactsLoading = false;
            }
        });
    }

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
