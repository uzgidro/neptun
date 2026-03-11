import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { API_V3, ApiService } from '@/core/services/api.service';

const CURRENCY = '/currency';

@Injectable({
    providedIn: 'root'
})
export class CurrencyService extends ApiService {
    private currency$: Observable<{ rate: number }> | null = null;

    getCurrency(): Observable<{ rate: number }> {
        if (!this.currency$) {
            this.currency$ = this.http.get<{ rate: number }>(this.BASE_URL + API_V3 + CURRENCY).pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
        }
        return this.currency$;
    }
}
