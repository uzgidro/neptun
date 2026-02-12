import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AccessCard, AccessZone, AccessLog, AccessRequest } from '@/core/interfaces/hrm/access-control';

// Мок-данные: пропуска сотрудников
const MOCK_CARDS: AccessCard[] = [
    {
        id: 1,
        card_number: 'АК-001',
        employee_id: 1,
        employee_name: 'Каримов Рустам Шарипович',
        employee_code: 'ТН-001',
        department_name: 'Руководство',
        position_name: 'Генеральный директор',
        status: 'active',
        issued_at: '2015-03-15',
        valid_from: '2015-03-15',
        valid_until: '2026-03-15',
        access_zones: [1, 2, 3, 4, 5],
        last_used_at: '2025-01-30T08:45:00',
        last_zone: 'Главный вход'
    },
    {
        id: 2,
        card_number: 'АК-002',
        employee_id: 2,
        employee_name: 'Ахмедова Нилуфар Бахтиёровна',
        employee_code: 'ТН-002',
        department_name: 'Отдел кадров',
        position_name: 'Начальник отдела кадров',
        status: 'active',
        issued_at: '2017-06-01',
        valid_from: '2017-06-01',
        valid_until: '2026-06-01',
        access_zones: [1, 2, 4],
        last_used_at: '2025-01-30T08:50:00',
        last_zone: 'Главный вход'
    },
    {
        id: 3,
        card_number: 'АК-003',
        employee_id: 3,
        employee_name: 'Юлдашев Ботир Камолович',
        employee_code: 'ТН-003',
        department_name: 'Производственный отдел',
        position_name: 'Начальник производства',
        status: 'active',
        issued_at: '2016-09-12',
        valid_from: '2016-09-12',
        valid_until: '2026-09-12',
        access_zones: [1, 2, 5],
        last_used_at: '2025-01-30T07:55:00',
        last_zone: 'Главный вход'
    },
    {
        id: 4,
        card_number: 'АК-004',
        employee_id: 4,
        employee_name: 'Рахимова Дилноза Алишеровна',
        employee_code: 'ТН-004',
        department_name: 'Финансовый отдел',
        position_name: 'Главный бухгалтер',
        status: 'active',
        issued_at: '2018-01-20',
        valid_from: '2018-01-20',
        valid_until: '2026-01-20',
        access_zones: [1, 2, 4],
        last_used_at: '2025-01-30T08:55:00',
        last_zone: 'Офисный этаж'
    },
    {
        id: 5,
        card_number: 'АК-005',
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        employee_code: 'ТН-005',
        department_name: 'IT-отдел',
        position_name: 'Системный администратор',
        status: 'active',
        issued_at: '2019-04-15',
        valid_from: '2019-04-15',
        valid_until: '2026-04-15',
        access_zones: [1, 2, 3],
        last_used_at: '2025-01-30T08:30:00',
        last_zone: 'Серверная'
    },
    {
        id: 6,
        card_number: 'АК-006',
        employee_id: 6,
        employee_name: 'Абдуллаева Гулнора Тахировна',
        employee_code: 'ТН-006',
        department_name: 'Юридический отдел',
        position_name: 'Юрист',
        status: 'active',
        issued_at: '2020-02-10',
        valid_from: '2020-02-10',
        valid_until: '2026-02-10',
        access_zones: [1, 2, 4],
        last_used_at: '2025-01-30T09:00:00',
        last_zone: 'Офисный этаж'
    },
    {
        id: 7,
        card_number: 'АК-007',
        employee_id: 7,
        employee_name: 'Мирзаев Жасур Хамидович',
        employee_code: 'ТН-007',
        department_name: 'Производственный отдел',
        position_name: 'Технолог',
        status: 'active',
        issued_at: '2019-11-25',
        valid_from: '2019-11-25',
        valid_until: '2026-11-25',
        access_zones: [1, 2, 5],
        last_used_at: '2025-01-30T07:50:00',
        last_zone: 'Диспетчерская'
    },
    {
        id: 8,
        card_number: 'АК-008',
        employee_id: 8,
        employee_name: 'Исмоилова Шахло Равшановна',
        employee_code: 'ТН-008',
        department_name: 'Отдел контроля качества',
        position_name: 'Инженер по качеству',
        status: 'active',
        issued_at: '2021-03-01',
        valid_from: '2021-03-01',
        valid_until: '2026-03-01',
        access_zones: [1, 2, 5],
        last_used_at: '2025-01-30T08:10:00',
        last_zone: 'Главный вход'
    },
    {
        id: 9,
        card_number: 'АК-009',
        employee_id: 9,
        employee_name: 'Турсунов Ильхом Адхамович',
        employee_code: 'ТН-009',
        department_name: 'Отдел логистики',
        position_name: 'Менеджер по логистике',
        status: 'active',
        issued_at: '2020-07-14',
        valid_from: '2020-07-14',
        valid_until: '2026-07-14',
        access_zones: [1, 2],
        last_used_at: '2025-01-30T08:20:00',
        last_zone: 'Офисный этаж'
    },
    {
        id: 10,
        card_number: 'АК-010',
        employee_id: 10,
        employee_name: 'Хасанова Малика Обидовна',
        employee_code: 'ТН-010',
        department_name: 'Отдел кадров',
        position_name: 'Специалист по кадрам',
        status: 'active',
        issued_at: '2022-01-10',
        valid_from: '2022-01-10',
        valid_until: '2027-01-10',
        access_zones: [1, 2, 4],
        last_used_at: '2025-01-30T08:55:00',
        last_zone: 'Архив'
    },
    {
        id: 11,
        card_number: 'АК-011',
        employee_id: 11,
        employee_name: 'Сафаров Улугбек Шухратович',
        employee_code: 'ТН-011',
        department_name: 'Производственный отдел',
        position_name: 'Оператор',
        status: 'blocked',
        issued_at: '2023-05-20',
        valid_from: '2023-05-20',
        valid_until: '2028-05-20',
        access_zones: [1, 2, 5],
        last_used_at: '2025-01-24T17:05:00',
        last_zone: 'Главный вход',
        notes: 'Заблокирована на время больничного'
    },
    {
        id: 12,
        card_number: 'АК-012',
        employee_id: 12,
        employee_name: 'Каримова Зилола Бахтияровна',
        employee_code: 'ТН-012',
        department_name: 'Финансовый отдел',
        position_name: 'Бухгалтер',
        status: 'active',
        issued_at: '2023-09-01',
        valid_from: '2023-09-01',
        valid_until: '2028-09-01',
        access_zones: [1, 2],
        last_used_at: '2025-01-30T08:58:00',
        last_zone: 'Офисный этаж'
    }
];

