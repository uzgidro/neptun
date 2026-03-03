import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { ApiService } from '@/core/services/api.service';
import { UzgidroNewsResponse } from '@/core/interfaces/uzgidro-news';

const MOCK_NEWS: UzgidroNewsResponse = {
    items: [
        { id: 1, uz: 'Yangi ishlab chiqarish liniyasi ishga tushirildi', ru: 'Запущена новая производственная линия', eng: 'New production line launched', uztext: 'Yangi ishlab chiqarish liniyasi muvaffaqiyatli ishga tushirildi.', rutext: 'Новая производственная линия успешно запущена на Молокозаводе №1.', engtext: 'A new production line has been successfully launched at Plant No. 1.', uzsmall: 'Yangi liniya ishga tushirildi', rusmall: 'Новая линия запущена', engsmall: 'New line launched', date: '2024-12-25', img: '', views: 245 },
        { id: 2, uz: 'Yillik hisobot tasdiqlandi', ru: 'Утверждён годовой отчёт', eng: 'Annual report approved', uztext: 'Kompaniyaning yillik hisoboti tasdiqlandi.', rutext: 'Утверждён годовой отчёт компании за 2024 год.', engtext: 'The company annual report for 2024 has been approved.', uzsmall: 'Hisobot tasdiqlandi', rusmall: 'Отчёт утверждён', engsmall: 'Report approved', date: '2024-12-20', img: '', views: 180 },
        { id: 3, uz: 'Xalqaro hamkorlik shartnomasi imzolandi', ru: 'Подписан договор о международном сотрудничестве', eng: 'International cooperation agreement signed', uztext: 'Xalqaro hamkorlik boʻyicha yangi shartnoma imzolandi.', rutext: 'Подписан новый договор о международном сотрудничестве в области молочной промышленности.', engtext: 'A new international cooperation agreement in the dairy industry has been signed.', uzsmall: 'Shartnoma imzolandi', rusmall: 'Договор подписан', engsmall: 'Agreement signed', date: '2024-12-18', img: '', views: 312 },
        { id: 4, uz: 'Xodimlar malaka oshirish kursini tugatdi', ru: 'Сотрудники завершили курс повышения квалификации', eng: 'Employees completed advanced training course', uztext: 'Kompaniya xodimlari malaka oshirish kursini muvaffaqiyatli tugatdi.', rutext: 'Группа сотрудников успешно завершила курс повышения квалификации.', engtext: 'A group of employees successfully completed an advanced training course.', uzsmall: 'Kurs tugatildi', rusmall: 'Курс завершён', engsmall: 'Course completed', date: '2024-12-15', img: '', views: 98 }
    ],
    _meta: { totalCount: 4, pageCount: 1, currentPage: 1, perPage: 20 },
    _links: { self: { href: '/news?page=1' }, last: { href: '/news?page=1' } }
};

@Injectable({
    providedIn: 'root'
})
export class UzgidroNewsService extends ApiService {
    getNews(page: number = 1): Observable<UzgidroNewsResponse> {
        return of(MOCK_NEWS).pipe(delay(300));
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
