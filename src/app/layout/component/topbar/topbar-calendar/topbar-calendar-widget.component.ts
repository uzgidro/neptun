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
import { CalendarEventsService } from '@/core/services/calendar-events.service';
import { CalendarResponse, DayCounts } from '@/core/interfaces/calendar-events';
import { PastEventsService } from '@/core/services/past-events.service';
import { PastEvent as PastEvent } from '@/core/interfaces/past-events';
import { ReceptionService } from '@/core/services/reception.service';
import { Reception } from '@/core/interfaces/reception';

@Component({
    selector: 'app-topbar-calendar',
    imports: [DatePicker, DatePipe, Popover, PrimeTemplate, FormsModule, NgClass, Dialog, Tooltip, ButtonDirective, ButtonIcon],
    templateUrl: './topbar-calendar-widget.component.html',
    styleUrl: './topbar-calendar-widget.component.scss'
})
export class TopbarCalendarWidget implements OnInit {
    eventManagementService = inject(EventManagementService);
    calendarEventsService = inject(CalendarEventsService);
    pastEventsService = inject(PastEventsService);
    receptionService = inject(ReceptionService);

    allEvents = signal<Event[]>([]);
    allReceptions = signal<Reception[]>([]);
    selectedDate: Date = new Date();
    selectedDayEvents = signal<Event[]>([]);
    selectedDayReceptions = signal<Reception[]>([]);
    selectedDayCounts = signal<DayCounts | null>(null);
    loading = false;

    eventDialogVisible = false;
    eventDialogHeader = '';
    selectedEventDetails: Event | null = null;
    loadingEventDetails = false;

    // Модальное окно для Reception
    receptionDialogVisible = false;
    receptionDialogHeader = '';
    selectedReceptionDetails: Reception | null = null;
    loadingReceptionDetails = false;

    // Модальное окно для статистики
    statisticsDialogVisible = false;
    statisticsDialogHeader = '';
    statisticsPastEvents = signal<PastEvent[]>([]);
    loadingStatistics = false;

    // Кэш для данных календаря по месяцам (ключ: "year-month")
    private calendarCache = new Map<string, CalendarResponse>();

    ngOnInit() {
        this.loadEvents();
        this.loadReceptions();
        this.loadCalendarData(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1);
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

    loadReceptions() {
        this.receptionService.getReceptions().subscribe({
            next: (receptions) => {
                this.allReceptions.set(receptions);
                this.onDateSelect(this.selectedDate);
            },
            error: (err) => {
                console.error('Failed to load receptions:', err);
            }
        });
    }

    onDateSelect(date: Date) {
        this.selectedDate = date;
        this.selectedDayEvents.set(this.getEventsForDate(date));
        this.selectedDayReceptions.set(this.getReceptionsForDate(date));
        this.updateSelectedDayCounts(date);

        // Загружаем данные для нового месяца, если их нет в кэше
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const cacheKey = `${year}-${month}`;
        if (!this.calendarCache.has(cacheKey)) {
            this.loadCalendarData(year, month);
        }
    }

    onMonthChange(event: { month?: number; year?: number }) {
        if (event.month && event.year) {
            this.loadCalendarData(event.year, event.month + 1);
        }
    }

    hasEvents(day: number, month: number, year: number): boolean {
        const date = new Date(year, month, day);
        return this.allEvents().some((event) => isSameDay(parseISO(event.event_date), date));
    }

    hasReceptions(day: number, month: number, year: number): boolean {
        const date = new Date(year, month, day);
        return this.allReceptions().some((reception) => {
            const receptionDate = typeof reception.date === 'string' ? parseISO(reception.date) : reception.date;
            return isSameDay(receptionDate, date);
        });
    }

    private getEventsForDate(date: Date): Event[] {
        return this.allEvents()
            .filter((event) => isSameDay(parseISO(event.event_date), date))
            .sort((a, b) => parseISO(a.event_date).getTime() - parseISO(b.event_date).getTime());
    }

    private getReceptionsForDate(date: Date): Reception[] {
        return this.allReceptions()
            .filter((reception) => {
                const receptionDate = typeof reception.date === 'string' ? parseISO(reception.date) : reception.date;
                return isSameDay(receptionDate, date);
            })
            .sort((a, b) => {
                const dateA = typeof a.date === 'string' ? parseISO(a.date) : a.date;
                const dateB = typeof b.date === 'string' ? parseISO(b.date) : b.date;
                return dateA.getTime() - dateB.getTime();
            });
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

    openReceptionDetails(receptionId: number) {
        this.loadingReceptionDetails = true;
        this.receptionDialogVisible = true;
        this.receptionDialogHeader = 'Информация о приеме';

        this.receptionService.getReception(receptionId).subscribe({
            next: (reception) => {
                this.selectedReceptionDetails = reception;
                this.loadingReceptionDetails = false;
            },
            error: (err) => {
                console.error('Failed to load reception details:', err);
                this.loadingReceptionDetails = false;
                this.receptionDialogVisible = false;
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

    loadCalendarData(year: number, month: number) {
        const cacheKey = `${year}-${month}`;

        if (this.calendarCache.has(cacheKey)) {
            this.updateSelectedDayCounts(this.selectedDate);
            return;
        }

        this.calendarEventsService.getCalendarEvents(year, month).subscribe({
            next: (response) => {
                this.calendarCache.set(cacheKey, response);
                this.updateSelectedDayCounts(this.selectedDate);
            },
            error: (err) => {
                console.error('Failed to load calendar data:', err);
            }
        });
    }

    updateSelectedDayCounts(date: Date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const cacheKey = `${year}-${month}`;

        const calendarData = this.calendarCache.get(cacheKey);
        if (!calendarData) {
            this.selectedDayCounts.set(null);
            return;
        }

        // Форматируем дату в формат "YYYY-MM-DD"
        const dateString = `${year}-${month.toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

        // Находим данные для выбранного дня
        const dayCounts = calendarData.days.find((day) => day.date === dateString);
        this.selectedDayCounts.set(dayCounts || null);
    }

    onStatisticClick(type: 'incidents' | 'shutdowns' | 'discharges' | 'visits', count: number) {
        if (count === 0) return;

        // Мапим тип для API
        const typeMap = {
            incidents: 'incident',
            shutdowns: 'shutdown',
            discharges: 'discharge',
            visits: 'visit'
        };

        const apiType = typeMap[type] as 'incident' | 'shutdown' | 'discharge' | 'visit';

        // Мапим тип для заголовка
        const headerMap = {
            incidents: 'Инциденты',
            shutdowns: 'Аварийные отключения',
            discharges: 'Холостые водосбросы',
            visits: 'Визиты'
        };

        this.statisticsDialogHeader = `${headerMap[type]} - ${this.selectedDate.toLocaleDateString('ru-RU')}`;
        this.statisticsDialogVisible = true;
        this.loadingStatistics = true;

        this.pastEventsService.getPastEventsByType(this.selectedDate, apiType).subscribe({
            next: (response) => {
                // Извлекаем массив events из ответа, создаем копию и реверсируем
                const eventsArray = response?.events ? [...response.events].reverse() : [];
                this.statisticsPastEvents.set(eventsArray);
                this.loadingStatistics = false;
            },
            error: (err) => {
                console.error('Failed to load statistics:', err);
                this.loadingStatistics = false;
                this.statisticsDialogVisible = false;
            }
        });
    }
}
