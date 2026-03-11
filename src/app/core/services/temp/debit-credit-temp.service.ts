import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { DCInfo } from '@/core/interfaces/debit-credit';

const DC = '/dc';

@Injectable({
    providedIn: 'root'
})
export class DebitCreditTempService extends ApiService {
    getDC(): Observable<DCInfo> {
        return this.http.get<DCInfo>(this.BASE_URL + DC);
    }
}
