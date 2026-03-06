import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import { Vacancy, VacancyPayload, Candidate, CandidatePayload, Interview } from '@/core/interfaces/hrm/recruiting';

const API_URL = BASE_URL + '/hrm/recruiting';
const USE_MOCK = !BASE_URL;

// ===================== MOCK DATA =====================

const MOCK_VACANCIES: Vacancy[] = [
    {
        id: 1, title: 'Инженер-технолог', department_id: 1, department_name: 'Управление производством',
        position_id: 12, position_name: 'Инженер-технолог',
        description: 'Обеспечение технической эксплуатации производственных объектов Молокозавода «Чарвак». Контроль состояния пастеризаторов, сепараторов и ёмкостей.',
        requirements: 'Высшее техническое образование по специальности «Технология молочного производства». Стаж работы на молокозаводе не менее 3 лет.',
        responsibilities: 'Проведение технических осмотров, контроль параметров производственных объектов, подготовка отчётов о состоянии оборудования',
        education_requirements: 'Высшее (технология молочного производства)',
        experience_years: 3, skills: ['Технология молочного производства', 'AutoCAD', 'Мониторинг производства', 'Охрана труда'],
        salary_from: 8000000, salary_to: 12000000, employment_type: 'full_time',
        status: 'open', priority: 'high',
        requested_by: 101, requested_by_name: 'Каримов Б.Р.', request_date: '2026-01-15',
        request_justification: 'Расширение штата в связи с вводом нового производственного оборудования',
        approved_by: 200, approved_by_name: 'Директор', approved_date: '2026-01-20',
        published_at: '2026-01-25', deadline: '2026-03-31',
        publish_portals: ['ish.uz', 'hh.uz', 'molokoprom.uz'],
        applications_count: 12, interviews_count: 4, offers_count: 0,
        created_at: '2026-01-15T08:00:00Z', updated_at: '2026-02-28T10:00:00Z'
    },
    {
        id: 2, title: 'Оператор производственной линии', department_id: 1, department_name: 'Управление производством',
        position_id: 11, position_name: 'Оператор производственной линии',
        description: 'Управление работой производственного оборудования на Молокозаводе «Ходжикент». Контроль параметров сепараторов, пастеризаторов и систем регулирования.',
        requirements: 'Среднее специальное или высшее техническое образование. Опыт работы на производственных объектах от 2 лет.',
        education_requirements: 'Среднее специальное / высшее (технология молочного производства)',
        experience_years: 2, skills: ['Технология молочного производства', 'SCADA', 'Производственное оборудование', 'Автоматика'],
        salary_from: 5000000, salary_to: 7000000, employment_type: 'full_time',
        status: 'open', priority: 'urgent',
        requested_by: 101, requested_by_name: 'Каримов Б.Р.', request_date: '2026-02-01',
        request_justification: 'Замена уволившегося сотрудника. Срочно требуется оператор для сменной работы.',
        approved_by: 200, approved_by_name: 'Директор', approved_date: '2026-02-03',
        published_at: '2026-02-05', deadline: '2026-03-15',
        publish_portals: ['ish.uz', 'hh.uz'],
        applications_count: 8, interviews_count: 3, offers_count: 1,
        created_at: '2026-02-01T08:00:00Z', updated_at: '2026-02-25T14:00:00Z'
    },
    {
        id: 3, title: 'Электромонтёр по обслуживанию подстанций', department_id: 5, department_name: 'Служба подстанций и линий',
        position_id: 50, position_name: 'Электромонтёр',
        description: 'Техническое обслуживание и ремонт оборудования подстанций 110/35/10 кВ.',
        requirements: 'Среднее специальное образование (электротехника). Группа по электробезопасности не ниже IV. Опыт от 2 лет.',
        education_requirements: 'Среднее специальное (электротехника)',
        experience_years: 2, skills: ['Электромонтаж', 'Релейная защита', 'Высоковольтное оборудование', 'Охрана труда'],
        salary_from: 4500000, salary_to: 6000000, employment_type: 'full_time',
        status: 'pending_approval', priority: 'normal',
        requested_by: 150, requested_by_name: 'Нуриллаев А.С.', request_date: '2026-02-20',
        request_justification: 'Плановое расширение штата на 2026 год',
        applications_count: 0, interviews_count: 0, offers_count: 0,
        created_at: '2026-02-20T08:00:00Z', updated_at: '2026-02-20T08:00:00Z'
    },
    {
        id: 4, title: 'Инженер АСУ ТП', department_id: 6, department_name: 'Отдел автоматизации',
        position_id: 60, position_name: 'Инженер АСУ ТП',
        description: 'Разработка и сопровождение автоматизированных систем управления технологическими процессами на объектах МолокоПром.',
        requirements: 'Высшее образование (автоматизация, информатика). Знание SCADA-систем, ПЛК. Опыт от 3 лет.',
        education_requirements: 'Высшее (автоматизация, IT)',
        experience_years: 3, skills: ['SCADA', 'PLC', 'Siemens S7', 'Python', 'Сети TCP/IP', 'ОРС'],
        salary_from: 9000000, salary_to: 14000000, employment_type: 'full_time',
        status: 'closed', priority: 'high',
        requested_by: 160, requested_by_name: 'Исмаилов Р.К.', request_date: '2025-11-01',
        approved_by: 200, approved_by_name: 'Директор', approved_date: '2025-11-05',
        published_at: '2025-11-10', deadline: '2026-01-31',
        applications_count: 15, interviews_count: 6, offers_count: 1,
        closed_at: '2026-02-01T10:00:00Z', closed_reason: 'Кандидат принят на работу', hired_candidate_id: 5,
        created_at: '2025-11-01T08:00:00Z', updated_at: '2026-02-01T10:00:00Z'
    },
    {
        id: 5, title: 'Техник-метролог', department_id: 7, department_name: 'Метрологическая служба',
        position_id: 70, position_name: 'Техник-метролог',
        description: 'Поверка и калибровка средств измерений на молокозаводах. Обеспечение метрологической прослеживаемости.',
        requirements: 'Среднее специальное или высшее образование (метрология). Опыт поверки КИП от 1 года.',
        education_requirements: 'Среднее специальное / высшее (метрология)',
        experience_years: 1, skills: ['Метрология', 'КИП', 'Калибровка', 'ISO 17025'],
        salary_from: 4000000, salary_to: 5500000, employment_type: 'full_time',
        status: 'draft', priority: 'low',
        requested_by: 170, requested_by_name: 'Хасанов Д.Ф.', request_date: '2026-02-25',
        request_justification: 'Замена сотрудника, уходящего на пенсию',
        applications_count: 0, interviews_count: 0, offers_count: 0,
        created_at: '2026-02-25T08:00:00Z', updated_at: '2026-02-25T08:00:00Z'
    }
];

