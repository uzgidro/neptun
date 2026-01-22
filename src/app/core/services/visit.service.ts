import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { delay, Observable, of } from 'rxjs';
import { VisitDto } from '@/core/interfaces/visits';

@Injectable({
    providedIn: 'root'
})
export class VisitService extends ApiService {
    // Mock data for visits
    getVisits(date?: Date): Observable<VisitDto[]> {
        const today = new Date();
        const mockData: VisitDto[] = [
            {
                id: 1,
                organization_id: 5,
                organization_name: 'Молокозавод №1',
                visit_date: new Date(today.getTime() + 86400000),
                description: 'Плановая проверка санитарных условий',
                responsible_name: 'Молоков А.',
                created_by: { id: 1, name: 'Секретарь Каримова К.К.' },
                created_at: new Date()
            },
            {
                id: 2,
                organization_id: 7,
                organization_name: 'Молокозавод №3',
                visit_date: new Date(today.getTime() + 86400000 * 3),
                description: 'Визит делегации из Министерства',
                responsible_name: 'Сывороточник Б.',
                created_by: { id: 2, name: 'Помощник Рахимов Р.Р.' },
                created_at: new Date()
            }
        ];
        return of(mockData).pipe(delay(200));
    }

    addVisit(formData: FormData): Observable<any> {
        return of({ id: Date.now(), success: true }).pipe(delay(300));
    }

    editVisit(id: number, formData: FormData): Observable<any> {
        return of({ id, success: true }).pipe(delay(300));
    }

    deleteVisit(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }
}