// Мок-данные: зоны доступа
const MOCK_ZONES: AccessZone[] = [
    {
        id: 1,
        name: 'Главный вход',
        code: 'ZONE-01',
        description: 'Главный проходной пункт здания',
        location: '1 этаж, центральный вход',
        security_level: 'public',
        requires_escort: false,
        max_occupancy: 500,
        current_occupancy: 187,
        readers: [
            { id: 1, name: 'Турникет вход №1', zone_id: 1, type: 'card', direction: 'entry', ip_address: '192.168.1.101', is_online: true, last_heartbeat: '2025-01-30T09:00:00' },
            { id: 2, name: 'Турникет вход №2', zone_id: 1, type: 'card', direction: 'entry', ip_address: '192.168.1.102', is_online: true, last_heartbeat: '2025-01-30T09:00:00' },
            { id: 3, name: 'Турникет выход №1', zone_id: 1, type: 'card', direction: 'exit', ip_address: '192.168.1.103', is_online: true, last_heartbeat: '2025-01-30T09:00:00' },
            { id: 4, name: 'Турникет выход №2', zone_id: 1, type: 'card', direction: 'exit', ip_address: '192.168.1.104', is_online: true, last_heartbeat: '2025-01-30T09:00:00' }
        ],
        is_active: true
    },
    {
        id: 2,
        name: 'Офисный этаж',
        code: 'ZONE-02',
        description: 'Офисные помещения 2-3 этаж',
        location: '2-3 этаж',
        security_level: 'standard',
        requires_escort: false,
        max_occupancy: 200,
        current_occupancy: 134,
        readers: [
            { id: 5, name: 'Дверь 2-й этаж', zone_id: 2, type: 'card', direction: 'both', ip_address: '192.168.1.201', is_online: true, last_heartbeat: '2025-01-30T09:00:00' },
            { id: 6, name: 'Дверь 3-й этаж', zone_id: 2, type: 'card', direction: 'both', ip_address: '192.168.1.202', is_online: true, last_heartbeat: '2025-01-30T09:00:00' }
        ],
        is_active: true
    },
    {
        id: 3,
        name: 'Серверная',
        code: 'ZONE-03',
        description: 'Серверная комната IT-отдела',
        location: '1 этаж, помещение 105',
        security_level: 'high',
        requires_escort: false,
        max_occupancy: 5,
        current_occupancy: 1,
        readers: [{ id: 7, name: 'Биометрический замок серверной', zone_id: 3, type: 'biometric', direction: 'both', ip_address: '192.168.1.301', is_online: true, last_heartbeat: '2025-01-30T09:00:00' }],
        is_active: true
    },
    {
        id: 4,
        name: 'Архив',
        code: 'ZONE-04',
        description: 'Архивное хранилище документов',
        location: 'Цокольный этаж',
        security_level: 'restricted',
        requires_escort: true,
        max_occupancy: 10,
        current_occupancy: 0,
        readers: [{ id: 8, name: 'Замок архива', zone_id: 4, type: 'combined', direction: 'both', ip_address: '192.168.1.401', is_online: true, last_heartbeat: '2025-01-30T09:00:00' }],
        is_active: true
    },
    {
        id: 5,
        name: 'Диспетчерская',
        code: 'ZONE-05',
        description: 'Диспетчерская производственного отдела',
        location: '1 этаж, производственный корпус',
        security_level: 'critical',
        requires_escort: true,
        max_occupancy: 8,
        current_occupancy: 3,
        readers: [
            { id: 9, name: 'Биометрический замок диспетчерской', zone_id: 5, type: 'biometric', direction: 'both', ip_address: '192.168.1.501', is_online: true, last_heartbeat: '2025-01-30T09:00:00' },
            { id: 10, name: 'PIN-панель диспетчерской', zone_id: 5, type: 'pin', direction: 'both', ip_address: '192.168.1.502', is_online: true, last_heartbeat: '2025-01-30T09:00:00' }
        ],
        is_active: true
    }
];

