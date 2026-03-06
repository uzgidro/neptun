import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { Training, TrainingPayload } from '@/core/interfaces/hrm/training';
import { CrudService } from '@/core/interfaces/crud-service.interface';

const TRAININGS = '/hrm/training/trainings';
const USE_MOCK = !BASE_URL;

const MOCK_TRAININGS: Training[] = [
    {
        id: 1,
        title: 'Эксплуатация производственных линий: современные подходы',
        description: 'Курс повышения квалификации по эксплуатации и техническому обслуживанию производственных линий на молокозаводах Узбекистана.',
        training_type: 'course',
        provider: 'Ташкентский институт пищевой промышленности',
        start_date: '2026-03-15',
        end_date: '2026-04-15',
        duration_hours: 72,
        location: 'Ташкент, ул. Кари-Ниязова, 100',
        is_online: false,
        max_participants: 25,
        current_participants: 18,
        status: 'planned',
        cost: 4500000,
        certificate_provided: true,
        created_at: '2026-01-10T09:00:00Z',
        updated_at: '2026-01-10T09:00:00Z',
    },
    {
        id: 2,
        title: 'Безопасность производственных объектов',
        description: 'Семинар по нормам и правилам безопасной эксплуатации пастеризаторов, сепараторов и защитных конструкций молокозаводов.',
        training_type: 'seminar',
        provider: 'АО «МолокоПром»',
        start_date: '2026-02-01',
        end_date: '2026-02-03',
        duration_hours: 16,
        location: 'Молокозавод «Чарвак», конференц-зал',
        is_online: false,
        max_participants: 40,
        current_participants: 35,
        status: 'completed',
        cost: 1200000,
        certificate_provided: true,
        created_at: '2025-12-15T10:30:00Z',
        updated_at: '2026-02-04T14:00:00Z',
    },
    {
        id: 3,
        title: 'Системы SCADA для мониторинга производства',
        description: 'Практический воркшоп по настройке и использованию систем диспетчерского управления и сбора данных на молокозаводах.',
        training_type: 'workshop',
        provider: 'ООО "МолокоСофт"',
        start_date: '2026-03-01',
        end_date: '2026-03-05',
        duration_hours: 40,
        location: undefined,
        is_online: true,
        max_participants: 30,
        current_participants: 22,
        status: 'in_progress',
        cost: 3200000,
        certificate_provided: true,
        created_at: '2026-01-20T08:00:00Z',
        updated_at: '2026-03-01T09:00:00Z',
    },
    {
        id: 4,
        title: 'Сертификация ISO 55001: Управление активами молокозавода',
        description: 'Программа подготовки к сертификации по международному стандарту управления активами для объектов молочного производства.',
        training_type: 'certification',
        provider: 'TÜV Rheinland',
        start_date: '2026-05-10',
        end_date: '2026-06-10',
        duration_hours: 120,
        location: 'Ташкент, бизнес-центр "Пойтахт"',
        is_online: false,
        max_participants: 15,
        current_participants: 8,
        status: 'planned',
        cost: 12000000,
        certificate_provided: true,
        created_at: '2026-02-01T11:00:00Z',
        updated_at: '2026-02-01T11:00:00Z',
    },
    {
        id: 5,
        title: 'Наставничество: передача опыта эксплуатации производства',
        description: 'Программа наставничества для молодых специалистов по эксплуатации производственного оборудования и систем автоматизации.',
        training_type: 'mentoring',
        provider: undefined,
        start_date: '2026-01-15',
        end_date: '2026-07-15',
        duration_hours: 200,
        location: 'Молокозавод «Ходжикент»',
        is_online: false,
        max_participants: 10,
        current_participants: 6,
        status: 'in_progress',
        cost: undefined,
        certificate_provided: false,
        created_at: '2025-12-01T09:00:00Z',
        updated_at: '2026-01-15T10:00:00Z',
    },
    {
        id: 6,
        title: 'Основы молочной технологии и сырьевых ресурсов',
        description: 'Самостоятельное изучение материалов по технологическим расчётам, прогнозированию поставок сырья и оптимизации производства на молокозаводах.',
        training_type: 'self_study',
        provider: 'Coursera / Московский институт пищевой промышленности',
        start_date: '2026-02-10',
        end_date: '2026-04-10',
        duration_hours: 60,
        location: undefined,
        is_online: true,
        max_participants: undefined,
        current_participants: 12,
        status: 'in_progress',
        cost: 800000,
        certificate_provided: true,
        created_at: '2026-02-05T07:30:00Z',
        updated_at: '2026-02-10T08:00:00Z',
    },
];

/**
 * @deprecated Use `TrainingService` from `@/core/services/hrm/training.service` instead.
 * This service is kept for backward compatibility with existing components.
 */
@Injectable({
    providedIn: 'root',
})
export class TrainingService extends ApiService implements CrudService<Training, TrainingPayload> {
    getAll(): Observable<Training[]> {
        if (USE_MOCK) return of(MOCK_TRAININGS).pipe(delay(200));
        return this.http.get<Training[]>(BASE_URL + TRAININGS);
    }

    getById(id: number): Observable<Training> {
        if (USE_MOCK) return of(MOCK_TRAININGS.find((t) => t.id === id)!).pipe(delay(200));
        return this.http.get<Training>(BASE_URL + TRAININGS + '/' + id);
    }

    create(payload: TrainingPayload): Observable<Training> {
        if (USE_MOCK) return of({ ...payload, id: Date.now() } as Training).pipe(delay(200));
        return this.http.post<Training>(BASE_URL + TRAININGS, payload);
    }

    update(id: number, payload: TrainingPayload): Observable<Training> {
        if (USE_MOCK) return of({ ...MOCK_TRAININGS.find((t) => t.id === id)!, ...payload } as Training).pipe(delay(200));
        return this.http.patch<Training>(BASE_URL + TRAININGS + '/' + id, payload);
    }

    delete(id: number): Observable<void> {
        if (USE_MOCK) return of(undefined as unknown as void).pipe(delay(200));
        return this.http.delete<void>(BASE_URL + TRAININGS + '/' + id);
    }

    // Legacy aliases for backwards compatibility
    getTrainings = this.getAll.bind(this);
    getTraining = this.getById.bind(this);
    createTraining = this.create.bind(this);
    updateTraining = this.update.bind(this);
    deleteTraining = this.delete.bind(this);
}
