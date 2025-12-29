import { Injectable } from '@angular/core';
import { ApiService, BASE_URL, FLAT } from '@/core/services/api.service';
import { Organization, OrganizationPayload } from '@/core/interfaces/organizations';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const ORGANIZATIONS = '/organizations';

@Injectable({
    providedIn: 'root'
})
export class OrganizationService extends ApiService {
    getOrganizationsFlat(): Observable<Organization[]> {
        return this.http.get<Organization[]>(`${BASE_URL}${ORGANIZATIONS}${FLAT}`);
    }

    getCascades(): Observable<Organization[]> {
        const params = new HttpParams().set('type', 'cascade');
        return this.http.get<Organization[]>(BASE_URL + ORGANIZATIONS, { params: params });
    }

    createOrganization(payload: OrganizationPayload): Observable<Organization> {
        return this.http.post<Organization>(`${BASE_URL}${ORGANIZATIONS}`, payload);
    }

    updateOrganization(id: number, payload: OrganizationPayload): Observable<Organization> {
        return this.http.put<Organization>(`${BASE_URL}${ORGANIZATIONS}/${id}`, payload);
    }

    deleteOrganization(id: number): Observable<any> {
        return this.http.delete(`${BASE_URL}${ORGANIZATIONS}/${id}`);
    }
}
