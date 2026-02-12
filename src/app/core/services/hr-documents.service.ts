import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DocumentRequest, HRDocument } from '@/core/interfaces/hrm/hr-documents';

// Мок-данные: HR-документы
const MOCK_DOCUMENTS: HRDocument[] = [
    // Трудовые договоры (4)
    {
        id: 1,
        document_number: 'ТД-2023/045',
        title: 'Трудовой договор — Сафаров У.Ш.',
        type: 'employment_contract',
        category: 'personnel',
        status: 'signed',
        employee_id: 11,
        employee_name: 'Сафаров Улугбек Шухратович',
        department_id: 2,
        department_name: 'Производственный отдел',
        description: 'Трудовой договор на неопределённый срок',
        file_url: '/files/docs/td-2023-045.pdf',
        file_name: 'ТД-2023-045.pdf',
        file_size: 245000,
        file_type: 'application/pdf',
        created_by: 2,
        created_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        created_at: '2023-05-18T10:00:00',
        valid_from: '2023-05-20',
        requires_signature: true,
        signatures: [
            { id: 1, document_id: 1, signer_id: 1, signer_name: 'Каримов Рустам Шарипович', signer_position: 'Генеральный директор', status: 'signed', signed_at: '2023-05-19T09:00:00', order: 1 },
            { id: 2, document_id: 1, signer_id: 11, signer_name: 'Сафаров Улугбек Шухратович', signer_position: 'Оператор', status: 'signed', signed_at: '2023-05-19T11:00:00', order: 2 }
        ],
        version: 1,
        is_template: false,
        tags: ['трудовой договор', 'производство']
    },
    {
        id: 2,
        document_number: 'ТД-2023/052',
        title: 'Трудовой договор — Каримова З.Б.',
        type: 'employment_contract',
        category: 'personnel',
        status: 'signed',
        employee_id: 12,
        employee_name: 'Каримова Зилола Бахтияровна',
        department_id: 5,
        department_name: 'Финансовый отдел',
        description: 'Трудовой договор на неопределённый срок',
        file_url: '/files/docs/td-2023-052.pdf',
        file_name: 'ТД-2023-052.pdf',
        file_size: 238000,
        file_type: 'application/pdf',
        created_by: 2,
        created_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        created_at: '2023-08-28T10:00:00',
        valid_from: '2023-09-01',
        requires_signature: true,
        signatures: [
            { id: 3, document_id: 2, signer_id: 1, signer_name: 'Каримов Рустам Шарипович', signer_position: 'Генеральный директор', status: 'signed', signed_at: '2023-08-30T09:00:00', order: 1 },
            { id: 4, document_id: 2, signer_id: 12, signer_name: 'Каримова Зилола Бахтияровна', signer_position: 'Бухгалтер', status: 'signed', signed_at: '2023-08-30T11:00:00', order: 2 }
        ],
        version: 1,
        is_template: false,
        tags: ['трудовой договор', 'финансы']
    },
    {
        id: 3,
        document_number: 'ТД-2015/001',
        title: 'Трудовой договор — Каримов Р.Ш.',
        type: 'employment_contract',
        category: 'personnel',
        status: 'signed',
        employee_id: 1,
        employee_name: 'Каримов Рустам Шарипович',
        department_id: 1,
        department_name: 'Руководство',
        description: 'Трудовой договор генерального директора',
        file_url: '/files/docs/td-2015-001.pdf',
        file_name: 'ТД-2015-001.pdf',
        file_size: 310000,
        file_type: 'application/pdf',
        created_by: 2,
        created_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        created_at: '2015-03-10T10:00:00',
        valid_from: '2015-03-15',
        requires_signature: true,
        signatures: [{ id: 5, document_id: 3, signer_id: 1, signer_name: 'Каримов Рустам Шарипович', signer_position: 'Генеральный директор', status: 'signed', signed_at: '2015-03-14T09:00:00', order: 1 }],
        version: 1,
        is_template: false,
        tags: ['трудовой договор', 'руководство']
    },
    {
        id: 4,
        document_number: 'ТД-2025/003',
        title: 'Трудовой договор — Новый сотрудник (проект)',
        type: 'employment_contract',
        category: 'personnel',
        status: 'draft',
        department_id: 6,
        department_name: 'IT-отдел',
        description: 'Проект трудового договора для нового разработчика',
        created_by: 2,
        created_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        created_at: '2025-01-20T14:00:00',
        requires_signature: true,
        signatures: [],
        version: 1,
        is_template: false,
        tags: ['трудовой договор', 'IT', 'проект']
    },

    // Приказы (5)
    {
        id: 5,
        document_number: 'ПР-2025/001',
        title: 'Приказ о приёме на работу — Январь 2025',
        type: 'order',
        category: 'personnel',
        status: 'signed',
        description: 'Приказ о приёме 3 новых сотрудников',
        file_url: '/files/docs/pr-2025-001.pdf',
        file_name: 'ПР-2025-001.pdf',
        file_size: 125000,
        file_type: 'application/pdf',
        created_by: 2,
        created_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        created_at: '2025-01-10T09:00:00',
        valid_from: '2025-01-10',
        requires_signature: true,
        signatures: [{ id: 6, document_id: 5, signer_id: 1, signer_name: 'Каримов Рустам Шарипович', signer_position: 'Генеральный директор', status: 'signed', signed_at: '2025-01-10T10:00:00', order: 1 }],
        version: 1,
        is_template: false,
        tags: ['приказ', 'приём на работу']
    },
    {
        id: 6,
        document_number: 'ПР-2025/002',
        title: 'Приказ об увольнении — Январь 2025',
        type: 'order',
        category: 'personnel',
        status: 'signed',
        description: 'Приказ об увольнении по собственному желанию',
        file_url: '/files/docs/pr-2025-002.pdf',
        file_name: 'ПР-2025-002.pdf',
        file_size: 98000,
        file_type: 'application/pdf',
        created_by: 2,
        created_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        created_at: '2025-01-15T09:00:00',
        valid_from: '2025-01-15',
        requires_signature: true,
        signatures: [{ id: 7, document_id: 6, signer_id: 1, signer_name: 'Каримов Рустам Шарипович', signer_position: 'Генеральный директор', status: 'signed', signed_at: '2025-01-15T10:00:00', order: 1 }],
        version: 1,
        is_template: false,
        tags: ['приказ', 'увольнение']
    },
    {
        id: 7,
        document_number: 'ПР-2025/003',
        title: 'Приказ о предоставлении отпуска — Абдуллаева Г.Т.',
        type: 'order',
        category: 'personnel',
        status: 'signed',
        employee_id: 6,
        employee_name: 'Абдуллаева Гулнора Тахировна',
        department_id: 8,
        department_name: 'Юридический отдел',
        description: 'Предоставление ежегодного оплачиваемого отпуска с 13.01 по 17.01.2025',
        file_url: '/files/docs/pr-2025-003.pdf',
        file_name: 'ПР-2025-003.pdf',
        file_size: 87000,
        file_type: 'application/pdf',
        created_by: 2,
        created_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        created_at: '2025-01-09T09:00:00',
        valid_from: '2025-01-13',
        valid_until: '2025-01-17',
        requires_signature: true,
        signatures: [{ id: 8, document_id: 7, signer_id: 1, signer_name: 'Каримов Рустам Шарипович', signer_position: 'Генеральный директор', status: 'signed', signed_at: '2025-01-09T14:00:00', order: 1 }],
        version: 1,
        is_template: false,
        tags: ['приказ', 'отпуск']
    },
    {
        id: 8,
        document_number: 'ПР-2025/004',
        title: 'Приказ о направлении в командировку — Турсунов И.А.',
        type: 'order',
        category: 'personnel',
        status: 'signed',
        employee_id: 9,
        employee_name: 'Турсунов Ильхом Адхамович',
        department_id: 4,
        department_name: 'Отдел логистики',
        description: 'Направление в командировку в г. Наманган с 20.01 по 22.01.2025',
        file_url: '/files/docs/pr-2025-004.pdf',
        file_name: 'ПР-2025-004.pdf',
        file_size: 92000,
        file_type: 'application/pdf',
        created_by: 2,
        created_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        created_at: '2025-01-17T09:00:00',
        valid_from: '2025-01-20',
        valid_until: '2025-01-22',
        requires_signature: true,
        signatures: [{ id: 9, document_id: 8, signer_id: 1, signer_name: 'Каримов Рустам Шарипович', signer_position: 'Генеральный директор', status: 'signed', signed_at: '2025-01-17T11:00:00', order: 1 }],
        version: 1,
        is_template: false,
        tags: ['приказ', 'командировка']
    },
    {
        id: 9,
        document_number: 'ПР-2025/005',
        title: 'Приказ о премировании за IV квартал 2024',
        type: 'order',
        category: 'financial',
        status: 'pending_signature',
        description: 'Премирование сотрудников по итогам IV квартала 2024 года',
        file_url: '/files/docs/pr-2025-005.pdf',
        file_name: 'ПР-2025-005.pdf',
        file_size: 156000,
        file_type: 'application/pdf',
        created_by: 4,
        created_by_name: 'Рахимова Дилноза Алишеровна',
        created_at: '2025-01-25T10:00:00',
        valid_from: '2025-02-01',
        requires_signature: true,
        signatures: [
            { id: 10, document_id: 9, signer_id: 4, signer_name: 'Рахимова Дилноза Алишеровна', signer_position: 'Главный бухгалтер', status: 'signed', signed_at: '2025-01-25T10:30:00', order: 1 },
            { id: 11, document_id: 9, signer_id: 1, signer_name: 'Каримов Рустам Шарипович', signer_position: 'Генеральный директор', status: 'pending', order: 2 }
        ],
        version: 1,
        is_template: false,
        tags: ['приказ', 'премирование']
    },

    // Справки (3)
    {
        id: 10,
        document_number: 'СПР-2025/001',
        title: 'Справка о доходах — Мирзаев Ж.Х.',
        type: 'certificate',
        category: 'financial',
        status: 'signed',
        employee_id: 7,
        employee_name: 'Мирзаев Жасур Хамидович',
        department_id: 2,
        department_name: 'Производственный отдел',
        description: 'Справка о доходах за 2024 год для банка',
        file_url: '/files/docs/spr-2025-001.pdf',
        file_name: 'СПР-2025-001.pdf',
        file_size: 78000,
        file_type: 'application/pdf',
        created_by: 4,
        created_by_name: 'Рахимова Дилноза Алишеровна',
        created_at: '2025-01-12T10:00:00',
        requires_signature: true,
        signatures: [{ id: 12, document_id: 10, signer_id: 4, signer_name: 'Рахимова Дилноза Алишеровна', signer_position: 'Главный бухгалтер', status: 'signed', signed_at: '2025-01-12T11:00:00', order: 1 }],
        version: 1,
        is_template: false,
        tags: ['справка', 'доходы']
    },
    {
        id: 11,
        document_number: 'СПР-2025/002',
        title: 'Справка с места работы — Назаров Ф.Б.',
        type: 'certificate',
        category: 'personnel',
        status: 'signed',
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        department_id: 6,
        department_name: 'IT-отдел',
        description: 'Справка с места работы для посольства',
        file_url: '/files/docs/spr-2025-002.pdf',
        file_name: 'СПР-2025-002.pdf',
        file_size: 65000,
        file_type: 'application/pdf',
        created_by: 2,
        created_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        created_at: '2025-01-18T14:00:00',
        requires_signature: true,
        signatures: [{ id: 13, document_id: 11, signer_id: 2, signer_name: 'Ахмедова Нилуфар Бахтиёровна', signer_position: 'Начальник отдела кадров', status: 'signed', signed_at: '2025-01-18T15:00:00', order: 1 }],
        version: 1,
        is_template: false,
        tags: ['справка', 'место работы']
    },
    {
        id: 12,
        document_number: 'СПР-2025/003',
        title: 'Справка о стаже работы — Исмоилова Ш.Р.',
        type: 'certificate',
        category: 'personnel',
        status: 'signed',
        employee_id: 8,
        employee_name: 'Исмоилова Шахло Равшановна',
        department_id: 3,
        department_name: 'Отдел контроля качества',
        description: 'Справка о стаже работы',
        file_url: '/files/docs/spr-2025-003.pdf',
        file_name: 'СПР-2025-003.pdf',
        file_size: 54000,
        file_type: 'application/pdf',
        created_by: 2,
        created_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        created_at: '2025-01-22T09:00:00',
        requires_signature: true,
        signatures: [{ id: 14, document_id: 12, signer_id: 2, signer_name: 'Ахмедова Нилуфар Бахтиёровна', signer_position: 'Начальник отдела кадров', status: 'signed', signed_at: '2025-01-22T10:00:00', order: 1 }],
        version: 1,
        is_template: false,
        tags: ['справка', 'стаж']
    },

    // Заявления (2)
    {
        id: 13,
        document_number: 'ЗЯВ-2025/001',
        title: 'Заявление на отпуск — Абдуллаева Г.Т.',
        type: 'statement',
        category: 'personnel',
        status: 'signed',
        employee_id: 6,
        employee_name: 'Абдуллаева Гулнора Тахировна',
        department_id: 8,
        department_name: 'Юридический отдел',
        description: 'Заявление на ежегодный оплачиваемый отпуск с 13.01 по 17.01.2025',
        file_url: '/files/docs/zyav-2025-001.pdf',
        file_name: 'ЗЯВ-2025-001.pdf',
        file_size: 42000,
        file_type: 'application/pdf',
        created_by: 6,
        created_by_name: 'Абдуллаева Гулнора Тахировна',
        created_at: '2025-01-06T09:00:00',
        requires_signature: false,
        version: 1,
        is_template: false,
        tags: ['заявление', 'отпуск']
    },
    {
        id: 14,
        document_number: 'ЗЯВ-2025/002',
        title: 'Заявление на отпуск — Хасанова М.О.',
        type: 'statement',
        category: 'personnel',
        status: 'signed',
        employee_id: 10,
        employee_name: 'Хасанова Малика Обидовна',
        department_id: 7,
        department_name: 'Отдел кадров',
        description: 'Заявление на ежегодный оплачиваемый отпуск с 06.01 по 10.01.2025',
        file_url: '/files/docs/zyav-2025-002.pdf',
        file_name: 'ЗЯВ-2025-002.pdf',
        file_size: 41000,
        file_type: 'application/pdf',
        created_by: 10,
        created_by_name: 'Хасанова Малика Обидовна',
        created_at: '2024-12-25T09:00:00',
        requires_signature: false,
        version: 1,
        is_template: false,
        tags: ['заявление', 'отпуск']
    },

    // Служебные записки (2)
    {
        id: 15,
        document_number: 'СЗ-2025/001',
        title: 'Служебная записка — Запрос на новое оборудование',
        type: 'memo',
        category: 'administrative',
        status: 'signed',
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        department_id: 6,
        department_name: 'IT-отдел',
        description: 'Запрос на приобретение серверного оборудования',
        file_url: '/files/docs/sz-2025-001.pdf',
        file_name: 'СЗ-2025-001.pdf',
        file_size: 68000,
        file_type: 'application/pdf',
        created_by: 5,
        created_by_name: 'Назаров Фаррух Бахромович',
        created_at: '2025-01-08T11:00:00',
        requires_signature: false,
        version: 1,
        is_template: false,
        tags: ['служебная записка', 'оборудование', 'IT']
    },
    {
        id: 16,
        document_number: 'СЗ-2025/002',
        title: 'Служебная записка — Обновление регламента',
        type: 'memo',
        category: 'administrative',
        status: 'archived',
        employee_id: 3,
        employee_name: 'Юлдашев Ботир Камолович',
        department_id: 2,
        department_name: 'Производственный отдел',
        description: 'Предложение по обновлению регламента производственного процесса',
        file_url: '/files/docs/sz-2025-002.pdf',
        file_name: 'СЗ-2025-002.pdf',
        file_size: 95000,
        file_type: 'application/pdf',
        created_by: 3,
        created_by_name: 'Юлдашев Ботир Камолович',
        created_at: '2025-01-05T10:00:00',
        requires_signature: false,
        version: 1,
        is_template: false,
        tags: ['служебная записка', 'регламент', 'производство']
    },

    // Положение (1)
    {
        id: 17,
        document_number: 'ПЛЖ-2024/003',
        title: 'Положение о внутреннем трудовом распорядке',
        type: 'regulation',
        category: 'regulatory',
        status: 'signed',
        description: 'Правила внутреннего трудового распорядка организации',
        file_url: '/files/docs/plzh-2024-003.pdf',
        file_name: 'ПЛЖ-2024-003.pdf',
        file_size: 420000,
        file_type: 'application/pdf',
        created_by: 2,
        created_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        created_at: '2024-06-01T10:00:00',
        valid_from: '2024-07-01',
        requires_signature: true,
        signatures: [{ id: 15, document_id: 17, signer_id: 1, signer_name: 'Каримов Рустам Шарипович', signer_position: 'Генеральный директор', status: 'signed', signed_at: '2024-06-28T09:00:00', order: 1 }],
        version: 2,
        is_template: false,
        tags: ['положение', 'трудовой распорядок']
    },

    // Инструкция (1)
    {
        id: 18,
        document_number: 'ИНС-2024/005',
        title: 'Инструкция по охране труда на производстве',
        type: 'instruction',
        category: 'regulatory',
        status: 'signed',
        department_id: 2,
        department_name: 'Производственный отдел',
        description: 'Инструкция по технике безопасности и охране труда для работников производственного отдела',
        file_url: '/files/docs/ins-2024-005.pdf',
        file_name: 'ИНС-2024-005.pdf',
        file_size: 380000,
        file_type: 'application/pdf',
        created_by: 3,
        created_by_name: 'Юлдашев Ботир Камолович',
        created_at: '2024-09-15T10:00:00',
        valid_from: '2024-10-01',
        requires_signature: true,
        signatures: [
            { id: 16, document_id: 18, signer_id: 1, signer_name: 'Каримов Рустам Шарипович', signer_position: 'Генеральный директор', status: 'signed', signed_at: '2024-09-28T09:00:00', order: 1 },
            { id: 17, document_id: 18, signer_id: 3, signer_name: 'Юлдашев Ботир Камолович', signer_position: 'Начальник производства', status: 'signed', signed_at: '2024-09-27T09:00:00', order: 2 }
        ],
        version: 1,
        is_template: false,
        tags: ['инструкция', 'охрана труда', 'производство']
    }
];

