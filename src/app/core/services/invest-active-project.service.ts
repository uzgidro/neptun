import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { InvestActiveProject } from '@/core/interfaces/invest-active-project';

const INVEST_ACTIVE_PROJECTS = '/invest-active-projects';

export interface AddInvestActiveProjectRequest {
    category: string;
    project_name: string;
    foreign_partner?: string;
    implementation_period?: string;
    capacity_mw?: number;
    production_mln_kwh?: number;
    cost_mln_usd?: number;
    status_text?: string;
}

export interface EditInvestActiveProjectRequest {
    category?: string;
    project_name?: string;
    foreign_partner?: string;
    implementation_period?: string;
    capacity_mw?: number;
    production_mln_kwh?: number;
    cost_mln_usd?: number;
    status_text?: string;
}

@Injectable({
    providedIn: 'root'
})
export class InvestActiveProjectService extends ApiService {
    getActiveProjects(): Observable<InvestActiveProject[]> {
        return this.http.get<InvestActiveProject[]>(BASE_URL + INVEST_ACTIVE_PROJECTS);
    }

    getById(id: number): Observable<InvestActiveProject> {
        return this.http.get<InvestActiveProject>(`${BASE_URL}${INVEST_ACTIVE_PROJECTS}/${id}`);
    }

    add(data: AddInvestActiveProjectRequest): Observable<InvestActiveProject> {
        return this.http.post<InvestActiveProject>(BASE_URL + INVEST_ACTIVE_PROJECTS, data);
    }

    edit(id: number, data: EditInvestActiveProjectRequest): Observable<InvestActiveProject> {
        return this.http.patch<InvestActiveProject>(`${BASE_URL}${INVEST_ACTIVE_PROJECTS}/${id}`, data);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${BASE_URL}${INVEST_ACTIVE_PROJECTS}/${id}`);
    }
}
