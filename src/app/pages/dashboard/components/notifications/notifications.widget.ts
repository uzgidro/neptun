import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { DatePipe, NgClass } from '@angular/common';
import { PastEventsService } from '@/core/services/past-events.service';
import { DateGroup, PastEvent, EventType } from '@/core/interfaces/past-events';
import { FileResponse } from '@/core/interfaces/files';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [ButtonModule, MenuModule, DatePipe, NgClass, ButtonDirective, DialogComponent, DatePickerComponent, FormsModule, TranslateModule],
    templateUrl: './notifications.widget.html'
})
export class NotificationsWidget implements OnInit {
    private pastEventsService = inject(PastEventsService);

    eventsByDate: DateGroup[] = [];
    loading = false;
    expandedEvents = new Set<string>();
    selectedDate: Date = new Date();

    @Input() expanded: boolean = false;
    @Output() expansionChange = new EventEmitter<boolean>();

    imageViewerVisible = false;
    imageViewerHeader = '';
    selectedImageUrl = '';

    items = [
        { label: 'Add New', icon: 'pi pi-fw pi-plus' },
        { label: 'Remove', icon: 'pi pi-fw pi-trash' }
    ];

    ngOnInit() {
        this.loadPastEvents();
    }

    toggleEventExpansion(eventDate: string) {
        if (this.expandedEvents.has(eventDate)) {
            this.expandedEvents.delete(eventDate);
        } else {
            this.expandedEvents.add(eventDate);
        }
    }

    isEventExpanded(eventDate: string): boolean {
        return this.expandedEvents.has(eventDate);
    }

    getEventKey(event: PastEvent): string {
        return event.date + event.entity_type + event.entity_id + event.organization_id;
    }

    shouldShowExpandButton(event: PastEvent): boolean {
        return event.description.length > 120 || this.hasMediaFiles(event);
    }

    hasMediaFiles(event: PastEvent): boolean {
        if (!event.files || event.files.length === 0) return false;
        return event.files.some((file) => this.isImageFile(file.file_name) || this.isVideoFile(file.file_name));
    }

    getMediaFiles(event: PastEvent): FileResponse[] {
        if (!event.files) return [];
        return event.files.filter((file) => this.isImageFile(file.file_name) || this.isVideoFile(file.file_name));
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

    loadPastEvents(date?: Date) {
        this.loading = true;
        this.pastEventsService.getPastEvents(date).subscribe({
            next: (response) => {
                this.eventsByDate = response;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading past events:', error);
                this.loading = false;
            }
        });
    }

    onDateChange(date: Date | null) {
        if (date) {
            this.loadPastEvents(date);
        } else {
            this.loadPastEvents();
        }
    }

    getEventIcon(type: EventType, event?: PastEvent): string {
        // Check for entity_type first
        if (event?.entity_type) {
            const entityIcons: Record<string, string> = {
                shutdown: 'pi-wrench',
                discharge: 'pi-comment',
                incident: 'pi-exclamation-triangle'
            };
            if (entityIcons[event.entity_type]) {
                return entityIcons[event.entity_type];
            }
        }

        // Fallback to type-based icons
        const icons: Record<EventType, string> = {
            success: 'pi-check-circle',
            danger: 'pi-exclamation-circle',
            warning: 'pi-times-circle',
            info: 'pi-info-circle'
        };
        return icons[type] || 'pi-info-circle';
    }

    getEntityIconRotation(entityType?: string): string {
        return entityType === 'discharge' ? 'rotate-135' : '';
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

    openImageViewer(event: PastEvent, index: number) {
        if (event.files) {
            this.selectedImageUrl = event.files[index].url;
            this.imageViewerHeader = `${event.organization_name}`;
            this.imageViewerVisible = true;
        }
    }

    expandAll() {
        this.expanded = !this.expanded;
        this.expansionChange.emit(this.expanded);
    }
}
