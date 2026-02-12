import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { OrgEmployee, OrgUnit } from '@/core/interfaces/hrm/org-structure';

// Мок-данные: организационные единицы
const MOCK_ORG_UNITS: OrgUnit[] = [
    {
        id: 1,
        name: 'АО "Узбекгидроэнерго"',
        code: 'UGE',
        type: 'company',
        parent_id: null,
        head_id: 1,
        head_name: 'Каримов Рустам Шарипович',
        head_position: 'Генеральный директор',
        employee_count: 247,
        budget: 15000000000,
        location: 'г. Ташкент',
        description: 'Головная организация',
        is_active: true,
        created_at: '2010-01-01T00:00:00',
        level: 0,
        expanded: true
    },
    {
        id: 2,
        name: 'Аппарат управления',
        code: 'UGE-AU',
        type: 'division',
        parent_id: 1,
        employee_count: 72,
        location: 'г. Ташкент, главный офис',
        description: 'Административно-управленческий аппарат',
        is_active: true,
        created_at: '2010-01-01T00:00:00',
        level: 1,
        expanded: true
    },
    {
        id: 3,
        name: 'Руководство',
        code: 'UGE-AU-RUK',
        type: 'department',
        parent_id: 2,
        head_id: 1,
        head_name: 'Каримов Рустам Шарипович',
        head_position: 'Генеральный директор',
        employee_count: 5,
        location: 'г. Ташкент, главный офис, 3 этаж',
        description: 'Руководство организации',
        is_active: true,
        created_at: '2010-01-01T00:00:00',
        level: 2
    },
    {
        id: 4,
        name: 'Отдел кадров',
        code: 'UGE-AU-HR',
        type: 'section',
        parent_id: 2,
        head_id: 2,
        head_name: 'Ахмедова Нилуфар Бахтиёровна',
        head_position: 'Начальник отдела кадров',
        employee_count: 15,
        location: 'г. Ташкент, главный офис, 2 этаж',
        description: 'Управление персоналом и кадровый учёт',
        is_active: true,
        created_at: '2010-01-01T00:00:00',
        level: 2
    },
    {
        id: 5,
        name: 'Финансовый отдел',
        code: 'UGE-AU-FIN',
        type: 'section',
        parent_id: 2,
        head_id: 4,
        head_name: 'Рахимова Дилноза Алишеровна',
        head_position: 'Главный бухгалтер',
        employee_count: 18,
        location: 'г. Ташкент, главный офис, 2 этаж',
        description: 'Бухгалтерия и финансовое планирование',
        is_active: true,
        created_at: '2010-01-01T00:00:00',
        level: 2
    },
    {
        id: 6,
        name: 'IT-отдел',
        code: 'UGE-AU-IT',
        type: 'section',
        parent_id: 2,
        head_id: 5,
        head_name: 'Назаров Фаррух Бахромович',
        head_position: 'Системный администратор',
        employee_count: 22,
        location: 'г. Ташкент, главный офис, 1 этаж',
        description: 'Информационные технологии и поддержка инфраструктуры',
        is_active: true,
        created_at: '2012-06-01T00:00:00',
        level: 2
    },
    {
        id: 7,
        name: 'Юридический отдел',
        code: 'UGE-AU-LAW',
        type: 'section',
        parent_id: 2,
        head_id: 6,
        head_name: 'Абдуллаева Гулнора Тахировна',
        head_position: 'Юрист',
        employee_count: 12,
        location: 'г. Ташкент, главный офис, 2 этаж',
        description: 'Правовое обеспечение деятельности организации',
        is_active: true,
        created_at: '2010-01-01T00:00:00',
        level: 2
    },
    {
        id: 8,
        name: 'Производственный блок',
        code: 'UGE-PB',
        type: 'division',
        parent_id: 1,
        employee_count: 134,
        location: 'г. Ташкент, производственный корпус',
        description: 'Производственно-технический комплекс',
        is_active: true,
        created_at: '2010-01-01T00:00:00',
        level: 1,
        expanded: true
    },
    {
        id: 9,
        name: 'Производственный отдел',
        code: 'UGE-PB-PROD',
        type: 'department',
        parent_id: 8,
        head_id: 3,
        head_name: 'Юлдашев Ботир Камолович',
        head_position: 'Начальник производства',
        employee_count: 78,
        location: 'г. Ташкент, производственный корпус',
        description: 'Основное производство и эксплуатация оборудования',
        is_active: true,
        created_at: '2010-01-01T00:00:00',
        level: 2
    },
    {
        id: 10,
        name: 'Отдел контроля качества',
        code: 'UGE-PB-QC',
        type: 'section',
        parent_id: 8,
        head_id: 8,
        head_name: 'Исмоилова Шахло Равшановна',
        head_position: 'Инженер по качеству',
        employee_count: 24,
        location: 'г. Ташкент, производственный корпус',
        description: 'Контроль качества продукции и процессов',
        is_active: true,
        created_at: '2010-01-01T00:00:00',
        level: 2
    },
    {
        id: 11,
        name: 'Отдел логистики',
        code: 'UGE-PB-LOG',
        type: 'section',
        parent_id: 8,
        head_id: 9,
        head_name: 'Турсунов Ильхом Адхамович',
        head_position: 'Менеджер по логистике',
        employee_count: 32,
        location: 'г. Ташкент, производственный корпус',
        description: 'Логистика, снабжение и складской учёт',
        is_active: true,
        created_at: '2010-01-01T00:00:00',
        level: 2
    }
];

