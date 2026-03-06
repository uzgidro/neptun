import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import {
    PerformanceReview, PerformanceReviewPayload, SelfReviewPayload, ManagerReviewPayload,
    PerformanceGoal, GoalPayload, PerformanceDashboard,
    KPI, PerformanceRating
} from '@/core/interfaces/hrm/performance';

const API_URL = BASE_URL + '/hrm/performance';
const USE_MOCK = !BASE_URL;

const MOCK_GOALS: PerformanceGoal[] = [
    { id: 1, employee_id: 1, title: 'Увеличить выпуск продукции на 5%', weight: 30, status: 'in_progress', progress: 65, target_value: 105, current_value: 98 },
    { id: 2, employee_id: 1, title: 'Снизить аварийность на 20%', weight: 25, status: 'completed', progress: 100, target_value: 80, current_value: 75 },
    { id: 3, employee_id: 2, title: 'Внедрить систему мониторинга', weight: 30, status: 'in_progress', progress: 40, target_value: 100, current_value: 40 },
    { id: 4, employee_id: 3, title: 'Оптимизировать расход воды', weight: 25, status: 'not_started', progress: 0, target_value: 90, current_value: 0 }
];

const MOCK_REVIEWS: PerformanceReview[] = [
    {
        id: 1, employee_id: 1, employee_name: 'Каримов Бахтиёр Рустамович', reviewer_id: 10, reviewer_name: 'Исмаилов А.Б.',
        type: 'annual', status: 'completed', period_start: '2025-01-01', period_end: '2025-12-31',
        goals: [MOCK_GOALS[0], MOCK_GOALS[1]], self_rating: 4, self_comment: 'Выполнил все поставленные задачи',
        manager_rating: 4, manager_comment: 'Хорошие результаты', final_rating: 4,
        strengths: 'Инициативность, техническая экспертиза', improvements: 'Делегирование задач'
    },
    {
        id: 2, employee_id: 2, employee_name: 'Султанова Дилноза Камолидиновна', reviewer_id: 10, reviewer_name: 'Исмаилов А.Б.',
        type: 'annual', status: 'manager_review', period_start: '2025-01-01', period_end: '2025-12-31',
        goals: [MOCK_GOALS[2]], self_rating: 4, self_comment: 'Активно работаю над проектом мониторинга',
        manager_rating: null, final_rating: null
    },
    {
        id: 3, employee_id: 3, employee_name: 'Рахимов Отабек Шухратович', reviewer_id: 10, reviewer_name: 'Исмаилов А.Б.',
        type: 'quarterly', status: 'self_review', period_start: '2026-01-01', period_end: '2026-03-31',
        goals: [MOCK_GOALS[3]], self_rating: null, manager_rating: null, final_rating: null
    },
    {
        id: 4, employee_id: 4, employee_name: 'Абдуллаев Жасур Тохирович', reviewer_id: 11, reviewer_name: 'Хасанов Р.Т.',
        type: 'probation', status: 'completed', period_start: '2025-10-01', period_end: '2026-01-01',
        goals: [], self_rating: 3, manager_rating: 4, final_rating: 4,
        strengths: 'Быстрая обучаемость', improvements: 'Углубить знание нормативов'
    }
];

const MOCK_DASHBOARD: PerformanceDashboard = {
    total_reviews: 48, completed_reviews: 32, pending_reviews: 16, avg_rating: 3.8,
    goal_stats: { total: 120, completed: 72, in_progress: 35, overdue: 13, avg_progress: 68 }
};

const MOCK_KPIS: KPI[] = [
    { id: 1, employee_id: 1, employee_name: 'Каримов Б.Р.', kpi_name: 'Выпуск продукции', target_value: 1200, actual_value: 1150, unit: 'тонн', period_month: 2, period_year: 2026, achievement_percent: 95.8, status: 'on_track' },
    { id: 2, employee_id: 1, employee_name: 'Каримов Б.Р.', kpi_name: 'Снижение потерь', target_value: 5, actual_value: 4.2, unit: '%', period_month: 2, period_year: 2026, achievement_percent: 116, status: 'exceeded' },
    { id: 3, employee_id: 2, employee_name: 'Султанова Д.К.', kpi_name: 'Внедрение мониторинга', target_value: 100, actual_value: 40, unit: '%', period_month: 2, period_year: 2026, achievement_percent: 40, status: 'behind' },
    { id: 4, employee_id: 3, employee_name: 'Рахимов О.Ш.', kpi_name: 'Обслуживание оборудования', target_value: 50, actual_value: 42, unit: 'единиц', period_month: 2, period_year: 2026, achievement_percent: 84, status: 'at_risk' }
];

const MOCK_RATINGS: PerformanceRating[] = [
    { id: 1, employee_id: 1, employee_name: 'Каримов Б.Р.', period_year: 2025, overall_rating: 4.2, rating_label: 'Превышает ожидания', rank: 3, percentile: 85 },
    { id: 2, employee_id: 2, employee_name: 'Султанова Д.К.', period_year: 2025, overall_rating: 3.8, rating_label: 'Соответствует ожиданиям', rank: 8, percentile: 70 },
    { id: 3, employee_id: 3, employee_name: 'Рахимов О.Ш.', period_year: 2025, overall_rating: 4.5, rating_label: 'Превышает ожидания', rank: 1, percentile: 95 },
    { id: 4, employee_id: 4, employee_name: 'Абдуллаев Ж.Т.', period_year: 2025, overall_rating: 3.5, rating_label: 'Соответствует ожиданиям', rank: 12, percentile: 55 }
];

@Injectable({
    providedIn: 'root'
})
export class PerformanceService {
    private http = inject(HttpClient);

