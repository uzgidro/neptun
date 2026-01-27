import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Training, TrainingPayload } from '@/core/interfaces/hrm/training';

const TRAININGS = '/trainings';

@Injectable({
    providedIn: 'root'
})
export class TrainingService extends ApiService {
    getTrainings(): Observable<Training[]> {
        return this.http.get<Training[]>(BASE_URL + TRAININGS);
    }

    getTraining(id: number): Observable<Training> {
        return this.http.get<Training>(BASE_URL + TRAININGS + '/' + id);
    }

    createTraining(payload: TrainingPayload): Observable<Training> {
        return this.http.post<Training>(BASE_URL + TRAININGS, payload);
    }

    updateTraining(id: number, payload: TrainingPayload): Observable<Training> {
        return this.http.patch<Training>(BASE_URL + TRAININGS + '/' + id, payload);
    }

    deleteTraining(id: number): Observable<any> {
        return this.http.delete(BASE_URL + TRAININGS + '/' + id);
    }
}
