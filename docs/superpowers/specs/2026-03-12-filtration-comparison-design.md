# Filtration Comparison Page — Design Spec

## Overview

Страница сравнительной таблицы фильтрации и пьезометров, дополнение к сводкам водохранилищ. Доступна из раздела «Водохранилища → Фильтрация».

При выборе даты сводки X данные фильтрации/пьезометров отображаются за дату X (current), а сервер автоматически подбирает историческую дату с ближайшим уровнем водохранилища (historical).

## Контекст

- **Фреймворк:** Angular 20, standalone components, lazy-loaded
- **UI:** PrimeNG 20 + Tailwind CSS 4
- **API:** `GET /filtration/comparison?date=`, `POST /filtration/measurements`
- **Полная API-документация:** `docs/FILTRATION_API.md`, `docs/FILTRATION_COMPARISON_API.md`

## RBAC

| Роль | Поведение |
|------|-----------|
| `sc` / `rais` | Видит все организации с фильтрацией/пьезометрами |
| `reservoir` | Видит только свой объект (из JWT `organization_id`) |

## Файловая структура

```
src/app/core/
├── services/
│   └── filtration-comparison.service.ts
├── interfaces/
│   └── filtration-comparison.ts

src/app/pages/situation-center/reservoirs-info/
└── filtration-comparison/
    ├── filtration-comparison.component.ts|html|scss
    └── components/
        ├── org-comparison-card.component.ts|html|scss
        ├── filtration-table.component.ts|html|scss
        └── piezometer-table.component.ts|html|scss
```

## Компоненты

### FiltrationComparisonComponent (Smart — страница)

**Ответственность:** загрузка данных, формирование FormArray, сохранение, RBAC-логика.

- При входе: `date = вчера` → `GET /filtration/comparison?date=`
- Хранит `OrgComparison[]` как reference-данные (name, norm, type, piezometer_counts, level, volume)
- Строит `FormArray` только с редактируемыми значениями
- Кнопка «Сохранить» → POST для каждой организации (до 2 запросов: current + historical)
- После сохранения → повторный GET, toast

### OrgComparisonCardComponent (Presentational)

**Input:** `OrgComparison`, `FormGroup` организации.

Отображает:
- Заголовок: название организации, уровень (м), объём (млн м3) из `current`
- `FiltrationTableComponent` — таблица фильтрации
- `PiezometerTableComponent` — таблица пьезометров

### FiltrationTableComponent (Presentational)

**Input:** `LocationReading[]` (current), `LocationReading[]` (historical | null), `FormGroup` current locations, `FormGroup` historical locations.

Единая таблица (не две отдельные):
- Строка current: значения flow_rate (редактируемые)
- Строка дельта: current − historical (вычисляемая)
- Строка historical: значения flow_rate (редактируемые)
- Если `historical = null` — строки дельт и historical не рендерятся

Колонки: `| Дата | Жами (л/с) | ПК-1 | меъёр | +,- | ПК-2 | меъёр | +,- | ... |`

- «Жами» — сумма всех flow_rate (вычисляется на лету)
- Для каждого location: значение → норма → отклонение от нормы
- Колонки «меъёр» и «+,-» отображаются для locations с `norm != null`

### PiezometerTableComponent (Presentational)

**Input:** `PiezoReading[]` (current), `PiezoReading[]` (historical | null), `PiezometerCounts`, FormGroups.

Аналогично FiltrationTable, но с группировкой по `type`:
- Подзаголовок «босимли (N)» — напорные пьезометры
- Подзаголовок «босимсиз (N)» — безнапорные пьезометры
- N берётся из `piezometer_counts`

## Интерфейсы

Берутся из API-документации (`docs/FILTRATION_API.md`):

