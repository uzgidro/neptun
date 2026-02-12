import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { SnowCoverResponse } from '@/core/interfaces/snow-cover';
import { HttpParams } from '@angular/common/http';

const SNOW_COVER = '/snow-cover';

@Injectable({
    providedIn: 'root'
})
export class SnowCoverService extends ApiService {
    getSnowCover(date?: Date): Observable<SnowCoverResponse> {
        let params = new HttpParams();
        if (date) {
            params = params.set('date', this.dateToYMD(date));
        }
        return this.http.get<SnowCoverResponse>(BASE_URL + SNOW_COVER, { params });
    }
}
