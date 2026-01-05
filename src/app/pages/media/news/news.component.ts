import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TelegramMessage, TelegramNewsParams, TelegramNewsResponse } from '@/core/interfaces/telegram-news';
import { NewsService } from '@/core/services/news.service';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { Image } from 'primeng/image';
import { Paginator } from 'primeng/paginator';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';

@Component({
    selector: 'app-news',
    standalone: true,
    imports: [CommonModule, FormsModule, Tag, ButtonDirective, IconField, InputIcon, InputText, Tooltip, Dialog, Divider, Image, Paginator, DatePickerComponent, PrimeTemplate, ButtonIcon, ButtonLabel, NgOptimizedImage],
    templateUrl: './news.component.html',
    styleUrl: './news.component.scss'
})
export class NewsComponent implements OnInit, OnDestroy {
    newsData: TelegramNewsResponse | null = null;
    messages: TelegramMessage[] = [];
    filteredMessages: TelegramMessage[] = [];
    loading = true;
    displayDetailDialog = false;
    selectedMessage: TelegramMessage | null = null;

    // Параметры пагинации
    first = 0;
    rows = 10;
    totalRecords = 0;

    // Фильтры
    searchQuery = '';
    dateFrom: Date | null = null;
    dateTo: Date | null = null;

    private newsService = inject(NewsService);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.loadNews();
    }

    private loadNews(params?: TelegramNewsParams) {
        this.loading = true;
        const apiParams: TelegramNewsParams = {
            limit: params?.limit || 100,
            ...params
        };

        this.newsService
            .getNews(apiParams)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.newsData = data;
                    this.messages = data.messages;
                    this.totalRecords = data.messages.length;
                    this.applyFilters();
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка',
                        detail: 'Не удалось загрузить новости'
                    });
                    console.error('Error loading news:', error);
                },
                complete: () => (this.loading = false)
            });
    }

    applyFilters() {
        let result = [...this.messages];

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            result = result.filter((m) => m.text.toLowerCase().includes(query));
        }

        if (this.dateFrom) {
            const fromTime = this.dateFrom.getTime();
            result = result.filter((m) => new Date(m.date).getTime() >= fromTime);
        }

        if (this.dateTo) {
            const toTime = this.dateTo.getTime();
            result = result.filter((m) => new Date(m.date).getTime() <= toTime);
        }

        this.filteredMessages = result;
        this.first = 0;
    }

    onSearchInput(event: Event) {
        this.searchQuery = (event.target as HTMLInputElement).value.toLowerCase();
        this.applyFilters();
    }

    onDateFilterChange() {
        this.applyFilters();
    }

    clearDateFilter() {
        this.dateFrom = null;
        this.dateTo = null;
        this.applyFilters();
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
    }

    get paginatedMessages(): TelegramMessage[] {
        return this.filteredMessages.slice(this.first, this.first + this.rows);
    }

    openDetailDialog(message: TelegramMessage) {
        this.selectedMessage = message;
        this.displayDetailDialog = true;
    }

    closeDetailDialog() {
        this.displayDetailDialog = false;
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatDateTime(dateStr: string): string {
        return new Date(dateStr).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    truncateText(text: string, maxLength: number = 150): string {
        if (!text) return '';
        const cleanText = text.replace(/\n/g, ' ').trim();
        return cleanText.length > maxLength ? cleanText.substring(0, maxLength) + '...' : cleanText;
    }

    getMediaUrl(message: TelegramMessage): string {
        return message.media?.url || '';
    }

    getMediaThumbnail(message: TelegramMessage): string {
        return message.media?.thumbnail_url || message.media?.url || '';
    }

    hasMedia(message: TelegramMessage): boolean {
        return !!message.media;
    }

    isVideo(message: TelegramMessage): boolean {
        return message.media?.type === 'video';
    }

    isPhoto(message: TelegramMessage): boolean {
        return message.media?.type === 'photo';
    }

    formatViews(views: number): string {
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1) + 'M';
        } else if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'K';
        }
        return views.toString();
    }

    onCardHover(event: MouseEvent, isHovering: boolean) {
        const card = event.currentTarget as HTMLElement;
        const video = card.querySelector('video') as HTMLVideoElement;

        if (video) {
            if (isHovering) {
                video.play().catch(() => {});
            } else {
                video.pause();
                video.currentTime = 0;
            }
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