const MOCK_CANDIDATES: Candidate[] = [
    {
        id: 1, vacancy_id: 1, vacancy_title: 'Инженер-технолог',
        full_name: 'Юсупов Алишер Бахромович', email: 'yusupov.a@mail.uz', phone: '+998901234567',
        birth_date: '1992-05-14', address: 'г. Ташкент, Мирзо-Улугбекский р-н',
        source: 'job_portal', status: 'interview', stage: 'interview',
        education: [
            { institution: 'Ташкентский институт ирригации и мелиорации (ТИИИМ)', degree: 'Магистр', field_of_study: 'Технология молочного производства', start_year: 2010, end_year: 2015 }
        ],
        experience: [
            { company: 'Сырдарьинский молокозавод', position: 'Инженер-технолог', start_date: '2018-03-01', description: 'Контроль производственных объектов, ведение технической документации', is_current: true }
        ],
        skills: ['Технология молочного производства', 'AutoCAD', 'Мониторинг производства', 'MS Office'],
        languages: [{ language: 'Узбекский', level: 'native' }, { language: 'Русский', level: 'fluent' }, { language: 'Английский', level: 'intermediate' }],
        rating: 4.2, hr_rating: 4, technical_rating: 4.5, salary_expectation: 10000000,
        notice_period_days: 30, available_from: '2026-04-01',
        created_at: '2026-02-01T10:00:00Z', updated_at: '2026-02-20T15:00:00Z'
    },
    {
        id: 2, vacancy_id: 1, vacancy_title: 'Инженер-технолог',
        full_name: 'Турсунов Бобур Маъруфович', email: 'tursunov.b@gmail.com', phone: '+998937654321',
        birth_date: '1995-09-20', address: 'г. Чирчик, Ташкентская обл.',
        source: 'website', status: 'screening', stage: 'screening',
        education: [
            { institution: 'Национальный исследовательский университет «МЭИ» (филиал в Ташкенте)', degree: 'Бакалавр', field_of_study: 'Технология молочного производства', start_year: 2013, end_year: 2017 }
        ],
        experience: [
            { company: 'Молокозавод «Чирчик»', position: 'Техник-технолог', start_date: '2017-08-01', end_date: '2025-12-31', description: 'Техническое обслуживание производственных объектов' }
        ],
        skills: ['Технология молочного производства', 'AutoCAD', 'Охрана труда'],
        languages: [{ language: 'Узбекский', level: 'native' }, { language: 'Русский', level: 'advanced' }],
        rating: 3.5, hr_rating: 3.5, salary_expectation: 9000000,
        notice_period_days: 14, available_from: '2026-03-15',
        created_at: '2026-02-05T12:00:00Z', updated_at: '2026-02-15T09:00:00Z'
    },
    {
        id: 3, vacancy_id: 2, vacancy_title: 'Оператор производственной линии',
        full_name: 'Кадиров Шерзод Набиевич', email: 'kadirov.sh@mail.uz', phone: '+998944567890',
        birth_date: '1990-01-08', address: 'г. Ангрен, Ташкентская обл.',
        source: 'referral', status: 'offer', stage: 'offer',
        education: [
            { institution: 'Ташкентский институт пищевой промышленности', degree: 'Бакалавр', field_of_study: 'Технология молочного производства', start_year: 2008, end_year: 2012 }
        ],
        experience: [
            { company: 'Ангренский молокозавод', position: 'Оператор линии', start_date: '2012-09-01', end_date: '2025-11-30', description: 'Управление производственным оборудованием, контроль параметров' },
            { company: 'Навоийский молокозавод', position: 'Оператор', start_date: '2025-12-01', is_current: true, description: 'Управление производственным оборудованием' }
        ],
        skills: ['Технология молочного производства', 'SCADA', 'Производственное оборудование', 'Автоматика'],
        languages: [{ language: 'Узбекский', level: 'native' }, { language: 'Русский', level: 'fluent' }],
        rating: 4.5, hr_rating: 4, technical_rating: 5, cultural_fit_rating: 4.5,
        salary_expectation: 6500000, notice_period_days: 14, available_from: '2026-03-20',
        offer: {
            id: 1, candidate_id: 3, vacancy_id: 2, offered_salary: 6000000, offered_position: 'Оператор производственной линии',
            offered_department: 'Управление производством', start_date: '2026-04-01', contract_type: 'permanent',
            probation_period_months: 3, benefits: ['ДМС', 'Служебный транспорт', 'Питание'], status: 'sent',
            sent_at: '2026-02-25T10:00:00Z', expires_at: '2026-03-10T23:59:59Z', created_at: '2026-02-24T15:00:00Z'
        },
        created_at: '2026-02-10T14:00:00Z', updated_at: '2026-02-25T10:00:00Z'
    },
    {
        id: 4, vacancy_id: 2, vacancy_title: 'Оператор производственной линии',
        full_name: 'Мамадалиев Фаррух Улугбекович', email: 'mamadaliev.f@inbox.uz', phone: '+998905551234',
        birth_date: '1997-11-30', address: 'г. Олмалик, Ташкентская обл.',
        source: 'gov_portal', status: 'rejected', stage: 'closed',
        education: [
            { institution: 'Олмалыкский горно-металлургический техникум', degree: 'Среднее специальное', field_of_study: 'Электрооборудование', start_year: 2014, end_year: 2017 }
        ],
        experience: [
            { company: 'АГМК', position: 'Электромонтёр', start_date: '2017-07-01', end_date: '2025-10-31', description: 'Обслуживание электрооборудования' }
        ],
        skills: ['Электромонтаж', 'Релейная защита'],
        languages: [{ language: 'Узбекский', level: 'native' }, { language: 'Русский', level: 'intermediate' }],
        rating: 2.5, hr_rating: 3, technical_rating: 2,
        salary_expectation: 5000000,
        rejection_reason: 'Недостаточный опыт работы с производственным оборудованием', rejection_date: '2026-02-18',
        created_at: '2026-02-08T09:00:00Z', updated_at: '2026-02-18T11:00:00Z'
    },
    {
        id: 5, vacancy_id: 4, vacancy_title: 'Инженер АСУ ТП',
        full_name: 'Нурматов Жавохир Абдукаримович', email: 'nurmatov.j@gmail.com', phone: '+998971112233',
        birth_date: '1993-07-22', address: 'г. Ташкент, Чиланзарский р-н',
        source: 'direct', status: 'hired', stage: 'hired',
        education: [
            { institution: 'ТУИТ (Ташкентский университет информационных технологий)', degree: 'Магистр', field_of_study: 'Автоматизация и управление', start_year: 2011, end_year: 2016 }
        ],
        experience: [
            { company: 'Навоийский ГМК', position: 'Инженер АСУТП', start_date: '2016-08-01', end_date: '2026-01-15', description: 'Программирование ПЛК Siemens, разработка SCADA-систем' }
        ],
        skills: ['SCADA', 'Siemens S7', 'TIA Portal', 'Python', 'PostgreSQL', 'Сети TCP/IP'],
        languages: [{ language: 'Узбекский', level: 'native' }, { language: 'Русский', level: 'fluent' }, { language: 'Английский', level: 'advanced' }],
        certifications: ['Siemens Certified Programmer', 'CCNA'],
        rating: 4.8, hr_rating: 4.5, technical_rating: 5, cultural_fit_rating: 4.5,
        salary_expectation: 12000000, hired_date: '2026-02-01', employee_id: 180,
        created_at: '2025-11-15T10:00:00Z', updated_at: '2026-02-01T08:00:00Z'
    }
];

