import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { UzgidroNewsResponse } from '@/core/interfaces/uzgidro-news';

const NEWS = '/news';

@Injectable({
    providedIn: 'root'
})
export class UzgidroNewsService extends ApiService {
    getNews(page: number = 1): Observable<UzgidroNewsResponse> {
        return this.http.get<UzgidroNewsResponse>(`${BASE_URL}${NEWS}`, {
            params: { page: page.toString() }
        });
    }

    /**
     * Maps application language code to API field suffix
     * uz-latn/uz-cyrl → uz, en → eng, ru → ru
     */
    mapLanguageToField(langCode: string): 'uz' | 'ru' | 'eng' {
        if (langCode.startsWith('uz')) {
            return 'uz';
        }
        if (langCode === 'en') {
            return 'eng';
        }
        return 'ru';
    }
}
