import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiService } from '@/core/services/api.service';

@Injectable({
    providedIn: 'root'
})
export class CurrencyService extends ApiService {
    getCurrency(): Observable<{ rate: number }> {
        // Мок курса валют (USD/UZS)
        return of({ rate: 12450.50 }).pipe(delay(200));
    }
}
