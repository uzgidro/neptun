import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import {
    PerformanceReview, PerformanceReviewPayload, SelfReviewPayload, ManagerReviewPayload,
    PerformanceGoal, GoalPayload, PerformanceDashboard,
    KPI, PerformanceRating
} from '@/core/interfaces/hrm/performance';

const API_URL = BASE_URL + '/hrm/performance';

@Injectable({
    providedIn: 'root'
})
export class PerformanceService {
    private http = inject(HttpClient);

    // Reviews
    getReviews(params?: { status?: string; type?: string; employee_id?: number; search?: string }): Observable<PerformanceReview[]> {
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.type) httpParams = httpParams.set('type', params.type);
        if (params?.employee_id) httpParams = httpParams.set('employee_id', params.employee_id.toString());
        if (params?.search) httpParams = httpParams.set('search', params.search);
        return this.http.get<PerformanceReview[]>(`${API_URL}/reviews`, { params: httpParams });
    }

    getReviewById(id: number): Observable<PerformanceReview> {
        return this.http.get<PerformanceReview>(`${API_URL}/reviews/${id}`);
    }

    createReview(payload: PerformanceReviewPayload): Observable<PerformanceReview> {
        return this.http.post<PerformanceReview>(`${API_URL}/reviews`, payload);
    }

    updateReview(id: number, payload: Partial<PerformanceReviewPayload>): Observable<PerformanceReview> {
        return this.http.patch<PerformanceReview>(`${API_URL}/reviews/${id}`, payload);
    }

    submitSelfReview(id: number, payload: SelfReviewPayload): Observable<PerformanceReview> {
        return this.http.post<PerformanceReview>(`${API_URL}/reviews/${id}/self-review`, payload);
    }

    submitManagerReview(id: number, payload: ManagerReviewPayload): Observable<PerformanceReview> {
        return this.http.post<PerformanceReview>(`${API_URL}/reviews/${id}/manager-review`, payload);
    }

    completeReview(id: number): Observable<PerformanceReview> {
        return this.http.post<PerformanceReview>(`${API_URL}/reviews/${id}/complete`, {});
    }

    // Goals
    getGoals(params?: { status?: string; employee_id?: number; review_id?: number }): Observable<PerformanceGoal[]> {
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.employee_id) httpParams = httpParams.set('employee_id', params.employee_id.toString());
        if (params?.review_id) httpParams = httpParams.set('review_id', params.review_id.toString());
        return this.http.get<PerformanceGoal[]>(`${API_URL}/goals`, { params: httpParams });
    }

    createGoal(payload: GoalPayload): Observable<PerformanceGoal> {
        return this.http.post<PerformanceGoal>(`${API_URL}/goals`, payload);
    }

    updateGoal(id: number, payload: Partial<GoalPayload>): Observable<PerformanceGoal> {
        return this.http.patch<PerformanceGoal>(`${API_URL}/goals/${id}`, payload);
    }

    updateGoalProgress(id: number, currentValue: number): Observable<PerformanceGoal> {
        return this.http.patch<PerformanceGoal>(`${API_URL}/goals/${id}/progress`, { current_value: currentValue });
    }

    deleteGoal(id: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/goals/${id}`);
    }

    // Analytics
    getKPIs(): Observable<KPI[]> {
        return this.http.get<KPI[]>(`${API_URL}/kpis`);
    }

    getRatings(): Observable<PerformanceRating[]> {
        return this.http.get<PerformanceRating[]>(`${API_URL}/ratings`);
    }

    getEmployeeRating(employeeId: number): Observable<PerformanceRating> {
        return this.http.get<PerformanceRating>(`${API_URL}/ratings/employee/${employeeId}`);
    }

    getDashboard(): Observable<PerformanceDashboard> {
        return this.http.get<PerformanceDashboard>(`${API_URL}/dashboard`);
    }
}
