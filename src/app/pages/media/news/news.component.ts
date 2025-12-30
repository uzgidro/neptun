import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { News, NewsPayload, NewsCategory, NewsCategoryType, NewsStatus } from '@/core/interfaces/news';
import { NewsService } from '@/core/services/news.service';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { TextareaComponent } from '@/layout/component/dialog/textarea/textarea.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { FileUploadComponent } from '@/layout/component/dialog/file-upload/file-upload.component';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { Image } from 'primeng/image';
import { GalleriaModule } from 'primeng/galleria';
import { Paginator } from 'primeng/paginator';

@Component({
    selector: 'app-news',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        Tag,
        ButtonDirective,
        ButtonIcon,
        ButtonLabel,
        IconField,
        InputIcon,
        InputText,
        Tooltip,
        Select,
        DialogComponent,
        InputTextComponent,
        SelectComponent,
        TextareaComponent,
        DatePickerComponent,
        DeleteConfirmationComponent,
        FileUploadComponent,
        Dialog,
        Divider,
        Image,
        GalleriaModule,
        Paginator
    ],
    templateUrl: './news.component.html',
    styleUrl: './news.component.scss'
})
export class NewsComponent implements OnInit, OnDestroy {
    news: News[] = [];
    filteredNews: News[] = [];
    paginatedNews: News[] = [];
    loading = true;
    syncing = false;
    displayDialog = false;
    displayDeleteDialog = false;
    displayDetailDialog = false;
    submitted = false;
    isEditMode = false;
    selectedNews: News | null = null;

    // Пагинация
    first = 0;
    rows = 10;

    newsForm: FormGroup;
    mediaFiles: File[] = [];
    mediaToRemove: Set<number> = new Set();

    categories: NewsCategory[] = [];
    selectedCategory: NewsCategoryType | null = null;
    selectedStatus: NewsStatus | null = null;
    selectedSort: string = 'date_desc';

    categoryOptions: { name: string; value: NewsCategoryType | null }[] = [];
    categoryFormOptions: { name: string; value: number }[] = [];

    statusOptions = [
        { name: 'Все статусы', value: null },
        { name: 'Черновик', value: 'draft' },
        { name: 'Опубликовано', value: 'published' },
        { name: 'В архиве', value: 'archived' }
    ];

    sortOptions = [
        { name: 'Сначала новые', value: 'date_desc' },
        { name: 'Сначала старые', value: 'date_asc' },
        { name: 'По заголовку (А-Я)', value: 'title_asc' },
        { name: 'По заголовку (Я-А)', value: 'title_desc' }
    ];

    statusFormOptions = [
        { name: 'Черновик', value: 'draft' },
        { name: 'Опубликовано', value: 'published' },
        { name: 'В архиве', value: 'archived' }
    ];

    sourceFormOptions = [
        { name: 'Ручной ввод', value: 'manual' },
        { name: 'Telegram', value: 'telegram' },
        { name: 'Instagram', value: 'instagram' }
    ];

    private newsService = inject(NewsService);
    private messageService = inject(MessageService);
    private fb = inject(FormBuilder);
    private destroy$ = new Subject<void>();

    constructor() {
        this.newsForm = this.fb.group({
            title: ['', Validators.required],
            content: ['', Validators.required],
            category: [null, Validators.required],
            source: [null, Validators.required],
            sourceUrl: [''],
            status: [null, Validators.required],
            publishedAt: [null]
        });

        // Подписка на изменения формы для предпросмотра
        this.newsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe();
    }

    ngOnInit() {
        this.loadCategories();
        this.loadNews();
    }

    private loadCategories() {
        this.categories = this.newsService.getCategories();
        this.categoryOptions = [
            { name: 'Все категории', value: null },
            ...this.categories.map(c => ({ name: c.name, value: c.type }))
        ];
        this.categoryFormOptions = this.categories.map(c => ({ name: c.name, value: c.id }));
    }

