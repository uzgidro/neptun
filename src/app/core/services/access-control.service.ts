import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { AccessCard, AccessZone, AccessLog, AccessRequest } from '@/core/interfaces/hrm/access-control';
import { HttpParams } from '@angular/common/http';

const ACCESS_CONTROL = '/hrm/access-control';
const USE_MOCK = !BASE_URL;

const MOCK_ZONES: AccessZone[] = [
    { id: 1, name: 'Главный вход', code: 'MAIN-GATE', location: 'Центральный аппарат', security_level: 'standard', requires_escort: false, max_occupancy: 500, current_occupancy: 245, readers: [{ id: 1, name: 'Турникет 1', zone_id: 1, type: 'card', direction: 'both', is_online: true }], is_active: true },
    { id: 2, name: 'Серверная', code: 'SERVER-RM', location: 'Центральный аппарат, этаж 2', security_level: 'high', requires_escort: true, max_occupancy: 10, current_occupancy: 2, readers: [{ id: 2, name: 'Биометрия', zone_id: 2, type: 'biometric', direction: 'entry', is_online: true }], is_active: true },
    { id: 3, name: 'Машинный зал', code: 'MACH-HALL', location: 'Молокозавод «Чарвак»', security_level: 'restricted', requires_escort: false, max_occupancy: 50, current_occupancy: 12, readers: [{ id: 3, name: 'Турникет МЗ', zone_id: 3, type: 'card', direction: 'both', is_online: true }], is_active: true },
    { id: 4, name: 'Диспетчерская', code: 'DISPATCH', location: 'Молокозавод «Чарвак»', security_level: 'critical', requires_escort: true, max_occupancy: 8, current_occupancy: 3, readers: [{ id: 4, name: 'Комбо-вход', zone_id: 4, type: 'combined', direction: 'entry', is_online: true }], is_active: true }
];

const MOCK_CARDS: AccessCard[] = [
    { id: 1, card_number: 'AC-001-2024', employee_id: 1, employee_name: 'Каримов Бахтиёр Рустамович', employee_code: 'EMP-001', department_name: 'Молокозавод «Чарвак»', position_name: 'Главный инженер', status: 'active', issued_at: '2024-03-15', valid_from: '2024-03-15', valid_until: '2027-03-15', access_zones: [1, 2, 3, 4], last_used_at: '2026-03-04T08:12:00Z', last_zone: 'Главный вход' },
    { id: 2, card_number: 'AC-002-2024', employee_id: 2, employee_name: 'Султанова Дилноза Камолидиновна', employee_code: 'EMP-002', department_name: 'Центральный аппарат', position_name: 'Начальник отдела', status: 'active', issued_at: '2024-05-20', valid_from: '2024-05-20', valid_until: '2027-05-20', access_zones: [1, 2], last_used_at: '2026-03-04T08:25:00Z', last_zone: 'Главный вход' },
    { id: 3, card_number: 'AC-003-2025', employee_id: 3, employee_name: 'Рахимов Отабек Шухратович', employee_code: 'EMP-003', department_name: 'Молокозавод «Фархад»', position_name: 'Инженер-технолог', status: 'active', issued_at: '2025-01-10', valid_from: '2025-01-10', valid_until: '2028-01-10', access_zones: [1, 3], last_used_at: '2026-03-04T07:55:00Z', last_zone: 'Машинный зал' },
    { id: 4, card_number: 'AC-004-2025', employee_id: 4, employee_name: 'Абдуллаев Жасур Тохирович', employee_code: 'EMP-004', department_name: 'Молокозавод «Ходжикент»', position_name: 'Оператор', status: 'blocked', issued_at: '2025-06-01', valid_from: '2025-06-01', valid_until: '2028-06-01', access_zones: [1], notes: 'Заблокирована по причине утери' },
    { id: 5, card_number: 'AC-005-2026', employee_id: 5, employee_name: 'Мирзаева Нодира Бахтиёровна', employee_code: 'EMP-005', department_name: 'Центральный аппарат', position_name: 'HR-специалист', status: 'active', issued_at: '2026-01-15', valid_from: '2026-01-15', valid_until: '2029-01-15', access_zones: [1], last_used_at: '2026-03-04T08:30:00Z', last_zone: 'Главный вход' }
];

