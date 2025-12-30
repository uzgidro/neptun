import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { News, NewsPayload, NewsCategory, NewsCategoryType, NewsStatus } from '@/core/interfaces/news';

@Injectable({
    providedIn: 'root'
})
export class NewsService {
    private readonly categories: NewsCategory[] = [
        { id: 1, name: 'Instagram', type: 'instagram', icon: 'pi pi-instagram', color: '#E4405F' },
        { id: 2, name: 'Telegram', type: 'telegram', icon: 'pi pi-telegram', color: '#0088cc' }
    ];

    private mockNews: News[] = [];

    private nextId = 1;
    private nextMediaId = 1;

    getCategories(): NewsCategory[] {
        return [...this.categories];
    }

    getCategoryById(id: number): NewsCategory | undefined {
        return this.categories.find(c => c.id === id);
    }

    getCategoryByType(type: NewsCategoryType): NewsCategory | undefined {
        return this.categories.find(c => c.type === type);
    }

    getAll(): Observable<News[]> {
        return of([...this.mockNews]).pipe(delay(300));
    }

    getByCategory(categoryType: NewsCategoryType): Observable<News[]> {
        const filtered = this.mockNews.filter(n => n.category?.type === categoryType);
        return of(filtered).pipe(delay(300));
    }

    getById(id: number): Observable<News | undefined> {
        const news = this.mockNews.find(n => n.id === id);
        return of(news).pipe(delay(200));
    }

    create(payload: NewsPayload, mediaFiles?: File[]): Observable<News> {
        const category = this.getCategoryById(payload.categoryId);

        // Обработка загруженных файлов
        const media = this.processMediaFiles(mediaFiles);

        const newNews: News = {
            id: this.nextId++,
            ...payload,
            category,
            media,
            createdAt: new Date().toISOString()
        };
        this.mockNews.unshift(newNews);
        return of(newNews).pipe(delay(300));
    }

    private processMediaFiles(files?: File[]): { id: number; type: 'image' | 'video' | 'document'; url: string; fileName: string }[] {
        if (!files || files.length === 0) {
            return [];
        }

        return files.map(file => {
            const url = URL.createObjectURL(file);
            let type: 'image' | 'video' | 'document' = 'document';

            if (file.type.startsWith('image/')) {
                type = 'image';
            } else if (file.type.startsWith('video/')) {
                type = 'video';
            }

            return {
                id: this.nextMediaId++,
                type,
                url,
                fileName: file.name
            };
        });
    }

    update(id: number, payload: NewsPayload, mediaFiles?: File[], mediaIdsToRemove?: number[]): Observable<News> {
        const index = this.mockNews.findIndex(n => n.id === id);
        if (index !== -1) {
            const category = this.getCategoryById(payload.categoryId);

            // Обработка новых загруженных файлов
            const newMedia = this.processMediaFiles(mediaFiles);

            // Фильтруем существующие медиа (удаляем отмеченные)
            let existingMedia = this.mockNews[index].media || [];
            if (mediaIdsToRemove && mediaIdsToRemove.length > 0) {
                existingMedia = existingMedia.filter(m => !mediaIdsToRemove.includes(m.id));
            }

            // Объединяем оставшиеся медиа с новыми
            const combinedMedia = [...existingMedia, ...newMedia];

            this.mockNews[index] = {
                ...this.mockNews[index],
                ...payload,
                category,
                media: combinedMedia,
                updatedAt: new Date().toISOString()
            };
            return of(this.mockNews[index]).pipe(delay(300));
        }
        throw new Error('News not found');
    }

    delete(id: number): Observable<void> {
        const index = this.mockNews.findIndex(n => n.id === id);
        if (index !== -1) {
            this.mockNews.splice(index, 1);
        }
        return of(undefined).pipe(delay(300));
    }

    syncFromTelegram(): Observable<{ synced: number; message: string }> {
        // Заглушка для синхронизации с Telegram
        // В реальном приложении здесь будет вызов backend API
        return of({
            synced: 0,
            message: 'Синхронизация с Telegram требует настройки backend API'
        }).pipe(delay(1000));
    }

    getCategoryLabel(type: NewsCategoryType): string {
        const labels: Record<NewsCategoryType, string> = {
            instagram: 'Instagram',
            telegram: 'Telegram'
        };
        return labels[type];
    }

    getCategoryColor(type: NewsCategoryType): string {
        const colors: Record<NewsCategoryType, string> = {
            instagram: '#E4405F',
            telegram: '#0088cc'
        };
        return colors[type];
    }

    getCategoryIcon(type: NewsCategoryType): string {
        const icons: Record<NewsCategoryType, string> = {
            instagram: 'pi pi-instagram',
            telegram: 'pi pi-telegram'
        };
        return icons[type];
    }

    getStatusLabel(status: NewsStatus): string {
        const labels: Record<NewsStatus, string> = {
            draft: 'Черновик',
            published: 'Опубликовано',
            archived: 'В архиве'
        };
        return labels[status];
    }

    getStatusSeverity(status: NewsStatus): 'info' | 'warn' | 'success' | 'danger' | 'secondary' | 'contrast' {
        const severities: Record<NewsStatus, 'info' | 'success' | 'secondary'> = {
            draft: 'secondary',
            published: 'success',
            archived: 'info'
        };
        return severities[status];
    }

    getSourceLabel(source: string): string {
        const labels: Record<string, string> = {
            manual: 'Ручной ввод',
            telegram: 'Telegram',
            instagram: 'Instagram'
        };
        return labels[source] || source;
    }
}
