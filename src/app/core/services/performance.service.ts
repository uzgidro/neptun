import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { PerformanceGoal, GoalPayload, PerformanceReview, PerformanceReviewPayload } from '@/core/interfaces/hrm/performance';

const GOALS = '/hrm/performance/goals';
const REVIEWS = '/hrm/performance/reviews';
const USE_MOCK = !BASE_URL;

const MOCK_GOALS: PerformanceGoal[] = [
    {
        id: 1,
        employee_id: 101,
        title: 'Повысить коэффициент использования установленной мощности производства до 92%',
        target_value: 92,
        current_value: 87,
        weight: 30,
        status: 'in_progress',
        due_date: '2026-06-30',
        progress: 65,
    },
    {
        id: 2,
        employee_id: 102,
        title: 'Снизить время незапланированных простоев технологического оборудования на 15%',
        target_value: 15,
        current_value: 9,
        weight: 25,
        status: 'in_progress',
        due_date: '2026-12-31',
        progress: 60,
    },
    {
        id: 3,
        employee_id: 103,
        title: 'Завершить модернизацию системы автоматического управления Молокозавода «Чирчик»',
        target_value: 100,
        current_value: 100,
        weight: 20,
        status: 'completed',
        due_date: '2026-03-01',
        progress: 100,
    },
    {
        id: 4,
        employee_id: 101,
        title: 'Обеспечить выполнение годового плана выработки продукции — 2 800 тонн',
        target_value: 2800,
        current_value: 520,
        weight: 35,
        status: 'in_progress',
        due_date: '2026-12-31',
        progress: 19,
    },
    {
        id: 5,
        employee_id: 104,
        title: 'Провести аттестацию 100% оперативного персонала молочного комбината',
        target_value: 100,
        current_value: 0,
        weight: 15,
        status: 'not_started',
        due_date: '2026-09-30',
        progress: 0,
    },
];

const MOCK_REVIEWS: PerformanceReview[] = [
    {
        id: 1,
        employee_id: 101,
        employee_name: 'Каримов Бахтиёр Рустамович',
        reviewer_id: 201,
        reviewer_name: 'Юлдашев Шавкат Абдуллаевич',
        type: 'annual',
        status: 'completed',
        period_start: '2025-01-01',
        period_end: '2025-12-31',
        goals: [MOCK_GOALS[0], MOCK_GOALS[3]],
        self_rating: 4,
        self_comment: 'В течение отчётного периода обеспечил стабильную работу производственного оборудования, выполнил план по выработке на 98%.',
        manager_rating: 4,
        manager_comment: 'Сотрудник демонстрирует высокий уровень компетенций в управлении производственным оборудованием. Рекомендуется к повышению квалификации по SCADA-системам.',
        final_rating: 4,
        strengths: 'Глубокие технические знания, ответственный подход к эксплуатации оборудования, оперативное реагирование на аварийные ситуации.',
        improvements: 'Необходимо улучшить навыки работы с современными цифровыми системами мониторинга и отчётности.',
        created_at: '2026-01-15T09:00:00Z',
        updated_at: '2026-02-01T14:30:00Z',
    },
    {
        id: 2,
        employee_id: 102,
        employee_name: 'Ходжаев Тимур Маратович',
        reviewer_id: 201,
        reviewer_name: 'Юлдашев Шавкат Абдуллаевич',
        type: 'quarterly',
        status: 'manager_review',
        period_start: '2026-01-01',
        period_end: '2026-03-31',
        goals: [MOCK_GOALS[1]],
        self_rating: 3,
        self_comment: 'Выполнял плановые работы по техническому обслуживанию технологического оборудования. Столкнулся с задержками поставки запасных частей.',
        manager_rating: null,
        manager_comment: undefined,
        final_rating: null,
        strengths: undefined,
        improvements: undefined,
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-02T16:00:00Z',
    },
    {
        id: 3,
        employee_id: 103,
        employee_name: 'Рахимова Дилноза Ферганаовна',
        reviewer_id: 202,
        reviewer_name: 'Мирзаев Алишер Камолович',
        type: 'project',
        status: 'self_review',
        period_start: '2025-09-01',
        period_end: '2026-03-01',
        goals: [MOCK_GOALS[2]],
        self_rating: null,
        self_comment: undefined,
        manager_rating: null,
        manager_comment: undefined,
        final_rating: null,
        strengths: undefined,
        improvements: undefined,
        created_at: '2026-03-02T08:00:00Z',
        updated_at: '2026-03-02T08:00:00Z',
    },
];

@Injectable({
    providedIn: 'root',
})
export class PerformanceService extends ApiService {
    // Goals CRUD
    getGoals(): Observable<PerformanceGoal[]> {
        if (USE_MOCK) return of(MOCK_GOALS).pipe(delay(200));
        return this.http.get<PerformanceGoal[]>(BASE_URL + GOALS);
    }

    getGoal(id: number): Observable<PerformanceGoal> {
        if (USE_MOCK) return of(MOCK_GOALS.find((g) => g.id === id)!).pipe(delay(200));
        return this.http.get<PerformanceGoal>(BASE_URL + GOALS + '/' + id);
    }

    createGoal(payload: GoalPayload): Observable<PerformanceGoal> {
        if (USE_MOCK) return of({ ...payload, id: Date.now() } as PerformanceGoal).pipe(delay(200));
        return this.http.post<PerformanceGoal>(BASE_URL + GOALS, payload);
    }

    updateGoal(id: number, payload: GoalPayload): Observable<PerformanceGoal> {
        if (USE_MOCK) return of({ ...MOCK_GOALS.find((g) => g.id === id)!, ...payload } as PerformanceGoal).pipe(delay(200));
        return this.http.patch<PerformanceGoal>(BASE_URL + GOALS + '/' + id, payload);
    }

    deleteGoal(id: number): Observable<any> {
        if (USE_MOCK) return of(null).pipe(delay(200));
        return this.http.delete(BASE_URL + GOALS + '/' + id);
    }

    // Reviews CRUD
    getReviews(): Observable<PerformanceReview[]> {
        if (USE_MOCK) return of(MOCK_REVIEWS).pipe(delay(200));
        return this.http.get<PerformanceReview[]>(BASE_URL + REVIEWS);
    }

    getReview(id: number): Observable<PerformanceReview> {
        if (USE_MOCK) return of(MOCK_REVIEWS.find((r) => r.id === id)!).pipe(delay(200));
        return this.http.get<PerformanceReview>(BASE_URL + REVIEWS + '/' + id);
    }

    createReview(payload: PerformanceReviewPayload): Observable<PerformanceReview> {
        if (USE_MOCK) return of({ ...payload, id: Date.now() } as unknown as PerformanceReview).pipe(delay(200));
        return this.http.post<PerformanceReview>(BASE_URL + REVIEWS, payload);
    }

    updateReview(id: number, payload: Partial<PerformanceReviewPayload>): Observable<PerformanceReview> {
        if (USE_MOCK) return of({ ...MOCK_REVIEWS.find((r) => r.id === id)!, ...payload } as PerformanceReview).pipe(delay(200));
        return this.http.patch<PerformanceReview>(BASE_URL + REVIEWS + '/' + id, payload);
    }

    deleteReview(id: number): Observable<any> {
        if (USE_MOCK) return of(null).pipe(delay(200));
        return this.http.delete(BASE_URL + REVIEWS + '/' + id);
    }
}