// Мок-данные: запросы на документы
const MOCK_REQUESTS: DocumentRequest[] = [
    {
        id: 1,
        document_type: 'certificate',
        employee_id: 7,
        employee_name: 'Мирзаев Жасур Хамидович',
        department_name: 'Производственный отдел',
        purpose: 'Для получения кредита в банке',
        status: 'completed',
        requested_at: '2025-01-10T09:00:00',
        processed_at: '2025-01-12T10:00:00',
        processed_by: 2,
        processed_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        document_id: 10,
        copies_count: 1
    },
    {
        id: 2,
        document_type: 'certificate',
        employee_id: 5,
        employee_name: 'Назаров Фаррух Бахромович',
        department_name: 'IT-отдел',
        purpose: 'Для посольства (получение визы)',
        status: 'completed',
        requested_at: '2025-01-16T14:00:00',
        processed_at: '2025-01-18T14:00:00',
        processed_by: 2,
        processed_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        document_id: 11,
        copies_count: 2
    },
    {
        id: 3,
        document_type: 'certificate',
        employee_id: 8,
        employee_name: 'Исмоилова Шахло Равшановна',
        department_name: 'Отдел контроля качества',
        purpose: 'Для предоставления в другую организацию',
        status: 'completed',
        requested_at: '2025-01-20T09:00:00',
        processed_at: '2025-01-22T09:00:00',
        processed_by: 2,
        processed_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        document_id: 12,
        copies_count: 1
    },
    {
        id: 4,
        document_type: 'certificate',
        employee_id: 9,
        employee_name: 'Турсунов Ильхом Адхамович',
        department_name: 'Отдел логистики',
        purpose: 'Для оформления ипотеки',
        status: 'pending',
        requested_at: '2025-01-28T10:00:00',
        copies_count: 1
    },
    {
        id: 5,
        document_type: 'employment_contract',
        employee_id: 12,
        employee_name: 'Каримова Зилола Бахтияровна',
        department_name: 'Финансовый отдел',
        purpose: 'Копия трудового договора для личных целей',
        status: 'rejected',
        requested_at: '2025-01-22T11:00:00',
        processed_at: '2025-01-23T09:00:00',
        processed_by: 2,
        processed_by_name: 'Ахмедова Нилуфар Бахтиёровна',
        rejection_reason: 'Необходимо предоставить письменное обоснование',
        copies_count: 1
    }
];

