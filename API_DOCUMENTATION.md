# HRM API Documentation для Backend

Base URL: `https://prime.speedwagon.uz`

## Мой кабинет (Employee Cabinet)

### GET /my-profile
Получить профиль текущего сотрудника

**Response:**
```json
{
  "id": 1,
  "employee_id": "EMP-2019-0234",
  "full_name": "Абдуллаев Азамбай Ахмадович",
  "first_name": "Азамбай",
  "last_name": "Абдуллаев",
  "middle_name": "Ахмадович",
  "photo": "https://...",
  "position_id": 15,
  "position_name": "Инженер по автоматизации",
  "department_id": 1,
  "department_name": "IT-отдел",
  "email": "abdulaev.a@ministry.uz",
  "phone": "+998 (71) 123-45-67",
  "internal_phone": "1234",
  "hire_date": "2019-02-15",
  "birth_date": "1990-05-20",
  "employment_status": "active",
  "contract_type": "permanent",
  "is_on_probation": false,
  "manager_id": 5,
  "manager_name": "Каримов Бахтиёр Рустамович"
}
```

### PATCH /my-profile
Обновить профиль (только контактные данные)

**Request:**
```json
{
  "phone": "+998 (71) 123-45-67",
  "internal_phone": "1234",
  "email": "newemail@ministry.uz"
}
```

---

### GET /my-leave-balance
Получить остаток отпусков

**Response:**
```json
{
  "employee_id": 1,
  "year": 2025,
  "annual_leave_total": 15,
  "annual_leave_used": 3,
  "annual_leave_remaining": 12,
  "additional_leave_total": 5,
  "additional_leave_used": 3,
  "additional_leave_remaining": 2,
  "study_leave_total": 3,
  "study_leave_used": 3,
  "study_leave_remaining": 0,
  "sick_leave_used_month": 1,
  "sick_leave_used_year": 5,
  "comp_days_available": 2
}
```

---

### GET /my-vacations
Получить мои заявки на отпуск

**Response:**
```json
[
  {
    "id": 1,
    "type": "annual",
    "start_date": "2025-02-01",
    "end_date": "2025-02-05",
    "days_count": 5,
    "status": "approved",
    "reason": "Семейные обстоятельства",
    "submitted_at": "2025-01-20T10:00:00",
    "approved_by": 5,
    "approved_by_name": "Каримов Б.Р.",
    "approved_at": "2025-01-24T10:30:00"
  }
]
```

**Типы отпуска (type):** `annual`, `additional`, `study`, `unpaid`, `sick`, `maternity`, `paternity`, `comp_day`

**Статусы (status):** `draft`, `pending`, `approved`, `rejected`, `cancelled`, `completed`

### POST /my-vacations
Создать заявку на отпуск

**Request:**
```json
{
  "type": "annual",
  "start_date": "2025-03-01",
  "end_date": "2025-03-10",
  "reason": "Плановый отпуск"
}
```

### POST /my-vacations/{id}/cancel
Отменить заявку на отпуск

---

### GET /my-salary
Получить информацию о зарплате

**Response:**
```json
{
  "employee_id": 1,
  "current_salary": {
    "base_salary": 3000000,
    "total_allowances": 500000,
    "gross_salary": 3500000
  },
  "last_payment": {
    "id": 12,
    "period_month": 12,
    "period_year": 2024,
    "gross_salary": 3500000,
    "total_deductions": 525000,
    "net_salary": 2975000,
    "paid_at": "2025-01-02",
    "status": "paid"
  },
  "payment_history": ["..."]
}
```

### GET /my-salary/payslip/{paymentId}
Скачать расчетный лист (PDF)

**Response:** `application/pdf` blob

---

### GET /my-training
Получить информацию об обучении

