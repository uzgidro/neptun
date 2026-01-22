import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { ReservoirSummaryRequest, ReservoirSummaryResponse } from '@/core/interfaces/reservoir-summary';
import { HttpResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ReservoirSummaryService extends ApiService {
    // Mock data for storage tanks summary (бывшие водохранилища -> резервуары хранения)
    getReservoirSummary(date: Date): Observable<ReservoirSummaryResponse[]> {
        const mockData: ReservoirSummaryResponse[] = [
            {
                organization_id: 1,
                organization_name: 'Резервуар хранения №1 (Молоко цельное)',
                income: { current: 850, prev: 820, year_ago: 780, two_years_ago: 750 },
                volume: { current: 2500, prev: 2450, year_ago: 2300, two_years_ago: 2200 },
                level: { current: 85, prev: 83, year_ago: 80, two_years_ago: 78 },
                release: { current: 720, prev: 700, year_ago: 680, two_years_ago: 650 },
                modsnow: { current: 0, prev: 0, year_ago: 0, two_years_ago: 0 },
                incoming_volume: 25600,
                incoming_volume_prev_year: 24200,
                incoming_volume_is_calculated: false,
                incoming_volume_prev_year_is_calculated: false
            },
            {
                organization_id: 2,
                organization_name: 'Резервуар хранения №2 (Сливки)',
                income: { current: 320, prev: 310, year_ago: 290, two_years_ago: 280 },
                volume: { current: 800, prev: 780, year_ago: 750, two_years_ago: 720 },
                level: { current: 78, prev: 76, year_ago: 74, two_years_ago: 72 },
                release: { current: 290, prev: 280, year_ago: 260, two_years_ago: 250 },
                modsnow: { current: 0, prev: 0, year_ago: 0, two_years_ago: 0 },
                incoming_volume: 9600,
                incoming_volume_prev_year: 8900,
                incoming_volume_is_calculated: false,
                incoming_volume_prev_year_is_calculated: false
            },
            {
                organization_id: 3,
                organization_name: 'Резервуар хранения №3 (Обезжиренное молоко)',
                income: { current: 450, prev: 440, year_ago: 420, two_years_ago: 400 },
                volume: { current: 1200, prev: 1180, year_ago: 1100, two_years_ago: 1050 },
                level: { current: 92, prev: 90, year_ago: 88, two_years_ago: 85 },
                release: { current: 420, prev: 410, year_ago: 390, two_years_ago: 370 },
                modsnow: { current: 0, prev: 0, year_ago: 0, two_years_ago: 0 },
                incoming_volume: 13500,
                incoming_volume_prev_year: 12600,
                incoming_volume_is_calculated: false,
                incoming_volume_prev_year_is_calculated: false
            },
            {
                organization_id: 4,
                organization_name: 'Резервуар хранения №4 (Кисломолочная продукция)',
                income: { current: 280, prev: 270, year_ago: 250, two_years_ago: 240 },
                volume: { current: 650, prev: 630, year_ago: 600, two_years_ago: 580 },
                level: { current: 88, prev: 86, year_ago: 84, two_years_ago: 82 },
                release: { current: 250, prev: 240, year_ago: 220, two_years_ago: 210 },
                modsnow: { current: 0, prev: 0, year_ago: 0, two_years_ago: 0 },
                incoming_volume: 8400,
                incoming_volume_prev_year: 7800,
                incoming_volume_is_calculated: false,
                incoming_volume_prev_year_is_calculated: false
            }
        ];
        return of(mockData).pipe(delay(200));
    }

    upsetReservoirData(data: ReservoirSummaryRequest[]): Observable<any> {
        return of({ success: true, updated: data.length }).pipe(delay(300));
    }

    downloadSummary(date: Date, format: string): Observable<HttpResponse<Blob>> {
        // Mock PDF/Excel download - return empty blob
        const blob = new Blob(['Mock export data'], { type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const response = new HttpResponse({
            body: blob,
            headers: undefined,
            status: 200
        });
        return of(response).pipe(delay(300));
    }
}
