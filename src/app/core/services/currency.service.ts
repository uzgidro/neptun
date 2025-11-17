import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';

interface CurrencyRate {
    Ccy: string;
    Rate: string;
}

@Injectable({
    providedIn: 'root'
})
export class CurrencyService {
    private apiUrl = 'https://cbu.uz/ru/arkhiv-kursov-valyut/json/';
    private baseCurrency = 'UZS';
    private usdCurrency = 'USD';

    private http = inject(HttpClient);

    private ratesCache$: Observable<CurrencyRate[]> | null = null;

    toUZS(amount: number): Observable<number> {
        return this.convert(amount, this.baseCurrency);
    }

    toUSD(amount: number): Observable<number> {
        return this.convert(amount, this.usdCurrency);
    }

    private convert(amount: number, toCurrency: string): Observable<number> {
        toCurrency = toCurrency.toUpperCase();

        return this.getRates().pipe(
            map((rates) => {
                const rate = this.findRate(rates);

                if (toCurrency == this.baseCurrency) {
                    return amount * rate;
                }

                return amount / rate;
            })
        );
    }

    private findRate(rates: CurrencyRate[]): number {
        const currency = rates.find((r) => r.Ccy === 'USD');
        if (!currency || !currency.Rate) {
            return 0;
        }

        return parseFloat(currency.Rate);
    }

    private getRates(): Observable<CurrencyRate[]> {
        if (!this.ratesCache$) {
            this.ratesCache$ = this.http.get<CurrencyRate[]>(this.apiUrl).pipe(
                shareReplay({ bufferSize: 1, refCount: true }),
                catchError(() => of([])) // В случае ошибки возвращаем пустой массив
            );
        }
        return this.ratesCache$;
    }
}
