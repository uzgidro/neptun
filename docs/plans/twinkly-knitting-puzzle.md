# План: Функционал просмотра аварийных отключений

## Цель

Добавить поле `viewed` к модели отключений, изменить логику сирены (играет только для непросмотренных), добавить индикатор и модальное окно с деталями.

---

## Файлы для изменения

| Файл                                                                                           | Изменение                         |
|------------------------------------------------------------------------------------------------|-----------------------------------|
| `src/app/core/interfaces/ges-shutdown.ts`                                                      | Добавить `viewed: boolean`        |
| `src/app/core/services/ges-shutdown.service.ts`                                                | Добавить метод `markAsViewed()`   |
| `src/app/pages/situation-center/sc-dashboard/widgets/sc-shutdowns/sc-shutdowns.component.ts`   | Логика модального окна и viewed   |
| `src/app/pages/situation-center/sc-dashboard/widgets/sc-shutdowns/sc-shutdowns.component.html` | UI: индикатор, модальное окно     |
| `src/app/pages/situation-center/sc-dashboard/widgets/sc-shutdowns/sc-shutdowns.component.scss` | Стили для индикатора и модального |
| `src/assets/i18n/ru.json`                                                                      | Ключи переводов                   |

---

## Шаг 1: Интерфейсы

**Файл:** `src/app/core/interfaces/ges-shutdown.ts`

Добавить `viewed: boolean` в:

- `ShutdownResponse` (строка 24)
- `ShutdownDto` (строка 44)

---

## Шаг 2: Сервис

**Файл:** `src/app/core/services/ges-shutdown.service.ts`

Добавить метод:

```typescript
markAsViewed(id: number): Observable<void> {
    return this.http.patch<void>(`${BASE_URL}${SHUTDOWNS}/${id}/viewed`, {});
}
```

---

## Шаг 3: Компонент TypeScript

**Файл:** `sc-shutdowns.component.ts`

### 3.1 Расширить ShutdownItem

```typescript
interface ShutdownItem {
    // ... существующие поля
    viewed: boolean;
    createdBy: UserShortInfo | null;
    idleDischargeVolume: number | null;
    files?: FileResponse[];
}
```

### 3.2 Добавить состояние модального окна

```typescript
showDetailDialog = false;
selectedShutdown: ShutdownItem | null = null;
showFilesDialog = false;
```

### 3.3 Изменить processShutdowns

- Добавить маппинг новых полей (viewed, createdBy, idleDischargeVolume, files)
- Изменить логику сирены:

```typescript
const hasUnviewedActive = items.some(s => s.isOngoing && !s.viewed);
this.alarmService.setHasActiveShutdowns(hasUnviewedActive);
```

### 3.4 Добавить методы

- `openDetail(shutdown)` - открыть модальное, вызвать markAsViewed если !viewed
- `markAsViewed(shutdown)` - PATCH запрос, обновить локальное состояние
- `closeDetailDialog()` - закрыть модальное
- `navigateToGesFromDialog()` - переход на /ges/:id
- `openFilesDialog()` - открыть просмотр файлов

### 3.5 Добавить импорты

```typescript
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';
```

---

## Шаг 4: Компонент HTML

**Файл:** `sc-shutdowns.component.html`

### 4.1 Индикатор в списке

В `.station-badges` после бейджа completed:

```html
<span class="view-indicator" [class.viewed]="shutdown.viewed">
    <i class="pi" [class.pi-eye]="shutdown.viewed" [class.pi-eye-slash]="!shutdown.viewed"></i>
</span>
```

### 4.2 Изменить клик

```html
(click)="openDetail(shutdown)"
```

вместо `navigateToGes()`

### 4.3 Модальное окно (в конец файла)

```html
<p-dialog [(visible)]="showDetailDialog"
          [header]="'SITUATION_CENTER.DASHBOARD.SHUTDOWNS.DETAIL_TITLE' | translate"
          [modal]="true" [style]="{ width: '500px' }"
          styleClass="shutdown-detail-dialog">
    @if (selectedShutdown) {
        <!-- Детали: stationName, stationType, reason, startTime, endTime,
             lostGeneration, idleDischargeVolume, createdBy -->

        <!-- Кнопка файлов если есть -->
        @if (selectedShutdown.files?.length) {
            <button pButton label="Файлы ({{selectedShutdown.files.length}})"
                    icon="pi pi-paperclip" (click)="openFilesDialog()">
            </button>
        }
    }

    <ng-template pTemplate="footer">
        <button pButton label="Перейти к станции" icon="pi pi-external-link"
                (click)="navigateToGesFromDialog()">
        </button>
    </ng-template>
</p-dialog>

<app-file-viewer [(visible)]="showFilesDialog"
                 [files]="selectedShutdown?.files || []"
                 header="Файлы">
</app-file-viewer>
```

---

## Шаг 5: Стили

**Файл:** `sc-shutdowns.component.scss`

```scss
// Индикатор просмотра
.view-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 3px;
    font-size: 10px;
    background: rgba(255, 71, 87, 0.25);
    color: #ff7788;

    &.viewed {
        background: rgba(0, 255, 136, 0.25);
        color: #00ff88;
    }
}

// Детали в модальном
.shutdown-detail-content { ... }
.detail-row { ... }
.detail-label { ... }
.detail-value { ... }
.ongoing-badge { ... }
```

---

## Шаг 6: Переводы

**Файл:** `src/assets/i18n/ru.json`

В `SITUATION_CENTER.DASHBOARD.SHUTDOWNS` добавить:

```json
"DETAIL_TITLE": "Детали отключения",
"ONGOING": "В процессе",
"GO_TO_GES": "Перейти к станции"
```

В `SITUATION_CENTER.SHUTDOWN` проверить наличие:

- `IDLE_DISCHARGE` - "Объём холостого сброса"

В `SITUATION_CENTER.COMMON`:

- `CREATED_BY` - "Создал"
- `FILES` - "Файлы"

---

## Верификация

1. **Сборка**: `npm run build` - без ошибок
2. **Сирена**: При появлении непросмотренного отключения играет, после просмотра - прекращает
3. **Индикатор**: pi-eye-slash для непросмотренных, pi-eye для просмотренных
4. **Модальное окно**: Открывается при клике, показывает все поля
5. **PATCH запрос**: Отправляется при открытии непросмотренного
6. **Файлы**: Кнопка открывает file-viewer
7. **Навигация**: Кнопка "Перейти к станции" работает
