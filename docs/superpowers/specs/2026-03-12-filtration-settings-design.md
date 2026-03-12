# Filtration Settings (CRUD) — Design Spec

## Overview

Страница настройки справочников фильтрации: управление местами фильтрации (locations) и пьезометрами (piezometers) для организаций-водохранилищ. Доступна только роли `sc`. Является предпосылкой для страницы сравнительной таблицы (`filtration-comparison`).

## Контекст

- **Фреймворк:** Angular 20, standalone components, lazy-loaded
- **UI:** PrimeNG 20 + Tailwind CSS 4
- **API:** `docs/FILTRATION_API.md` — разделы «Справочники» (locations, piezometers)
- **Паттерн:** Аналогичен существующим CRUD-секциям в `ges-detail/sections/`

## RBAC

| Роль | Доступ |
|------|--------|
| `sc` | Полный CRUD для всех организаций |
| Остальные | Нет доступа к этой странице |

## Файловая структура

```
src/app/core/
├── services/
│   └── filtration.service.ts
├── interfaces/
│   └── filtration.ts

src/app/pages/situation-center/reservoirs-info/
└── filtration-settings/
    ├── filtration-settings.component.ts|html|scss
    └── components/
        ├── location-dialog.component.ts|html|scss
        └── piezometer-dialog.component.ts|html|scss
```

### Разделение сервисов

- `filtration.service.ts` — CRUD для справочников (locations, piezometers)
- `filtration-comparison.service.ts` — comparison + measurements (из первого спека)

Оба наследуют `ApiService`. Интерфейсы `Location`, `Piezometer` лежат в `filtration.ts` и переиспользуются обоими сервисами. Интерфейсы comparison (`OrgComparison`, `ComparisonSnapshot` и т.д.) лежат в `filtration-comparison.ts` и импортируют базовые типы из `filtration.ts`.

## Интерфейсы

Все интерфейсы экспортируются (`export interface`). `Location` и `Piezometer` переиспользуются в `filtration-comparison.ts`, где `LocationReading extends Location` и `PiezoReading extends Piezometer`.

```typescript
// filtration.ts

export interface Location {
  id: number;
  organization_id: number;
  name: string;
  norm: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Piezometer {
  id: number;
  organization_id: number;
  name: string;
  type: 'pressure' | 'non_pressure';
  norm: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLocationRequest {
  organization_id: number;
  name: string;
  norm?: number | null;
  sort_order?: number;
}

export interface UpdateLocationRequest {
  name?: string;
  norm?: number | null;
  sort_order?: number;
}

export interface CreatePiezometerRequest {
  organization_id: number;
  name: string;
  type: 'pressure' | 'non_pressure';
  norm?: number | null;
  sort_order?: number;
}

export interface UpdatePiezometerRequest {
  name?: string;
  type?: 'pressure' | 'non_pressure';
  norm?: number | null;
  sort_order?: number;
}
```

## Сервис `FiltrationService`

```typescript
class FiltrationService extends ApiService {
  // Locations CRUD
  getLocations(organizationId: number): Observable<Location[]>
  // GET /filtration/locations?organization_id=

  createLocation(payload: CreateLocationRequest): Observable<any>
  // POST /filtration/locations → 201 Created

  updateLocation(id: number, payload: UpdateLocationRequest): Observable<{ status: string }>
  // PATCH /filtration/locations/{id} → 200 { status: "ok" }

  deleteLocation(id: number): Observable<{ status: string }>
  // DELETE /filtration/locations/{id} → 204 { status: "deleted" }

  // Piezometers CRUD
  getPiezometers(organizationId: number): Observable<Piezometer[]>
  // GET /filtration/piezometers?organization_id=

  createPiezometer(payload: CreatePiezometerRequest): Observable<any>
  // POST /filtration/piezometers → 201 Created

  updatePiezometer(id: number, payload: UpdatePiezometerRequest): Observable<{ status: string }>
  // PATCH /filtration/piezometers/{id} → 200 { status: "ok" }

  deletePiezometer(id: number): Observable<{ status: string }>
  // DELETE /filtration/piezometers/{id} → 204 { status: "deleted" }
}
```

## Компоненты

### FiltrationSettingsComponent (Smart — страница)

**Ответственность:** выбор организации, загрузка данных, оркестрация CRUD-операций.

- Dropdown организации (`p-select`): загружается через существующий `OrganizationService.getOrganizationsFlat()`, фильтруется на клиенте по `types.includes('reservoir')`
- При выборе организации → параллельный `forkJoin` для `getLocations()` + `getPiezometers()`
- Parent компонент отвечает за подстановку `organization_id` в create-payload перед отправкой
- Две таблицы: locations и piezometers
- Кнопки «Добавить» открывают соответствующий диалог

### LocationDialogComponent (Presentational)

Диалог создания/редактирования места фильтрации. Переиспользует `DialogComponent` из `layout/component/dialog/`.

