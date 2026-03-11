import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of, tap } from 'rxjs';
import { InvestmentDto, InvestmentResponse, InvestmentStatus, InvestmentType } from '@/core/interfaces/investment';

const INVESTMENTS = '/investments';
const STATUSES = '/statuses';
const TYPES = '/types';

@Injectable({
    providedIn: 'root'
})
export class InvestmentService extends ApiService {
    private statusesCache = new Map<number | string, InvestmentStatus[]>();

    getInvestments(typeId?: number): Observable<InvestmentDto[]> {
        let params: any = {};
        if (typeId) {
            params.type_id = typeId;
        }
        return this.http.get<InvestmentResponse[]>(this.BASE_URL + INVESTMENTS, { params });
    }

    createInvestment(formData: FormData): Observable<any> {
        return this.http.post(this.BASE_URL + INVESTMENTS, formData);
    }

    updateInvestment(id: number, formData: FormData): Observable<any> {
        return this.http.patch(`${this.BASE_URL}${INVESTMENTS}/${id}`, formData);
    }

    deleteInvestment(id: number): Observable<any> {
        return this.http.delete(`${this.BASE_URL}${INVESTMENTS}/${id}`);
    }

    getStatuses(typeId?: number): Observable<InvestmentStatus[]> {
        const cacheKey = typeId ? typeId : 'all';
        if (this.statusesCache.has(cacheKey)) {
            return of(this.statusesCache.get(cacheKey)!);
        }

        let params: any = {};
        if (typeId) {
            params.type_id = typeId;
        }

        return this.http.get<InvestmentStatus[]>(this.BASE_URL + INVESTMENTS + STATUSES, { params }).pipe(
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
        return this.http.get<InvestmentType[]>(this.BASE_URL + INVESTMENTS + TYPES).pipe(
            tap((types) => {
                this.typesCache = types;
            })
        );
    }
}
