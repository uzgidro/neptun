import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { GesShutdownDto, ShutdownDto } from '@/core/interfaces/ges-shutdown';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class GesShutdownService extends ApiService {
    // Mock data for plant line stoppages (остановки производственных линий)
    getShutdowns(date?: Date): Observable<GesShutdownDto> {
        const today = new Date();
        const mockData: GesShutdownDto = {
            // Основные молокозаводы
            ges: [
                {
                    id: 1,
                    organization_id: 5,
                    organization_name: 'Молокозавод №1',
                    started_at: new Date(today.getTime() - 3600000 * 5),
                    ended_at: new Date(today.getTime() - 3600000 * 2),
                    reason: 'Плановое техобслуживание линии пастеризации',
                    created_by: { id: 1, name: 'Оператор Иванов И.И.' },
                    generation_loss: 1500, // литров
                    created_at: new Date(today.getTime() - 3600000 * 5),
                    idle_discharge_volume: null
                },
                {
                    id: 2,
                    organization_id: 7,
                    organization_name: 'Молокозавод №3',
                    started_at: new Date(today.getTime() - 3600000 * 8),
                    ended_at: null,
                    reason: 'Замена фильтра на линии розлива',
                    created_by: { id: 2, name: 'Оператор Петров П.П.' },
                    generation_loss: 800,
                    created_at: new Date(today.getTime() - 3600000 * 8),
                    idle_discharge_volume: null
                }
            ],
            // Мини-цеха
            mini: [
                {
                    id: 3,
                    organization_id: 10,
                    organization_name: 'Мини-цех "Фергана"',
                    started_at: new Date(today.getTime() - 3600000 * 2),
                    ended_at: new Date(today.getTime() - 3600000),
                    reason: 'Профилактика оборудования',
                    created_by: { id: 3, name: 'Техник Сидоров С.С.' },
                    generation_loss: 200,
                    created_at: new Date(today.getTime() - 3600000 * 2),
                    idle_discharge_volume: null
                }
            ],
            // Филиалы
            micro: [
                {
                    id: 4,
                    organization_id: 12,
                    organization_name: 'Филиал "Бухара"',
                    started_at: new Date(today.getTime() - 3600000 * 4),
                    ended_at: new Date(today.getTime() - 3600000 * 3),
                    reason: 'Калибровка весового оборудования',
                    created_by: { id: 4, name: 'Инженер Каримов К.К.' },
                    generation_loss: 100,
                    created_at: new Date(today.getTime() - 3600000 * 4),
                    idle_discharge_volume: null
                }
            ]
        };
        return of(mockData).pipe(delay(200));
    }

    addShutdown(formData: FormData): Observable<any> {
        return of({ id: Date.now(), success: true }).pipe(delay(300));
    }

    editShutdown(id: number, formData: FormData): Observable<any> {
        return of({ id, success: true }).pipe(delay(300));
    }

    deleteShutdown(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    markAsViewed(id: number): Observable<void> {
        return of(undefined as void).pipe(delay(100));
    }

    private transformToDto(shutdown: any): ShutdownDto {
        return {
            ...shutdown,
            started_at: new Date(shutdown.started_at),
            created_at: new Date(shutdown.created_at),
            ended_at: shutdown.ended_at ? new Date(shutdown.ended_at) : null
        };
    }
}
