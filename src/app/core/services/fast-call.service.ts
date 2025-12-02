import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { FastCall } from '@/core/interfaces/fast-call';

const FAST_CALLS = '/fast-calls';

@Injectable({
    providedIn: 'root'
})
export class FastCallService extends ApiService {
    getFastCalls(): Observable<FastCall[]> {
        return this.http.get<FastCall[]>(BASE_URL + FAST_CALLS);
    }
}
