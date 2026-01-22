import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Organization, OrganizationPayload } from '@/core/interfaces/organizations';
import { Observable, of, delay } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrganizationService extends ApiService {
    private mockOrganizations: Organization[] = [
        { id: 1, name: 'АО "МолокоПром"', parent_organization_id: null, contacts: [], types: ['holding'] },
        { id: 2, name: 'Производственный кластер "Центр"', parent_organization_id: 1, contacts: [], types: ['cluster'] },
        { id: 3, name: 'Производственный кластер "Восток"', parent_organization_id: 1, contacts: [], types: ['cluster'] },
        { id: 4, name: 'Производственный кластер "Запад"', parent_organization_id: 1, contacts: [], types: ['cluster'] },
        { id: 5, name: 'Молокозавод №1', parent_organization_id: 2, contacts: [{ id: 1, name: 'Иванов Иван Иванович', phone: '+998901234567' }], types: ['plant'] },
        { id: 6, name: 'Молокозавод №2', parent_organization_id: 2, contacts: [{ id: 2, name: 'Петров Пётр Петрович', phone: '+998901234568' }], types: ['plant'] },
        { id: 7, name: 'Молокозавод №3', parent_organization_id: 3, contacts: [{ id: 3, name: 'Сидоров Сергей Сергеевич', phone: '+998901234569' }], types: ['plant'] },
        { id: 8, name: 'Молокозавод №4', parent_organization_id: 3, contacts: [{ id: 4, name: 'Алиев Алишер Алиевич', phone: '+998901234570' }], types: ['plant'] },
        { id: 9, name: 'Молокозавод №5', parent_organization_id: 4, contacts: [{ id: 5, name: 'Каримов Камол Каримович', phone: '+998901234571' }], types: ['plant'] },
        { id: 10, name: 'Мини-цех "Фергана"', parent_organization_id: 2, contacts: [], types: ['mini'] },
        { id: 11, name: 'Мини-цех "Самарканд"', parent_organization_id: 3, contacts: [], types: ['mini'] },
        { id: 12, name: 'Филиал "Бухара"', parent_organization_id: 4, contacts: [], types: ['branch'] },
        { id: 13, name: 'Филиал "Навои"', parent_organization_id: 4, contacts: [], types: ['branch'] },
        { id: 14, name: 'Филиал "Хорезм"', parent_organization_id: 4, contacts: [], types: ['branch'] }
    ];

    getOrganizationsFlat(): Observable<Organization[]> {
        return of(this.mockOrganizations).pipe(delay(200));
    }

    getCascades(): Observable<Organization[]> {
        const clusters = this.mockOrganizations.filter(o => o.types?.includes('cluster'));
        return of(clusters).pipe(delay(200));
    }

    createOrganization(payload: OrganizationPayload): Observable<Organization> {
        const newOrg: Organization = {
            id: Date.now(),
            name: payload.name,
            parent_organization_id: payload.parent_organization_id,
            contacts: []
        };
        this.mockOrganizations.push(newOrg);
        return of(newOrg).pipe(delay(200));
    }

    updateOrganization(id: number, payload: OrganizationPayload): Observable<Organization> {
        const org = this.mockOrganizations.find(o => o.id === id);
        if (org) {
            org.name = payload.name;
            org.parent_organization_id = payload.parent_organization_id;
        }
        return of(org!).pipe(delay(200));
    }

    deleteOrganization(id: number): Observable<any> {
        this.mockOrganizations = this.mockOrganizations.filter(o => o.id !== id);
        return of({ success: true }).pipe(delay(200));
    }
}
