import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
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
        let params = new HttpParams();
        if (date) {
            params = params.set('date', this.dateToYMD(date));
        }
        return this.http.get<GesShutdownResponse>(this.BASE_URL + SHUTDOWNS, {params: params}).pipe(
            map(response => ({
                ges: response.ges.map(this.transformToDto),
                mini: response.mini.map(this.transformToDto),
                micro: response.micro.map(this.transformToDto)
            }))
        );
    }

    addShutdown(formData: FormData, force = false): Observable<any> {
        if (force) formData.append('force', 'true');
        return this.http.post(this.BASE_URL + SHUTDOWNS, formData);
    }

    editShutdown(id: number, formData: FormData): Observable<any> {
        return this.http.patch(`${this.BASE_URL}${SHUTDOWNS}/${id}`, formData);
    }

    deleteShutdown(id: number): Observable<any> {
        return this.http.delete(`${this.BASE_URL}${SHUTDOWNS}/${id}`);
    }

    markAsViewed(id: number): Observable<void> {
        return this.http.patch<void>(`${this.BASE_URL}${SHUTDOWNS}/${id}/viewed`, {});
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