    getReviews(params?: { status?: string; type?: string; employee_id?: number; search?: string }): Observable<PerformanceReview[]> {
        if (USE_MOCK) {
            let result = [...MOCK_REVIEWS];
            if (params?.status) result = result.filter(r => r.status === params.status);
            if (params?.type) result = result.filter(r => r.type === params.type);
            if (params?.employee_id) result = result.filter(r => r.employee_id === params.employee_id);
            if (params?.search) result = result.filter(r => r.employee_name.toLowerCase().includes(params.search!.toLowerCase()));
            return of(result).pipe(delay(200));
        }
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.type) httpParams = httpParams.set('type', params.type);
        if (params?.employee_id) httpParams = httpParams.set('employee_id', params.employee_id.toString());
        if (params?.search) httpParams = httpParams.set('search', params.search);
        return this.http.get<PerformanceReview[]>(`${API_URL}/reviews`, { params: httpParams });
    }

    getReviewById(id: number): Observable<PerformanceReview> {
        if (USE_MOCK) return of(MOCK_REVIEWS.find(r => r.id === id) || MOCK_REVIEWS[0]).pipe(delay(150));
        return this.http.get<PerformanceReview>(`${API_URL}/reviews/${id}`);
    }

    createReview(payload: PerformanceReviewPayload): Observable<PerformanceReview> {
        if (USE_MOCK) return of({ ...MOCK_REVIEWS[2], ...payload, id: Date.now(), goals: [] } as PerformanceReview).pipe(delay(200));
        return this.http.post<PerformanceReview>(`${API_URL}/reviews`, payload);
    }

    updateReview(id: number, payload: Partial<PerformanceReviewPayload>): Observable<PerformanceReview> {
        if (USE_MOCK) return of({ ...MOCK_REVIEWS[0], ...payload, id } as PerformanceReview).pipe(delay(200));
        return this.http.patch<PerformanceReview>(`${API_URL}/reviews/${id}`, payload);
    }

    submitSelfReview(id: number, payload: SelfReviewPayload): Observable<PerformanceReview> {
        if (USE_MOCK) return of({ ...MOCK_REVIEWS[0], ...payload, id, status: 'manager_review' as const }).pipe(delay(200));
        return this.http.post<PerformanceReview>(`${API_URL}/reviews/${id}/self-review`, payload);
    }

    submitManagerReview(id: number, payload: ManagerReviewPayload): Observable<PerformanceReview> {
        if (USE_MOCK) return of({ ...MOCK_REVIEWS[0], ...payload, id, status: 'completed' as const }).pipe(delay(200));
        return this.http.post<PerformanceReview>(`${API_URL}/reviews/${id}/manager-review`, payload);
    }

    completeReview(id: number): Observable<PerformanceReview> {
        if (USE_MOCK) return of({ ...MOCK_REVIEWS[0], id, status: 'completed' as const }).pipe(delay(200));
        return this.http.post<PerformanceReview>(`${API_URL}/reviews/${id}/complete`, {});
    }

    getGoals(params?: { status?: string; employee_id?: number; review_id?: number }): Observable<PerformanceGoal[]> {
        if (USE_MOCK) {
            let result = [...MOCK_GOALS];
            if (params?.status) result = result.filter(g => g.status === params.status);
            if (params?.employee_id) result = result.filter(g => g.employee_id === params.employee_id);
            return of(result).pipe(delay(200));
        }
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.employee_id) httpParams = httpParams.set('employee_id', params.employee_id.toString());
        if (params?.review_id) httpParams = httpParams.set('review_id', params.review_id.toString());
        return this.http.get<PerformanceGoal[]>(`${API_URL}/goals`, { params: httpParams });
    }

    createGoal(payload: GoalPayload): Observable<PerformanceGoal> {
        if (USE_MOCK) return of({ ...MOCK_GOALS[0], ...payload, id: Date.now(), progress: 0, status: 'not_started' as const }).pipe(delay(200));
        return this.http.post<PerformanceGoal>(`${API_URL}/goals`, payload);
    }

    updateGoal(id: number, payload: Partial<GoalPayload>): Observable<PerformanceGoal> {
        if (USE_MOCK) return of({ ...MOCK_GOALS[0], ...payload, id }).pipe(delay(200));
        return this.http.patch<PerformanceGoal>(`${API_URL}/goals/${id}`, payload);
    }

    updateGoalProgress(id: number, currentValue: number): Observable<PerformanceGoal> {
        if (USE_MOCK) return of({ ...MOCK_GOALS[0], id, current_value: currentValue }).pipe(delay(200));
        return this.http.patch<PerformanceGoal>(`${API_URL}/goals/${id}/progress`, { current_value: currentValue });
    }

    deleteGoal(id: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(`${API_URL}/goals/${id}`);
    }

    getKPIs(): Observable<KPI[]> {
        if (USE_MOCK) return of(MOCK_KPIS).pipe(delay(200));
        return this.http.get<KPI[]>(`${API_URL}/kpis`);
    }

    getRatings(): Observable<PerformanceRating[]> {
        if (USE_MOCK) return of(MOCK_RATINGS).pipe(delay(200));
        return this.http.get<PerformanceRating[]>(`${API_URL}/ratings`);
    }

    getEmployeeRating(employeeId: number): Observable<PerformanceRating> {
        if (USE_MOCK) return of(MOCK_RATINGS.find(r => r.employee_id === employeeId) || MOCK_RATINGS[0]).pipe(delay(150));
        return this.http.get<PerformanceRating>(`${API_URL}/ratings/employee/${employeeId}`);
    }

    getDashboard(): Observable<PerformanceDashboard> {
        if (USE_MOCK) return of(MOCK_DASHBOARD).pipe(delay(200));
        return this.http.get<PerformanceDashboard>(`${API_URL}/dashboard`);
    }
}
