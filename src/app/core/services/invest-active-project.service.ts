import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { InvestActiveProject } from '@/core/interfaces/invest-active-project';

const INVEST_ACTIVE_PROJECTS = '/invest-active-projects';

@Injectable({
    providedIn: 'root'
})
export class InvestActiveProjectService extends ApiService {
    getActiveProjects(): Observable<InvestActiveProject[]> {
        return this.http.get<InvestActiveProject[]>(BASE_URL + INVEST_ACTIVE_PROJECTS);
    }
}
