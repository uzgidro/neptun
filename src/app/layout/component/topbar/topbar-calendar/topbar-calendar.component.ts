import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { DatePipe, NgClass } from '@angular/common';
import { Popover } from 'primeng/popover';
import { PrimeTemplate } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { EventManagementService } from '@/core/services/event-management.service';
import { Event } from '@/core/interfaces/event-management';
import { isSameDay, parseISO } from 'date-fns';
import { Dialog } from 'primeng/dialog';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

@Component({
    selector: 'app-topbar-calendar',
    imports: [DatePicker, DatePipe, Popover, PrimeTemplate, FormsModule, NgClass, Dialog, Tooltip, ButtonDirective, ButtonIcon],
    templateUrl: './topbar-calendar.component.html',
    styleUrl: './topbar-calendar.component.scss'
})
export class TopbarCalendarComponent implements OnInit {
    eventManagementService = inject(EventManagementService);

    allEvents = signal<Event[]>([]);
    selectedDate: Date = new Date();
    selectedDayEvents = signal<Event[]>([]);
    loading = false;

    eventDialogVisible = false;
    eventDialogHeader = '';
    selectedEventDetails: Event | null = null;
    loadingEventDetails = false;

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

    openEventDetails(eventId: number) {
        this.loadingEventDetails = true;
        this.eventDialogVisible = true;
        this.eventDialogHeader = 'Информация о событии';

        this.eventManagementService.getEventById(eventId).subscribe({
            next: (event) => {
                this.selectedEventDetails = event;
                this.loadingEventDetails = false;
            },
            error: (err) => {
                console.error('Failed to load event details:', err);
                this.loadingEventDetails = false;
                this.eventDialogVisible = false;
            }
        });
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

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    isImageFile(fileName: string): boolean {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
        const lowerFileName = fileName.toLowerCase();
        return imageExtensions.some((ext) => lowerFileName.endsWith(ext));
    }

    isVideoFile(fileName: string): boolean {
        const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.mpeg', '.mpg'];
        const lowerFileName = fileName.toLowerCase();
        return videoExtensions.some((ext) => lowerFileName.endsWith(ext));
    }

    getFileIcon(fileName: string): string {
        const lowerFileName = fileName.toLowerCase();

        if (lowerFileName.endsWith('.doc') || lowerFileName.endsWith('.docx')) {
            return 'pi pi-file-word text-blue-500';
        }

        if (lowerFileName.endsWith('.xls') || lowerFileName.endsWith('.xlsx')) {
            return 'pi pi-file-excel text-green-500';
        }

        if (lowerFileName.endsWith('.pdf')) {
            return 'pi pi-file-pdf text-red-500';
        }

        if (lowerFileName.match(/\.(mp4|avi|mov|wmv|flv|mkv)$/)) {
            return 'pi pi-video text-purple-500';
        }

        if (lowerFileName.match(/\.(mp3|wav|ogg|flac|aac)$/)) {
            return 'pi pi-volume-up text-orange-500';
        }

        if (lowerFileName.match(/\.(zip|rar|7z|tar|gz)$/)) {
            return 'pi pi-box text-yellow-600';
        }

        if (lowerFileName.endsWith('.txt')) {
            return 'pi pi-align-left text-gray-500';
        }

        return 'pi pi-file text-gray-400';
    }
}
