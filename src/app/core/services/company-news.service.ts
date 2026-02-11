import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiService } from '@/core/services/api.service';
import { CompanyNewsResponse } from '@/core/interfaces/company-news';

@Injectable({
    providedIn: 'root'
})
export class CompanyNewsService extends ApiService {
    getNews(page: number = 1): Observable<CompanyNewsResponse> {
        const mockData: CompanyNewsResponse = {
            items: [
                {
                    id: 1,
                    uz: 'Yangi sut zavodi ishga tushirildi',
                    ru: 'Запущен новый молокозавод',
                    eng: 'New dairy plant launched',
                    uztext: 'Yangi zamonaviy sut zavodi ishga tushirildi.',
                    rutext: 'Новый современный молокозавод был запущен в эксплуатацию.',
                    engtext: 'A new modern dairy plant has been launched.',
                    uzsmall: 'Yangi zavod ishga tushirildi',
                    rusmall: 'Новый завод запущен',
                    engsmall: 'New plant launched',
                    date: new Date().toISOString().split('T')[0],
                    img: '',
                    views: 120
                },
                {
                    id: 2,
                    uz: 'Ishlab chiqarish hajmi oshdi',
                    ru: 'Объём производства увеличен',
                    eng: 'Production volume increased',
                    uztext: 'Kompaniya ishlab chiqarish hajmini 15% ga oshirdi.',
                    rutext: 'Компания увеличила объём производства на 15%.',
                    engtext: 'The company increased production volume by 15%.',
                    uzsmall: 'Ishlab chiqarish oshdi',
                    rusmall: 'Производство выросло',
                    engsmall: 'Production grew',
                    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                    img: '',
                    views: 85
                }
            ],
            _meta: {
                totalCount: 2,
                pageCount: 1,
                currentPage: page,
                perPage: 10
            },
            _links: {
                self: { href: '#' },
                last: { href: '#' }
            }
        };
        return of(mockData).pipe(delay(200));
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