// Мок-данные: журнал доступа (30 записей за сегодня)
const TODAY = '2025-01-30';
const MOCK_LOGS: AccessLog[] = [
    {
        id: 1,
        timestamp: `${TODAY}T07:50:00`,
        card_id: 7,
        card_number: 'АК-007',
        employee_id: 7,
        employee_name: 'Мирзаев Жасур Хамидович',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 1,
        reader_name: 'Турникет вход №1',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 2,
        timestamp: `${TODAY}T07:55:00`,
        card_id: 3,
        card_number: 'АК-003',
        employee_id: 3,
        employee_name: 'Юлдашев Ботир Камолович',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 1,
        reader_name: 'Турникет вход №1',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 3,
        timestamp: `${TODAY}T07:58:00`,
        card_id: 7,
        card_number: 'АК-007',
        employee_id: 7,
        employee_name: 'Мирзаев Жасур Хамидович',
        zone_id: 5,
        zone_name: 'Диспетчерская',
        reader_id: 9,
        reader_name: 'Биометрический замок диспетчерской',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 4,
        timestamp: `${TODAY}T08:10:00`,
        card_id: 8,
        card_number: 'АК-008',
        employee_id: 8,
        employee_name: 'Исмоилова Шахло Равшановна',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 2,
        reader_name: 'Турникет вход №2',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 5,
        timestamp: `${TODAY}T08:20:00`,
        card_id: 9,
        card_number: 'АК-009',
        employee_id: 9,
        employee_name: 'Турсунов Ильхом Адхамович',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 1,
        reader_name: 'Турникет вход №1',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 6,
        timestamp: `${TODAY}T08:22:00`,
        card_id: 9,
        card_number: 'АК-009',
        employee_id: 9,
        employee_name: 'Турсунов Ильхом Адхамович',
        zone_id: 2,
        zone_name: 'Офисный этаж',
        reader_id: 5,
        reader_name: 'Дверь 2-й этаж',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 7,
        timestamp: `${TODAY}T08:30:00`,
        card_id: 5,
        card_number: 'АК-005',
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 1,
        reader_name: 'Турникет вход №1',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 8,
        timestamp: `${TODAY}T08:32:00`,
        card_id: 5,
        card_number: 'АК-005',
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        zone_id: 3,
        zone_name: 'Серверная',
        reader_id: 7,
        reader_name: 'Биометрический замок серверной',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 9,
        timestamp: `${TODAY}T08:45:00`,
        card_id: 1,
        card_number: 'АК-001',
        employee_id: 1,
        employee_name: 'Каримов Рустам Шарипович',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 1,
        reader_name: 'Турникет вход №1',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 10,
        timestamp: `${TODAY}T08:48:00`,
        card_id: 1,
        card_number: 'АК-001',
        employee_id: 1,
        employee_name: 'Каримов Рустам Шарипович',
        zone_id: 2,
        zone_name: 'Офисный этаж',
        reader_id: 6,
        reader_name: 'Дверь 3-й этаж',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 11,
        timestamp: `${TODAY}T08:50:00`,
        card_id: 2,
        card_number: 'АК-002',
        employee_id: 2,
        employee_name: 'Ахмедова Нилуфар Бахтиёровна',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 2,
        reader_name: 'Турникет вход №2',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 12,
        timestamp: `${TODAY}T08:52:00`,
        card_id: 2,
        card_number: 'АК-002',
        employee_id: 2,
        employee_name: 'Ахмедова Нилуфар Бахтиёровна',
        zone_id: 2,
        zone_name: 'Офисный этаж',
        reader_id: 5,
        reader_name: 'Дверь 2-й этаж',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 13,
        timestamp: `${TODAY}T08:55:00`,
        card_id: 4,
        card_number: 'АК-004',
        employee_id: 4,
        employee_name: 'Рахимова Дилноза Алишеровна',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 1,
        reader_name: 'Турникет вход №1',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 14,
        timestamp: `${TODAY}T08:55:30`,
        card_id: 10,
        card_number: 'АК-010',
        employee_id: 10,
        employee_name: 'Хасанова Малика Обидовна',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 2,
        reader_name: 'Турникет вход №2',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 15,
        timestamp: `${TODAY}T08:57:00`,
        card_id: 4,
        card_number: 'АК-004',
        employee_id: 4,
        employee_name: 'Рахимова Дилноза Алишеровна',
        zone_id: 2,
        zone_name: 'Офисный этаж',
        reader_id: 5,
        reader_name: 'Дверь 2-й этаж',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 16,
        timestamp: `${TODAY}T08:58:00`,
        card_id: 12,
        card_number: 'АК-012',
        employee_id: 12,
        employee_name: 'Каримова Зилола Бахтияровна',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 1,
        reader_name: 'Турникет вход №1',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 17,
        timestamp: `${TODAY}T08:59:00`,
        card_id: 12,
        card_number: 'АК-012',
        employee_id: 12,
        employee_name: 'Каримова Зилола Бахтияровна',
        zone_id: 2,
        zone_name: 'Офисный этаж',
        reader_id: 5,
        reader_name: 'Дверь 2-й этаж',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 18,
        timestamp: `${TODAY}T09:00:00`,
        card_id: 6,
        card_number: 'АК-006',
        employee_id: 6,
        employee_name: 'Абдуллаева Гулнора Тахировна',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 2,
        reader_name: 'Турникет вход №2',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 19,
        timestamp: `${TODAY}T09:02:00`,
        card_id: 6,
        card_number: 'АК-006',
        employee_id: 6,
        employee_name: 'Абдуллаева Гулнора Тахировна',
        zone_id: 2,
        zone_name: 'Офисный этаж',
        reader_id: 5,
        reader_name: 'Дверь 2-й этаж',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 20,
        timestamp: `${TODAY}T09:15:00`,
        card_id: 11,
        card_number: 'АК-011',
        employee_id: 11,
        employee_name: 'Сафаров Улугбек Шухратович',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 1,
        reader_name: 'Турникет вход №1',
        direction: 'entry',
        status: 'denied',
        denial_reason: 'Карта заблокирована'
    },
    {
        id: 21,
        timestamp: `${TODAY}T10:30:00`,
        card_id: 5,
        card_number: 'АК-005',
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        zone_id: 3,
        zone_name: 'Серверная',
        reader_id: 7,
        reader_name: 'Биометрический замок серверной',
        direction: 'exit',
        status: 'granted'
    },
    {
        id: 22,
        timestamp: `${TODAY}T10:32:00`,
        card_id: 5,
        card_number: 'АК-005',
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        zone_id: 2,
        zone_name: 'Офисный этаж',
        reader_id: 5,
        reader_name: 'Дверь 2-й этаж',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 23,
        timestamp: `${TODAY}T10:45:00`,
        card_id: 10,
        card_number: 'АК-010',
        employee_id: 10,
        employee_name: 'Хасанова Малика Обидовна',
        zone_id: 4,
        zone_name: 'Архив',
        reader_id: 8,
        reader_name: 'Замок архива',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 24,
        timestamp: `${TODAY}T11:15:00`,
        card_id: 10,
        card_number: 'АК-010',
        employee_id: 10,
        employee_name: 'Хасанова Малика Обидовна',
        zone_id: 4,
        zone_name: 'Архив',
        reader_id: 8,
        reader_name: 'Замок архива',
        direction: 'exit',
        status: 'granted'
    },
    {
        id: 25,
        timestamp: `${TODAY}T12:00:00`,
        card_id: 3,
        card_number: 'АК-003',
        employee_id: 3,
        employee_name: 'Юлдашев Ботир Камолович',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 3,
        reader_name: 'Турникет выход №1',
        direction: 'exit',
        status: 'granted'
    },
    {
        id: 26,
        timestamp: `${TODAY}T12:05:00`,
        card_id: 8,
        card_number: 'АК-008',
        employee_id: 8,
        employee_name: 'Исмоилова Шахло Равшановна',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 3,
        reader_name: 'Турникет выход №1',
        direction: 'exit',
        status: 'granted'
    },
    {
        id: 27,
        timestamp: `${TODAY}T13:00:00`,
        card_id: 3,
        card_number: 'АК-003',
        employee_id: 3,
        employee_name: 'Юлдашев Ботир Камолович',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 1,
        reader_name: 'Турникет вход №1',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 28,
        timestamp: `${TODAY}T13:02:00`,
        card_id: 8,
        card_number: 'АК-008',
        employee_id: 8,
        employee_name: 'Исмоилова Шахло Равшановна',
        zone_id: 1,
        zone_name: 'Главный вход',
        reader_id: 2,
        reader_name: 'Турникет вход №2',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 29,
        timestamp: `${TODAY}T14:30:00`,
        card_id: 1,
        card_number: 'АК-001',
        employee_id: 1,
        employee_name: 'Каримов Рустам Шарипович',
        zone_id: 5,
        zone_name: 'Диспетчерская',
        reader_id: 9,
        reader_name: 'Биометрический замок диспетчерской',
        direction: 'entry',
        status: 'granted'
    },
    {
        id: 30,
        timestamp: `${TODAY}T14:50:00`,
        card_id: 1,
        card_number: 'АК-001',
        employee_id: 1,
        employee_name: 'Каримов Рустам Шарипович',
        zone_id: 5,
        zone_name: 'Диспетчерская',
        reader_id: 9,
        reader_name: 'Биометрический замок диспетчерской',
        direction: 'exit',
        status: 'granted'
    }
];