// Мок-данные: сотрудники в организационной структуре
const MOCK_ORG_EMPLOYEES: OrgEmployee[] = [
    {
        id: 1,
        name: 'Каримов Рустам Шарипович',
        position: 'Генеральный директор',
        department_id: 1,
        department_name: 'Руководство',
        email: 'r.karimov@uzgidroenergo.uz',
        phone: '+998 71 234-56-01',
        hire_date: '2015-03-15',
        is_manager: true,
        subordinates_count: 246
    },
    {
        id: 2,
        name: 'Ахмедова Нилуфар Бахтиёровна',
        position: 'Начальник отдела кадров',
        department_id: 7,
        department_name: 'Отдел кадров',
        email: 'n.akhmedova@uzgidroenergo.uz',
        phone: '+998 71 234-56-02',
        manager_id: 1,
        manager_name: 'Каримов Рустам Шарипович',
        hire_date: '2017-06-01',
        is_manager: true,
        subordinates_count: 14
    },
    {
        id: 3,
        name: 'Юлдашев Ботир Камолович',
        position: 'Начальник производства',
        department_id: 2,
        department_name: 'Производственный отдел',
        email: 'b.yuldashev@uzgidroenergo.uz',
        phone: '+998 71 234-56-03',
        manager_id: 1,
        manager_name: 'Каримов Рустам Шарипович',
        hire_date: '2016-09-12',
        is_manager: true,
        subordinates_count: 77
    },
    {
        id: 4,
        name: 'Рахимова Дилноза Алишеровна',
        position: 'Главный бухгалтер',
        department_id: 5,
        department_name: 'Финансовый отдел',
        email: 'd.rakhimova@uzgidroenergo.uz',
        phone: '+998 71 234-56-04',
        manager_id: 1,
        manager_name: 'Каримов Рустам Шарипович',
        hire_date: '2018-01-20',
        is_manager: true,
        subordinates_count: 17
    },
    {
        id: 5,
        name: 'Назаров Фаррух Бахромович',
        position: 'Системный администратор',
        department_id: 6,
        department_name: 'IT-отдел',
        email: 'f.nazarov@uzgidroenergo.uz',
        phone: '+998 71 234-56-05',
        manager_id: 1,
        manager_name: 'Каримов Рустам Шарипович',
        hire_date: '2019-04-15',
        is_manager: true,
        subordinates_count: 21
    },
    {
        id: 6,
        name: 'Абдуллаева Гулнора Тахировна',
        position: 'Юрист',
        department_id: 8,
        department_name: 'Юридический отдел',
        email: 'g.abdullaeva@uzgidroenergo.uz',
        phone: '+998 71 234-56-06',
        manager_id: 1,
        manager_name: 'Каримов Рустам Шарипович',
        hire_date: '2020-02-10',
        is_manager: true,
        subordinates_count: 11
    },
    {
        id: 7,
        name: 'Мирзаев Жасур Хамидович',
        position: 'Технолог',
        department_id: 2,
        department_name: 'Производственный отдел',
        email: 'zh.mirzaev@uzgidroenergo.uz',
        phone: '+998 71 234-56-07',
        manager_id: 3,
        manager_name: 'Юлдашев Ботир Камолович',
        hire_date: '2019-11-25',
        is_manager: false,
        subordinates_count: 0
    },
    {
        id: 8,
        name: 'Исмоилова Шахло Равшановна',
        position: 'Инженер по качеству',
        department_id: 3,
        department_name: 'Отдел контроля качества',
        email: 'sh.ismoilova@uzgidroenergo.uz',
        phone: '+998 71 234-56-08',
        manager_id: 3,
        manager_name: 'Юлдашев Ботир Камолович',
        hire_date: '2021-03-01',
        is_manager: true,
        subordinates_count: 23
    },
    {
        id: 9,
        name: 'Турсунов Ильхом Адхамович',
        position: 'Менеджер по логистике',
        department_id: 4,
        department_name: 'Отдел логистики',
        email: 'i.tursunov@uzgidroenergo.uz',
        phone: '+998 71 234-56-09',
        manager_id: 3,
        manager_name: 'Юлдашев Ботир Камолович',
        hire_date: '2020-07-14',
        is_manager: true,
        subordinates_count: 31
    },
    {
        id: 10,
        name: 'Хасанова Малика Обидовна',
        position: 'Специалист по кадрам',
        department_id: 7,
        department_name: 'Отдел кадров',
        email: 'm.khasanova@uzgidroenergo.uz',
        phone: '+998 71 234-56-10',
        manager_id: 2,
        manager_name: 'Ахмедова Нилуфар Бахтиёровна',
        hire_date: '2022-01-10',
        is_manager: false,
        subordinates_count: 0
    },
    {
        id: 11,
        name: 'Сафаров Улугбек Шухратович',
        position: 'Оператор',
        department_id: 2,
        department_name: 'Производственный отдел',
        email: 'u.safarov@uzgidroenergo.uz',
        phone: '+998 71 234-56-11',
        manager_id: 3,
        manager_name: 'Юлдашев Ботир Камолович',
        hire_date: '2023-05-20',
        is_manager: false,
        subordinates_count: 0
    },
    {
        id: 12,
        name: 'Каримова Зилола Бахтияровна',
        position: 'Бухгалтер',
        department_id: 5,
        department_name: 'Финансовый отдел',
        email: 'z.karimova@uzgidroenergo.uz',
        phone: '+998 71 234-56-12',
        manager_id: 4,
        manager_name: 'Рахимова Дилноза Алишеровна',
        hire_date: '2023-09-01',
        is_manager: false,
        subordinates_count: 0
    }
];

