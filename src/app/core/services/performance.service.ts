import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { PerformanceGoal, GoalPayload, PerformanceReview, PerformanceReviewPayload } from '@/core/interfaces/hrm/performance';

const GOALS = '/hrm/performance/goals';
const REVIEWS = '/hrm/performance/reviews';

@Injectable({
    providedIn: 'root'
})
export class PerformanceService extends ApiService {
    // Goals CRUD
    getGoals(): Observable<PerformanceGoal[]> {
        return this.http.get<PerformanceGoal[]>(BASE_URL + GOALS);
    }

    getGoal(id: number): Observable<PerformanceGoal> {
        return this.http.get<PerformanceGoal>(BASE_URL + GOALS + '/' + id);
    }

    createGoal(payload: GoalPayload): Observable<PerformanceGoal> {
        return this.http.post<PerformanceGoal>(BASE_URL + GOALS, payload);
    }

    updateGoal(id: number, payload: GoalPayload): Observable<PerformanceGoal> {
        return this.http.patch<PerformanceGoal>(BASE_URL + GOALS + '/' + id, payload);
    }

    deleteGoal(id: number): Observable<any> {
        return this.http.delete(BASE_URL + GOALS + '/' + id);
    }

    // Reviews CRUD
    getReviews(): Observable<PerformanceReview[]> {
        return this.http.get<PerformanceReview[]>(BASE_URL + REVIEWS);
    }

    getReview(id: number): Observable<PerformanceReview> {
        return this.http.get<PerformanceReview>(BASE_URL + REVIEWS + '/' + id);
    }

    createReview(payload: PerformanceReviewPayload): Observable<PerformanceReview> {
        return this.http.post<PerformanceReview>(BASE_URL + REVIEWS, payload);
    }

    updateReview(id: number, payload: Partial<PerformanceReviewPayload>): Observable<PerformanceReview> {
        return this.http.patch<PerformanceReview>(BASE_URL + REVIEWS + '/' + id, payload);
    }

    deleteReview(id: number): Observable<any> {
        return this.http.delete(BASE_URL + REVIEWS + '/' + id);
    }
}