**Reactive Form:**

| Поле | Компонент | Валидация |
|------|-----------|-----------|
| `name` | `pInputText` | required |
| `norm` | `pInputNumber` (decimal, maxFractionDigits=2) | optional |
| `sort_order` | `pInputNumber` (integer) | optional, default 0 |

**Input:** `Location | null` (null = создание, объект = редактирование).
**Output:** `CreateLocationRequest | UpdateLocationRequest`.

### PiezometerDialogComponent (Presentational)

Диалог создания/редактирования пьезометра.

**Reactive Form:**

| Поле | Компонент | Валидация |
|------|-----------|-----------|
| `name` | `pInputText` | required |
| `type` | `p-select` (options: босимли/босимсиз) | required |
| `norm` | `pInputNumber` (decimal, maxFractionDigits=2) | optional |
| `sort_order` | `pInputNumber` (integer) | optional, default 0 |

**Input:** `Piezometer | null` (null = создание, объект = редактирование).
**Output:** `CreatePiezometerRequest | UpdatePiezometerRequest`.

## UI Layout

### Страница

```
┌──────────────────────────────────────────────────────────┐
│  Организация: [▾ Чарвакская ГЭС                       ] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Места фильтрации                          [+ Добавить] │
│  ┌────┬──────────┬───────┬────────────┬─────────────────┐│
│  │ №  │ Название │ Норма │ Порядок    │ Действия        ││
│  │ 1  │ ПК-1     │ 0.5   │ 1          │ [edit] [delete] ││
│  │ 2  │ ПК-2     │ —     │ 2          │ [edit] [delete] ││
│  └────┴──────────┴───────┴────────────┴─────────────────┘│
│                                                          │
│  Пьезометры                                [+ Добавить] │
│  ┌────┬──────────┬──────────┬───────┬────────┬──────────┐│
│  │ №  │ Название │ Тип      │ Норма │ Порядок│ Действия ││
│  │ 1  │ П-1      │ босимли  │ 12.0  │ 1      │ [e] [d]  ││
│  │ 2  │ П-2      │ босимсиз │ —     │ 2      │ [e] [d]  ││
│  └────┴──────────┴──────────┴───────┴────────┴──────────┘│
└──────────────────────────────────────────────────────────┘
```

### Таблицы

- `p-table` с колонками, без пагинации (количество locations/piezometers невелико)
- Колонка «Действия»: иконки edit (`pi pi-pencil`) и delete (`pi pi-trash`)
- Если таблица пуста → inline-сообщение «Нет мест фильтрации» / «Нет пьезометров»

### Диалоги

- Заголовок: «Добавить место фильтрации» / «Редактировать место фильтрации» (аналогично для пьезометров)
- Кнопки: «Сохранить» + «Отмена»
- При редактировании — форма предзаполнена текущими значениями

## Data Flow

### Загрузка

```
1. Вход на страницу → OrganizationService.getOrganizationsFlat() → filter by types.includes('reservoir') → dropdown
2. Пользователь выбирает организацию
3. forkJoin:
   → GET /filtration/locations?organization_id=X
   → GET /filtration/piezometers?organization_id=X
4. Рендер двух таблиц
```

### Создание

```
1. Клик «+ Добавить» → открывается диалог
2. Заполнение формы → «Сохранить»
3. POST /filtration/locations (или /piezometers)
4. Успех → toast, закрытие диалога, повторный GET списка
5. Ошибка 409 → toast «Название уже существует»
```

### Редактирование

```
1. Клик edit → открывается диалог с предзаполненной формой
2. Изменение → «Сохранить»
3. PATCH /filtration/locations/{id} (или /piezometers/{id})
4. Успех → toast, закрытие диалога, повторный GET
5. Ошибка 409 → toast «Название уже существует»
```

### Удаление

```
1. Клик delete → DeleteConfirmationComponent: «При удалении будут удалены все связанные замеры. Продолжить?»
2. Подтверждение → DELETE /filtration/locations/{id} (или /piezometers/{id})
3. Успех → toast, повторный GET
```

## Обработка ошибок

| Код | Обработка |
|-----|-----------|
| 400 | Toast с текстом ошибки валидации |
| 403 | Toast «Нет доступа» |
| 404 | Toast «Не найдено», повторный GET для синхронизации |
| 409 | Toast «Название уже существует в этой организации» |
| 500 | Toast «Ошибка сервера» |

## Роутинг

Lazy-loaded route в `app.routes.ts`:

- Путь: `filtration-settings`
- Guard: `scGuard` (только `sc`)

## Переводы

Добавить ключи в `assets/i18n/ru.json`, `uz-cyrl.json`, `uz-latn.json`, `en.json`:

- Заголовок страницы
- Названия таблиц и колонок
- Диалоги (заголовки, поля, кнопки)
- Типы пьезометров (босимли, босимсиз)
- Сообщения об ошибках и успехе
- Confirm-диалог удаления
