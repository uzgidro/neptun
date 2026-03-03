import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import { Training, TrainingPayload, TrainingParticipant, Certificate, DevelopmentPlan, DevelopmentGoal } from '@/core/interfaces/hrm/training';

const API_URL = BASE_URL + '/hrm/training';

@Injectable({
    providedIn: 'root'
})
export class TrainingService {
    private http = inject(HttpClient);

    // Trainings
    getTrainings(params?: { status?: string; type?: string }): Observable<Training[]> {
        let httpParams = new HttpParams();
        if (params?.status) {
            httpParams = httpParams.set('status', params.status);
        }
        if (params?.type) {
            httpParams = httpParams.set('type', params.type);
        }
        return this.http.get<Training[]>(`${API_URL}/trainings`, { params: httpParams });
    }

    getTrainingById(id: number): Observable<Training> {
        return this.http.get<Training>(`${API_URL}/trainings/${id}`);
    }

    createTraining(payload: TrainingPayload): Observable<Training> {
        return this.http.post<Training>(`${API_URL}/trainings`, payload);
    }

    updateTraining(id: number, payload: Partial<TrainingPayload>): Observable<Training> {
        return this.http.put<Training>(`${API_URL}/trainings/${id}`, payload);
    }

    deleteTraining(id: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/trainings/${id}`);
    }

    // Participants
    getParticipants(trainingId: number): Observable<TrainingParticipant[]> {
        return this.http.get<TrainingParticipant[]>(`${API_URL}/trainings/${trainingId}/participants`);
    }

    enrollParticipant(trainingId: number, employeeId: number): Observable<TrainingParticipant> {
        return this.http.post<TrainingParticipant>(`${API_URL}/trainings/${trainingId}/participants`, { employee_id: employeeId });
    }

    removeParticipant(trainingId: number, participantId: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/trainings/${trainingId}/participants/${participantId}`);
    }

    completeParticipant(trainingId: number, participantId: number, score?: number): Observable<TrainingParticipant> {
        return this.http.post<TrainingParticipant>(`${API_URL}/trainings/${trainingId}/participants/${participantId}/complete`, { score });
    }

    getEmployeeTrainings(employeeId: number): Observable<TrainingParticipant[]> {
        return this.http.get<TrainingParticipant[]>(`${API_URL}/employees/${employeeId}/trainings`);
    }

    // Certificates
    getCertificates(employeeId: number): Observable<Certificate[]> {
        return this.http.get<Certificate[]>(`${API_URL}/employees/${employeeId}/certificates`);
    }

    addCertificate(employeeId: number, certificate: Partial<Certificate>, file?: File): Observable<Certificate> {
        const formData = new FormData();
        Object.keys(certificate).forEach(key => {
            const value = (certificate as any)[key];
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });
        if (file) {
            formData.append('file', file);
        }
        return this.http.post<Certificate>(`${API_URL}/employees/${employeeId}/certificates`, formData);
    }

    deleteCertificate(employeeId: number, certificateId: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/employees/${employeeId}/certificates/${certificateId}`);
    }

    // Development Plans
    getDevelopmentPlans(employeeId?: number): Observable<DevelopmentPlan[]> {
        let params = new HttpParams();
        if (employeeId) {
            params = params.set('employee_id', employeeId.toString());
        }
        return this.http.get<DevelopmentPlan[]>(`${API_URL}/development-plans`, { params });
    }

    getDevelopmentPlanById(id: number): Observable<DevelopmentPlan> {
        return this.http.get<DevelopmentPlan>(`${API_URL}/development-plans/${id}`);
    }

    createDevelopmentPlan(plan: Partial<DevelopmentPlan>): Observable<DevelopmentPlan> {
        return this.http.post<DevelopmentPlan>(`${API_URL}/development-plans`, plan);
    }

    updateDevelopmentPlan(id: number, plan: Partial<DevelopmentPlan>): Observable<DevelopmentPlan> {
        return this.http.put<DevelopmentPlan>(`${API_URL}/development-plans/${id}`, plan);
    }

    deleteDevelopmentPlan(id: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/development-plans/${id}`);
    }

    // Goals
    addGoal(planId: number, goal: Partial<DevelopmentGoal>): Observable<DevelopmentGoal> {
        return this.http.post<DevelopmentGoal>(`${API_URL}/development-plans/${planId}/goals`, goal);
    }

    updateGoal(planId: number, goalId: number, goal: Partial<DevelopmentGoal>): Observable<DevelopmentGoal> {
        return this.http.put<DevelopmentGoal>(`${API_URL}/development-plans/${planId}/goals/${goalId}`, goal);
    }

    deleteGoal(planId: number, goalId: number): Observable<void> {
        return this.http.delete<void>(`${API_URL}/development-plans/${planId}/goals/${goalId}`);
    }
}
