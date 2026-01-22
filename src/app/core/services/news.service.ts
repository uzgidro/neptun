import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TelegramNewsParams, TelegramNewsResponse } from '@/core/interfaces/telegram-news';
import { ApiService } from '@/core/services/api.service';

// Мок-данные новостей
const MOCK_NEWS: TelegramNewsResponse = {
    channel_id: 1,
    channel_title: 'МолокоПром Новости',
    messages: [
        {
            id: 1,
            text: 'Молокозавод "Самарканд" увеличил производство на 15% по итогам квартала',
            date: new Date().toISOString(),
            views: 245,
            forwards: 12,
            reactions: null,
            author: null,
            media: null,
            reply_to_message_id: null,
            edit_date: null,
            has_protected_content: false
        },
        {
            id: 2,
            text: 'Запуск новой производственной линии в кластере "Фергана"',
            date: new Date(Date.now() - 86400000).toISOString(),
            views: 189,
            forwards: 8,
            reactions: null,
            author: null,
            media: null,
            reply_to_message_id: null,
            edit_date: null,
            has_protected_content: false
        },
        {
            id: 3,
            text: 'АО "МолокоПром" подписал договор о модернизации оборудования',
            date: new Date(Date.now() - 172800000).toISOString(),
            views: 320,
            forwards: 25,
            reactions: null,
            author: null,
            media: null,
            reply_to_message_id: null,
            edit_date: null,
            has_protected_content: false
        }
    ]
};

@Injectable({
    providedIn: 'root'
})
export class NewsService extends ApiService {
    getNews(params?: TelegramNewsParams): Observable<TelegramNewsResponse> {
        return of(MOCK_NEWS).pipe(delay(300));
    }
}
