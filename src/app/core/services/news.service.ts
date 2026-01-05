import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { TelegramNewsParams, TelegramNewsResponse } from '@/core/interfaces/telegram-news';
import { ApiService, BASE_URL } from '@/core/services/api.service';

const NEWS = '/news';

@Injectable({
    providedIn: 'root'
})
export class NewsService extends ApiService {
    getNews(params?: TelegramNewsParams): Observable<TelegramNewsResponse> {
        let httpParams = new HttpParams();

        if (params?.limit) {
            httpParams = httpParams.set('limit', params.limit.toString());
        }
        if (params?.offset_id) {
            httpParams = httpParams.set('offset_id', params.offset_id.toString());
        }
        if (params?.date_from) {
            httpParams = httpParams.set('date_from', params.date_from);
        }
        if (params?.date_to) {
            httpParams = httpParams.set('date_to', params.date_to);
        }

        return this.http.get<TelegramNewsResponse>(BASE_URL + NEWS, { params: httpParams });
    }
}