**Response:**
```json
{
  "completed": [
    {
      "id": 1,
      "course_id": 10,
      "course_name": "Управление проектами",
      "course_type": "Профессиональное развитие",
      "completed_at": "2024-11-15",
      "score": 92,
      "certificate_number": "ПМ-2024-001234",
      "certificate_url": "/certificates/pm-2024-001234.pdf"
    }
  ],
  "in_progress": [
    {
      "id": 3,
      "course_id": 15,
      "course_name": "Цифровая трансформация",
      "course_type": "Профессиональное развитие",
      "started_at": "2025-01-20",
      "deadline": "2025-03-20",
      "progress_percent": 20,
      "modules_completed": 2,
      "modules_total": 10
    }
  ],
  "assigned": [
    {
      "id": 4,
      "course_id": 20,
      "course_name": "Agile и Scrum методологии",
      "course_type": "Профессиональное развитие",
      "assigned_at": "2025-01-15",
      "start_date": "2025-02-01",
      "deadline": "2025-04-01",
      "assigned_by_name": "Каримов Б.Р.",
      "is_mandatory": true
    }
  ]
}
```

---

### GET /my-competencies
Получить мои компетенции

**Response:**
```json
{
  "employee_id": 1,
  "last_assessment_date": "2024-10-15",
  "next_assessment_date": "2025-04-15",
  "average_score": 3.5,
  "competencies": [
    {
      "competency_id": 1,
      "competency_name": "Лидерство",
      "category": "Управленческие",
      "current_level": 3,
      "max_level": 5,
      "target_level": 4,
      "target_date": "2025-06-01"
    }
  ],
  "development_plan": [
    {
      "id": 1,
      "competency_name": "Лидерство",
      "current_level": 3,
      "target_level": 4,
      "target_date": "2025-06-01",
      "actions": ["Пройти курс", "Взять роль ментора"],
      "status": "in_progress"
    }
  ]
}
```

---

### GET /my-notifications
Получить уведомления

**Response:**
```json
[
  {
    "id": 1,
    "type": "vacation_approved",
    "title": "Отпуск одобрен",
    "message": "Ваша заявка на отпуск одобрена",
    "created_at": "2025-01-24T10:30:00",
    "read": false,
    "icon": "pi-calendar-plus",
    "severity": "success"
  }
]
```

**Типы (type):** `vacation_approved`, `vacation_rejected`, `salary_paid`, `training_assigned`, `assessment_scheduled`, `task_assigned`, `document_ready`, `system`, `other`

### PATCH /my-notifications/{id}/read
Отметить уведомление как прочитанное

### POST /my-notifications/read-all
Отметить все уведомления как прочитанные

---

### GET /my-tasks
Получить мои задачи

**Response:**
```json
[
  {
    "id": 1,
    "type": "training",
    "title": "Пройти курс",
    "description": "Завершить все модули",
    "due_date": "2025-03-20",
    "priority": "medium",
    "status": "in_progress",
    "link": "/hrm/training"
  }
]
```

---

### GET /my-documents
Получить мои документы

**Response:**
```json
[
  {
    "id": 1,
    "type": "contract",
    "name": "Трудовой договор №234",
    "uploaded_at": "2019-02-15",
    "can_download": true
  }
]
```

**Типы (type):** `contract`, `addendum`, `certificate`, `payslip`, `reference`, `order`, `other`

### GET /my-documents/{id}/download
Скачать документ

**Response:** `application/octet-stream` blob

---

## Vacation Management

### GET /vacations
Получить все заявки на отпуск (для HR)

### GET /vacations/{id}
Получить заявку по ID

### POST /vacations
Создать заявку

### PATCH /vacations/{id}
Обновить заявку

### DELETE /vacations/{id}
Удалить заявку

### POST /vacations/{id}/approve
Одобрить заявку

### POST /vacations/{id}/reject
Отклонить заявку
```json
{ "rejection_reason": "Причина отклонения" }
```

### POST /vacations/{id}/cancel
Отменить заявку

### GET /vacation-balances
Получить остатки отпусков всех сотрудников

### GET /vacation-balances/employee/{employeeId}
Получить остаток отпуска сотрудника

---

## Аутентификация

Все запросы должны включать cookies с JWT токеном.

### POST /auth/sign-in
```json
{ "name": "username", "password": "password" }
```

### POST /auth/sign-out
Выход из системы

### POST /auth/refresh
Обновить токен