// Мок-данные: заявки на доступ
const MOCK_REQUESTS: AccessRequest[] = [
    {
        id: 1,
        employee_id: 9,
        employee_name: 'Турсунов Ильхом Адхамович',
        department_name: 'Отдел логистики',
        requested_zones: [4],
        requested_zone_names: ['Архив'],
        reason: 'Необходим доступ к архиву для проверки документов по логистике',
        valid_from: '2025-02-01',
        valid_until: '2025-02-28',
        is_temporary: true,
        status: 'pending',
        requested_at: '2025-01-28T10:00:00'
    },
    {
        id: 2,
        employee_id: 12,
        employee_name: 'Каримова Зилола Бахтияровна',
        department_name: 'Финансовый отдел',
        requested_zones: [4],
        requested_zone_names: ['Архив'],
        reason: 'Доступ для работы с финансовой документацией в архиве',
        valid_from: '2025-02-01',
        is_temporary: false,
        status: 'approved',
        requested_at: '2025-01-25T09:00:00',
        processed_by: 2,
        processed_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        processed_at: '2025-01-26T10:00:00'
    },
    {
        id: 3,
        employee_id: 8,
        employee_name: 'Исмоилова Шахло Равшановна',
        department_name: 'Отдел контроля качества',
        requested_zones: [3],
        requested_zone_names: ['Серверная'],
        reason: 'Необходим доступ для проверки оборудования мониторинга качества',
        valid_from: '2025-01-27',
        valid_until: '2025-01-31',
        is_temporary: true,
        status: 'rejected',
        requested_at: '2025-01-24T14:00:00',
        processed_by: 5,
        processed_by_name: 'Назаров Фаррух Бахромович',
        processed_at: '2025-01-25T09:00:00',
        rejection_reason: 'Доступ в серверную только для сотрудников IT-отдела. Обратитесь к сисадмину для сопровождения.'
    },
    {
        id: 4,
        employee_id: 7,
        employee_name: 'Мирзаев Жасур Хамидович',
        department_name: 'Производственный отдел',
        requested_zones: [3],
        requested_zone_names: ['Серверная'],
        reason: 'Проверка подключения датчиков производственного оборудования к серверу',
        valid_from: '2025-02-03',
        valid_until: '2025-02-03',
        is_temporary: true,
        status: 'pending',
        requested_at: '2025-01-30T11:00:00'
    },
    {
        id: 5,
        employee_id: 4,
        employee_name: 'Рахимова Дилноза Алишеровна',
        department_name: 'Финансовый отдел',
        requested_zones: [5],
        requested_zone_names: ['Диспетчерская'],
        reason: 'Проведение инвентаризации оборудования в диспетчерской',
        valid_from: '2025-02-10',
        valid_until: '2025-02-10',
        is_temporary: true,
        status: 'approved',
        requested_at: '2025-01-29T15:00:00',
        processed_by: 3,
        processed_by_name: 'Юлдашев Ботир Камолович',
        processed_at: '2025-01-30T08:00:00'
    }
];

