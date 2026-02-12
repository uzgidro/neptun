# Plan: MODSNOW Dashboard — Снежный покров

## Context

Новый API `GET /snow-cover?date=YYYY-MM-DD` возвращает данные снежного покрова (MODSNOW) по организациям за 3 периода: сегодня, вчера, год назад. Каждая организация содержит общий % покрова и зоны высотности с детализацией. Нужно создать новую страницу-дашборд «MODSNOW» в разделе «Водохранилища» меню и красиво отобразить эти данные.

## API Response Structure

```
GET /snow-cover?date=2025-02-07
→ { today: { date, items[] }, yesterday: { date, items[] }, year_ago: { date, items[] } }
→ item: { organization_id, organization_name, cover (%), zones[{ min_elev, max_elev, sca_pct }], resource_date }
```

## Files to Create

### 1. Interface — `src/app/core/interfaces/snow-cover.ts`

```ts
export interface SnowCoverZone {
    min_elev: number;
    max_elev: number;
    sca_pct: number;
}

export interface SnowCoverItem {
    organization_id: number;
    organization_name: string;
    cover: number | null;
    zones: SnowCoverZone[] | null;
    resource_date: string | null;
}

export interface SnowCoverPeriod {
    date: string;
    items: SnowCoverItem[];
}

export interface SnowCoverResponse {
    today: SnowCoverPeriod;
    yesterday: SnowCoverPeriod;
    year_ago: SnowCoverPeriod;
}
```

### 2. Service — `src/app/core/services/snow-cover.service.ts`

Extends `ApiService`. Endpoint: `BASE_URL + '/snow-cover'`. Метод `getSnowCover(date?: Date)` с опциональным параметром `date`.

### 3. Component — `src/app/pages/situation-center/reservoirs-info/snow-cover/`

- `snow-cover.component.ts` — standalone component, inject `SnowCoverService`
- `snow-cover.component.html` — layout с карточками и графиками
- `snow-cover.component.scss` — стили

**Dashboard layout:**

1. **Toolbar** — DatePicker для выбора даты + кнопка обновления + «Последнее обновление»
2. **Summary cards (3 шт)** — Средний % покрова: сегодня / вчера / год назад (с иконками и цветами)
3. **Bar chart** — Горизонтальный bar chart: покров по организациям (сегодня vs год назад)
4. **Table** — PrimeNG p-table: организация, сегодня %, вчера %, год назад %, дельта (сегодня - год назад)
5. **Expandable rows** — При раскрытии строки показать зоны высотности организации

## Files to Modify

### 4. Routes — `src/app.routes.ts`

Добавить: `{ path: 'snow-cover', component: SnowCoverComponent, canActivate: [raisGuard] }`

### 5. Menu — `src/app/layout/component/menu/menu.component.ts`

В секцию `MENU.RESERVOIR_INFO` → `items[]` добавить 4-й пункт:

```ts
{
    label: this.t('MENU.SNOW_COVER'),
    role: ['rais', 'sc'],
    routerLink: ['/snow-cover']
}
```

### 6. Translations — все 4 i18n файла

**MENU:**

- `MENU.SNOW_COVER`: "MODSNOW" (ru) / "MODSNOW" (en) / "MODSNOW" (uz-cyrl) / "MODSNOW" (uz-latn)

**SNOW_COVER section (новая, верхнего уровня):**

- `SNOW_COVER.TITLE`: "Снежный покров (MODSNOW)"
- `SNOW_COVER.TODAY`: "Сегодня"
- `SNOW_COVER.YESTERDAY`: "Вчера"
- `SNOW_COVER.YEAR_AGO`: "Год назад"
- `SNOW_COVER.AVG_COVER`: "Средний покров"
- `SNOW_COVER.ORGANIZATION`: "Организация"
- `SNOW_COVER.COVER`: "Покров, %"
- `SNOW_COVER.DELTA`: "Δ к году назад"
- `SNOW_COVER.ZONES`: "Зоны высотности"
- `SNOW_COVER.ELEVATION`: "Высота, м"
- `SNOW_COVER.SCA_PCT`: "Покров, %"
- `SNOW_COVER.NO_DATA`: "Нет данных"
- `SNOW_COVER.RESOURCE_DATE`: "Дата снимка"

## Implementation Steps

### Step 1: Create interface `snow-cover.ts`

### Step 2: Create service `snow-cover.service.ts`

- `extends ApiService`
- `const SNOW_COVER = '/snow-cover'`
- `getSnowCover(date?: Date): Observable<SnowCoverResponse>`

### Step 3: Create component `snow-cover/`

**TS:**

- `inject(SnowCoverService)`, `inject(TranslateService)`
- `selectedDate: Date`, `data: SnowCoverResponse | null`, `loading: boolean`
- `ngOnInit()` → `loadData()` + `interval(300000)` auto-refresh (5 мин)
- `loadData()` → `service.getSnowCover(date).subscribe(...)`
- `avgCover(period)` — вычислить среднее значение cover по items
- `chartData` / `chartOptions` — Chart.js bar chart config
- `updateChart()` — подготовить данные для графика при получении ответа

**HTML layout:**

```
<div class="snow-cover-page">
  <!-- Toolbar: DatePicker + Refresh -->
  <!-- Summary Cards: 3 карточки со средним % -->
  <!-- Bar Chart: p-chart type="bar" -->
  <!-- Table: p-table с expandable rows для зон -->
</div>
```

**Chart:** Horizontal bar chart — организации по оси Y, % покрова по оси X. Два dataset: «Сегодня» (синий) и «Год назад» (серый).

**Table columns:** Организация | Сегодня % | Вчера % | Год назад % | Δ | Дата снимка

**Expandable rows:** Таблица зон: Высота (min-max м) | Покров %

### Step 4: Add route in `app.routes.ts`

### Step 5: Add menu item in `menu.component.ts`

### Step 6: Add translations to all 4 i18n files

## Verification

1. Перейти в меню: Водохранилища → MODSNOW
2. Убедиться что загружаются данные за сегодня
3. Проверить 3 summary-карточки со средним %
4. Проверить bar chart с сравнением организаций
5. Проверить таблицу с раскрытием зон высотности
6. Сменить дату → данные обновились
7. `ng build` без ошибок
