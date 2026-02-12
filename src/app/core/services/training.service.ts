import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Training, TrainingPayload } from '@/core/interfaces/hrm/training';

// Мок-данные обучений (8 программ)
const MOCK_TRAININGS: Training[] = [
    {
        id: 1,
        title: 'Охрана труда и техника безопасности',
        description: 'Обязательное обучение по охране труда для всех сотрудников предприятия. Включает теоретическую часть и практические занятия.',
        training_type: 'course',
        provider: 'Центр охраны труда',
        start_date: '2024-11-01',
        end_date: '2024-11-15',
        duration_hours: 40,
        location: 'Учебный класс №1',
        is_online: false,
        max_participants: 30,
        current_participants: 12,
        status: 'completed',
        cost: 3_600_000,
        certificate_provided: true,
        created_at: '2024-10-15',
        updated_at: '2024-11-15'
    },
    {
        id: 2,
        title: '1С:Предприятие — Управление торговлей',
        description: 'Курс по работе с конфигурацией 1С:УТ 11. Основы работы, настройка справочников, формирование отчётов.',
        training_type: 'course',
        provider: 'Учебный центр 1С-Ташкент',
        start_date: '2025-01-20',
        end_date: '2025-02-28',
        duration_hours: 60,
        location: 'Учебный центр 1С',
        is_online: false,
        max_participants: 15,
        current_participants: 8,
        status: 'in_progress',
        cost: 4_800_000,
        certificate_provided: true,
        created_at: '2025-01-10',
        updated_at: '2025-01-20'
    },
    {
        id: 3,
        title: 'Проектное управление (PMI)',
        description: 'Основы проектного менеджмента по стандартам PMI. Планирование, управление рисками, контроль сроков и бюджета.',
        training_type: 'seminar',
        provider: 'Бизнес-академия',
        start_date: '2025-03-10',
        end_date: '2025-03-14',
        duration_hours: 32,
        location: 'Отель Hilton, конференц-зал',
        is_online: false,
        max_participants: 20,
        current_participants: 3,
        status: 'planned',
        cost: 8_000_000,
        certificate_provided: true,
        created_at: '2025-01-25',
        updated_at: '2025-01-25'
    },
    {
        id: 4,
        title: 'Промышленная безопасность',
        description: 'Аттестация по промышленной безопасности для инженерно-технических работников производственного отдела.',
        training_type: 'certification',
        provider: 'Госгортехнадзор',
        start_date: '2024-09-01',
        end_date: '2024-09-10',
        duration_hours: 24,
        location: 'Центр аттестации',
        is_online: false,
        max_participants: 10,
        current_participants: 5,
        status: 'completed',
        cost: 2_500_000,
        certificate_provided: true,
        created_at: '2024-08-10',
        updated_at: '2024-09-10'
    },
    {
        id: 5,
        title: 'Excel продвинутый уровень',
        description: 'Продвинутые функции Excel: сводные таблицы, макросы VBA, Power Query, визуализация данных.',
        training_type: 'workshop',
        provider: 'IT Academy',
        start_date: '2025-04-01',
        end_date: '2025-04-10',
        duration_hours: 20,
        is_online: true,
        max_participants: 25,
        current_participants: 6,
        status: 'planned',
        cost: 1_500_000,
        certificate_provided: false,
        created_at: '2025-02-01',
        updated_at: '2025-02-01'
    },
    {
        id: 6,
        title: 'Деловой английский язык (Business English)',
        description: 'Курс делового английского для руководителей и специалистов. Деловая переписка, переговоры, презентации.',
        training_type: 'course',
        provider: 'Language Pro',
        start_date: '2025-01-15',
        end_date: '2025-06-15',
        duration_hours: 120,
        location: 'Офис компании, переговорная',
        is_online: false,
        max_participants: 10,
        current_participants: 4,
        status: 'in_progress',
        cost: 12_000_000,
        certificate_provided: true,
        created_at: '2024-12-20',
        updated_at: '2025-01-15'
    },
    {
        id: 7,
        title: 'Управление качеством (ISO 9001:2015)',
        description: 'Обучение требованиям стандарта ISO 9001:2015. Внутренний аудит, документация СМК, корректирующие действия.',
        training_type: 'certification',
        provider: 'SGS Academy',
        start_date: '2024-10-14',
        end_date: '2024-10-18',
        duration_hours: 40,
        location: 'Бизнес-центр Инфинити',
        is_online: false,
        max_participants: 15,
        current_participants: 3,
        status: 'completed',
        cost: 6_000_000,
        certificate_provided: true,
        created_at: '2024-09-20',
        updated_at: '2024-10-18'
    },
    {
        id: 8,
        title: 'Менеджмент и лидерство',
        description: 'Программа развития управленческих компетенций: постановка целей, мотивация, делегирование, обратная связь.',
        training_type: 'seminar',
        provider: 'Бизнес-академия',
        start_date: '2025-05-12',
        end_date: '2025-05-16',
        duration_hours: 32,
        location: 'Конференц-зал компании',
        is_online: false,
        max_participants: 12,
        current_participants: 5,
        status: 'planned',
        cost: 7_200_000,
        certificate_provided: true,
        created_at: '2025-02-05',
        updated_at: '2025-02-05'
    }
];

@Injectable({
    providedIn: 'root'
})
export class TrainingService extends ApiService {
    // --- CRUD methods ---

    getAll(): Observable<Training[]> {
        return of(MOCK_TRAININGS).pipe(delay(300));
    }

    getById(id: number): Observable<Training> {
        const training = MOCK_TRAININGS.find((t) => t.id === id);
        return of(training as Training).pipe(delay(300));
    }

    create(payload: TrainingPayload): Observable<Training> {
        const newTraining: Training = {
            id: Date.now(),
            status: 'planned',
            current_participants: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...payload
        } as Training;
        return of(newTraining).pipe(delay(200));
    }

    update(id: number, payload: TrainingPayload): Observable<Training> {
        const existing = MOCK_TRAININGS.find((t) => t.id === id);
        const updated = { ...existing, ...payload, updated_at: new Date().toISOString() } as Training;
        return of(updated).pipe(delay(200));
    }

    delete(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    // --- Legacy aliases (backward compatibility) ---

    getTrainings(): Observable<Training[]> {
        return this.getAll();
    }

    getTraining(id: number): Observable<Training> {
        return this.getById(id);
    }

    createTraining(payload: TrainingPayload): Observable<Training> {
        return this.create(payload);
    }

    updateTraining(id: number, payload: TrainingPayload): Observable<Training> {
        return this.update(id, payload);
    }

    deleteTraining(id: number): Observable<any> {
        return this.delete(id);
    }
}
