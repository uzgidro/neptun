import { Injectable } from '@angular/core';
import { ApiService, FLAT } from '@/core/services/api.service';
import { Organization, OrganizationPayload } from '@/core/interfaces/organizations';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

const ORGANIZATIONS = '/organizations';

@Injectable({
    providedIn: 'root'
})
export class OrganizationService extends ApiService {
    private organizationsFlat$: Observable<Organization[]> | null = null;
    private organizationsTree$: Observable<Organization[]> | null = null;
    private cascades$: Observable<Organization[]> | null = null;

    getOrganizationsFlat(): Observable<Organization[]> {
        if (!this.organizationsFlat$) {
            this.organizationsFlat$ = this.http.get<Organization[]>(`${this.BASE_URL}${ORGANIZATIONS}${FLAT}`).pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
        }
        return this.organizationsFlat$;
    }

    getOrganizationsTree(): Observable<Organization[]> {
        if (!this.organizationsTree$) {
            this.organizationsTree$ = this.http.get<Organization[]>(`${this.BASE_URL}${ORGANIZATIONS}`).pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
        }
        return this.organizationsTree$;
    }

    invalidateOrganizationsCache(): void {
        this.organizationsFlat$ = null;
        this.organizationsTree$ = null;
        this.cascades$ = null;
    }

    createOrganization(payload: OrganizationPayload): Observable<Organization> {
        return this.http.post<Organization>(`${this.BASE_URL}${ORGANIZATIONS}`, payload).pipe(
            tap(() => this.invalidateOrganizationsCache())
        );
    }

    updateOrganization(id: number, payload: OrganizationPayload): Observable<Organization> {
        return this.http.patch<Organization>(`${this.BASE_URL}${ORGANIZATIONS}/${id}`, payload).pipe(
            tap(() => this.invalidateOrganizationsCache())
        );
    }

    deleteOrganization(id: number): Observable<any> {
        return this.http.delete(`${this.BASE_URL}${ORGANIZATIONS}/${id}`).pipe(
            tap(() => this.invalidateOrganizationsCache())
        );
    }

    getCascades(): Observable<Organization[]> {
        if (!this.cascades$) {
            const params = new HttpParams().set('type', 'cascade');
            this.cascades$ = this.http.get<Organization[]>(`${this.BASE_URL}${ORGANIZATIONS}`, { params }).pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
        }
        return this.cascades$;
    }

    getOrganizationsWithType(type: string): Observable<Organization[]> {
        return this.getOrganizationsFlat().pipe(
            map(orgs => orgs.filter(org => org.types?.includes(type)))
        );
    }
}
