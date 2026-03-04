import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { OrgUnit, OrgEmployee } from '@/core/interfaces/hrm/org-structure';

const ORG_STRUCTURE = '/hrm/org-structure';
const USE_MOCK = !BASE_URL;

const MOCK_EMPLOYEES: OrgEmployee[] = [
    { id: 1, name: 'Каримов Бахтиёр Рустамович', position: 'Главный инженер', department_id: 2, department_name: 'Чарвакская ГЭС', phone: '+998901234567', hire_date: '2018-03-15', is_manager: true },
    { id: 2, name: 'Султанова Дилноза Камолидиновна', position: 'Начальник отдела кадров', department_id: 5, department_name: 'Управление персоналом', phone: '+998901234568', hire_date: '2019-07-01', is_manager: true },
    { id: 3, name: 'Рахимов Отабек Шухратович', position: 'Инженер-энергетик', department_id: 3, department_name: 'Фархадская ГЭС', phone: '+998901234569', hire_date: '2020-01-15', is_manager: false },
    { id: 4, name: 'Абдуллаев Жасур Тохирович', position: 'Оператор', department_id: 4, department_name: 'Ходжикентская ГЭС', phone: '+998901234570', hire_date: '2025-10-01', is_manager: false },
    { id: 5, name: 'Мирзаева Нодира Бахтиёровна', position: 'HR-специалист', department_id: 5, department_name: 'Управление персоналом', phone: '+998901234571', hire_date: '2022-04-10', is_manager: false },
    { id: 6, name: 'Исмаилов Азиз Бахтиёрович', position: 'Генеральный директор', department_id: 1, department_name: 'АО «Узбекгидроэнерго»', phone: '+998901234560', hire_date: '2015-01-01', is_manager: true }
];

const MOCK_UNITS: OrgUnit[] = [
    {
        id: 1, name: 'АО «Узбекгидроэнерго»', code: 'UGE', type: 'company', parent_id: null,
        head_id: 6, head_name: 'Исмаилов Азиз Бахтиёрович', head_position: 'Генеральный директор',
        employee_count: 3842, is_active: true, created_at: '2000-01-01', location: 'г. Ташкент',
        children: [
            {
                id: 2, name: 'Чарвакская ГЭС', code: 'CHARVAK', type: 'branch', parent_id: 1,
                head_id: 1, head_name: 'Каримов Бахтиёр Рустамович', head_position: 'Главный инженер',
                employee_count: 485, is_active: true, created_at: '2000-01-01', location: 'Чарвак'
            },
            {
                id: 3, name: 'Фархадская ГЭС', code: 'FARHAD', type: 'branch', parent_id: 1,
                employee_count: 425, is_active: true, created_at: '2000-01-01', location: 'Фархад'
            },
            {
                id: 4, name: 'Ходжикентская ГЭС', code: 'HODJI', type: 'branch', parent_id: 1,
                employee_count: 312, is_active: true, created_at: '2000-01-01', location: 'Ходжикент'
            },
            {
                id: 5, name: 'Управление персоналом', code: 'HR', type: 'department', parent_id: 1,
                head_id: 2, head_name: 'Султанова Дилноза Камолидиновна', head_position: 'Начальник отдела',
                employee_count: 45, is_active: true, created_at: '2000-01-01', location: 'г. Ташкент'
            },
            {
                id: 6, name: 'Финансовый департамент', code: 'FIN', type: 'department', parent_id: 1,
                employee_count: 38, is_active: true, created_at: '2000-01-01', location: 'г. Ташкент'
            },
            {
                id: 7, name: 'Сырдарьинские ГЭС', code: 'SYRDARYA', type: 'branch', parent_id: 1,
                employee_count: 520, is_active: true, created_at: '2000-01-01', location: 'Сырдарья'
            },
            {
                id: 8, name: 'Зарафшанские ГЭС', code: 'ZARAFSHAN', type: 'branch', parent_id: 1,
                employee_count: 345, is_active: true, created_at: '2000-01-01', location: 'Зарафшан'
            }
        ]
    }
];

@Injectable({
    providedIn: 'root'
})
export class OrgStructureService extends ApiService {
    getOrgUnits(): Observable<OrgUnit[]> {
        if (USE_MOCK) return of(MOCK_UNITS).pipe(delay(250));
        return this.http.get<OrgUnit[]>(BASE_URL + ORG_STRUCTURE + '/units');
    }

    getOrgUnit(id: number): Observable<OrgUnit> {
        if (USE_MOCK) {
            const flat = [MOCK_UNITS[0], ...(MOCK_UNITS[0].children || [])];
            return of(flat.find(u => u.id === id) || MOCK_UNITS[0]).pipe(delay(150));
        }
        return this.http.get<OrgUnit>(BASE_URL + ORG_STRUCTURE + '/units/' + id);
    }

    createOrgUnit(data: Partial<OrgUnit>): Observable<OrgUnit> {
        if (USE_MOCK) return of({ ...MOCK_UNITS[0].children![0], ...data, id: Date.now() } as OrgUnit).pipe(delay(200));
        return this.http.post<OrgUnit>(BASE_URL + ORG_STRUCTURE + '/units', data);
    }

    updateOrgUnit(id: number, data: Partial<OrgUnit>): Observable<OrgUnit> {
        if (USE_MOCK) return of({ ...MOCK_UNITS[0].children![0], ...data, id } as OrgUnit).pipe(delay(200));
        return this.http.patch<OrgUnit>(BASE_URL + ORG_STRUCTURE + '/units/' + id, data);
    }

    deleteOrgUnit(id: number): Observable<any> {
        if (USE_MOCK) return of({}).pipe(delay(200));
        return this.http.delete(BASE_URL + ORG_STRUCTURE + '/units/' + id);
    }

    getOrgEmployees(): Observable<OrgEmployee[]> {
        if (USE_MOCK) return of(MOCK_EMPLOYEES).pipe(delay(200));
        return this.http.get<OrgEmployee[]>(BASE_URL + ORG_STRUCTURE + '/employees');
    }

    getUnitEmployees(unitId: number): Observable<OrgEmployee[]> {
        if (USE_MOCK) return of(MOCK_EMPLOYEES.filter(e => e.department_id === unitId)).pipe(delay(200));
        return this.http.get<OrgEmployee[]>(BASE_URL + ORG_STRUCTURE + '/units/' + unitId + '/employees');
    }

    assignEmployee(unitId: number, employeeId: number): Observable<any> {
        if (USE_MOCK) return of({}).pipe(delay(200));
        return this.http.post(BASE_URL + ORG_STRUCTURE + '/units/' + unitId + '/employees', { employee_id: employeeId });
    }

    removeEmployee(unitId: number, employeeId: number): Observable<any> {
        if (USE_MOCK) return of({}).pipe(delay(200));
        return this.http.delete(BASE_URL + ORG_STRUCTURE + '/units/' + unitId + '/employees/' + employeeId);
    }
}