const MOCK_LOGS: AccessLog[] = [
    { id: 1, timestamp: '2026-03-04T08:12:00Z', card_id: 1, card_number: 'AC-001-2024', employee_id: 1, employee_name: 'Каримов Б.Р.', zone_id: 1, zone_name: 'Главный вход', reader_id: 1, reader_name: 'Турникет 1', direction: 'entry', status: 'granted' },
    { id: 2, timestamp: '2026-03-04T08:25:00Z', card_id: 2, card_number: 'AC-002-2024', employee_id: 2, employee_name: 'Султанова Д.К.', zone_id: 1, zone_name: 'Главный вход', reader_id: 1, reader_name: 'Турникет 1', direction: 'entry', status: 'granted' },
    { id: 3, timestamp: '2026-03-04T07:55:00Z', card_id: 3, card_number: 'AC-003-2025', employee_id: 3, employee_name: 'Рахимов О.Ш.', zone_id: 3, zone_name: 'Машинный зал', reader_id: 3, reader_name: 'Турникет МЗ', direction: 'entry', status: 'granted' },
    { id: 4, timestamp: '2026-03-04T08:30:00Z', card_id: 5, card_number: 'AC-005-2026', employee_id: 5, employee_name: 'Мирзаева Н.Б.', zone_id: 1, zone_name: 'Главный вход', reader_id: 1, reader_name: 'Турникет 1', direction: 'entry', status: 'granted' },
    { id: 5, timestamp: '2026-03-04T08:45:00Z', card_id: 4, card_number: 'AC-004-2025', employee_id: 4, employee_name: 'Абдуллаев Ж.Т.', zone_id: 1, zone_name: 'Главный вход', reader_id: 1, reader_name: 'Турникет 1', direction: 'entry', status: 'denied', denial_reason: 'Карта заблокирована' }
];

const MOCK_REQUESTS: AccessRequest[] = [
    { id: 1, employee_id: 4, employee_name: 'Абдуллаев Жасур Тохирович', department_name: 'Молокозавод «Ходжикент»', requested_zones: [3], requested_zone_names: ['Машинный зал'], reason: 'Необходим доступ для обслуживания оборудования', valid_from: '2026-03-05', valid_until: '2026-06-05', is_temporary: true, status: 'pending', requested_at: '2026-03-03T10:00:00Z' },
    { id: 2, employee_id: 5, employee_name: 'Мирзаева Нодира Бахтиёровна', department_name: 'Центральный аппарат', requested_zones: [2], requested_zone_names: ['Серверная'], reason: 'Проведение аудита документов', valid_from: '2026-03-10', valid_until: '2026-03-10', is_temporary: true, status: 'approved', requested_at: '2026-03-01T14:30:00Z', processed_by: 10, processed_by_name: 'Admin', processed_at: '2026-03-02T09:00:00Z' }
];