@Injectable({
    providedIn: 'root'
})
export class HRDocumentsService extends ApiService {
    // Документы
    getDocuments(): Observable<HRDocument[]> {
        return of(MOCK_DOCUMENTS).pipe(delay(300));
    }

    getDocument(id: number): Observable<HRDocument> {
        const doc = MOCK_DOCUMENTS.find((d) => d.id === id) || MOCK_DOCUMENTS[0];
        return of(doc).pipe(delay(300));
    }

    createDocument(formData: FormData): Observable<HRDocument> {
        const newDoc: HRDocument = {
            id: Date.now(),
            document_number: 'НОВ-' + Date.now(),
            title: 'Новый документ',
            type: 'other',
            category: 'personnel',
            status: 'draft',
            created_by: 2,
            created_by_name: 'Ахмедова Нилуфар Бахтиёровна',
            created_at: new Date().toISOString(),
            requires_signature: false,
            version: 1,
            is_template: false
        };
        return of(newDoc).pipe(delay(200));
    }

    updateDocument(id: number, data: Partial<HRDocument>): Observable<HRDocument> {
        const existing = MOCK_DOCUMENTS.find((d) => d.id === id) || MOCK_DOCUMENTS[0];
        const updated: HRDocument = { ...existing, ...data, id };
        return of(updated).pipe(delay(200));
    }