@Injectable({
    providedIn: 'root'
})
export class AccessControlService extends ApiService {
    // Пропуска
    getCards(): Observable<AccessCard[]> {
        return of(MOCK_CARDS).pipe(delay(300));
    }

    getCard(id: number): Observable<AccessCard> {
        const card = MOCK_CARDS.find((c) => c.id === id) || MOCK_CARDS[0];
        return of(card).pipe(delay(300));
    }

    createCard(data: Partial<AccessCard>): Observable<AccessCard> {
        const newCard: AccessCard = {
            id: Date.now(),
            card_number: 'АК-' + (MOCK_CARDS.length + 1).toString().padStart(3, '0'),
            employee_id: data.employee_id || 0,
            employee_name: data.employee_name || '',
            employee_code: data.employee_code || '',
            department_name: data.department_name || '',
            position_name: data.position_name || '',
            status: 'active',
            issued_at: new Date().toISOString().split('T')[0],
            valid_from: data.valid_from || new Date().toISOString().split('T')[0],
            valid_until: data.valid_until || '2030-01-01',
            access_zones: data.access_zones || [1, 2]
        };
        return of(newCard).pipe(delay(200));
    }

    updateCard(id: number, data: Partial<AccessCard>): Observable<AccessCard> {
        const existing = MOCK_CARDS.find((c) => c.id === id) || MOCK_CARDS[0];
        const updated: AccessCard = { ...existing, ...data, id };
        return of(updated).pipe(delay(200));
    }

