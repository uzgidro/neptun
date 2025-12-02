import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Reception } from '@/core/interfaces/reception';
import { HttpParams } from '@angular/common/http';

const RECEPTIONS = '/receptions';

@Injectable({
    providedIn: 'root'
})
export class ReceptionService extends ApiService {
    getReceptions(status?: string): Observable<Reception[]> {
        let params = new HttpParams();
        if (status) {
            params = params.set('status', status);
        }
        return this.http.get<Reception[]>(BASE_URL + RECEPTIONS, { params: params });
    }

    getReception(id: number): Observable<Reception> {
        return this.http.get<Reception>(BASE_URL + RECEPTIONS + '/' + id);
    }

    createReception(reception: Partial<Reception>): Observable<Reception> {
        return this.http.post<Reception>(BASE_URL + RECEPTIONS, reception);
    }

    updateReception(id: number, reception: Partial<Reception>): Observable<Reception> {
        return this.http.put<Reception>(BASE_URL + RECEPTIONS + '/' + id, reception);
    }

    deleteReception(id: number): Observable<any> {
        return this.http.delete(BASE_URL + RECEPTIONS + '/' + id);
    }
}
