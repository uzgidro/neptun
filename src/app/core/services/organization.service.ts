import { Injectable } from '@angular/core';
import { ApiService, BASE_URL, FLAT } from '@/core/services/api.service';
import { Organization } from '@/core/interfaces/organizations';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const ORGANIZATIONS = '/organizations'
const CASCADES = '/cascades'

@Injectable({
  providedIn: 'root'
})
export class OrganizationService extends ApiService{

    getOrganizationsFlat(): Observable<Organization[]> {
        return this.http.get<Organization[]>(`${BASE_URL}${ORGANIZATIONS}${FLAT}`);
    }

    getCascades(): Observable<Organization[]> {
        const params = new HttpParams().set('type', 'cascade');
        return this.http.get<Organization[]>(BASE_URL + ORGANIZATIONS, { params: params });
    }

    // For Dashboard cascades with contacts and ascue metrics
    getOrganizationsCascades(): Observable<Organization[]> {
        return this.http.get<Organization[]>(BASE_URL + ORGANIZATIONS + CASCADES);
    }
}
