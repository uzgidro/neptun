import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { GesShutdownDto, GesShutdownPayload, GesShutdownResponse, ShutdownDto, ShutdownResponse } from '@/core/interfaces/ges-shutdown';
import { map } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

const SHUTDOWNS = '/shutdowns';

@Injectable({
    providedIn: 'root'
})
export class GesShutdownService extends ApiService {
    getShutdowns(date?: Date): Observable<GesShutdownDto> {
        const params = new HttpParams();
        if (date) {
            params.set('date', date.toISOString());
        }
        return this.http.get<GesShutdownResponse>(BASE_URL + SHUTDOWNS, {params: params}).pipe(
            map(response => ({
                ges: response.ges.map(this.transformToDto),
                mini: response.mini.map(this.transformToDto),
                micro: response.micro.map(this.transformToDto)
            }))
        );
    }

    addShutdown(payload: GesShutdownPayload): Observable<any> {
        return this.http.post(BASE_URL + SHUTDOWNS, payload);
    }

    private transformToDto(shutdown: ShutdownResponse): ShutdownDto {
        return {
            ...shutdown,
            started_at: new Date(shutdown.started_at),
            created_at: new Date(shutdown.created_at),
            ended_at: shutdown.ended_at ? new Date(shutdown.ended_at) : null
        };
    }
}
