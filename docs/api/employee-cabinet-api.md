# API Specification: Employee Personal Cabinet (Личный Кабинет Сотрудника)

## Overview
This document describes the API endpoints required for the Employee Personal Cabinet feature.
All endpoints require JWT authentication.

**Base URL:** `/api/v1`
**Authentication:** Bearer Token (JWT)

---

## 1. Employee Profile

### GET /employee/profile
Get current employee's profile information.

**Response:**
```json
{
    "id": 1,
    "employee_id": "EMP-2019-0234",
    "full_name": "Абдуллаев Азамбай Ахмадович",
    "first_name": "Азамбай",
    "last_name": "Абдуллаев",
    "middle_name": "Ахмадович",
    "photo": "https://example.com/photos/emp-234.jpg",
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
    "probation_end_date": null,
    "is_on_probation": false,
    "manager_id": 5,
    "manager_name": "Каримов Бахтиёр Рустамович"
}
```

**Employment Status:** `active` | `on_leave` | `on_sick_leave` | `suspended` | `terminated`
**Contract Type:** `permanent` | `fixed_term` | `probation` | `contractor`

---

## 2. Leave Balance

### GET /employee/leave-balance
Get current employee's leave balance for the current year.

**Query Parameters:**
- `year` (optional): Year (default: current year)

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

## 3. Vacation Requests

### GET /employee/vacation-requests
Get list of current employee's vacation requests.

**Query Parameters:**
- `status` (optional): Filter by status
- `year` (optional): Filter by year
- `page` (optional): Page number
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
    "data": [
        {
            "id": 1,
            "type": "annual",
            "start_date": "2025-02-01",
            "end_date": "2025-02-05",
            "days_count": 5,
            "status": "approved",
            "reason": "Семейные обстоятельства",
            "submitted_at": "2025-01-20T10:00:00Z",
            "approved_by": 5,
            "approved_by_name": "Каримов Б.Р.",
            "approved_at": "2025-01-24T10:30:00Z",
            "rejected_by": null,
            "rejected_by_name": null,
            "rejected_at": null,
            "rejection_reason": null,
            "substitute_id": 10,
            "substitute_name": "Иванов И.И."
        }
    ],
    "meta": {
        "total": 5,
        "page": 1,
        "limit": 10,
        "total_pages": 1
    }
}
```

**Vacation Types:**
- `annual` - Основной отпуск
- `additional` - Дополнительный отпуск
- `study` - Учебный отпуск
- `unpaid` - Отпуск без сохранения з/п
- `sick` - Больничный
- `maternity` - Декретный отпуск
- `paternity` - Отпуск по уходу за ребенком
- `comp_day` - Отгул

**Vacation Status:**
- `draft` - Черновик
- `pending` - На согласовании
- `approved` - Одобрено
- `rejected` - Отклонено
- `cancelled` - Отменено
- `completed` - Завершено

### POST /employee/vacation-requests
Create a new vacation request.

**Request Body:**
```json
{
    "type": "annual",
    "start_date": "2025-02-01",
    "end_date": "2025-02-05",
    "reason": "Семейные обстоятельства",
    "substitute_id": 10
}
```

**Response:** `201 Created`
```json
{
    "id": 3,
    "type": "annual",
    "start_date": "2025-02-01",
    "end_date": "2025-02-05",
    "days_count": 5,
    "status": "pending",
    "submitted_at": "2025-01-25T09:00:00Z"
}
```

### PUT /employee/vacation-requests/{id}/cancel
Cancel a pending vacation request.

**Response:** `200 OK`
```json
{
    "id": 3,
    "status": "cancelled"
}
```

---

## 4. Salary Information

### GET /employee/salary
Get current employee's salary information.

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
        "paid_at": "2025-01-02T00:00:00Z",
        "status": "paid"
    },
    "payment_history": [
        {
            "id": 12,
            "period_month": 12,
            "period_year": 2024,
            "gross_salary": 3500000,
            "total_deductions": 525000,
            "net_salary": 2975000,
            "paid_at": "2025-01-02T00:00:00Z",
            "status": "paid"
        }
    ]
}
```

**Payment Status:** `calculated` | `approved` | `paid` | `pending`

### GET /employee/salary/payslip/{payment_id}
Download payslip PDF for a specific payment.

**Response:** PDF file (Content-Type: application/pdf)

---

## 5. Training

### GET /employee/training
Get current employee's training information.

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

### GET /employee/training/certificate/{course_id}
Download certificate PDF for a completed course.

**Response:** PDF file (Content-Type: application/pdf)

---

## 6. Competencies