```typescript
interface LocationReading {
  id: number;
  organization_id: number;
  name: string;
  norm: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  flow_rate: number | null;
}

interface PiezoReading {
  id: number;
  organization_id: number;
  name: string;
  type: 'pressure' | 'non_pressure';
  norm: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  level: number | null;
}

interface PiezometerCounts {
  pressure: number;
  non_pressure: number;
}

interface ComparisonSnapshot {
  date: string;
  level: number | null;
  volume: number | null;
  locations: LocationReading[];
  piezometers: PiezoReading[];
  piezometer_counts: PiezometerCounts;
}

interface OrgComparison {
  organization_id: number;
  organization_name: string;
  current: ComparisonSnapshot;
  historical: ComparisonSnapshot | null;
}

interface UpsertRequest {
  organization_id: number;
  date: string;
  filtration_measurements?: { location_id: number; flow_rate: number | null }[];
  piezometer_measurements?: { piezometer_id: number; level: number | null }[];
}
```

## Сервис

`FiltrationComparisonService` наследует `ApiService`:

```typescript
class FiltrationComparisonService extends ApiService {
  getComparison(date: string): Observable<OrgComparison[]>
  saveMeasurements(payload: UpsertRequest): Observable<{ status: string }>
}
```

- `getComparison` → `GET /filtration/comparison?date=`
- `saveMeasurements` → `POST /filtration/measurements`

## Структура формы

Форма содержит только редактируемые значения. Reference-данные хранятся в `OrgComparison[]`.

```typescript
FormGroup {
  date: FormControl<string>,
  organizations: FormArray [
    FormGroup {
      organization_id: number,
      current: FormGroup {
        date: string,
        locations: FormArray [
          FormGroup { location_id: number, flow_rate: FormControl<number|null> }
        ],
        piezometers: FormArray [
          FormGroup { piezometer_id: number, level: FormControl<number|null> }
        ]
      },
      historical: FormGroup | null {
        date: string,
        locations: FormArray [...],
        piezometers: FormArray [...]
      }
    }
  ]
}
```

## Data flow

### Загрузка

```
1. Вход → date = вчера
2. GET /filtration/comparison?date=2026-03-11
3. Ответ: OrgComparison[] → сохраняем reference + строим FormArray
```

### Сохранение

```
1. Кнопка «Сохранить» → проходим по organizations FormArray
2. POST только для dirty-организаций (до 2 запросов на организацию: current + historical)
3. Все POST отправляются параллельно через forkJoin
4. Отправляем ВСЕ замеры организации за дату (upsert идемпотентен)
5. После всех POST → повторный GET /comparison
6. p-toast: успех / ошибка
```

**Обработка ошибок при сохранении:**

- Все POST отправляются параллельно (`forkJoin`)
- Если часть запросов упала — toast с ошибкой, указываем какие организации не сохранились
- Успешные запросы не откатываются (upsert идемпотентен, можно повторить)
- Кнопка «Сохранить» остаётся активной для повторной попытки
- После ошибки — повторный GET для синхронизации

### Дельты

Вычисляются на лету при рендеринге (не хранятся в форме):
- `current.flow_rate - historical.flow_rate` — разница между датами
- `flow_rate - norm` / `level - norm` — отклонение от нормы (отдельные колонки)

## UI Layout

### Toolbar (sticky top)

```
[DatePicker: 11.03.2026]    [Excel (disabled)] [PDF (disabled)]    [Сохранить]
```

- DatePicker: `p-datePicker`, по умолчанию вчера
- Excel/PDF: заглушки (disabled, tooltip «В разработке»), вторая итерация
- Сохранить: `p-button`, disabled если форма pristine

### Карточка организации

```
╔═══════════════════════════════════════════════════════════╗
║  Андижон сув омбори                                       ║
║  сатҳи — 880.63 м,  ҳажми — 797.9 млн м³                 ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ТАБЛИЦА ФИЛЬТРАЦИИ                                      ║
║  ┌────────┬───────┬──────┬──────┬──────┬──────┐           ║
║  │        │жами   │ ПК-1 │меъёр │ +,-  │ ПК-2 │...       ║
║  │ current│ 17.49 │ 0.15 │ 0.5  │-0.35 │ 0.22 │...       ║
║  │ дельта │ -4.16 │+0.03 │      │      │+0.03 │...       ║
║  │histor. │ 21.65 │ 0.12 │ 0.5  │-0.38 │ 0.19 │...       ║
║  └────────┴───────┴──────┴──────┴──────┴──────┘           ║
║                                                           ║
║  ТАБЛИЦА ПЬЕЗОМЕТРОВ                                     ║
║  ┌────────────────── босимли (3) ─────────────────┐       ║
║  │        │ П-1  │меъёр│ +,-  │ П-2  │...        │       ║
║  │ current│ 11.8 │12.0 │-0.2  │ 15.2 │...        │       ║
║  │ дельта │ +0.3 │     │      │ +0.2 │...        │       ║
║  │histor. │ 11.5 │12.0 │-0.5  │ 15.0 │...        │       ║
║  ├────────────────── босимсиз (2) ────────────────┤       ║
║  │        │ П-5  │меъёр│ +,-  │ П-6  │           │       ║
║  │ ...    │      │     │      │      │           │       ║
║  └────────┴──────┴─────┴──────┴──────┴───────────┘       ║
╚═══════════════════════════════════════════════════════════╝
```

