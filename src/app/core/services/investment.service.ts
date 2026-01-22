import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of, tap } from 'rxjs';
import { delay } from 'rxjs/operators';
import { InvestmentDto, InvestmentStatus, InvestmentType } from '@/core/interfaces/investment';

// Мок-данные статусов и типов
const MOCK_STATUSES: InvestmentStatus[] = [
    { id: 1, name: 'Планируется', description: 'Проект на стадии планирования', display_order: 1 },
    { id: 2, name: 'В процессе', description: 'Проект в активной фазе реализации', display_order: 2 },
    { id: 3, name: 'Завершён', description: 'Проект успешно завершён', display_order: 3 },
    { id: 4, name: 'Приостановлен', description: 'Проект временно приостановлен', display_order: 4 }
];

const MOCK_TYPES: InvestmentType[] = [
    { id: 1, name: 'Модернизация', description: 'Модернизация существующего оборудования' },
    { id: 2, name: 'Строительство', description: 'Строительство новых объектов' },
    { id: 3, name: 'Закупка оборудования', description: 'Закупка нового оборудования' }
];

// Мок-данные инвестиций
const MOCK_INVESTMENTS: InvestmentDto[] = [
    { id: 1, name: 'Модернизация линии №1', status: MOCK_STATUSES[0], type: MOCK_TYPES[0], cost: 500000000, comments: 'Плановая модернизация' },
    { id: 2, name: 'Строительство нового цеха', status: MOCK_STATUSES[1], type: MOCK_TYPES[1], cost: 2000000000, comments: 'Расширение производства' },
    { id: 3, name: 'Закупка оборудования', status: MOCK_STATUSES[0], type: MOCK_TYPES[2], cost: 150000000, comments: 'Замена устаревшего оборудования' }
];

@Injectable({
    providedIn: 'root'
})
export class InvestmentService extends ApiService {
    private statusesCache = new Map<number | string, InvestmentStatus[]>();

    getInvestments(typeId?: number): Observable<InvestmentDto[]> {
        let result = [...MOCK_INVESTMENTS];
        if (typeId) {
            result = result.filter(i => i.type.id === typeId);
        }
        return of(result).pipe(delay(200));
    }

    createInvestment(formData: FormData): Observable<any> {
        return of({ id: Date.now(), success: true }).pipe(delay(300));
    }

    updateInvestment(id: number, formData: FormData): Observable<any> {
        return of({ success: true }).pipe(delay(300));
    }

    deleteInvestment(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    getStatuses(typeId?: number): Observable<InvestmentStatus[]> {
        const cacheKey = typeId ? typeId : 'all';
        if (this.statusesCache.has(cacheKey)) {
            return of(this.statusesCache.get(cacheKey)!);
        }
        return of(MOCK_STATUSES).pipe(
            delay(200),
            tap((statuses) => {
                this.statusesCache.set(cacheKey, statuses);
            })
        );
    }

    private typesCache: InvestmentType[] | null = null;

    getTypes(): Observable<InvestmentType[]> {
        if (this.typesCache) {
            return of(this.typesCache);
        }
        return of(MOCK_TYPES).pipe(
            delay(200),
            tap((types) => {
                this.typesCache = types;
            })
        );
    }
}