const MOCK_INTERVIEWS: Interview[] = [
    {
        id: 1, candidate_id: 1, candidate_name: 'Юсупов Алишер Бахромович', vacancy_id: 1,
        interviewer_id: 101, interviewer_name: 'Каримов Бахтиёр Рустамович',
        interview_type: 'technical', stage: 'technical',
        scheduled_at: '2026-03-05T10:00:00Z', duration_minutes: 60,
        location: 'Административное здание, каб. 305', status: 'scheduled',
        created_at: '2026-02-25T08:00:00Z'
    },
    {
        id: 2, candidate_id: 1, candidate_name: 'Юсупов Алишер Бахромович', vacancy_id: 1,
        interviewer_id: 103, interviewer_name: 'Рахимов Отабек Шухратович',
        interview_type: 'hr', stage: 'initial',
        scheduled_at: '2026-02-20T14:00:00Z', duration_minutes: 45,
        location: 'Административное здание, каб. 210', status: 'completed',
        competency_scores: [
            { competency: 'Коммуникация', score: 4, notes: 'Хорошо структурирует мысли' },
            { competency: 'Мотивация', score: 4.5, notes: 'Высокая мотивация к работе в молочной промышленности' }
        ],
        overall_rating: 4, strengths: ['Профильное образование', 'Опыт на производственных объектах', 'Хорошие коммуникативные навыки'],
        weaknesses: ['Нет опыта работы непосредственно на молокозаводе'],
        feedback: 'Кандидат показал хорошие знания и высокую мотивацию. Рекомендуется техническое собеседование.',
        recommendation: 'yes', completed_at: '2026-02-20T14:50:00Z',
        created_at: '2026-02-15T10:00:00Z'
    },
    {
        id: 3, candidate_id: 3, candidate_name: 'Кадиров Шерзод Набиевич', vacancy_id: 2,
        interviewer_id: 101, interviewer_name: 'Каримов Бахтиёр Рустамович',
        interview_type: 'technical', stage: 'technical',
        scheduled_at: '2026-02-18T10:00:00Z', duration_minutes: 90,
        location: 'Производственный цех Молокозавода «Ходжикент» (практическое)', status: 'completed',
        competency_scores: [
            { competency: 'Управление производственным оборудованием', score: 5, notes: 'Отличные знания и практические навыки' },
            { competency: 'SCADA системы', score: 4, notes: 'Уверенная работа с интерфейсом' },
            { competency: 'Безопасность', score: 5, notes: 'Высокий уровень осведомлённости' }
        ],
        overall_rating: 4.7, strengths: ['Большой практический опыт', 'Знание типового оборудования молокозавода', 'Ответственный подход к безопасности'],
        feedback: 'Отличный кандидат. Рекомендую к найму. Опыт работы на молокозаводах — сильная сторона.',
        recommendation: 'strong_yes', completed_at: '2026-02-18T11:30:00Z',
        created_at: '2026-02-12T08:00:00Z'
    },
    {
        id: 4, candidate_id: 5, candidate_name: 'Нурматов Жавохир Абдукаримович', vacancy_id: 4,
        interviewer_id: 160, interviewer_name: 'Исмаилов Рустам Камолович',
        interview_type: 'final', stage: 'final',
        scheduled_at: '2026-01-20T11:00:00Z', duration_minutes: 60,
        location: 'Конференц-зал ГО', status: 'completed',
        competency_scores: [
            { competency: 'Программирование ПЛК', score: 5 },
            { competency: 'SCADA разработка', score: 5 },
            { competency: 'Сетевые технологии', score: 4 },
            { competency: 'Аналитическое мышление', score: 5 }
        ],
        overall_rating: 4.8, strengths: ['Глубокие технические знания', 'Сертификат Siemens', 'Опыт крупных проектов'],
        feedback: 'Выдающийся кандидат. Полностью соответствует требованиям. Рекомендую принять.',
        recommendation: 'strong_yes', completed_at: '2026-01-20T12:05:00Z',
        created_at: '2026-01-15T08:00:00Z'
    }
];