### GET /employee/competencies
Get current employee's competency assessments.

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
            "target_date": "2025-06-01",
            "last_assessed_at": "2024-10-15"
        }
    ],
    "development_plan": [
        {
            "id": 1,
            "competency_name": "Лидерство",
            "current_level": 3,
            "target_level": 4,
            "target_date": "2025-06-01",
            "actions": [
                "Пройти курс \"Эффективное лидерство\"",
                "Взять роль ментора для junior-специалиста"
            ],
            "status": "in_progress"
        }
    ]
}
```

**Development Goal Status:** `not_started` | `in_progress` | `completed`

---

## 7. Notifications

### GET /employee/notifications
Get current employee's notifications.

**Query Parameters:**
- `read` (optional): Filter by read status (true/false)
- `page` (optional): Page number
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
    "data": [
        {
            "id": 1,
            "type": "vacation_approved",
            "title": "Отпуск одобрен",
            "message": "Ваша заявка на отпуск с 01.02.2025 по 05.02.2025 одобрена",
            "created_at": "2025-01-24T10:30:00Z",
            "read": false,
            "read_at": null,
            "link": "/hrm/my-cabinet",
            "icon": "pi-calendar-plus",
            "severity": "success"
        }
    ],
    "meta": {
        "total": 10,
        "unread": 3,
        "page": 1,
        "limit": 20
    }
}
```

**Notification Types:**
- `vacation_approved` - Отпуск одобрен
- `vacation_rejected` - Отпуск отклонен
- `salary_paid` - Зарплата выплачена
- `training_assigned` - Назначено обучение
- `assessment_scheduled` - Запланирована оценка
- `task_assigned` - Назначена задача
- `document_ready` - Документ готов
- `system` - Системное уведомление
- `other` - Прочее

**Severity:** `info` | `success` | `warn` | `danger`

### PUT /employee/notifications/{id}/read
Mark a notification as read.

**Response:** `200 OK`
```json
{
    "id": 1,
    "read": true,
    "read_at": "2025-01-25T09:00:00Z"
}
```

### PUT /employee/notifications/read-all
Mark all notifications as read.

**Response:** `200 OK`
```json
{
    "updated_count": 3
}
```

---

## 8. Documents

### GET /employee/documents
Get current employee's documents.

**Query Parameters:**
- `type` (optional): Filter by document type
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
    "data": [
        {
            "id": 1,
            "type": "contract",
            "name": "Трудовой договор №234 от 15.02.2019",
            "description": "Основной трудовой договор",
            "uploaded_at": "2019-02-15",
            "file_url": "/documents/contracts/234.pdf",
            "file_size": 245000,
            "can_download": true
        }
    ],
    "meta": {
        "total": 4,
        "page": 1,
        "limit": 10
    }
}
```

**Document Types:**
- `contract` - Трудовой договор
- `addendum` - Дополнительное соглашение
- `certificate` - Сертификат
- `payslip` - Расчетный лист
- `reference` - Справка
- `order` - Приказ
- `other` - Прочее

### GET /employee/documents/{id}/download
Download a document.

**Response:** File (various Content-Types based on file extension)

---

## 9. Tasks

### GET /employee/tasks
Get current employee's tasks.

**Query Parameters:**
- `status` (optional): Filter by status
- `priority` (optional): Filter by priority

**Response:**
```json
{
    "data": [
        {
            "id": 1,
            "type": "training",
            "title": "Пройти курс \"Цифровая трансформация\"",
            "description": "Завершить все модули курса",
            "due_date": "2025-03-20",
            "priority": "medium",
            "status": "in_progress",
            "assigned_by_name": "Система",
            "link": "/hrm/training"
        }
    ],
    "meta": {
        "total": 2,
        "page": 1,
        "limit": 10
    }
}
```

**Task Types:** `training` | `assessment` | `document` | `approval` | `meeting` | `other`
**Priority:** `low` | `medium` | `high` | `urgent`
**Status:** `pending` | `in_progress` | `completed` | `overdue`

---

## Error Responses

All endpoints return errors in the following format:

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Validation failed",
        "details": [
            {
                "field": "start_date",
                "message": "Start date must be in the future"
            }
        ]
    }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - 401 - Invalid or expired token
- `FORBIDDEN` - 403 - Access denied
- `NOT_FOUND` - 404 - Resource not found
- `VALIDATION_ERROR` - 422 - Validation failed
- `INTERNAL_ERROR` - 500 - Server error

---

## Authentication

All requests must include the Authorization header:

```
Authorization: Bearer <jwt_token>
```

JWT token should be obtained from the `/auth/login` endpoint.

---

## Notes for Backend Developer

1. **User Context**: All `/employee/*` endpoints use the JWT token to identify the current user. No employee_id parameter is needed in the URL.

2. **Date Format**: All dates should be in ISO 8601 format (YYYY-MM-DD for dates, YYYY-MM-DDTHH:mm:ssZ for timestamps).

3. **Currency**: All currency values are in UZS (Uzbek Som) as integers.

4. **Pagination**: Use `page` and `limit` query parameters. Response should include `meta` object with total count and page info.

5. **Vacation Workflow**:
   - Employee submits request (status: `pending`)
   - Manager approves/rejects (status: `approved`/`rejected`)
   - After vacation end date (status: `completed`)

6. **Notifications**: Should be created automatically when:
   - Vacation request is approved/rejected
   - Salary is paid
   - Training is assigned
   - Assessment is scheduled
   - Document is ready for download

7. **Real-time Updates**: Consider implementing WebSocket for real-time notifications.