    deleteDocument(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    downloadDocument(id: number): Observable<Blob> {
        return of(new Blob()).pipe(delay(300));
    }

    // Запросы на документы
    getRequests(): Observable<DocumentRequest[]> {
        return of(MOCK_REQUESTS).pipe(delay(300));
    }

    createRequest(data: Partial<DocumentRequest>): Observable<DocumentRequest> {
        const newRequest: DocumentRequest = {
            id: Date.now(),
            document_type: data.document_type || 'certificate',
            employee_id: data.employee_id || 0,
            employee_name: data.employee_name || '',
            department_name: data.department_name || '',
            purpose: data.purpose,
            status: 'pending',
            requested_at: new Date().toISOString(),
            copies_count: data.copies_count || 1
        };
        return of(newRequest).pipe(delay(200));
    }

    approveRequest(id: number): Observable<DocumentRequest> {
        const found = MOCK_REQUESTS.find((r) => r.id === id) || MOCK_REQUESTS[0];
        const approved: DocumentRequest = {
            ...found,
            id,
            status: 'in_progress',
            processed_at: new Date().toISOString(),
            processed_by: 2,
            processed_by_name: 'Ахмедова Нилуфар Бахтиёровна'
        };
        return of(approved).pipe(delay(200));
    }

    rejectRequest(id: number, reason: string): Observable<DocumentRequest> {
        const found = MOCK_REQUESTS.find((r) => r.id === id) || MOCK_REQUESTS[0];
        const rejected: DocumentRequest = {
            ...found,
            id,
            status: 'rejected',
            processed_at: new Date().toISOString(),
            processed_by: 2,
            processed_by_name: 'Ахмедова Нилуфар Бахтиёровна',
            rejection_reason: reason
        };
        return of(rejected).pipe(delay(200));
    }
}
