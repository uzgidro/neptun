import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import { Vacancy, VacancyPayload, Candidate, CandidatePayload, Interview } from '@/core/interfaces/hrm/recruiting';

const API_URL = BASE_URL + '/hrm/recruiting';

@Injectable({
    providedIn: 'root'
})
export class RecruitingService {
    private http = inject(HttpClient);

    // Vacancies
    getVacancies(params?: { status?: string; department_id?: number }): Observable<Vacancy[]> {
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.department_id) httpParams = httpParams.set('department_id', params.department_id.toString());
        return this.http.get<Vacancy[]>(`${API_URL}/vacancies`, { params: httpParams });
    }

    getVacancyById(id: number): Observable<Vacancy> {
        return this.http.get<Vacancy>(`${API_URL}/vacancies/${id}`);
    }

    createVacancy(payload: VacancyPayload): Observable<Vacancy> {
        return this.http.post<Vacancy>(`${API_URL}/vacancies`, payload);
    }

    updateVacancy(id: number, payload: Partial<VacancyPayload>): Observable<Vacancy> {
        return this.http.patch<Vacancy>(`${API_URL}/vacancies/${id}`, payload);
    }

    deleteVacancy(id: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/vacancies/${id}`);
    }

    publishVacancy(id: number): Observable<Vacancy> {
        return this.http.post<Vacancy>(`${API_URL}/vacancies/${id}/publish`, {});
    }

    closeVacancy(id: number): Observable<Vacancy> {
        return this.http.post<Vacancy>(`${API_URL}/vacancies/${id}/close`, {});
    }

    // Candidates
    getCandidates(params?: { vacancy_id?: number; status?: string }): Observable<Candidate[]> {
        let httpParams = new HttpParams();
        if (params?.vacancy_id) httpParams = httpParams.set('vacancy_id', params.vacancy_id.toString());
        if (params?.status) httpParams = httpParams.set('status', params.status);
        return this.http.get<Candidate[]>(`${API_URL}/candidates`, { params: httpParams });
    }

    getCandidateById(id: number): Observable<Candidate> {
        return this.http.get<Candidate>(`${API_URL}/candidates/${id}`);
    }

    createCandidate(payload: CandidatePayload, resume?: File): Observable<Candidate> {
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
            const value = (payload as any)[key];
            if (value !== undefined && value !== null) formData.append(key, value);
        });
        if (resume) formData.append('resume', resume);
        return this.http.post<Candidate>(`${API_URL}/candidates`, formData);
    }

    updateCandidate(id: number, payload: Partial<CandidatePayload>): Observable<Candidate> {
        return this.http.patch<Candidate>(`${API_URL}/candidates/${id}`, payload);
    }

    deleteCandidate(id: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/candidates/${id}`);
    }

    updateCandidateStatus(id: number, status: string, notes?: string): Observable<Candidate> {
        return this.http.patch<Candidate>(`${API_URL}/candidates/${id}/status`, { status, notes });
    }

    getCandidateInterviews(candidateId: number): Observable<Interview[]> {
        return this.http.get<Interview[]>(`${API_URL}/candidates/${candidateId}/interviews`);
    }

    // Interviews
    getInterviews(): Observable<Interview[]> {
        return this.http.get<Interview[]>(`${API_URL}/interviews`);
    }

    createInterview(interview: Partial<Interview>): Observable<Interview> {
        return this.http.post<Interview>(`${API_URL}/interviews`, interview);
    }

    updateInterview(id: number, data: Partial<Interview>): Observable<Interview> {
        return this.http.patch<Interview>(`${API_URL}/interviews/${id}`, data);
    }

    // Stats
    getRecruitingStats(): Observable<any> {
        return this.http.get<any>(`${API_URL}/stats`);
    }
}
