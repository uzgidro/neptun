# План: Добавление кнопок экспорта на страницу холостых сбросов

## Цель

Добавить две кнопки экспорта (Excel и PDF) на страницу холостых сбросов по API `/discharges/export?date=YYYY-MM-DD&format=excel|pdf`

## Файлы для изменения

### 1. `src/app/core/services/discharge.service.ts`

Добавить метод для скачивания отчёта:

```typescript
downloadDischarges(date: Date, format: 'excel' | 'pdf'): Observable<HttpResponse<Blob>> {
    return this.http.get(BASE_URL + DISCHARGES + '/export', {
        params: {
            date: this.dateToYMD(date),
            format: format
        },
        responseType: 'blob',
        observe: 'response'
    });
}
```

### 2. `src/app/pages/situation-center/ges/shutdown/shutdown_discharges/shutdown-discharge.component.ts`

Добавить:

- Импорт `finalize` из rxjs, `HttpResponse` из @angular/common/http, `saveAs` из file-saver
- Переменные состояния: `isExcelLoading = false`, `isPdfLoading = false`
- Геттер `dateYMD` для форматирования даты
- Метод `download(format: 'excel' | 'pdf')` по аналогии с reservoirs-summary.component.ts

### 3. `src/app/pages/situation-center/ges/shutdown/shutdown_discharges/shutdown-discharge.component.html`

Добавить кнопки экспорта в caption таблицы (строка 22-37), рядом с датой:

```html
<div class="flex justify-end items-center gap-3">
    <p-button
        label="Excel"
        icon="pi pi-file-excel"
        severity="success"
        [loading]="isExcelLoading"
        [disabled]="!discharges || discharges.length === 0"
        (onClick)="download('excel')">
    </p-button>
    <p-button
        label="PDF"
        icon="pi pi-file-pdf"
        severity="danger"
        [loading]="isPdfLoading"
        [disabled]="!discharges || discharges.length === 0"
        (onClick)="download('pdf')">
    </p-button>
    <p-iconfield>...</p-iconfield>
    <app-date ...></app-date>
</div>
```

## Порядок выполнения

1. Добавить метод в discharge.service.ts
2. Добавить логику в shutdown-discharge.component.ts
3. Добавить кнопки в shutdown-discharge.component.html

## Проверка

- Открыть страницу холостых сбросов
- Проверить, что кнопки отображаются
- Проверить, что кнопки disabled когда нет данных
- Нажать на кнопку Excel - должен скачаться файл
- Нажать на кнопку PDF - должен скачаться файл
- Проверить спиннер загрузки на кнопках
