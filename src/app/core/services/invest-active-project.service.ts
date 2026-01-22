import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { InvestActiveProject } from '@/core/interfaces/invest-active-project';

export interface AddInvestActiveProjectRequest {
    category: string;
    project_name: string;
    foreign_partner?: string;
    implementation_period?: string;
    capacity_tons?: number;
    production_mln_liters?: number;
    cost_mln_usd?: number;
    status_text?: string;
}

export interface EditInvestActiveProjectRequest {
    category?: string;
    project_name?: string;
    foreign_partner?: string;
    implementation_period?: string;
    capacity_tons?: number;
    production_mln_liters?: number;
    cost_mln_usd?: number;
    status_text?: string;
}

// Мок-данные активных инвестиционных проектов
const MOCK_ACTIVE_PROJECTS: InvestActiveProject[] = [
    { id: 1, category: 'Модернизация', project_name: 'Расширение молокозавода "Самарканд"', foreign_partner: 'Tetra Pak', implementation_period: '2024-2026', capacity_mw: 50, production_mln_kwh: 180, cost_mln_usd: 25, status_text: 'В процессе', created_at: '2024-01-15' },
    { id: 2, category: 'Строительство', project_name: 'Новый цех в кластере "Фергана"', foreign_partner: 'GEA Group', implementation_period: '2024-2025', capacity_mw: 30, production_mln_kwh: 110, cost_mln_usd: 15, status_text: 'Планируется', created_at: '2024-02-20' },
    { id: 3, category: 'Закупка', project_name: 'Линия UHT-обработки', foreign_partner: 'SPX Flow', implementation_period: '2024', capacity_mw: 20, production_mln_kwh: 73, cost_mln_usd: 8, status_text: 'Согласование', created_at: '2024-03-10' }
];

@Injectable({
    providedIn: 'root'
})
export class InvestActiveProjectService extends ApiService {
    getActiveProjects(): Observable<InvestActiveProject[]> {
        return of(MOCK_ACTIVE_PROJECTS).pipe(delay(200));
    }

    getById(id: number): Observable<InvestActiveProject> {
        const project = MOCK_ACTIVE_PROJECTS.find(p => p.id === id) || MOCK_ACTIVE_PROJECTS[0];
        return of(project).pipe(delay(200));
    }

    add(data: AddInvestActiveProjectRequest): Observable<InvestActiveProject> {
        const newProject: InvestActiveProject = { id: Date.now(), ...data } as InvestActiveProject;
        return of(newProject).pipe(delay(300));
    }

    edit(id: number, data: EditInvestActiveProjectRequest): Observable<InvestActiveProject> {
        const project = MOCK_ACTIVE_PROJECTS.find(p => p.id === id) || MOCK_ACTIVE_PROJECTS[0];
        return of({ ...project, ...data }).pipe(delay(300));
    }

    delete(id: number): Observable<void> {
        return of(undefined).pipe(delay(200));
    }
}