@Injectable({
    providedIn: 'root'
})
export class AccessControlService extends ApiService {
    getCards(params?: { employee_id?: number; status?: string; search?: string }): Observable<AccessCard[]> {
        if (USE_MOCK) {
            let result = [...MOCK_CARDS];
            if (params?.status) result = result.filter(c => c.status === params.status);
            if (params?.employee_id) result = result.filter(c => c.employee_id === params.employee_id);
            if (params?.search) result = result.filter(c => c.employee_name.toLowerCase().includes(params.search!.toLowerCase()) || c.card_number.includes(params.search!));
            return of(result).pipe(delay(200));
        }
        let httpParams = new HttpParams();
        if (params?.employee_id) httpParams = httpParams.set('employee_id', params.employee_id.toString());
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.search) httpParams = httpParams.set('search', params.search);
        return this.http.get<AccessCard[]>(BASE_URL + ACCESS_CONTROL + '/cards', { params: httpParams });
    }

    getCard(id: number): Observable<AccessCard> {
        if (USE_MOCK) return of(MOCK_CARDS.find(c => c.id === id) || MOCK_CARDS[0]).pipe(delay(150));
        return this.http.get<AccessCard>(BASE_URL + ACCESS_CONTROL + '/cards/' + id);
    }

    createCard(data: Partial<AccessCard>): Observable<AccessCard> {
        if (USE_MOCK) return of({ ...MOCK_CARDS[0], ...data, id: Date.now() } as AccessCard).pipe(delay(200));
        return this.http.post<AccessCard>(BASE_URL + ACCESS_CONTROL + '/cards', data);
    }

    updateCard(id: number, data: Partial<AccessCard>): Observable<AccessCard> {
        if (USE_MOCK) return of({ ...MOCK_CARDS[0], ...data, id } as AccessCard).pipe(delay(200));
        return this.http.patch<AccessCard>(BASE_URL + ACCESS_CONTROL + '/cards/' + id, data);
    }

    blockCard(id: number, reason: string): Observable<AccessCard> {
        if (USE_MOCK) return of({ ...MOCK_CARDS[0], id, status: 'blocked' as const, notes: reason }).pipe(delay(200));
        return this.http.post<AccessCard>(BASE_URL + ACCESS_CONTROL + '/cards/' + id + '/block', { reason });
    }

    unblockCard(id: number): Observable<AccessCard> {
        if (USE_MOCK) return of({ ...MOCK_CARDS[0], id, status: 'active' as const }).pipe(delay(200));
        return this.http.post<AccessCard>(BASE_URL + ACCESS_CONTROL + '/cards/' + id + '/unblock', {});
    }

    getZones(): Observable<AccessZone[]> {
        if (USE_MOCK) return of(MOCK_ZONES).pipe(delay(200));
        return this.http.get<AccessZone[]>(BASE_URL + ACCESS_CONTROL + '/zones');
    }

    createZone(data: Partial<AccessZone>): Observable<AccessZone> {
        if (USE_MOCK) return of({ ...MOCK_ZONES[0], ...data, id: Date.now() } as AccessZone).pipe(delay(200));
        return this.http.post<AccessZone>(BASE_URL + ACCESS_CONTROL + '/zones', data);
    }

    updateZone(id: number, data: Partial<AccessZone>): Observable<AccessZone> {
        if (USE_MOCK) return of({ ...MOCK_ZONES[0], ...data, id } as AccessZone).pipe(delay(200));
        return this.http.patch<AccessZone>(BASE_URL + ACCESS_CONTROL + '/zones/' + id, data);
    }

    getLogs(params?: { employee_id?: number; zone_id?: number; direction?: string; status?: string; date_from?: string; date_to?: string }): Observable<AccessLog[]> {
        if (USE_MOCK) {
            let result = [...MOCK_LOGS];
            if (params?.employee_id) result = result.filter(l => l.employee_id === params.employee_id);
            if (params?.zone_id) result = result.filter(l => l.zone_id === params.zone_id);
            if (params?.direction) result = result.filter(l => l.direction === params.direction);
            if (params?.status) result = result.filter(l => l.status === params.status);
            return of(result).pipe(delay(200));
        }
        let httpParams = new HttpParams();
        if (params?.employee_id) httpParams = httpParams.set('employee_id', params.employee_id.toString());
        if (params?.zone_id) httpParams = httpParams.set('zone_id', params.zone_id.toString());
        if (params?.direction) httpParams = httpParams.set('direction', params.direction);
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.date_from) httpParams = httpParams.set('date_from', params.date_from);
        if (params?.date_to) httpParams = httpParams.set('date_to', params.date_to);
        return this.http.get<AccessLog[]>(BASE_URL + ACCESS_CONTROL + '/logs', { params: httpParams });
    }

    getRequests(): Observable<AccessRequest[]> {
        if (USE_MOCK) return of(MOCK_REQUESTS).pipe(delay(200));
        return this.http.get<AccessRequest[]>(BASE_URL + ACCESS_CONTROL + '/requests');
    }

    createRequest(data: Partial<AccessRequest>): Observable<AccessRequest> {
        if (USE_MOCK) return of({ ...MOCK_REQUESTS[0], ...data, id: Date.now() } as AccessRequest).pipe(delay(200));
        return this.http.post<AccessRequest>(BASE_URL + ACCESS_CONTROL + '/requests', data);
    }

    approveRequest(id: number): Observable<AccessRequest> {
        if (USE_MOCK) return of({ ...MOCK_REQUESTS[1], id, status: 'approved' as const }).pipe(delay(200));
        return this.http.post<AccessRequest>(BASE_URL + ACCESS_CONTROL + '/requests/' + id + '/approve', {});
    }

    rejectRequest(id: number, reason: string): Observable<AccessRequest> {
        if (USE_MOCK) return of({ ...MOCK_REQUESTS[0], id, status: 'rejected' as const, rejection_reason: reason }).pipe(delay(200));
        return this.http.post<AccessRequest>(BASE_URL + ACCESS_CONTROL + '/requests/' + id + '/reject', { reason });
    }
}