    blockCard(id: number, reason: string): Observable<AccessCard> {
        const existing = MOCK_CARDS.find((c) => c.id === id) || MOCK_CARDS[0];
        const blocked: AccessCard = { ...existing, id, status: 'blocked', notes: reason };
        return of(blocked).pipe(delay(200));
    }

    unblockCard(id: number): Observable<AccessCard> {
        const existing = MOCK_CARDS.find((c) => c.id === id) || MOCK_CARDS[0];
        const unblocked: AccessCard = { ...existing, id, status: 'active', notes: undefined };
        return of(unblocked).pipe(delay(200));
    }

    // Зоны доступа
    getZones(): Observable<AccessZone[]> {
        return of(MOCK_ZONES).pipe(delay(300));
    }

    createZone(data: Partial<AccessZone>): Observable<AccessZone> {
        const newZone: AccessZone = {
            id: Date.now(),
            name: data.name || '',
            code: data.code || 'ZONE-NEW',
            description: data.description,
            location: data.location || '',
            security_level: data.security_level || 'standard',
            requires_escort: data.requires_escort || false,
            max_occupancy: data.max_occupancy,
            current_occupancy: 0,
            readers: [],
            is_active: true
        };
        return of(newZone).pipe(delay(200));
    }

    updateZone(id: number, data: Partial<AccessZone>): Observable<AccessZone> {
        const existing = MOCK_ZONES.find((z) => z.id === id) || MOCK_ZONES[0];
        const updated: AccessZone = { ...existing, ...data, id };
        return of(updated).pipe(delay(200));
    }

