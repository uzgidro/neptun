import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { OrganizationType, OrganizationTypePayload } from '@/core/interfaces/organization-type';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

const ORGANIZATION_TYPE = '/organization-type';

@Injectable({
    providedIn: 'root'
})
export class OrganizationTypeService extends ApiService {
    private organizationTypes$: Observable<OrganizationType[]> | null = null;

    getAll(): Observable<OrganizationType[]> {
        if (!this.organizationTypes$) {
            this.organizationTypes$ = this.http.get<OrganizationType[]>(`${this.BASE_URL}${ORGANIZATION_TYPE}`).pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
        }
        return this.organizationTypes$;
    }

    create(payload: OrganizationTypePayload): Observable<any> {
        return this.http.post(`${this.BASE_URL}${ORGANIZATION_TYPE}`, payload).pipe(
            tap(() => this.invalidateCache())
        );
    }

    delete(id: string): Observable<any> {
        return this.http.delete(`${this.BASE_URL}${ORGANIZATION_TYPE}/${id}`).pipe(
            tap(() => this.invalidateCache())
        );
    }

    invalidateCache(): void {
        this.organizationTypes$ = null;
    }
}
