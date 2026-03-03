import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { AccessCard, AccessZone, AccessLog, AccessRequest } from '@/core/interfaces/hrm/access-control';
import { HttpParams } from '@angular/common/http';

const ACCESS_CONTROL = '/hrm/access-control';

@Injectable({
    providedIn: 'root'
})
export class AccessControlService extends ApiService {
    // Access Cards
    getCards(params?: { employee_id?: number; status?: string; search?: string }): Observable<AccessCard[]> {
        let httpParams = new HttpParams();
        if (params?.employee_id) httpParams = httpParams.set('employee_id', params.employee_id.toString());
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.search) httpParams = httpParams.set('search', params.search);
        return this.http.get<AccessCard[]>(BASE_URL + ACCESS_CONTROL + '/cards', { params: httpParams });
    }

    getCard(id: number): Observable<AccessCard> {
        return this.http.get<AccessCard>(BASE_URL + ACCESS_CONTROL + '/cards/' + id);
    }

    createCard(data: Partial<AccessCard>): Observable<AccessCard> {
        return this.http.post<AccessCard>(BASE_URL + ACCESS_CONTROL + '/cards', data);
    }

    updateCard(id: number, data: Partial<AccessCard>): Observable<AccessCard> {
        return this.http.patch<AccessCard>(BASE_URL + ACCESS_CONTROL + '/cards/' + id, data);
    }

    blockCard(id: number, reason: string): Observable<AccessCard> {
        return this.http.post<AccessCard>(BASE_URL + ACCESS_CONTROL + '/cards/' + id + '/block', { reason });
    }

    unblockCard(id: number): Observable<AccessCard> {
        return this.http.post<AccessCard>(BASE_URL + ACCESS_CONTROL + '/cards/' + id + '/unblock', {});
    }

    // Access Zones
    getZones(): Observable<AccessZone[]> {
        return this.http.get<AccessZone[]>(BASE_URL + ACCESS_CONTROL + '/zones');
    }

    createZone(data: Partial<AccessZone>): Observable<AccessZone> {
        return this.http.post<AccessZone>(BASE_URL + ACCESS_CONTROL + '/zones', data);
    }

    updateZone(id: number, data: Partial<AccessZone>): Observable<AccessZone> {
        return this.http.patch<AccessZone>(BASE_URL + ACCESS_CONTROL + '/zones/' + id, data);
    }

    // Access Logs
    getLogs(params?: { employee_id?: number; zone_id?: number; direction?: string; status?: string; date_from?: string; date_to?: string }): Observable<AccessLog[]> {
        let httpParams = new HttpParams();
        if (params?.employee_id) httpParams = httpParams.set('employee_id', params.employee_id.toString());
        if (params?.zone_id) httpParams = httpParams.set('zone_id', params.zone_id.toString());
        if (params?.direction) httpParams = httpParams.set('direction', params.direction);
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.date_from) httpParams = httpParams.set('date_from', params.date_from);
        if (params?.date_to) httpParams = httpParams.set('date_to', params.date_to);
        return this.http.get<AccessLog[]>(BASE_URL + ACCESS_CONTROL + '/logs', { params: httpParams });
    }

    // Access Requests
    getRequests(): Observable<AccessRequest[]> {
        return this.http.get<AccessRequest[]>(BASE_URL + ACCESS_CONTROL + '/requests');
    }

    createRequest(data: Partial<AccessRequest>): Observable<AccessRequest> {
        return this.http.post<AccessRequest>(BASE_URL + ACCESS_CONTROL + '/requests', data);
    }

    approveRequest(id: number): Observable<AccessRequest> {
        return this.http.post<AccessRequest>(BASE_URL + ACCESS_CONTROL + '/requests/' + id + '/approve', {});
    }

    rejectRequest(id: number, reason: string): Observable<AccessRequest> {
        return this.http.post<AccessRequest>(BASE_URL + ACCESS_CONTROL + '/requests/' + id + '/reject', { reason });
    }
}
