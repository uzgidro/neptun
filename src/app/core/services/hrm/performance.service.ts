import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import { PerformanceReview, PerformanceReviewPayload, PerformanceGoal, GoalPayload, KPI, PerformanceRating } from '@/core/interfaces/hrm/performance';

const API_URL = BASE_URL + '/hrm/performance';

@Injectable({
    providedIn: 'root'
})
export class PerformanceService {
    private http = inject(HttpClient);

    // Performance Reviews
    getReviews(params?: { employee_id?: number; status?: string; year?: number }): Observable<PerformanceReview[]> {
        let httpParams = new HttpParams();
        if (params?.employee_id) {
            httpParams = httpParams.set('employee_id', params.employee_id.toString());
        }
        if (params?.status) {
            httpParams = httpParams.set('status', params.status);
        }
        if (params?.year) {
            httpParams = httpParams.set('year', params.year.toString());
        }
        return this.http.get<PerformanceReview[]>(`${API_URL}/reviews`, { params: httpParams });
    }

    getReviewById(id: number): Observable<PerformanceReview> {
        return this.http.get<PerformanceReview>(`${API_URL}/reviews/${id}`);
    }

    createReview(payload: PerformanceReviewPayload): Observable<PerformanceReview> {
        return this.http.post<PerformanceReview>(`${API_URL}/reviews`, payload);
    }

    updateReview(id: number, payload: Partial<PerformanceReviewPayload>): Observable<PerformanceReview> {
        return this.http.put<PerformanceReview>(`${API_URL}/reviews/${id}`, payload);
    }

    deleteReview(id: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/reviews/${id}`);
    }

    submitSelfReview(id: number, comments: string): Observable<PerformanceReview> {
        return this.http.post<PerformanceReview>(`${API_URL}/reviews/${id}/self-review`, { comments });
    }

    submitManagerReview(id: number, rating: number, comments: string): Observable<PerformanceReview> {
        return this.http.post<PerformanceReview>(`${API_URL}/reviews/${id}/manager-review`, { rating, comments });
    }

    completeReview(id: number): Observable<PerformanceReview> {
        return this.http.post<PerformanceReview>(`${API_URL}/reviews/${id}/complete`, {});
    }

    // Goals
    getGoals(params?: { employee_id?: number; status?: string }): Observable<PerformanceGoal[]> {
        let httpParams = new HttpParams();
        if (params?.employee_id) {
            httpParams = httpParams.set('employee_id', params.employee_id.toString());
        }
        if (params?.status) {
            httpParams = httpParams.set('status', params.status);
        }
        return this.http.get<PerformanceGoal[]>(`${API_URL}/goals`, { params: httpParams });
    }

    getGoalById(id: number): Observable<PerformanceGoal> {
        return this.http.get<PerformanceGoal>(`${API_URL}/goals/${id}`);
    }

    createGoal(payload: GoalPayload): Observable<PerformanceGoal> {
        return this.http.post<PerformanceGoal>(`${API_URL}/goals`, payload);
    }

    updateGoal(id: number, payload: Partial<GoalPayload>): Observable<PerformanceGoal> {
        return this.http.put<PerformanceGoal>(`${API_URL}/goals/${id}`, payload);
    }

    deleteGoal(id: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/goals/${id}`);
    }

    updateGoalProgress(id: number, actualValue: string, progressPercent: number): Observable<PerformanceGoal> {
        return this.http.post<PerformanceGoal>(`${API_URL}/goals/${id}/progress`, { actual_value: actualValue, progress_percent: progressPercent });
    }

    // KPIs
    getKPIs(params?: { employee_id?: number; month?: number; year?: number }): Observable<KPI[]> {
        let httpParams = new HttpParams();
        if (params?.employee_id) {
            httpParams = httpParams.set('employee_id', params.employee_id.toString());
        }
        if (params?.month) {
            httpParams = httpParams.set('month', params.month.toString());
        }
        if (params?.year) {
            httpParams = httpParams.set('year', params.year.toString());
        }
        return this.http.get<KPI[]>(`${API_URL}/kpis`, { params: httpParams });
    }

    createKPI(kpi: Partial<KPI>): Observable<KPI> {
        return this.http.post<KPI>(`${API_URL}/kpis`, kpi);
    }

    updateKPI(id: number, kpi: Partial<KPI>): Observable<KPI> {
        return this.http.put<KPI>(`${API_URL}/kpis/${id}`, kpi);
    }

    deleteKPI(id: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/kpis/${id}`);
    }

    // Ratings
    getRatings(year?: number): Observable<PerformanceRating[]> {
        let params = new HttpParams();
        if (year) {
            params = params.set('year', year.toString());
        }
        return this.http.get<PerformanceRating[]>(`${API_URL}/ratings`, { params });
    }

    getEmployeeRating(employeeId: number, year?: number): Observable<PerformanceRating> {
        let params = new HttpParams();
        if (year) {
            params = params.set('year', year.toString());
        }
        return this.http.get<PerformanceRating>(`${API_URL}/ratings/employee/${employeeId}`, { params });
    }

    // Dashboard
    getPerformanceDashboard(): Observable<any> {
        return this.http.get<any>(`${API_URL}/dashboard`);
    }
}
