import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Training, TrainingPayload } from '@/core/interfaces/hrm/training';
import { CrudService } from '@/core/interfaces/crud-service.interface';

const TRAININGS = '/hrm/training/trainings';

/**
 * @deprecated Use `TrainingService` from `@/core/services/hrm/training.service` instead.
 * This service is kept for backward compatibility with existing components.
 */
@Injectable({
    providedIn: 'root'
})
export class TrainingService extends ApiService implements CrudService<Training, TrainingPayload> {
    getAll(): Observable<Training[]> {
        return this.http.get<Training[]>(BASE_URL + TRAININGS);
    }

    getById(id: number): Observable<Training> {
        return this.http.get<Training>(BASE_URL + TRAININGS + '/' + id);
    }

    create(payload: TrainingPayload): Observable<Training> {
        return this.http.post<Training>(BASE_URL + TRAININGS, payload);
    }

    update(id: number, payload: TrainingPayload): Observable<Training> {
        return this.http.patch<Training>(BASE_URL + TRAININGS + '/' + id, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(BASE_URL + TRAININGS + '/' + id);
    }

    // Legacy aliases for backwards compatibility
    getTrainings = this.getAll.bind(this);
    getTraining = this.getById.bind(this);
    createTraining = this.create.bind(this);
    updateTraining = this.update.bind(this);
    deleteTraining = this.delete.bind(this);
}
