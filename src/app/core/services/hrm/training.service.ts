import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from '@/core/services/config.service';
import { Training, TrainingPayload } from '@/core/interfaces/hrm/training';

@Injectable({
    providedIn: 'root'
})
export class TrainingService {
    private http = inject(HttpClient);
    private configService = inject(ConfigService);

    private get API_URL(): string {
        return this.configService.apiBaseUrl + '/hrm/training';
    }

    // Trainings
    getTrainings(params?: { status?: string; type?: string }): Observable<Training[]> {
        let httpParams = new HttpParams();
        if (params?.status) {
            httpParams = httpParams.set('status', params.status);
        }
        if (params?.type) {
            httpParams = httpParams.set('type', params.type);
        }
        return this.http.get<Training[]>(`${this.API_URL}/trainings`, { params: httpParams });
    }

    getTrainingById(id: number): Observable<Training> {
        return this.http.get<Training>(`${this.API_URL}/trainings/${id}`);
    }

    createTraining(payload: TrainingPayload): Observable<Training> {
        return this.http.post<Training>(`${this.API_URL}/trainings`, payload);
    }

    updateTraining(id: number, payload: Partial<TrainingPayload>): Observable<Training> {
        return this.http.put<Training>(`${this.API_URL}/trainings/${id}`, payload);
    }

    deleteTraining(id: number): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/trainings/${id}`);
    }
}
