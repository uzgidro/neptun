import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Cascade, IdleDischargeResponse } from '@/core/interfaces/discharge';
import { Observable, of, delay } from 'rxjs';
import { HttpParams, HttpResponse } from '@angular/common/http';

const DISCHARGES = '/discharges';
const FLAT = '/flat';

@Injectable({
    providedIn: 'root'
})
export class DischargeService extends ApiService {
    // Mock data for product write-offs (бывший холостой сброс -> списание продукции)
    addDischarge(formData: FormData): Observable<any> {
        return of({ id: Date.now(), success: true }).pipe(delay(300));
    }

    getDischarges(): Observable<Cascade[]> {
        const mockData: Cascade[] = [
            {
                id: 1,
                name: 'Производственный кластер "Центр"',
                total_volume: 250,
                hpps: [
                    {
                        id: 5,
                        name: 'Молокозавод №1',
                        total_volume: 150,
                        discharges: [
                            {
                                id: 1,
                                organization: { id: 5, name: 'Молокозавод №1', contacts: [] },
                                created_by: { id: 1, name: 'Оператор Иванов И.И.' },
                                started_at: new Date().toISOString(),
                                ended_at: null,
                                flow_rate: 25,
                                total_volume: 150,
                                reason: 'Истечение срока годности партии №1234',
                                is_ongoing: true,
                                approved: null
                            }
                        ]
                    },
                    {
                        id: 6,
                        name: 'Молокозавод №2',
                        total_volume: 100,
                        discharges: [
                            {
                                id: 2,
                                organization: { id: 6, name: 'Молокозавод №2', contacts: [] },
                                created_by: { id: 2, name: 'Оператор Петров П.П.' },
                                started_at: new Date(Date.now() - 3600000).toISOString(),
                                ended_at: new Date().toISOString(),
                                flow_rate: 15,
                                total_volume: 100,
                                reason: 'Брак при производстве',
                                is_ongoing: false,
                                approved: true
                            }
                        ]
                    }
                ]
            },
            {
                id: 2,
                name: 'Производственный кластер "Восток"',
                total_volume: 80,
                hpps: [
                    {
                        id: 7,
                        name: 'Молокозавод №3',
                        total_volume: 80,
                        discharges: [
                            {
                                id: 3,
                                organization: { id: 7, name: 'Молокозавод №3', contacts: [] },
                                created_by: { id: 3, name: 'Оператор Сидоров С.С.' },
                                started_at: new Date(Date.now() - 7200000).toISOString(),
                                ended_at: null,
                                flow_rate: 10,
                                total_volume: 80,
                                reason: 'Несоответствие качества партии',
                                is_ongoing: true,
                                approved: null
                            }
                        ]
                    }
                ]
            }
        ];
        return of(mockData).pipe(delay(200));
    }

    getFlatDischarges(date?: Date): Observable<IdleDischargeResponse[]> {
        const today = new Date();
        const mockData: IdleDischargeResponse[] = [
            {
                id: 1,
                organization: { id: 5, name: 'Молокозавод №1', parent_organization_id: 2, types: ['plant'] },
                created_by: { id: 1, name: 'Оператор Иванов И.И.' },
                approved_by: null,
                started_at: today.toISOString(),
                ended_at: null,
                flow_rate: 25,
                total_volume: 150,
                reason: 'Истечение срока годности партии №1234',
                is_ongoing: true,
                approved: null
            },
            {
                id: 2,
                organization: { id: 6, name: 'Молокозавод №2', parent_organization_id: 2, types: ['plant'] },
                created_by: { id: 2, name: 'Оператор Петров П.П.' },
                approved_by: { id: 10, name: 'Менеджер Алиев А.А.' },
                started_at: new Date(today.getTime() - 3600000).toISOString(),
                ended_at: today.toISOString(),
                flow_rate: 15,
                total_volume: 100,
                reason: 'Брак при производстве',
                is_ongoing: false,
                approved: true
            }
        ];
        return of(mockData).pipe(delay(200));
    }

    editDischarge(id: number, formData: FormData): Observable<any> {
        return of({ id, success: true }).pipe(delay(300));
    }

    approveDischarge(id: number): Observable<any> {
        return of({ id, approved: true, success: true }).pipe(delay(200));
    }

    deleteDischarge(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    downloadDischarges(date: Date, format: 'excel' | 'pdf'): Observable<HttpResponse<Blob>> {
        return this.http.get(BASE_URL + DISCHARGES + '/export', {
            params: {
                date: this.dateToYMD(date),
                format: format
            },
            responseType: 'blob',
            observe: 'response'
        });
    }
}