const MOCK_RECRUITING_STATS = {
    total_vacancies: 5, open_vacancies: 2, closed_vacancies: 1, pending_vacancies: 2,
    total_candidates: 5, candidates_in_process: 2, hired: 1, rejected: 1, offers_sent: 1,
    avg_time_to_hire_days: 45, avg_candidates_per_vacancy: 8,
    pipeline: { new: 0, screening: 1, interview: 1, offer: 1, hired: 1, rejected: 1 },
    top_sources: [
        { source: 'job_portal', count: 2 },
        { source: 'referral', count: 1 },
        { source: 'direct', count: 1 },
        { source: 'gov_portal', count: 1 }
    ]
};

// ===================== SERVICE =====================

@Injectable({
    providedIn: 'root'
})
export class RecruitingService {
    private http = inject(HttpClient);

    // Vacancies
    getVacancies(params?: { status?: string; department_id?: number }): Observable<Vacancy[]> {
        if (USE_MOCK) {
            let result = [...MOCK_VACANCIES];
            if (params?.status) result = result.filter((v) => v.status === params.status);
            if (params?.department_id) result = result.filter((v) => v.department_id === params.department_id);
            return of(result).pipe(delay(200));
        }
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.department_id) httpParams = httpParams.set('department_id', params.department_id.toString());
        return this.http.get<Vacancy[]>(`${API_URL}/vacancies`, { params: httpParams });
    }

    getVacancyById(id: number): Observable<Vacancy> {
        if (USE_MOCK) return of(MOCK_VACANCIES.find((v) => v.id === id) || MOCK_VACANCIES[0]).pipe(delay(200));
        return this.http.get<Vacancy>(`${API_URL}/vacancies/${id}`);
    }

    createVacancy(payload: VacancyPayload): Observable<Vacancy> {
        if (USE_MOCK) {
            const newVacancy: Vacancy = {
                id: Date.now(), ...payload, department_name: 'Новый отдел', position_name: payload.title,
                description: payload.description, requirements: payload.requirements,
                status: 'draft', applications_count: 0, interviews_count: 0, offers_count: 0,
                created_at: new Date().toISOString(), updated_at: new Date().toISOString()
            };
            return of(newVacancy).pipe(delay(200));
        }
        return this.http.post<Vacancy>(`${API_URL}/vacancies`, payload);
    }

    updateVacancy(id: number, payload: Partial<VacancyPayload>): Observable<Vacancy> {
        if (USE_MOCK) {
            const vacancy = MOCK_VACANCIES.find((v) => v.id === id) || MOCK_VACANCIES[0];
            return of({ ...vacancy, ...payload, updated_at: new Date().toISOString() } as Vacancy).pipe(delay(200));
        }
        return this.http.patch<Vacancy>(`${API_URL}/vacancies/${id}`, payload);
    }

    deleteVacancy(id: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(`${API_URL}/vacancies/${id}`);
    }

    publishVacancy(id: number): Observable<Vacancy> {
        if (USE_MOCK) {
            const vacancy = MOCK_VACANCIES.find((v) => v.id === id) || MOCK_VACANCIES[0];
            return of({ ...vacancy, status: 'open' as const, published_at: new Date().toISOString(), updated_at: new Date().toISOString() }).pipe(delay(200));
        }
        return this.http.post<Vacancy>(`${API_URL}/vacancies/${id}/publish`, {});
    }

    closeVacancy(id: number): Observable<Vacancy> {
        if (USE_MOCK) {
            const vacancy = MOCK_VACANCIES.find((v) => v.id === id) || MOCK_VACANCIES[0];
            return of({ ...vacancy, status: 'closed' as const, closed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).pipe(delay(200));
        }
        return this.http.post<Vacancy>(`${API_URL}/vacancies/${id}/close`, {});
    }

    // Candidates
    getCandidates(params?: { vacancy_id?: number; status?: string }): Observable<Candidate[]> {
        if (USE_MOCK) {
            let result = [...MOCK_CANDIDATES];
            if (params?.vacancy_id) result = result.filter((c) => c.vacancy_id === params.vacancy_id);
            if (params?.status) result = result.filter((c) => c.status === params.status);
            return of(result).pipe(delay(200));
        }
        let httpParams = new HttpParams();
        if (params?.vacancy_id) httpParams = httpParams.set('vacancy_id', params.vacancy_id.toString());
        if (params?.status) httpParams = httpParams.set('status', params.status);
        return this.http.get<Candidate[]>(`${API_URL}/candidates`, { params: httpParams });
    }

    getCandidateById(id: number): Observable<Candidate> {
        if (USE_MOCK) return of(MOCK_CANDIDATES.find((c) => c.id === id) || MOCK_CANDIDATES[0]).pipe(delay(200));
        return this.http.get<Candidate>(`${API_URL}/candidates/${id}`);
    }

    createCandidate(payload: CandidatePayload, resume?: File): Observable<Candidate> {
        if (USE_MOCK) {
            const newCandidate: Candidate = {
                id: Date.now(), vacancy_id: payload.vacancy_id, full_name: payload.full_name,
                email: payload.email, phone: payload.phone, cover_letter: payload.cover_letter,
                source: payload.source, status: 'new', stage: 'application',
                created_at: new Date().toISOString(), updated_at: new Date().toISOString()
            };
            return of(newCandidate).pipe(delay(200));
        }
        const formData = new FormData();
        Object.keys(payload).forEach((key) => {
            const value = (payload as any)[key];
            if (value !== undefined && value !== null) formData.append(key, value);
        });
        if (resume) formData.append('resume', resume);
        return this.http.post<Candidate>(`${API_URL}/candidates`, formData);
    }

    updateCandidate(id: number, payload: Partial<CandidatePayload>): Observable<Candidate> {
        if (USE_MOCK) {
            const candidate = MOCK_CANDIDATES.find((c) => c.id === id) || MOCK_CANDIDATES[0];
            return of({ ...candidate, ...payload, updated_at: new Date().toISOString() } as Candidate).pipe(delay(200));
        }
        return this.http.patch<Candidate>(`${API_URL}/candidates/${id}`, payload);
    }

    deleteCandidate(id: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(`${API_URL}/candidates/${id}`);
    }

    updateCandidateStatus(id: number, status: string, notes?: string): Observable<Candidate> {
        if (USE_MOCK) {
            const candidate = MOCK_CANDIDATES.find((c) => c.id === id) || MOCK_CANDIDATES[0];
            return of({ ...candidate, status: status as any, updated_at: new Date().toISOString() }).pipe(delay(200));
        }
        return this.http.patch<Candidate>(`${API_URL}/candidates/${id}/status`, { status, notes });
    }

    getCandidateInterviews(candidateId: number): Observable<Interview[]> {
        if (USE_MOCK) return of(MOCK_INTERVIEWS.filter((i) => i.candidate_id === candidateId)).pipe(delay(200));
        return this.http.get<Interview[]>(`${API_URL}/candidates/${candidateId}/interviews`);
    }

    // Interviews
    getInterviews(): Observable<Interview[]> {
        if (USE_MOCK) return of(MOCK_INTERVIEWS).pipe(delay(200));
        return this.http.get<Interview[]>(`${API_URL}/interviews`);
    }

    createInterview(interview: Partial<Interview>): Observable<Interview> {
        if (USE_MOCK) {
            const newInterview: Interview = {
                id: Date.now(), candidate_id: 0, vacancy_id: 0, interviewer_id: 0,
                interview_type: 'hr', stage: 'initial', scheduled_at: new Date().toISOString(),
                duration_minutes: 60, status: 'scheduled', ...interview,
                created_at: new Date().toISOString()
            } as Interview;
            return of(newInterview).pipe(delay(200));
        }
        return this.http.post<Interview>(`${API_URL}/interviews`, interview);
    }

    updateInterview(id: number, data: Partial<Interview>): Observable<Interview> {
        if (USE_MOCK) {
            const interview = MOCK_INTERVIEWS.find((i) => i.id === id) || MOCK_INTERVIEWS[0];
            return of({ ...interview, ...data } as Interview).pipe(delay(200));
        }
        return this.http.patch<Interview>(`${API_URL}/interviews/${id}`, data);
    }

    // Stats
    getRecruitingStats(): Observable<any> {
        if (USE_MOCK) return of(MOCK_RECRUITING_STATS).pipe(delay(200));
        return this.http.get<any>(`${API_URL}/stats`);
    }
}
