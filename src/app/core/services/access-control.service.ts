import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { AccessCard, AccessZone, AccessLog, AccessRequest } from '@/core/interfaces/hrm/access-control';

const ACCESS_CONTROL = '/access-control';

@Injectable({
    providedIn: 'root'
})
export class AccessControlService extends ApiService {
    // Access Cards
    getCards(): Observable<AccessCard[]> {
        return this.http.get<AccessCard[]>(BASE_URL + ACCESS_CONTROL + '/cards');
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
    getLogs(): Observable<AccessLog[]> {
        return this.http.get<AccessLog[]>(BASE_URL + ACCESS_CONTROL + '/logs');
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
