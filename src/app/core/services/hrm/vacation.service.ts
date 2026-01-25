import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import { Vacation, VacationPayload, VacationBalance } from '@/core/interfaces/hrm/vacation';

const API_URL = BASE_URL + '/hrm/vacations';

@Injectable({
    providedIn: 'root'
})
export class VacationService {
    private http = inject(HttpClient);

    getAll(params?: { status?: string; year?: number }): Observable<Vacation[]> {
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.year) httpParams = httpParams.set('year', params.year.toString());
        return this.http.get<Vacation[]>(API_URL, { params: httpParams });
    }

    getById(id: number): Observable<Vacation> {
        return this.http.get<Vacation>(`${API_URL}/${id}`);
    }

    create(payload: VacationPayload): Observable<Vacation> {
        return this.http.post<Vacation>(API_URL, payload);
    }

    update(id: number, payload: Partial<VacationPayload>): Observable<Vacation> {
        return this.http.put<Vacation>(`${API_URL}/${id}`, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/${id}`);
    }

    approve(id: number): Observable<Vacation> {
        return this.http.post<Vacation>(`${API_URL}/${id}/approve`, {});
    }

    reject(id: number, reason: string): Observable<Vacation> {
        return this.http.post<Vacation>(`${API_URL}/${id}/reject`, { reason });
    }

    cancel(id: number): Observable<Vacation> {
        return this.http.post<Vacation>(`${API_URL}/${id}/cancel`, {});
    }

    getBalance(employeeId: number, year?: number): Observable<VacationBalance> {
        let params = new HttpParams();
        if (year) params = params.set('year', year.toString());
        return this.http.get<VacationBalance>(`${API_URL}/balance/${employeeId}`, { params });
    }

    getAllBalances(year?: number): Observable<VacationBalance[]> {
        let params = new HttpParams();
        if (year) params = params.set('year', year.toString());
        return this.http.get<VacationBalance[]>(`${API_URL}/balances`, { params });
    }

    getPendingApprovals(): Observable<Vacation[]> {
        return this.http.get<Vacation[]>(`${API_URL}/pending`);
    }

    getCalendar(month: number, year: number): Observable<Vacation[]> {
        const params = new HttpParams().set('month', month.toString()).set('year', year.toString());
        return this.http.get<Vacation[]>(`${API_URL}/calendar`, { params });
    }
}
