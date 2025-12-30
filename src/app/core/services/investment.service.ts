import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { InvestmentDto, InvestmentResponse, InvestmentStatus } from '@/core/interfaces/investment';

const INVESTMENTS = '/investments';
const STATUSES = '/statuses';

@Injectable({
    providedIn: 'root'
})
export class InvestmentService extends ApiService {
    getInvestments(): Observable<InvestmentDto[]> {
        return this.http.get<InvestmentResponse[]>(BASE_URL + INVESTMENTS);
    }

    createInvestment(formData: FormData): Observable<any> {
        return this.http.post(BASE_URL + INVESTMENTS, formData);
    }

    updateInvestment(id: number, formData: FormData): Observable<any> {
        return this.http.patch(`${BASE_URL}${INVESTMENTS}/${id}`, formData);
    }

    deleteInvestment(id: number): Observable<any> {
        return this.http.delete(`${BASE_URL}${INVESTMENTS}/${id}`);
    }

    getStatuses(): Observable<InvestmentStatus[]> {
        return this.http.get<InvestmentStatus[]>(BASE_URL + INVESTMENTS + STATUSES);
    }
}
