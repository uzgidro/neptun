import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DCInfo } from '@/core/interfaces/debit-credit';

// Мок-данные дебет/кредит
const MOCK_DC: DCInfo = {
    debit: { yearStartValue: 10000000000, currentValue: 15000000000, diff: 5000000 },
    credit: { yearStartValue: 8000000000, currentValue: 12500000000, diff: 4500000 },
    items: [
        {
            name: 'Основное производство',
            debit: { yearStartValue: 5000000000, currentValue: 7500000000, diff: 2500000000 },
            credit: { yearStartValue: 4000000000, currentValue: 6000000000, diff: 2000000000 }
        },
        {
            name: 'Вспомогательное производство',
            debit: { yearStartValue: 3000000000, currentValue: 4500000000, diff: 1500000000 },
            credit: { yearStartValue: 2500000000, currentValue: 4000000000, diff: 1500000000 }
        }
    ],
    startDate: new Date('2024-01-01'),
    currentDate: new Date()
};

@Injectable({
    providedIn: 'root'
})
export class DebitCreditTempService extends ApiService {
    getDC(): Observable<DCInfo> {
        return of(MOCK_DC).pipe(delay(200));
    }
}
