# План: Модуль новостей UzGidro

## Обзор

Реализовать фронтенд модуль для отображения новостей UzGidro с API `prime.speedwagon.uz/news`.

## API (из docs/news.md)

```
GET /news?page={page}
Authorization: Bearer <token>

Response: { items: [...], _meta: { totalCount, pageCount, currentPage, perPage: 20 }, _links }
Item: { id, uz, uztext, uzsmall, ru, rutext, rusmall, eng, engtext, engsmall, date, img, views }
```

## Файлы для создания

### 1. Интерфейсы: `src/app/core/interfaces/uzgidro-news.ts`

```typescript
export interface UzgidroNewsItem {
    id: number;
    uz: string; ru: string; eng: string;           // заголовки
    uztext: string; rutext: string; engtext: string; // HTML текст
    uzsmall: string; rusmall: string; engsmall: string; // краткий текст
    date: string; img: string; views: number;
}

export interface UzgidroNewsMeta {
    totalCount: number; pageCount: number; currentPage: number; perPage: number;
}

export interface UzgidroNewsResponse {
    items: UzgidroNewsItem[];
    _meta: UzgidroNewsMeta;
    _links: { self: { href: string }; next?: { href: string }; last: { href: string } };
}
```

### 2. Сервис: `src/app/core/services/uzgidro-news.service.ts`

- Наследует `ApiService`
- Метод `getNews(page?: number): Observable<UzgidroNewsResponse>`
- Хелпер для маппинга языков: `uz-latn/uz-cyrl → uz`, `en → eng`, `ru → ru`

### 3. Компонент: `src/app/pages/uzgidro-news/`

- `uzgidro-news.component.ts` - standalone, Angular 20 signals
- `uzgidro-news.component.html` - сетка карточек, диалог деталей
- `uzgidro-news.component.scss` - стили карточек

Функционал:

- Серверная пагинация (20 items/page)
- Карточки с изображениями
- Локализованный контент (uz/ru/eng по текущему языку)
- Детальный просмотр в диалоге (HTML контент через DomSanitizer)
- Скелетоны загрузки

## Файлы для изменения

### 4. Маршруты: `src/app.routes.ts`

Добавить импорт и маршрут:

```typescript
import { UzgidroNewsComponent } from '@/pages/uzgidro-news/uzgidro-news.component';
// ...
{ path: 'uzgidro-news', component: UzgidroNewsComponent, canActivate: [raisGuard] },
```

### 5. Переводы: `src/assets/i18n/*.json`

Добавить ключи `UZGIDRO_NEWS.*` в ru.json, en.json, uz-latn.json, uz-cyrl.json

## Референсы

- `src/app/core/services/api.service.ts:10` - BASE_URL
- `src/app/pages/media/news/news.component.ts` - паттерн компонента
- `src/app.routes.ts:99` - существующий маршрут media/news

## Проверка

1. `ng serve` - запустить приложение
2. Авторизоваться
3. Перейти на `/uzgidro-news`
4. Проверить загрузку новостей, пагинацию, смену языка, открытие диалога
