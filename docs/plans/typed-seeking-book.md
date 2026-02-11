# План реализации страницы Молокозавод

## Обзор

Создание новой страницы детализации Молокозавод (дашборд) с основными показателями и возможностью подробного просмотра данных через табы.

## Архитектура

### Структура страницы

1. **Дашборд-секция** (верхняя часть):
    - Основная информация о Молокозавод (название, родительская организация)
    - Карточки с KPI: количество аварий, количество списаний, текущая мощность
    - Список производственных линий с телеметрией (мощность, статус)
    - Место для картинки Молокозавод (заглушка на будущее)
    - Мнемосхема (SVG) - интерактивная схема станции

2. **Детальные табы** (нижняя часть, разворачиваемые):
    - Информация и подразделения
    - Контакты
    - Остановки линий (shutdowns)
    - Списания (discharges)
    - Инциденты (incidents)
    - Посещения (visits)
    - Телеметрия (полная)

### Права доступа

- Просмотр: все авторизованные пользователи (`raisGuard`)
- CRUD операции (создание/редактирование/удаление): только `scGuard`

## Файловая структура

```
src/app/
├── core/
│   ├── interfaces/
│   │   └── ges.ts                          # Интерфейсы для GES API
│   └── services/
│       └── ges.service.ts                  # GES API сервис
│
└── pages/
    └── situation-center/
        └── ges/
            └── ges-detail/                 # Новый модуль
                ├── ges-detail.component.ts
                ├── ges-detail.component.html
                ├── ges-detail.component.scss
                ├── components/
                │   ├── ges-dashboard/      # Верхняя дашборд-секция
                │   │   ├── ges-dashboard.component.ts
                │   │   └── ges-dashboard.component.html
                │   ├── ges-kpi-card/       # Карточка KPI
                │   │   ├── ges-kpi-card.component.ts
                │   │   └── ges-kpi-card.component.html
                │   ├── ges-aggregates/     # Список производственных линий
                │   │   ├── ges-aggregates.component.ts
                │   │   └── ges-aggregates.component.html
                │   └── ges-mnemonic/       # Мнемосхема SVG
                │       ├── ges-mnemonic.component.ts
                │       └── ges-mnemonic.component.html
                └── sections/               # Табы с детальными данными
                    ├── info/
                    ├── contacts/
                    ├── shutdowns/
                    ├── discharges/
                    ├── incidents/
                    ├── visits/
                    └── telemetry/
```

## TypeScript Интерфейсы

### Файл: `src/app/core/interfaces/ges.ts`

```typescript
// Основная информация о Молокозавод
interface GesResponse {
  id: number;
  name: string;
  parent_organization_id?: number;
  parent_organization?: string;
  types: string[];
  items?: GesResponse[];
}

// Контакты
interface GesContact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  ip_phone?: string;
  dob?: string;
  organization?: Organization;
  department?: Department;
  position?: Position;
  icon?: IconFile;
}

// Остановки линий
interface GesShutdown {
  id: number;
  organization_id: number;
  organization_name: string;
  started_at: string;
  ended_at?: string;
  reason?: string;
  created_by: UserShortInfo;
  generation_loss?: number;
  write_off_volume?: number;
  files?: FileResponse[];
}

// Списания
interface GesDischarge {
  id: number;
  organization: Organization;
  created_by: UserShortInfo;
  approved_by?: UserShortInfo;
  started_at: string;
  ended_at?: string;
  flow_rate: number;
  total_volume: number;
  reason?: string;
  is_ongoing: boolean;
  approved?: boolean;
  files?: FileResponse[];
}

// Инциденты
interface GesIncident {
  id: number;
  incident_date: string;
  description: string;
  organization_id?: number;
  organization?: string;
  created_by?: UserShortInfo;
  files?: FileResponse[];
}

// Посещения
interface GesVisit {
  id: number;
  organization_id: number;
  organization_name: string;
  visit_date: string;
  description: string;
  responsible_name: string;
  created_by?: UserShortInfo;
  files?: FileResponse[];
}

// Телеметрия
interface DataPoint {
  name: string;
  value: any;
  unit?: string;
  quality: 'good' | 'bad' | 'uncertain';
  severity?: 'normal' | 'warning' | 'alarm' | 'critical';
}

interface TelemetryEnvelope {
  id: string;
  station_id: string;
  station_name: string;
  timestamp: string;
  device_id: string;
  device_name: string;
  device_group: string;
  values: DataPoint[];
}

// Параметры фильтрации по датам
interface DateRangeParams {
  start_date?: string;  // YYYY-MM-DD
  end_date?: string;    // YYYY-MM-DD
}
```

## GES Service