### Таблица — единая для current + historical

Не две отдельные таблицы, а одна — как в Excel-прототипе (`docs/filter.xlsx`):

- Строка 1: current-значения (редактируемые)
- Строка 2: дельта (current − historical, вычисляемая, нередактируемая)
- Строка 3: historical-значения (редактируемые)
- Если `historical = null` — строки 2 и 3 не рендерятся

> **Примечание:** `FILTRATION_COMPARISON_API.md` описывает рендеринг как «две отдельные таблицы». Данный спек переопределяет это — используем единую таблицу по образцу Excel-прототипа.

### Редактирование

- Ячейки `flow_rate` и `level`: инлайн `pInputNumber`
  - `mode="decimal"`, `maxFractionDigits="2"`, `minFractionDigits="0"`
  - `min` не ограничен (значения могут быть любыми)
  - Ширина input: `5rem` (достаточно для чисел вроде `1245.30`)
- `level`/`volume` в заголовке: только чтение
- Изменённые ячейки: подсветка dirty state
- Tab-навигация: слева направо по колонкам, затем на следующую строку

### Горизонтальный скролл

При большом количестве locations/piezometers таблица может быть шире экрана:

- Таблица внутри контейнера с `overflow-x: auto`
- Первая колонка (дата) — `position: sticky; left: 0` (замороженная)

### Индикация нормы

- `value > norm` → красный фон ячейки
- `norm = null` → колонки «меъёр» и «+,-» скрыты для этого location/piezometer

### Пустые состояния

- `OrgComparison[]` пуст → сообщение «Нет данных фильтрации» (p-message, severity info)
- Организация с пустыми `locations[]` и `piezometers[]` → карточка не рендерится (такие организации не возвращаются API)
- Все `flow_rate`/`level` = null → ячейки пустые, пользователь может заполнить

### Роль `reservoir`

Та же страница, но `OrgComparison[]` содержит один элемент. Заголовок организации отображается.

## UX-поведение

- Кнопка «Сохранить» активна только если форма `dirty`
- Смена даты при несохранённых данных → `p-confirmDialog` с текстом «Есть несохранённые изменения. Продолжить?»
- `canDeactivate` guard для защиты от навигации с несохранёнными данными
- После успешного сохранения → `markAsPristine()`
- Loading spinner при загрузке и сохранении
- Дата: используется клиентское время (по аналогии с существующим `dateToYMD` в проекте)

## Роутинг

Lazy-loaded route в `app.routes.ts`:

- Путь: `filtration-comparison` (плоский, по конвенции проекта)
- Guard: новый `filtrationGuard` — проверяет роли `['sc', 'rais', 'reservoir']`. Создаётся в `src/app/core/guards/auth.guard.ts` по аналогии с `raisGuard`/`scGuard`.

## Переводы

Добавить ключи в `assets/i18n/ru.json`, `uz-cyrl.json`, `uz-latn.json`, `en.json` для:
- Заголовок страницы
- Колонки таблиц (жами, меъёр, +,-)
- Кнопки (сохранить, экспорт)
- Сообщения (успех, ошибка, подтверждение смены даты)
- Подзаголовки (босимли, босимсиз)

## Экспорт (вторая итерация)

Кнопки Excel и PDF — заглушки на первой итерации (disabled, tooltip). Реализация — во второй итерации с использованием существующих зависимостей проекта (xlsx, jsPDF, jspdf-autotable).
