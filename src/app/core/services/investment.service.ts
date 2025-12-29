import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InvestmentDto, InvestmentResponse } from '@/core/interfaces/investment';

const INVESTMENTS = '/investments';

@Injectable({
    providedIn: 'root'
})
export class InvestmentService extends ApiService {
    getInvestments(): Observable<InvestmentDto[]> {
        return this.http.get<InvestmentResponse[]>(BASE_URL + INVESTMENTS).pipe(
            map((responseArray) => {
                if (!responseArray) {
                    return [];
                }

                return responseArray.map((raw) => ({
                    ...raw,
                    date: new Date(raw.date)
                }));
            })
        );
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
}