    // Журнал доступа
    getLogs(): Observable<AccessLog[]> {
        return of(MOCK_LOGS).pipe(delay(300));
    }

    // Заявки на доступ
    getRequests(): Observable<AccessRequest[]> {
        return of(MOCK_REQUESTS).pipe(delay(300));
    }

    createRequest(data: Partial<AccessRequest>): Observable<AccessRequest> {
        const newRequest: AccessRequest = {
            id: Date.now(),
            employee_id: data.employee_id || 0,
            employee_name: data.employee_name || '',
            department_name: data.department_name || '',
            requested_zones: data.requested_zones || [],
            requested_zone_names: data.requested_zone_names || [],
            reason: data.reason || '',
            valid_from: data.valid_from || new Date().toISOString().split('T')[0],
            valid_until: data.valid_until,
            is_temporary: data.is_temporary || false,
            status: 'pending',
            requested_at: new Date().toISOString()
        };
        return of(newRequest).pipe(delay(200));
    }

    approveRequest(id: number): Observable<AccessRequest> {
        const found = MOCK_REQUESTS.find((r) => r.id === id) || MOCK_REQUESTS[0];
        const approved: AccessRequest = {
            ...found,
            id,
            status: 'approved',
            processed_by: 2,
            processed_by_name: 'Ахмедова Нилуфар Бахтиёровна',
            processed_at: new Date().toISOString()
        };
        return of(approved).pipe(delay(200));
    }

    rejectRequest(id: number, reason: string): Observable<AccessRequest> {
        const found = MOCK_REQUESTS.find((r) => r.id === id) || MOCK_REQUESTS[0];
        const rejected: AccessRequest = {
            ...found,
            id,
            status: 'rejected',
            processed_by: 2,
            processed_by_name: 'Ахмедова Нилуфар Бахтиёровна',
            processed_at: new Date().toISOString(),
            rejection_reason: reason
        };
        return of(rejected).pipe(delay(200));
    }
}