### Файл: `src/app/core/services/ges.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class GesService extends ApiService {
  private readonly GES = '/ges';

  // GET /ges/{id}
  getGesInfo(id: number): Observable<GesResponse>

  // GET /ges/{id}/departments
  getDepartments(id: number): Observable<Department[]>

  // GET /ges/{id}/contacts
  getContacts(id: number): Observable<GesContact[]>

  // GET /ges/{id}/shutdowns?start_date&end_date
  getShutdowns(id: number, dateRange?: DateRangeParams): Observable<GesShutdown[]>

  // GET /ges/{id}/discharges?start_date&end_date
  getDischarges(id: number, dateRange?: DateRangeParams): Observable<GesDischarge[]>

  // GET /ges/{id}/incidents?start_date&end_date
  getIncidents(id: number, dateRange?: DateRangeParams): Observable<GesIncident[]>

  // GET /ges/{id}/visits?start_date&end_date
  getVisits(id: number, dateRange?: DateRangeParams): Observable<GesVisit[]>

  // GET /ges/{id}/telemetry
  getTelemetry(id: number): Observable<TelemetryEnvelope[]>

  // GET /ges/{id}/telemetry/{device_id}
  getDeviceTelemetry(id: number, deviceId: string): Observable<TelemetryEnvelope>
}
```

## Роутинг

### Обновить `src/app.routes.ts`

```typescript
import { GesDetailComponent } from '@/pages/situation-center/ges/ges-detail/ges-detail.component';

// Добавить в children:
{ path: 'ges/:id', component: GesDetailComponent, canActivate: [raisGuard] },
```

## Компоненты дашборда

### 1. GesDetailComponent (главный)

- Загружает основную информацию о Молокозавод по ID из route params
- Содержит дашборд-секцию и табы
- Управляет переключением между Молокозавод через dropdown

### 2. GesDashboardComponent

- Отображает KPI карточки
- Список производственных линий с телеметрией
- Мнемосхему станции

### 3. GesKpiCardComponent

- Переиспользуемая карточка для отображения метрики
- Входные параметры: title, value, icon, trend, severity

### 4. GesAggregatesComponent

- Таблица/карточки производственных линий
- Показывает: название, мощность, статус, температуру
- Auto-refresh каждые 2 минуты (как существующий GES widget)

### 5. GesMnemonicComponent

- SVG мнемосхема станции
- Интерактивные элементы (клик по производственной линии показывает детали)
- Цветовая индикация состояния

## Секции с детальными данными

Каждая секция - standalone компонент с:

- Таблицей PrimeNG
- Фильтрацией по датам (start_date, end_date)
- Глобальным поиском
- CRUD диалогами (только для sc роли)

### Общий паттерн секции:

```typescript
@Component({
  selector: 'app-ges-shutdowns-section',
  standalone: true,
  // ...
})
export class GesShutdownsSection implements OnInit, OnDestroy {
  @Input() gesId!: number;

  data: GesShutdown[] = [];
  loading = false;

  // Фильтрация по датам
  startDate: Date | null = null;
  endDate: Date | null = null;

  // CRUD состояние
  displayDialog = false;
  displayDeleteDialog = false;
  isEditMode = false;
  selectedItem: GesShutdown | null = null;

  // Проверка прав
  canEdit = false; // inject AuthService, check hasRole('sc')

  private destroy$ = new Subject<void>();

  loadData(): void { ... }
  onDateRangeChange(): void { ... }
  openCreateDialog(): void { ... }
  openEditDialog(item): void { ... }
  confirmDelete(): void { ... }
}
```

## Порядок реализации

### Фаза 1: Базовая структура

1. Создать `src/app/core/interfaces/ges.ts`
2. Создать `src/app/core/services/ges.service.ts`
3. Создать базовый `ges-detail.component.ts` с роутингом
4. Добавить роут в `app.routes.ts`

### Фаза 2: Дашборд

5. Создать `GesDashboardComponent`
6. Создать `GesKpiCardComponent`
7. Создать `GesAggregatesComponent` с auto-refresh
8. Создать заглушку для `GesMnemonicComponent`

### Фаза 3: Детальные секции

9. Создать `GesInfoSection` (информация + подразделения)
10. Создать `GesContactsSection`
11. Создать `GesShutdownsSection` с CRUD
12. Создать `GesDischargesSection` с CRUD
13. Создать `GesIncidentsSection` с CRUD
14. Создать `GesVisitsSection` с CRUD
15. Создать `GesTelemetrySection`

### Фаза 4: Финализация

16. Добавить переводы в i18n
17. Добавить проверку прав (scGuard для CRUD)
18. Тестирование

## Критические файлы для референса

| Файл                                                                                 | Назначение                      |
|--------------------------------------------------------------------------------------|---------------------------------|
| `src/app/core/services/api.service.ts`                                               | Base класс, dateToYMD утилита   |
| `src/app/pages/situation-center/ges/shutdown/ges-shutdown/ges-shutdown.component.ts` | Паттерн CRUD таблицы            |
| `src/app/pages/invest/invest-active-projects/invest-active-projects.component.ts`    | Паттерн табов PrimeNG 20        |
| `src/app/dashboard/components/ges/ges.widget.ts`                                     | Паттерн auto-refresh телеметрии |
| `src/app/core/guards/auth.guard.ts`                                                  | Проверка ролей (scGuard)        |

## Верификация

После реализации проверить:

1. Открытие страницы `/ges/1` загружает данные
2. Табы переключаются, данные загружаются лениво
3. Фильтрация по датам работает
4. CRUD операции видны только для sc роли
5. Телеметрия обновляется автоматически
6. Мнемосхема отображается
