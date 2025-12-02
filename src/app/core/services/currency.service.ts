import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_V3, ApiService, BASE_URL } from '@/core/services/api.service';

const CURRENCY = '/currency';

@Injectable({
    providedIn: 'root'
})
export class CurrencyService extends ApiService {
    getCurrency(): Observable<{ rate: number }> {
        return this.http.get<{ rate: number }>(BASE_URL + API_V3 + CURRENCY);
    }
}
