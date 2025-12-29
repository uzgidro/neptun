import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Resolution, ResolutionPayload, ResolutionType, ResolutionStatus } from '../interfaces/resolution';

@Injectable({
    providedIn: 'root'
})
export class ResolutionService {
    private resolutions: Resolution[] = [
        // Президент
        {
            id: 1,
            number: 'ПП-123',
            date: '2024-01-15',
            title: 'О мерах по развитию гидроэнергетики',
            description: 'Постановление Президента о развитии гидроэнергетического сектора',
            type: 'president',
            status: 'active',
            issuedBy: 'Президент Республики',
            effectiveDate: '2024-02-01',
            createdAt: '2024-01-15T10:00:00Z'
        },
        {
            id: 2,
            number: 'ПП-456',
            date: '2024-03-10',
            title: 'О модернизации энергетической инфраструктуры',
            type: 'president',
            status: 'active',
            issuedBy: 'Президент Республики',
            effectiveDate: '2024-04-01',
            createdAt: '2024-03-10T09:00:00Z'
        },
        // Кабинет министров
        {
            id: 3,
            number: 'КМ-789',
            date: '2024-02-20',
            title: 'Об утверждении тарифов на электроэнергию',
            description: 'Постановление Кабинета Министров о новых тарифах',
            type: 'cabinet',
            status: 'active',
            issuedBy: 'Кабинет Министров',
            effectiveDate: '2024-03-01',
            createdAt: '2024-02-20T11:00:00Z'
        },
        {
            id: 4,
            number: 'КМ-012',
            date: '2024-04-05',
            title: 'О порядке эксплуатации водохранилищ',
            type: 'cabinet',
            status: 'active',
            issuedBy: 'Кабинет Министров',
            createdAt: '2024-04-05T14:00:00Z'
        },
        // Указы
        {
            id: 5,
            number: 'УП-345',
            date: '2024-01-25',
            title: 'О награждении работников энергетической отрасли',
            type: 'decree',
            status: 'active',
            issuedBy: 'Президент Республики',
            createdAt: '2024-01-25T08:00:00Z'
        },
        {
            id: 6,
            number: 'УП-678',
            date: '2023-12-15',
            title: 'О присвоении почетных званий',
            type: 'decree',
            status: 'active',
            issuedBy: 'Президент Республики',
            createdAt: '2023-12-15T10:00:00Z'
        },
        // Приказы
        {
            id: 7,
            number: 'ПР-901',
            date: '2024-05-01',
            title: 'О проведении технического аудита',
            description: 'Приказ о проведении аудита технического состояния оборудования',
            type: 'order',
            status: 'active',
            issuedBy: 'Министерство энергетики',
            createdAt: '2024-05-01T09:00:00Z'
        },
        {
            id: 8,
            number: 'ПР-234',
            date: '2024-04-20',
            title: 'О назначении ответственных лиц',
            type: 'order',
            status: 'active',
            issuedBy: 'Министерство энергетики',
            createdAt: '2024-04-20T11:00:00Z'
        },
        // Совместные соглашения
        {
            id: 9,
            number: 'СС-567',
            date: '2024-03-15',
            title: 'Соглашение о сотрудничестве в сфере энергетики',
            description: 'Совместное соглашение между министерствами',
            type: 'agreement',
            status: 'active',
            issuedBy: 'Министерство энергетики, Министерство финансов',
            effectiveDate: '2024-04-01',
            expirationDate: '2025-04-01',
            createdAt: '2024-03-15T12:00:00Z'
        },
        {
            id: 10,
            number: 'СС-890',
            date: '2024-02-28',
            title: 'Межведомственное соглашение по водным ресурсам',
            type: 'agreement',
            status: 'active',
            issuedBy: 'Министерство энергетики, Министерство водного хозяйства',
            createdAt: '2024-02-28T10:00:00Z'
        }
    ];

    private nextId = 11;

    getAll(): Observable<Resolution[]> {
        return of([...this.resolutions]).pipe(delay(300));
    }

    getByType(type: ResolutionType): Observable<Resolution[]> {
        const filtered = this.resolutions.filter(r => r.type === type);
        return of([...filtered]).pipe(delay(300));
    }

    getById(id: number): Observable<Resolution | undefined> {
        return of(this.resolutions.find(r => r.id === id)).pipe(delay(200));
    }

    create(payload: ResolutionPayload): Observable<Resolution> {
        const newResolution: Resolution = {
            ...payload,
            id: this.nextId++,
            createdAt: new Date().toISOString()
        };
        this.resolutions.unshift(newResolution);
        return of(newResolution).pipe(delay(300));
    }

    update(id: number, payload: ResolutionPayload): Observable<Resolution | null> {
        const index = this.resolutions.findIndex(r => r.id === id);
        if (index === -1) return of(null).pipe(delay(200));

        this.resolutions[index] = {
            ...this.resolutions[index],
            ...payload,
            updatedAt: new Date().toISOString()
        };
        return of(this.resolutions[index]).pipe(delay(300));
    }

    delete(id: number): Observable<boolean> {
        const index = this.resolutions.findIndex(r => r.id === id);
        if (index === -1) return of(false).pipe(delay(200));

        this.resolutions.splice(index, 1);
        return of(true).pipe(delay(300));
    }

    getTypeLabel(type: ResolutionType): string {
        const labels: Record<ResolutionType, string> = {
            president: 'Президент',
            cabinet: 'Кабинет министров',
            decree: 'Указ',
            order: 'Приказ',
            agreement: 'Совместное соглашение'
        };
        return labels[type] || type;
    }

    getTypeSeverity(type: ResolutionType): string {
        const severities: Record<ResolutionType, string> = {
            president: 'danger',
            cabinet: 'warn',
            decree: 'info',
            order: 'secondary',
            agreement: 'success'
        };
        return severities[type] || 'info';
    }

    getStatusLabel(status: ResolutionStatus): string {
        const labels: Record<ResolutionStatus, string> = {
            draft: 'Черновик',
            active: 'Действующий',
            cancelled: 'Отменён',
            expired: 'Истёк'
        };
        return labels[status] || status;
    }

    getStatusSeverity(status: ResolutionStatus): string {
        const severities: Record<ResolutionStatus, string> = {
            draft: 'secondary',
            active: 'success',
            cancelled: 'danger',
            expired: 'warn'
        };
        return severities[status] || 'info';
    }

    getPageTitle(type: ResolutionType): string {
        const titles: Record<ResolutionType, string> = {
            president: 'Постановления Президента',
            cabinet: 'Постановления Кабинета министров',
            decree: 'Указы',
            order: 'Приказы',
            agreement: 'Совместные соглашения'
        };
        return titles[type] || 'Постановления';
    }
}
