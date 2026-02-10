# GES API Documentation

Документация по API методам для страницы ГЭС.

**Base URL:** `/api/v1`

**Аутентификация:** Все методы требуют токен авторизации в заголовке `Authorization: Bearer <token>`

---

## Содержание

1. [Получить информацию о ГЭС](#1-получить-информацию-о-гэс)
2. [Получить подразделения ГЭС](#2-получить-подразделения-гэс)
3. [Получить контакты ГЭС](#3-получить-контакты-гэс)
4. [Получить остановы ГЭС](#4-получить-остановы-гэс)
5. [Получить сбросы ГЭС](#5-получить-сбросы-гэс)
6. [Получить инциденты ГЭС](#6-получить-инциденты-гэс)
7. [Получить посещения ГЭС](#7-получить-посещения-гэс)
8. [Получить телеметрию станции](#8-получить-телеметрию-станции)
9. [Получить телеметрию устройства](#9-получить-телеметрию-устройства)
10. [Получить данные АСКУЭ](#10-получить-данные-аскуэ)

---

## Общие типы данных

### ErrorResponse

Ответ при ошибке:

```json
{
  "error": "Описание ошибки"
}
```

### UserShortInfo

Краткая информация о пользователе:

```typescript
interface UserShortInfo {
  id: number;
  name: string | null;
}
```

### FileResponse

Информация о файле с presigned URL:

```typescript
interface FileResponse {
  id: number;
  file_name: string;
  category_id: number;
  mime_type: string;
  size_bytes: number;
  created_at: string; // ISO 8601 datetime
  url: string;        // Presigned URL (действителен 1 час)
}
```

### Organization

Модель организации:

```typescript
interface Organization {
  id: number;
  name: string;
  parent_organization_id?: number;
  parent_organization?: string;
  types: string[];
  items?: Organization[]; // Вложенные организации
}
```

---

## 1. Получить информацию о ГЭС

Получение детальной информации о ГЭС по ID.

### Запрос

```
GET /ges/{id}
```

### Параметры пути

| Параметр | Тип   | Обязательный | Описание       |
|----------|-------|--------------|----------------|
| id       | int64 | Да           | ID организации |

### Ответ

**200 OK**

```typescript
interface GesResponse {
  id: number;
  name: string;
  parent_organization_id?: number;
  parent_organization?: string;
  types: string[];
  items?: GesResponse[]; // Вложенные организации
}
```

**Пример ответа:**

```json
{
  "id": 1,
  "name": "Саяно-Шушенская ГЭС",
  "parent_organization_id": 5,
  "parent_organization": "РусГидро",
  "types": ["ges", "power_plant"],
  "items": []
}
```

### Ошибки

| Код | Описание                  |
|-----|---------------------------|
| 400 | Неверный формат ID        |
| 404 | Организация не найдена    |
| 500 | Внутренняя ошибка сервера |

---

## 2. Получить подразделения ГЭС

Получение списка подразделений ГЭС.

### Запрос

```
GET /ges/{id}/departments
```

### Параметры пути

| Параметр | Тип   | Обязательный | Описание       |
|----------|-------|--------------|----------------|
| id       | int64 | Да           | ID организации |

### Ответ

**200 OK**

```typescript
interface Department {
  id: number;
  name: string;
  description?: string;
  organization_id: number;
  organization?: Organization;
}

type DepartmentsResponse = Department[];
```

**Пример ответа:**

```json
[
  {
    "id": 1,
    "name": "Отдел эксплуатации",
    "description": "Отдел отвечает за эксплуатацию оборудования",
    "organization_id": 1
  },
  {
    "id": 2,
    "name": "Служба безопасности",
    "organization_id": 1
  }
]
```

### Ошибки

| Код | Описание                  |
|-----|---------------------------|
| 400 | Неверный формат ID        |
| 500 | Внутренняя ошибка сервера |

---

## 3. Получить контакты ГЭС

Получение списка контактов сотрудников ГЭС.

### Запрос

```
GET /ges/{id}/contacts
```

### Параметры пути

| Параметр | Тип   | Обязательный | Описание       |
|----------|-------|--------------|----------------|
| id       | int64 | Да           | ID организации |

### Ответ

**200 OK**

```typescript
interface IconFile {
  id: number;
  file_name: string;
  url: string;        // Presigned URL (действителен 24 часа)
  mime_type: string;
  size_bytes: number;
}

interface Position {
  id: number;
  name: string;
  description?: string;
}

interface Contact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  ip_phone?: string;
  dob?: string;                        // ISO 8601 datetime
  external_organization_name?: string;
  icon_id?: number;
  organization?: Organization;
  department?: Department;
  position?: Position;
  icon?: IconFile;
}

type ContactsResponse = Contact[];
```

**Пример ответа:**

```json
[
  {
    "id": 1,
    "name": "Иванов Иван Иванович",
    "email": "ivanov@example.com",
    "phone": "+7 (999) 123-45-67",
    "ip_phone": "1234",
    "organization": {
      "id": 1,
      "name": "Саяно-Шушенская ГЭС",
      "types": ["ges"]
    },
    "department": {
      "id": 1,
      "name": "Отдел эксплуатации",
      "organization_id": 1
    },
    "position": {
      "id": 1,
      "name": "Главный инженер"
    },
    "icon": {
      "id": 5,
      "file_name": "avatar.jpg",
      "url": "https://minio.example.com/...",
      "mime_type": "image/jpeg",
      "size_bytes": 45678
    }
  }
]
```

### Ошибки

| Код | Описание                  |
|-----|---------------------------|
| 400 | Неверный формат ID        |
| 500 | Внутренняя ошибка сервера |

---

## 4. Получить остановы ГЭС

Получение списка остановов оборудования ГЭС с возможностью фильтрации по дате.

### Запрос

```
GET /ges/{id}/shutdowns
```

### Параметры пути

| Параметр | Тип   | Обязательный | Описание       |
|----------|-------|--------------|----------------|
| id       | int64 | Да           | ID организации |

### Query параметры

| Параметр   | Тип    | Обязательный | Формат     | Описание               |
|------------|--------|--------------|------------|------------------------|
| start_date | string | Нет          | YYYY-MM-DD | Начальная дата фильтра |
| end_date   | string | Нет          | YYYY-MM-DD | Конечная дата фильтра  |

### Ответ

**200 OK**

```typescript
interface Shutdown {
  id: number;
  organization_id: number;
  organization_name: string;
  started_at: string;                    // ISO 8601 datetime
  ended_at?: string;                     // ISO 8601 datetime, null если продолжается
  reason?: string;
  created_by: UserShortInfo;
  generation_loss?: number;              // Потери выработки в МВт·ч
  created_at: string;                    // ISO 8601 datetime
  idle_discharge_volume?: number;        // Объем холостого сброса в тыс. м³
  files?: FileResponse[];
}

type ShutdownsResponse = Shutdown[];
```

**Пример запроса:**

```
GET /ges/1/shutdowns?start_date=2024-01-01&end_date=2024-12-31
```

**Пример ответа:**

```json
[
  {
    "id": 1,
    "organization_id": 1,
    "organization_name": "Саяно-Шушенская ГЭС",
    "started_at": "2024-03-15T08:00:00Z",
    "ended_at": "2024-03-15T16:00:00Z",
    "reason": "Плановое техническое обслуживание",
    "created_by": {
      "id": 5,
      "name": "Петров А.В."
    },
    "generation_loss": 150.5,
    "created_at": "2024-03-15T07:30:00Z",
    "idle_discharge_volume": 25.3,
    "files": [
      {
        "id": 10,
        "file_name": "act.pdf",
        "category_id": 1,
        "mime_type": "application/pdf",
        "size_bytes": 125000,
        "created_at": "2024-03-15T16:30:00Z",
        "url": "https://minio.example.com/..."
      }
    ]
  }
]
```

### Ошибки

| Код | Описание                    |
|-----|-----------------------------|
| 400 | Неверный формат ID или даты |
| 500 | Внутренняя ошибка сервера   |

---

## 5. Получить сбросы ГЭС

Получение списка сбросов воды ГЭС с возможностью фильтрации по дате.

### Запрос

```
GET /ges/{id}/discharges
```

### Параметры пути

| Параметр | Тип   | Обязательный | Описание       |
|----------|-------|--------------|----------------|
| id       | int64 | Да           | ID организации |

### Query параметры

| Параметр   | Тип    | Обязательный | Формат     | Описание               |
|------------|--------|--------------|------------|------------------------|
| start_date | string | Нет          | YYYY-MM-DD | Начальная дата фильтра |
| end_date   | string | Нет          | YYYY-MM-DD | Конечная дата фильтра  |

### Ответ

**200 OK**

```typescript
interface Discharge {
  id: number;
  organization: Organization;
  created_by: UserShortInfo;
  approved_by?: UserShortInfo;
  started_at: string;                    // ISO 8601 datetime
  ended_at?: string;                     // ISO 8601 datetime
  flow_rate: number;                     // Расход воды м³/с
  total_volume: number;                  // Общий объем м³
  reason?: string;
  is_ongoing: boolean;                   // Продолжается ли сейчас
  approved?: boolean;                    // Согласован ли сброс
  files?: FileResponse[];
}

type DischargesResponse = Discharge[];
```

**Пример ответа:**

```json
[
  {
    "id": 1,
    "organization": {
      "id": 1,
      "name": "Саяно-Шушенская ГЭС",
      "types": ["ges"]
    },
    "created_by": {
      "id": 5,
      "name": "Петров А.В."
    },
    "approved_by": {
      "id": 3,
      "name": "Сидоров В.И."
    },
    "started_at": "2024-03-20T10:00:00Z",
    "ended_at": "2024-03-20T18:00:00Z",
    "flow_rate": 500.0,
    "total_volume": 14400000.0,
    "reason": "Паводковый сброс",
    "is_ongoing": false,
    "approved": true,
    "files": []
  }
]
```

### Ошибки

| Код | Описание                    |
|-----|-----------------------------|
| 400 | Неверный формат ID или даты |
| 500 | Внутренняя ошибка сервера   |

---

## 6. Получить инциденты ГЭС

Получение списка инцидентов ГЭС с возможностью фильтрации по дате.

### Запрос

```
GET /ges/{id}/incidents
```

### Параметры пути

| Параметр | Тип   | Обязательный | Описание       |
|----------|-------|--------------|----------------|
| id       | int64 | Да           | ID организации |

### Query параметры

| Параметр   | Тип    | Обязательный | Формат     | Описание               |
|------------|--------|--------------|------------|------------------------|
| start_date | string | Нет          | YYYY-MM-DD | Начальная дата фильтра |
| end_date   | string | Нет          | YYYY-MM-DD | Конечная дата фильтра  |

### Ответ

**200 OK**

```typescript
interface Incident {
  id: number;
  incident_date: string;                 // ISO 8601 datetime
  description: string;
  created_at: string;                    // ISO 8601 datetime
  organization_id?: number;
  organization?: string;                 // Название организации
  created_by?: UserShortInfo;
  files?: FileResponse[];
}

type IncidentsResponse = Incident[];
```

**Пример ответа:**

```json
[
  {
    "id": 1,
    "incident_date": "2024-03-10T14:30:00Z",
    "description": "Обнаружена утечка масла в гидроагрегате №3",
    "created_at": "2024-03-10T14:45:00Z",
    "organization_id": 1,
    "organization": "Саяно-Шушенская ГЭС",
    "created_by": {
      "id": 7,
      "name": "Козлов С.П."
    },
    "files": [
      {
        "id": 15,
        "file_name": "photo_incident.jpg",
        "category_id": 2,
        "mime_type": "image/jpeg",
        "size_bytes": 250000,
        "created_at": "2024-03-10T14:50:00Z",
        "url": "https://minio.example.com/..."
      }
    ]
  }
]
```

### Ошибки

| Код | Описание                    |
|-----|-----------------------------|
| 400 | Неверный формат ID или даты |
| 500 | Внутренняя ошибка сервера   |

---

## 7. Получить посещения ГЭС

Получение списка посещений ГЭС с возможностью фильтрации по дате.

### Запрос

```
GET /ges/{id}/visits
```

### Параметры пути

| Параметр | Тип   | Обязательный | Описание       |
|----------|-------|--------------|----------------|
| id       | int64 | Да           | ID организации |

### Query параметры

| Параметр   | Тип    | Обязательный | Формат     | Описание               |
|------------|--------|--------------|------------|------------------------|
| start_date | string | Нет          | YYYY-MM-DD | Начальная дата фильтра |
| end_date   | string | Нет          | YYYY-MM-DD | Конечная дата фильтра  |

### Ответ

**200 OK**

```typescript
interface Visit {
  id: number;
  organization_id: number;
  organization_name: string;
  visit_date: string;                    // ISO 8601 datetime
  description: string;
  responsible_name: string;              // ФИО ответственного
  created_at: string;                    // ISO 8601 datetime
  created_by?: UserShortInfo;
  files?: FileResponse[];
}

type VisitsResponse = Visit[];
```

**Пример ответа:**

```json
[
  {
    "id": 1,
    "organization_id": 1,
    "organization_name": "Саяно-Шушенская ГЭС",
    "visit_date": "2024-04-05T09:00:00Z",
    "description": "Плановая проверка Ростехнадзора",
    "responsible_name": "Михайлов Д.А.",
    "created_at": "2024-04-01T10:00:00Z",
    "created_by": {
      "id": 2,
      "name": "Андреев К.М."
    },
    "files": [
      {
        "id": 20,
        "file_name": "report.docx",
        "category_id": 3,
        "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "size_bytes": 75000,
        "created_at": "2024-04-05T17:00:00Z",
        "url": "https://minio.example.com/..."
      }
    ]
  }
]
```

### Ошибки

| Код | Описание                    |
|-----|-----------------------------|
| 400 | Неверный формат ID или даты |
| 500 | Внутренняя ошибка сервера   |

---

## 8. Получить телеметрию станции

Получение телеметрии всех устройств станции из АСУТП (данные в реальном времени из Redis).

### Запрос

```
GET /ges/{id}/telemetry
```

### Параметры пути

| Параметр | Тип   | Обязательный | Описание        |
|----------|-------|--------------|-----------------|
| id       | int64 | Да           | ID станции в БД |

### Ответ

**200 OK**

```typescript
interface DataPoint {
  name: string;                          // Название параметра
  value: any;                            // Значение (число, строка, boolean)
  unit?: string;                         // Единица измерения
  quality: string;                       // Качество данных (например: "good", "bad")
  severity?: string;                     // Уровень критичности (например: "normal", "warning", "alarm")
}

interface TelemetryEnvelope {
  id: string;                            // Уникальный ID записи
  station_id: string;                    // ID станции в АСУТП
  station_name: string;                  // Название станции
  timestamp: string;                     // ISO 8601 datetime - время получения данных
  device_id: string;                     // ID устройства
  device_name: string;                   // Название устройства
  device_group: string;                  // Группа устройств
  values: DataPoint[];                   // Массив параметров телеметрии
}

type StationTelemetryResponse = TelemetryEnvelope[];
```

**Пример ответа:**

```json
[
  {
    "id": "tel-001",
    "station_id": "ges-sayano",
    "station_name": "Саяно-Шушенская ГЭС",
    "timestamp": "2024-04-10T12:30:45Z",
    "device_id": "ga-1",
    "device_name": "Гидроагрегат №1",
    "device_group": "generators",
    "values": [
      {
        "name": "active_power",
        "value": 640.5,
        "unit": "МВт",
        "quality": "good",
        "severity": "normal"
      },
      {
        "name": "rotation_speed",
        "value": 142.8,
        "unit": "об/мин",
        "quality": "good",
        "severity": "normal"
      },
      {
        "name": "bearing_temperature",
        "value": 65.2,
        "unit": "°C",
        "quality": "good",
        "severity": "warning"
      }
    ]
  },
  {
    "id": "tel-002",
    "station_id": "ges-sayano",
    "station_name": "Саяно-Шушенская ГЭС",
    "timestamp": "2024-04-10T12:30:45Z",
    "device_id": "ga-2",
    "device_name": "Гидроагрегат №2",
    "device_group": "generators",
    "values": [
      {
        "name": "active_power",
        "value": 620.0,
        "unit": "МВт",
        "quality": "good",
        "severity": "normal"
      }
    ]
  }
]
```

### Ошибки

| Код | Описание                         |
|-----|----------------------------------|
| 400 | Неверный формат ID станции       |
| 500 | Ошибка получения данных из Redis |

---

## 9. Получить телеметрию устройства

Получение телеметрии конкретного устройства станции из АСУТП.

### Запрос

```
GET /ges/{id}/telemetry/{device_id}
```

### Параметры пути

| Параметр  | Тип    | Обязательный | Описание        |
|-----------|--------|--------------|-----------------|
| id        | int64  | Да           | ID станции в БД |
| device_id | string | Да           | ID устройства   |

### Ответ

**200 OK**

```typescript
// Возвращает один объект TelemetryEnvelope
interface DeviceTelemetryResponse {
  id: string;
  station_id: string;
  station_name: string;
  timestamp: string;
  device_id: string;
  device_name: string;
  device_group: string;
  values: DataPoint[];
}
```

**Пример запроса:**

```
GET /ges/1/telemetry/ga-1
```

**Пример ответа:**

```json
{
  "id": "tel-001",
  "station_id": "ges-sayano",
  "station_name": "Саяно-Шушенская ГЭС",
  "timestamp": "2024-04-10T12:30:45Z",
  "device_id": "ga-1",
  "device_name": "Гидроагрегат №1",
  "device_group": "generators",
  "values": [
    {
      "name": "active_power",
      "value": 640.5,
      "unit": "МВт",
      "quality": "good",
      "severity": "normal"
    },
    {
      "name": "rotation_speed",
      "value": 142.8,
      "unit": "об/мин",
      "quality": "good",
      "severity": "normal"
    },
    {
      "name": "bearing_temperature",
      "value": 65.2,
      "unit": "°C",
      "quality": "good",
      "severity": "warning"
    },
    {
      "name": "vibration_level",
      "value": 2.1,
      "unit": "мм/с",
      "quality": "good",
      "severity": "normal"
    }
  ]
}
```

### Ошибки

| Код | Описание                                     |
|-----|----------------------------------------------|
| 400 | Неверный формат ID или отсутствует device_id |
| 404 | Телеметрия устройства не найдена             |
| 500 | Ошибка получения данных из Redis             |

---

## 10. Получить данные АСКУЭ

Получение данных АСКУЭ (автоматизированная система коммерческого учёта электроэнергии) для ГЭС.

### Запрос

```
GET /ges/{id}/askue
```

### Параметры пути

| Параметр | Тип   | Обязательный | Описание       |
|----------|-------|--------------|----------------|
| id       | int64 | Да           | ID организации |

### Ответ

**200 OK**

```typescript
interface ASCUEMetrics {
  active?: number;            // Активная мощность (МВт)
  reactive?: number;          // Реактивная мощность (МВАр)
  power_import?: number;      // Импорт мощности
  power_export?: number;      // Экспорт мощности
  own_needs?: number;         // Собственные нужды
  flow?: number;              // Расход воды (м³/с)
  active_agg_count?: number;  // Количество работающих агрегатов
  pending_agg_count?: number; // Количество агрегатов в резерве
  repair_agg_count?: number;  // Количество агрегатов в ремонте
}
```

**Пример ответа:**

```json
{
  "active": 125.5,
  "reactive": 45.2,
  "power_import": 10.0,
  "power_export": 5.0,
  "own_needs": 3.5,
  "flow": 1250.0,
  "active_agg_count": 4,
  "pending_agg_count": 1,
  "repair_agg_count": 0
}
```

### Ошибки

| Код | Описание                                          |
|-----|---------------------------------------------------|
| 400 | Неверный формат ID                                |
| 404 | Организация не найдена в конфигурации АСКУЭ       |
| 500 | Ошибка при получении данных из внешнего источника |

### Примечания

- Данные получаются из внешнего источника АСКУЭ, настроенного в `config/ascue.yaml`
- Не все поля могут присутствовать в ответе — это зависит от конфигурации метрик для конкретной организации
- Данные обновляются в реальном времени при каждом запросе

---

## Примечания

### Presigned URLs

- **Файлы событий** (shutdowns, discharges, incidents, visits): URL действителен **1 час**
- **Иконки контактов**: URL действителен **24 часа**

После истечения срока действия URL необходимо повторно запросить данные для получения новых ссылок.

### Формат даты

Все даты в ответах возвращаются в формате **ISO 8601** с timezone UTC:

```
2024-03-15T08:00:00Z
```

Для query параметров фильтрации используется формат **YYYY-MM-DD**:

```
2024-03-15
```

### Телеметрия АСУТП

Данные телеметрии хранятся в Redis и обновляются в реальном времени системой АСУТП. Рекомендуемый интервал polling: **5-10 секунд**.

Возможные значения `quality`:

- `good` — данные достоверны
- `bad` — проблемы с получением данных
- `uncertain` — данные под вопросом

Возможные значения `severity`:

- `normal` — в норме
- `warning` — предупреждение
- `alarm` — аварийное состояние
- `critical` — критическое состояние