    private loadNews() {
        this.loading = true;
        this.newsService
            .getAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.news = data;
                    this.applyFilters();
                },
                complete: () => (this.loading = false)
            });
    }

    applyFilters() {
        let result = [...this.news];

        if (this.selectedCategory) {
            result = result.filter(n => n.category?.type === this.selectedCategory);
        }

        if (this.selectedStatus) {
            result = result.filter(n => n.status === this.selectedStatus);
        }

        if (this.searchQuery) {
            result = result.filter(n =>
                n.title.toLowerCase().includes(this.searchQuery) ||
                n.content.toLowerCase().includes(this.searchQuery)
            );
        }

        // Сортировка
        result.sort((a, b) => {
            switch (this.selectedSort) {
                case 'date_desc':
                    return new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime();
                case 'date_asc':
                    return new Date(a.publishedAt || a.createdAt).getTime() - new Date(b.publishedAt || b.createdAt).getTime();
                case 'title_asc':
                    return a.title.localeCompare(b.title, 'ru');
                case 'title_desc':
                    return b.title.localeCompare(a.title, 'ru');
                default:
                    return 0;
            }
        });

        this.filteredNews = result;
        this.first = 0; // Сбрасываем на первую страницу при изменении фильтров
        this.updatePaginatedNews();
    }

    updatePaginatedNews() {
        this.paginatedNews = this.filteredNews.slice(this.first, this.first + this.rows);
    }

    onPageChange(event: any) {
        this.first = event.first;
        this.rows = event.rows;
        this.updatePaginatedNews();
    }

    searchQuery = '';

    onSearchInput(event: Event) {
        this.searchQuery = (event.target as HTMLInputElement).value.toLowerCase();
        this.applyFilters();
    }

    syncFromTelegram() {
        this.syncing = true;
        this.newsService
            .syncFromTelegram()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result) => {
                    this.messageService.add({
                        severity: result.synced > 0 ? 'success' : 'info',
                        summary: 'Синхронизация',
                        detail: result.message
                    });
                    if (result.synced > 0) {
                        this.loadNews();
                    }
                },
                error: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка',
                        detail: 'Не удалось выполнить синхронизацию'
                    });
                },
                complete: () => (this.syncing = false)
            });
    }

    openDialog() {
        this.isEditMode = false;
        this.selectedNews = null;
        this.submitted = false;
        this.mediaFiles = [];
        this.mediaToRemove.clear();
        this.newsForm.reset();
        this.displayDialog = true;
    }

    openEditDialog(news: News) {
        this.isEditMode = true;
        this.selectedNews = news;
        this.submitted = false;
        this.mediaFiles = [];
        this.mediaToRemove.clear();

        const categoryOption = this.categoryFormOptions.find(c => c.value === news.categoryId);
        const sourceOption = this.sourceFormOptions.find(s => s.value === news.source);
        const statusOption = this.statusFormOptions.find(s => s.value === news.status);

        this.newsForm.patchValue({
            title: news.title,
            content: news.content,
            category: categoryOption || null,
            source: sourceOption || null,
            sourceUrl: news.sourceUrl || '',
            status: statusOption || null,
            publishedAt: news.publishedAt ? new Date(news.publishedAt) : null
        });

        this.displayDialog = true;
    }

    closeDialog() {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedNews = null;
        this.mediaFiles = [];
        this.mediaToRemove.clear();
    }

    toggleMediaRemoval(mediaId: number) {
        if (this.mediaToRemove.has(mediaId)) {
            this.mediaToRemove.delete(mediaId);
        } else {
            this.mediaToRemove.add(mediaId);
        }
    }

    onFilesChange(files: File[]) {
        this.mediaFiles = files;
    }

    onRemoveFile(index: number) {
        this.mediaFiles = this.mediaFiles.filter((_, i) => i !== index);
    }

    onSubmit() {
        this.submitted = true;

        if (this.newsForm.invalid) {
            return;
        }

        const formValue = this.newsForm.value;
        const payload: NewsPayload = {
            title: formValue.title,
            content: formValue.content,
            categoryId: formValue.category?.value || formValue.category,
            source: formValue.source?.value || formValue.source,
            sourceUrl: formValue.sourceUrl || undefined,
            status: formValue.status?.value || formValue.status,
            publishedAt: formValue.publishedAt instanceof Date
                ? formValue.publishedAt.toISOString()
                : formValue.publishedAt
        };

        if (this.isEditMode && this.selectedNews) {
            const mediaIdsToRemove = Array.from(this.mediaToRemove);
            this.newsService
                .update(this.selectedNews.id, payload, this.mediaFiles, mediaIdsToRemove)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Новость обновлена' });
                        this.loadNews();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось обновить новость' });
                    }
                });
        } else {
            this.newsService
                .create(payload, this.mediaFiles)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Новость создана' });
                        this.loadNews();
                        this.closeDialog();
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось создать новость' });
                    }
                });
        }
    }

    openDetailDialog(news: News) {
        this.selectedNews = news;
        this.displayDetailDialog = true;
    }

    closeDetailDialog() {
        this.displayDetailDialog = false;
    }

    openDeleteDialog(news: News) {
        this.selectedNews = news;
        this.displayDeleteDialog = true;
    }

    confirmDelete() {
        if (!this.selectedNews) return;

        this.newsService
            .delete(this.selectedNews.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Новость удалена' });
                    this.loadNews();
                    this.displayDeleteDialog = false;
                    this.selectedNews = null;
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось удалить новость' });
                }
            });
    }

    getCategoryLabel(type: NewsCategoryType): string {
        return this.newsService.getCategoryLabel(type);
    }

    getCategoryColor(type: NewsCategoryType): string {
        return this.newsService.getCategoryColor(type);
    }

    getCategoryIcon(type: NewsCategoryType): string {
        return this.newsService.getCategoryIcon(type);
    }

    getStatusLabel(status: NewsStatus): string {
        return this.newsService.getStatusLabel(status);
    }

    getStatusSeverity(status: NewsStatus): any {
        return this.newsService.getStatusSeverity(status);
    }

    getSourceLabel(source: string): string {
        return this.newsService.getSourceLabel(source);
    }

    formatDate(dateStr: string | null | undefined): string {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('ru-RU');
    }

    formatDateTime(dateStr: string | null | undefined): string {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    truncateText(text: string, maxLength: number = 100): string {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    getFirstImageUrl(news: News): string | null {
        if (!news.media || news.media.length === 0) return null;
        const image = news.media.find(m => m.type === 'image');
        return image ? image.url : null;
    }

    getFirstVideoUrl(news: News): string | null {
        if (!news.media || news.media.length === 0) return null;
        const video = news.media.find(m => m.type === 'video');
        return video ? video.url : null;
    }

    hasMediaType(news: News, type: 'image' | 'video' | 'document'): boolean {
        if (!news.media) return false;
        return news.media.some(m => m.type === type);
    }

    onCardHover(event: MouseEvent, isHovering: boolean) {
        const card = event.currentTarget as HTMLElement;
        const video = card.querySelector('video') as HTMLVideoElement;
        const overlay = card.querySelector('.news-card-video-overlay') as HTMLElement;

        if (video) {
            if (isHovering) {
                video.play().catch(() => {});
                if (overlay) overlay.style.opacity = '0';
            } else {
                video.pause();
                video.currentTime = 0;
                if (overlay) overlay.style.opacity = '1';
            }
        }
    }

    onVideoLoaded(event: Event) {
        const video = event.target as HTMLVideoElement;
        const overlay = video.parentElement?.querySelector('.news-card-video-overlay') as HTMLElement;
        if (overlay) {
            overlay.classList.add('loaded');
        }
    }

    onVideoError(event: Event, news: News) {
        console.warn('Video failed to load:', news.title);
    }

    getImages(news: News): any[] {
        if (!news.media) return [];
        return news.media.filter(m => m.type === 'image');
    }

    getVideos(news: News): any[] {
        if (!news.media) return [];
        return news.media.filter(m => m.type === 'video');
    }

    getDocuments(news: News): any[] {
        if (!news.media) return [];
        return news.media.filter(m => m.type === 'document');
    }

    galleriaResponsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 5
        },
        {
            breakpoint: '768px',
            numVisible: 3
        },
        {
            breakpoint: '560px',
            numVisible: 2
        }
    ];

    // Предпросмотр - получение значений из формы
    get previewTitle(): string {
        return this.newsForm.get('title')?.value || 'Заголовок новости';
    }

    get previewContent(): string {
        const content = this.newsForm.get('content')?.value || '';
        return content ? this.truncateText(content, 200) : 'Текст новости будет отображаться здесь...';
    }

    get previewCategory(): NewsCategory | null {
        const categoryValue = this.newsForm.get('category')?.value;
        const categoryId = categoryValue?.value || categoryValue;
        return categoryId ? this.newsService.getCategoryById(categoryId) || null : null;
    }

    get previewPublishedAt(): string {
        const date = this.newsForm.get('publishedAt')?.value;
        return date ? this.formatDateTime(date instanceof Date ? date.toISOString() : date) : this.formatDateTime(new Date().toISOString());
    }

    get hasPreviewMedia(): boolean {
        return this.mediaFiles.length > 0 || (this.selectedNews?.media?.length || 0) > 0;
    }

    get previewMediaUrl(): string | null {
        if (this.mediaFiles.length > 0 && this.mediaFiles[0].type.startsWith('image/')) {
            return URL.createObjectURL(this.mediaFiles[0]);
        }
        if (this.selectedNews?.media?.length && this.selectedNews.media[0].type === 'image') {
            return this.selectedNews.media[0].url;
        }
        return null;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
