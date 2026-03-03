import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import { Competency, CompetencyPayload, CompetencyAssessment, AssessmentPayload, CompetencyMatrix } from '@/core/interfaces/hrm/competency';

const API_URL = BASE_URL + '/hrm/competencies';

@Injectable({
    providedIn: 'root'
})
export class CompetencyService {
    private http = inject(HttpClient);

    // Competencies
    getCompetencies(category?: string): Observable<Competency[]> {
        let params = new HttpParams();
        if (category) {
            params = params.set('category', category);
        }
        return this.http.get<Competency[]>(API_URL, { params });
    }

    getCompetencyById(id: number): Observable<Competency> {
        return this.http.get<Competency>(`${API_URL}/${id}`);
    }

    createCompetency(payload: CompetencyPayload): Observable<Competency> {
        return this.http.post<Competency>(API_URL, payload);
    }

    updateCompetency(id: number, payload: Partial<CompetencyPayload>): Observable<Competency> {
        return this.http.put<Competency>(`${API_URL}/${id}`, payload);
    }

    deleteCompetency(id: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/${id}`);
    }

    // Assessments
    getAssessments(params?: { employee_id?: number; status?: string }): Observable<CompetencyAssessment[]> {
        let httpParams = new HttpParams();
        if (params?.employee_id) {
            httpParams = httpParams.set('employee_id', params.employee_id.toString());
        }
        if (params?.status) {
            httpParams = httpParams.set('status', params.status);
        }
        return this.http.get<CompetencyAssessment[]>(`${API_URL}/assessments`, { params: httpParams });
    }

    getAssessmentById(id: number): Observable<CompetencyAssessment> {
        return this.http.get<CompetencyAssessment>(`${API_URL}/assessments/${id}`);
    }

    createAssessment(payload: AssessmentPayload): Observable<CompetencyAssessment> {
        return this.http.post<CompetencyAssessment>(`${API_URL}/assessments`, payload);
    }

    updateAssessment(id: number, payload: Partial<AssessmentPayload>): Observable<CompetencyAssessment> {
        return this.http.put<CompetencyAssessment>(`${API_URL}/assessments/${id}`, payload);
    }

    deleteAssessment(id: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/assessments/${id}`);
    }

    completeAssessment(id: number): Observable<CompetencyAssessment> {
        return this.http.post<CompetencyAssessment>(`${API_URL}/assessments/${id}/complete`, {});
    }

    getEmployeeAssessments(employeeId: number): Observable<CompetencyAssessment[]> {
        return this.http.get<CompetencyAssessment[]>(`${API_URL}/employees/${employeeId}/assessments`);
    }

    // Competency Matrix
    getMatrices(): Observable<CompetencyMatrix[]> {
        return this.http.get<CompetencyMatrix[]>(`${API_URL}/matrices`);
    }

    getMatrixByPosition(positionId: number): Observable<CompetencyMatrix> {
        return this.http.get<CompetencyMatrix>(`${API_URL}/matrices/position/${positionId}`);
    }

    createMatrix(positionId: number, competencies: { competency_id: number; required_level: number; is_critical: boolean }[]): Observable<CompetencyMatrix> {
        return this.http.post<CompetencyMatrix>(`${API_URL}/matrices`, { position_id: positionId, competencies });
    }

    updateMatrix(id: number, competencies: { competency_id: number; required_level: number; is_critical: boolean }[]): Observable<CompetencyMatrix> {
        return this.http.put<CompetencyMatrix>(`${API_URL}/matrices/${id}`, { competencies });
    }

    // Gap Analysis
    getGapAnalysis(employeeId: number): Observable<any> {
        return this.http.get<any>(`${API_URL}/employees/${employeeId}/gap-analysis`);
    }

    // Reports
    getCompetencyReport(params?: { department_id?: number; competency_id?: number }): Observable<any> {
        let httpParams = new HttpParams();
        if (params?.department_id) {
            httpParams = httpParams.set('department_id', params.department_id.toString());
        }
        if (params?.competency_id) {
            httpParams = httpParams.set('competency_id', params.competency_id.toString());
        }
        return this.http.get<any>(`${API_URL}/reports`, { params: httpParams });
    }
}
