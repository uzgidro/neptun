import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Vacancy, Candidate, Interview, JobOffer, Onboarding } from '@/core/interfaces/hrm/recruiting';

const RECRUITING = '/hrm/recruiting';

/**
 * @deprecated Use `HrmRecruitingService` from `@/core/services/hrm/recruiting.service` instead.
 * This service is kept for backward compatibility with existing components.
 */
@Injectable({
    providedIn: 'root'
})
export class RecruitingService extends ApiService {
    // Vacancies
    getVacancies(): Observable<Vacancy[]> {
        return this.http.get<Vacancy[]>(BASE_URL + RECRUITING + '/vacancies');
    }

    getVacancy(id: number): Observable<Vacancy> {
        return this.http.get<Vacancy>(BASE_URL + RECRUITING + '/vacancies/' + id);
    }

    createVacancy(data: Partial<Vacancy>): Observable<Vacancy> {
        return this.http.post<Vacancy>(BASE_URL + RECRUITING + '/vacancies', data);
    }

    updateVacancy(id: number, data: Partial<Vacancy>): Observable<Vacancy> {
        return this.http.patch<Vacancy>(BASE_URL + RECRUITING + '/vacancies/' + id, data);
    }

    deleteVacancy(id: number): Observable<any> {
        return this.http.delete(BASE_URL + RECRUITING + '/vacancies/' + id);
    }

    publishVacancy(id: number): Observable<Vacancy> {
        return this.http.post<Vacancy>(BASE_URL + RECRUITING + '/vacancies/' + id + '/publish', {});
    }

    closeVacancy(id: number): Observable<Vacancy> {
        return this.http.post<Vacancy>(BASE_URL + RECRUITING + '/vacancies/' + id + '/close', {});
    }

    // Candidates
    getCandidates(): Observable<Candidate[]> {
        return this.http.get<Candidate[]>(BASE_URL + RECRUITING + '/candidates');
    }

    getCandidate(id: number): Observable<Candidate> {
        return this.http.get<Candidate>(BASE_URL + RECRUITING + '/candidates/' + id);
    }

    createCandidate(data: Partial<Candidate>): Observable<Candidate> {
        return this.http.post<Candidate>(BASE_URL + RECRUITING + '/candidates', data);
    }

    updateCandidate(id: number, data: Partial<Candidate>): Observable<Candidate> {
        return this.http.patch<Candidate>(BASE_URL + RECRUITING + '/candidates/' + id, data);
    }

    updateCandidateStage(id: number, stage: string): Observable<Candidate> {
        return this.http.post<Candidate>(BASE_URL + RECRUITING + '/candidates/' + id + '/stage', { stage });
    }

    // Interviews
    getInterviews(): Observable<Interview[]> {
        return this.http.get<Interview[]>(BASE_URL + RECRUITING + '/interviews');
    }

    createInterview(data: Partial<Interview>): Observable<Interview> {
        return this.http.post<Interview>(BASE_URL + RECRUITING + '/interviews', data);
    }

    updateInterview(id: number, data: Partial<Interview>): Observable<Interview> {
        return this.http.patch<Interview>(BASE_URL + RECRUITING + '/interviews/' + id, data);
    }

    // Job Offers
    getOffers(): Observable<JobOffer[]> {
        return this.http.get<JobOffer[]>(BASE_URL + RECRUITING + '/offers');
    }

    createOffer(data: Partial<JobOffer>): Observable<JobOffer> {
        return this.http.post<JobOffer>(BASE_URL + RECRUITING + '/offers', data);
    }

    updateOffer(id: number, data: Partial<JobOffer>): Observable<JobOffer> {
        return this.http.patch<JobOffer>(BASE_URL + RECRUITING + '/offers/' + id, data);
    }

    // Onboarding
    getOnboardings(): Observable<Onboarding[]> {
        return this.http.get<Onboarding[]>(BASE_URL + RECRUITING + '/onboardings');
    }

    createOnboarding(data: Partial<Onboarding>): Observable<Onboarding> {
        return this.http.post<Onboarding>(BASE_URL + RECRUITING + '/onboardings', data);
    }

    updateOnboarding(id: number, data: Partial<Onboarding>): Observable<Onboarding> {
        return this.http.patch<Onboarding>(BASE_URL + RECRUITING + '/onboardings/' + id, data);
    }
}
