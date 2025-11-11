import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { GesShutdownPayload } from '@/core/interfaces/ges-shutdown';

const SHUTDOWNS = '/shutdowns';

@Injectable({
    providedIn: 'root'
})
export class GesShutdownService extends ApiService {
    addShutdown(payload: GesShutdownPayload): Observable<any> {
        return this.http.post(BASE_URL + SHUTDOWNS, payload);
    }

    getShutdowns(): Observable<any[]> {
        return this.http.get<any[]>(BASE_URL + SHUTDOWNS);
    }
}
