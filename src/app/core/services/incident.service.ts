import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { IncidentDto } from '@/core/interfaces/incidents';

@Injectable({
    providedIn: 'root'
})
export class IncidentService extends ApiService {
    // Mock data for incidents
    getIncidents(date?: Date): Observable<IncidentDto[]> {
        const today = new Date();
        const mockData: IncidentDto[] = [
            {
                id: 1,
                organization_id: 5,
                organization: 'Молокозавод №1',
                incident_date: new Date(today.getTime() - 86400000 * 2),
                description: 'Обнаружено отклонение температурного режима в холодильной камере',
                created_by: { id: 1, name: 'Оператор Иванов И.И.' },
                created_at: new Date(today.getTime() - 86400000 * 2)
            },
            {
                id: 2,
                organization_id: 7,
                organization: 'Молокозавод №3',
                incident_date: new Date(today.getTime() - 86400000),
                description: 'Сбой в работе системы пастеризации',
                created_by: { id: 2, name: 'Техник Петров П.П.' },
                created_at: new Date(today.getTime() - 86400000)
            }
        ];
        return of(mockData).pipe(delay(200));
    }

    addIncident(formData: FormData): Observable<any> {
        return of({ id: Date.now(), success: true }).pipe(delay(300));
    }

    editIncident(id: number, formData: FormData): Observable<any> {
        return of({ id, success: true }).pipe(delay(300));
    }

    deleteIncident(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }
}