@Injectable({
    providedIn: 'root'
})
export class OrgStructureService extends ApiService {
    // Организационные единицы
    getOrgUnits(): Observable<OrgUnit[]> {
        return of(MOCK_ORG_UNITS).pipe(delay(300));
    }

    getOrgUnit(id: number): Observable<OrgUnit> {
        const unit = MOCK_ORG_UNITS.find((u) => u.id === id) || MOCK_ORG_UNITS[0];
        return of(unit).pipe(delay(300));
    }

    createOrgUnit(data: Partial<OrgUnit>): Observable<OrgUnit> {
        const newUnit: OrgUnit = {
            id: Date.now(),
            name: data.name || '',
            code: data.code || 'NEW',
            type: data.type || 'section',
            parent_id: data.parent_id ?? null,
            head_id: data.head_id,
            head_name: data.head_name,
            head_position: data.head_position,
            employee_count: 0,
            budget: data.budget,
            location: data.location,
            description: data.description,
            is_active: true,
            created_at: new Date().toISOString()
        };
        return of(newUnit).pipe(delay(200));
    }

    updateOrgUnit(id: number, data: Partial<OrgUnit>): Observable<OrgUnit> {
        const existing = MOCK_ORG_UNITS.find((u) => u.id === id) || MOCK_ORG_UNITS[0];
        const updated: OrgUnit = { ...existing, ...data, id };
        return of(updated).pipe(delay(200));
    }

    deleteOrgUnit(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    // Сотрудники в организационной структуре
    getOrgEmployees(): Observable<OrgEmployee[]> {
        return of(MOCK_ORG_EMPLOYEES).pipe(delay(300));
    }

    assignEmployee(unitId: number, employeeId: number): Observable<any> {
        return of({ success: true, unit_id: unitId, employee_id: employeeId }).pipe(delay(200));
    }

    removeEmployee(unitId: number, employeeId: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }
}
