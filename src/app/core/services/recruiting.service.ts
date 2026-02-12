import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Candidate, Interview, JobOffer, Onboarding, Vacancy } from '@/core/interfaces/hrm/recruiting';

// Мок-данные вакансий (5 вакансий)
const MOCK_VACANCIES: Vacancy[] = [
    {
        id: 1,
        title: 'Инженер-энергетик',
        department_id: 2,
        department_name: 'Производственный отдел',
        position_id: 13,
        position_name: 'Инженер-энергетик',
        description: 'Обеспечение бесперебойного энергоснабжения производственных объектов',
        requirements: 'Высшее техническое образование, опыт работы от 3 лет, знание ПУЭ',
        responsibilities: 'Обслуживание энергетического оборудования, контроль расхода энергоресурсов, разработка мероприятий по энергосбережению',
        education_requirements: 'Высшее техническое (энергетика)',
        experience_years: 3,
        skills: ['ПУЭ', 'AutoCAD', 'Энергоаудит', 'Релейная защита'],
        salary_from: 10_000_000,
        salary_to: 14_000_000,
        employment_type: 'full_time',
        status: 'open',
        priority: 'high',
        requested_by: 3,
        requested_by_name: 'Юлдашев Ботир Камолович',
        approved_by: 1,
        approved_by_name: 'Каримов Рустам Шарипович',
        approved_date: '2025-01-10',
        published_at: '2025-01-12',
        deadline: '2025-03-01',
        publish_portals: ['hh.uz', 'ishga.uz'],
        applications_count: 8,
        interviews_count: 3,
        offers_count: 0,
        created_at: '2025-01-05',
        updated_at: '2025-01-20'
    },
    {
        id: 2,
        title: 'Программист 1С',
        department_id: 6,
        department_name: 'IT-отдел',
        position_id: 14,
        position_name: 'Программист 1С',
        description: 'Разработка и сопровождение конфигураций 1С:Предприятие',
        requirements: 'Опыт работы с 1С от 2 лет, знание УТ, ЗУП, БП',
        responsibilities: 'Доработка конфигураций, написание отчётов и обработок, интеграция с внешними системами',
        education_requirements: 'Высшее (IT или экономическое)',
        experience_years: 2,
        skills: ['1С:Предприятие', 'SQL', 'REST API', 'УТ 11', 'ЗУП 3.1'],
        salary_from: 8_000_000,
        salary_to: 12_000_000,
        employment_type: 'full_time',
        status: 'open',
        priority: 'normal',
        requested_by: 5,
        requested_by_name: 'Назаров Фаррух Бахромович',
        approved_by: 1,
        approved_by_name: 'Каримов Рустам Шарипович',
        approved_date: '2025-01-15',
        published_at: '2025-01-17',
        deadline: '2025-03-15',
        publish_portals: ['hh.uz', 'linkedin'],
        applications_count: 12,
        interviews_count: 5,
        offers_count: 1,
        created_at: '2025-01-10',
        updated_at: '2025-02-01'
    },
    {
        id: 3,
        title: 'Экономист',
        department_id: 5,
        department_name: 'Финансовый отдел',
        position_id: 15,
        position_name: 'Экономист',
        description: 'Экономический анализ и планирование деятельности предприятия',
        requirements: 'Высшее экономическое образование, опыт от 2 лет, знание Excel на продвинутом уровне',
        responsibilities: 'Составление бюджетов, расчёт себестоимости, подготовка экономических обоснований',
        education_requirements: 'Высшее экономическое',
        experience_years: 2,
        skills: ['Excel', 'Бюджетирование', 'Финансовый анализ', '1С:Бухгалтерия'],
        salary_from: 7_000_000,
        salary_to: 10_000_000,
        employment_type: 'full_time',
        status: 'pending_approval',
        priority: 'normal',
        requested_by: 4,
        requested_by_name: 'Рахимова Дилноза Алишеровна',
        request_date: '2025-02-01',
        request_justification: 'Расширение финансового отдела в связи с ростом объёмов',
        applications_count: 0,
        interviews_count: 0,
        offers_count: 0,
        created_at: '2025-02-01',
        updated_at: '2025-02-01'
    },
    {
        id: 4,
        title: 'Электромонтёр',
        department_id: 2,
        department_name: 'Производственный отдел',
        position_id: 16,
        position_name: 'Электромонтёр',
        description: 'Обслуживание и ремонт электрооборудования',
        requirements: 'Среднее специальное образование, группа по электробезопасности не ниже III',
        responsibilities: 'Плановое и аварийное обслуживание электрооборудования',
        experience_years: 1,
        skills: ['Электробезопасность', 'Электромонтаж', 'Чтение схем'],
        salary_from: 5_000_000,
        salary_to: 7_000_000,
        employment_type: 'full_time',
        status: 'closed',
        priority: 'high',
        requested_by: 3,
        requested_by_name: 'Юлдашев Ботир Камолович',
        approved_by: 1,
        approved_by_name: 'Каримов Рустам Шарипович',
        approved_date: '2024-11-01',
        published_at: '2024-11-05',
        closed_at: '2025-01-10',
        closed_reason: 'Вакансия закрыта — кандидат принят',
        hired_candidate_id: 8,
        applications_count: 15,
        interviews_count: 6,
        offers_count: 2,
        created_at: '2024-10-28',
        updated_at: '2025-01-10'
    },
    {
        id: 5,
        title: 'Лаборант',
        department_id: 3,
        department_name: 'Отдел контроля качества',
        position_id: 17,
        position_name: 'Лаборант',
        description: 'Проведение лабораторных исследований и контроль качества продукции',
        requirements: 'Высшее или среднее специальное химико-технологическое образование',
        responsibilities: 'Отбор проб, проведение анализов, ведение журналов',
        education_requirements: 'Высшее/среднее специальное (химия, технология)',
        experience_years: 0,
        skills: ['Лабораторные анализы', 'ГОСТ', 'Метрология'],
        salary_from: 4_500_000,
        salary_to: 6_000_000,
        employment_type: 'full_time',
        status: 'draft',
        priority: 'low',
        requested_by: 8,
        requested_by_name: 'Исмоилова Шахло Равшановна',
        request_date: '2025-02-05',
        request_justification: 'Замена уволившегося сотрудника',
        applications_count: 0,
        interviews_count: 0,
        offers_count: 0,
        created_at: '2025-02-05',
        updated_at: '2025-02-05'
    }
];

// Мок-данные кандидатов (10 кандидатов)
const MOCK_CANDIDATES: Candidate[] = [
    {
        id: 1,
        vacancy_id: 1,
        vacancy_title: 'Инженер-энергетик',
        full_name: 'Алимов Бобур Тохирович',
        email: 'alimov.b@mail.uz',
        phone: '+998901234501',
        source: 'job_portal',
        status: 'interview',
        stage: 'interview',
        skills: ['ПУЭ', 'AutoCAD', 'Энергоаудит'],
        salary_expectation: 12_000_000,
        rating: 4,
        hr_rating: 4,
        created_at: '2025-01-15',
        updated_at: '2025-01-28'
    },
    {
        id: 2,
        vacancy_id: 1,
        vacancy_title: 'Инженер-энергетик',
        full_name: 'Джураев Санжар Камалович',
        email: 'djuraev.s@mail.uz',
        phone: '+998901234502',
        source: 'referral',
        status: 'technical_test',
        stage: 'assessment',
        skills: ['ПУЭ', 'Релейная защита', 'SCADA'],
        salary_expectation: 13_000_000,
        rating: 5,
        hr_rating: 4,
        technical_rating: 5,
        created_at: '2025-01-16',
        updated_at: '2025-02-02'
    },
    {
        id: 3,
        vacancy_id: 1,
        vacancy_title: 'Инженер-энергетик',
        full_name: 'Норматов Азиз Хасанович',
        email: 'normatov.a@mail.uz',
        phone: '+998901234503',
        source: 'website',
        status: 'rejected',
        stage: 'closed',
        skills: ['AutoCAD'],
        salary_expectation: 14_000_000,
        rating: 2,
        rejection_reason: 'Недостаточный опыт работы',
        rejection_date: '2025-01-22',
        created_at: '2025-01-14',
        updated_at: '2025-01-22'
    },
    {
        id: 4,
        vacancy_id: 2,
        vacancy_title: 'Программист 1С',
        full_name: 'Усманова Дилфуза Рахматуллаевна',
        email: 'usmanova.d@mail.uz',
        phone: '+998901234504',
        source: 'job_portal',
        status: 'offer',
        stage: 'offer',
        skills: ['1С:Предприятие', 'SQL', 'УТ 11', 'ЗУП 3.1'],
        salary_expectation: 10_000_000,
        rating: 5,
        hr_rating: 5,
        technical_rating: 5,
        cultural_fit_rating: 4,
        created_at: '2025-01-18',
        updated_at: '2025-02-05'
    },
    {
        id: 5,
        vacancy_id: 2,
        vacancy_title: 'Программист 1С',
        full_name: 'Кадыров Тимур Равшанович',
        email: 'kadyrov.t@mail.uz',
        phone: '+998901234505',
        source: 'social_media',
        status: 'interview',
        stage: 'interview',
        skills: ['1С:Предприятие', 'SQL', 'REST API'],
        salary_expectation: 11_000_000,
        rating: 3,
        hr_rating: 3,
        created_at: '2025-01-20',
        updated_at: '2025-01-30'
    },
    {
        id: 6,
        vacancy_id: 2,
        vacancy_title: 'Программист 1С',
        full_name: 'Ражабов Нодир Файзуллаевич',
        email: 'rajabov.n@mail.uz',
        phone: '+998901234506',
        source: 'agency',
        status: 'screening',
        stage: 'screening',
        skills: ['1С:Предприятие', 'БП 3.0'],
        salary_expectation: 9_000_000,
        rating: 3,
        created_at: '2025-01-25',
        updated_at: '2025-01-26'
    },
    {
        id: 7,
        vacancy_id: 2,
        vacancy_title: 'Программист 1С',
        full_name: 'Шарипова Мадина Зафаровна',
        email: 'sharipova.m@mail.uz',
        phone: '+998901234507',
        source: 'direct',
        status: 'withdrawn',
        stage: 'closed',
        skills: ['1С:Предприятие', 'SQL'],
        salary_expectation: 12_000_000,
        created_at: '2025-01-19',
        updated_at: '2025-01-27'
    },
    {
        id: 8,
        vacancy_id: 4,
        vacancy_title: 'Электромонтёр',
        full_name: 'Мамадалиев Шерзод Бахтиёрович',
        email: 'mamadaliev.sh@mail.uz',
        phone: '+998901234508',
        source: 'gov_portal',
        status: 'hired',
        stage: 'hired',
        skills: ['Электробезопасность', 'Электромонтаж'],
        salary_expectation: 6_000_000,
        rating: 4,
        hr_rating: 4,
        technical_rating: 4,
        hired_date: '2025-01-10',
        employee_id: 13,
        created_at: '2024-11-10',
        updated_at: '2025-01-10'
    },
    {
        id: 9,
        vacancy_id: 1,
        vacancy_title: 'Инженер-энергетик',
        full_name: 'Тошматов Лазиз Абдурашидович',
        email: 'toshmatov.l@mail.uz',
        phone: '+998901234509',
        source: 'job_portal',
        status: 'new',
        stage: 'application',
        skills: ['AutoCAD', 'Энергоаудит'],
        salary_expectation: 11_000_000,
        created_at: '2025-02-01',
        updated_at: '2025-02-01'
    },
    {
        id: 10,
        vacancy_id: 2,
        vacancy_title: 'Программист 1С',
        full_name: 'Бекмуратов Жамшид Олимович',
        email: 'bekmuratov.j@mail.uz',
        phone: '+998901234510',
        source: 'referral',
        status: 'phone_interview',
        stage: 'screening',
        skills: ['1С:Предприятие', 'SQL', 'REST API', 'Python'],
        salary_expectation: 10_500_000,
        rating: 4,
        created_at: '2025-01-28',
        updated_at: '2025-02-03'
    }
];

// Мок-данные собеседований
const MOCK_INTERVIEWS: Interview[] = [
    {
        id: 1,
        candidate_id: 1,
        candidate_name: 'Алимов Бобур Тохирович',
        vacancy_id: 1,
        interviewer_id: 3,
        interviewer_name: 'Юлдашев Ботир Камолович',
        interview_type: 'technical',
        stage: 'technical',
        scheduled_at: '2025-01-25T10:00:00',
        duration_minutes: 60,
        location: 'Конференц-зал 2',
        status: 'completed',
        overall_rating: 4,
        feedback: 'Хорошие технические знания, уверенно отвечал на вопросы по ПУЭ',
        recommendation: 'yes',
        completed_at: '2025-01-25T11:05:00',
        created_at: '2025-01-20'
    },
    {
        id: 2,
        candidate_id: 2,
        candidate_name: 'Джураев Санжар Камалович',
        vacancy_id: 1,
        interviewer_id: 3,
        interviewer_name: 'Юлдашев Ботир Камолович',
        interview_type: 'technical',
        stage: 'technical',
        scheduled_at: '2025-01-27T14:00:00',
        duration_minutes: 90,
        location: 'Конференц-зал 2',
        status: 'completed',
        overall_rating: 5,
        feedback: 'Отличный кандидат. Глубокие знания релейной защиты и SCADA систем',
        recommendation: 'strong_yes',
        completed_at: '2025-01-27T15:20:00',
        created_at: '2025-01-22'
    },
    {
        id: 3,
        candidate_id: 4,
        candidate_name: 'Усманова Дилфуза Рахматуллаевна',
        vacancy_id: 2,
        interviewer_id: 5,
        interviewer_name: 'Назаров Фаррух Бахромович',
        interview_type: 'technical',
        stage: 'technical',
        scheduled_at: '2025-01-28T11:00:00',
        duration_minutes: 90,
        location: 'IT-кабинет',
        status: 'completed',
        overall_rating: 5,
        feedback: 'Превосходные знания 1С, быстро решила тестовое задание',
        recommendation: 'strong_yes',
        completed_at: '2025-01-28T12:25:00',
        created_at: '2025-01-24'
    },
    {
        id: 4,
        candidate_id: 4,
        candidate_name: 'Усманова Дилфуза Рахматуллаевна',
        vacancy_id: 2,
        interviewer_id: 2,
        interviewer_name: 'Ахмедова Нилуфар Бахтиёровна',
        interview_type: 'final',
        stage: 'final',
        scheduled_at: '2025-02-03T10:00:00',
        duration_minutes: 45,
        location: 'Кабинет директора',
        status: 'completed',
        overall_rating: 5,
        feedback: 'Рекомендую к найму. Отличное впечатление',
        recommendation: 'strong_yes',
        completed_at: '2025-02-03T10:40:00',
        created_at: '2025-01-30'
    },
    {
        id: 5,
        candidate_id: 5,
        candidate_name: 'Кадыров Тимур Равшанович',
        vacancy_id: 2,
        interviewer_id: 5,
        interviewer_name: 'Назаров Фаррух Бахромович',
        interview_type: 'technical',
        stage: 'technical',
        scheduled_at: '2025-02-10T14:00:00',
        duration_minutes: 60,
        location: 'IT-кабинет',
        status: 'scheduled',
        created_at: '2025-02-05'
    },
    {
        id: 6,
        candidate_id: 1,
        candidate_name: 'Алимов Бобур Тохирович',
        vacancy_id: 1,
        interviewer_id: 2,
        interviewer_name: 'Ахмедова Нилуфар Бахтиёровна',
        interview_type: 'hr',
        stage: 'initial',
        scheduled_at: '2025-02-06T10:00:00',
        duration_minutes: 30,
        location: 'Отдел кадров',
        status: 'completed',
        overall_rating: 4,
        feedback: 'Мотивированный кандидат, хорошие коммуникативные навыки',
        recommendation: 'yes',
        completed_at: '2025-02-06T10:35:00',
        created_at: '2025-02-01'
    }
];

// Мок-данные офферов
const MOCK_OFFERS: JobOffer[] = [
    {
        id: 1,
        candidate_id: 4,
        vacancy_id: 2,
        offered_salary: 10_000_000,
        offered_position: 'Программист 1С',
        offered_department: 'IT-отдел',
        start_date: '2025-03-01',
        contract_type: 'permanent',
        probation_period_months: 3,
        benefits: ['ДМС', 'Обед', 'Обучение за счёт компании'],
        status: 'sent',
        sent_at: '2025-02-05',
        expires_at: '2025-02-15',
        approved_by: 1,
        approved_by_name: 'Каримов Рустам Шарипович',
        approved_at: '2025-02-04',
        created_at: '2025-02-04'
    },
    {
        id: 2,
        candidate_id: 8,
        vacancy_id: 4,
        offered_salary: 6_000_000,
        offered_position: 'Электромонтёр',
        offered_department: 'Производственный отдел',
        start_date: '2025-01-10',
        contract_type: 'probation',
        probation_period_months: 2,
        benefits: ['Спецодежда', 'Обед'],
        status: 'accepted',
        sent_at: '2024-12-28',
        responded_at: '2024-12-30',
        approved_by: 1,
        approved_by_name: 'Каримов Рустам Шарипович',
        approved_at: '2024-12-27',
        signed_at: '2025-01-08',
        created_at: '2024-12-27'
    }
];

// Мок-данные адаптации
const MOCK_ONBOARDINGS: Onboarding[] = [
    {
        id: 1,
        employee_id: 13,
        employee_name: 'Мамадалиев Шерзод Бахтиёрович',
        vacancy_id: 4,
        start_date: '2025-01-10',
        end_date: '2025-03-10',
        status: 'in_progress',
        mentor_id: 7,
        mentor_name: 'Мирзаев Жасур Хамидович',
        tasks: [
            { id: 1, title: 'Оформление документов', category: 'documents', status: 'completed', completed_at: '2025-01-10' },
            { id: 2, title: 'Инструктаж по ТБ', category: 'compliance', status: 'completed', completed_at: '2025-01-11' },
            { id: 3, title: 'Знакомство с коллективом', category: 'introduction', status: 'completed', completed_at: '2025-01-12' },
            { id: 4, title: 'Обучение на рабочем месте', category: 'training', status: 'in_progress', due_date: '2025-02-10' },
            { id: 5, title: 'Получение спецодежды и инструмента', category: 'department', status: 'completed', completed_at: '2025-01-10' }
        ],
        documents_submitted: ['Паспорт', 'Диплом', 'Трудовая книжка', 'ИНН'],
        documents_pending: [],
        email_created: false,
        system_access_granted: false,
        equipment_provided: true,
        overall_progress: 65,
        created_at: '2025-01-10'
    }
];

@Injectable({
    providedIn: 'root'
})
export class RecruitingService extends ApiService {
    // --- Vacancies ---

    getVacancies(): Observable<Vacancy[]> {
        return of(MOCK_VACANCIES).pipe(delay(300));
    }

    getVacancy(id: number): Observable<Vacancy> {
        const vacancy = MOCK_VACANCIES.find((v) => v.id === id);
        return of(vacancy as Vacancy).pipe(delay(300));
    }

    createVacancy(payload: Partial<Vacancy>): Observable<Vacancy> {
        const newVacancy: Vacancy = {
            id: Date.now(),
            status: 'draft',
            applications_count: 0,
            interviews_count: 0,
            offers_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...payload
        } as Vacancy;
        return of(newVacancy).pipe(delay(200));
    }

    updateVacancy(id: number, payload: Partial<Vacancy>): Observable<Vacancy> {
        const existing = MOCK_VACANCIES.find((v) => v.id === id);
        const updated = { ...existing, ...payload, updated_at: new Date().toISOString() } as Vacancy;
        return of(updated).pipe(delay(200));
    }

    deleteVacancy(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }

    publishVacancy(id: number): Observable<Vacancy> {
        const existing = MOCK_VACANCIES.find((v) => v.id === id);
        const published = {
            ...existing,
            status: 'open' as const,
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        } as Vacancy;
        return of(published).pipe(delay(200));
    }

    closeVacancy(id: number, reason?: string): Observable<Vacancy> {
        const existing = MOCK_VACANCIES.find((v) => v.id === id);
        const closed = {
            ...existing,
            status: 'closed' as const,
            closed_at: new Date().toISOString(),
            closed_reason: reason || 'Вакансия закрыта',
            updated_at: new Date().toISOString()
        } as Vacancy;
        return of(closed).pipe(delay(200));
    }

    // --- Candidates ---

    getCandidates(): Observable<Candidate[]> {
        return of(MOCK_CANDIDATES).pipe(delay(300));
    }

    getCandidate(id: number): Observable<Candidate> {
        const candidate = MOCK_CANDIDATES.find((c) => c.id === id);
        return of(candidate as Candidate).pipe(delay(300));
    }

    createCandidate(payload: Partial<Candidate>): Observable<Candidate> {
        const newCandidate: Candidate = {
            id: Date.now(),
            status: 'new',
            stage: 'application',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...payload
        } as Candidate;
        return of(newCandidate).pipe(delay(200));
    }

    updateCandidate(id: number, payload: Partial<Candidate>): Observable<Candidate> {
        const existing = MOCK_CANDIDATES.find((c) => c.id === id);
        const updated = { ...existing, ...payload, updated_at: new Date().toISOString() } as Candidate;
        return of(updated).pipe(delay(200));
    }

    updateCandidateStage(id: number, stage: string, status: string): Observable<Candidate> {
        const existing = MOCK_CANDIDATES.find((c) => c.id === id);
        const updated = {
            ...existing,
            stage,
            status,
            updated_at: new Date().toISOString()
        } as Candidate;
        return of(updated).pipe(delay(200));
    }

    // --- Interviews ---

    getInterviews(): Observable<Interview[]> {
        return of(MOCK_INTERVIEWS).pipe(delay(300));
    }

    createInterview(payload: Partial<Interview>): Observable<Interview> {
        const newInterview: Interview = {
            id: Date.now(),
            status: 'scheduled',
            created_at: new Date().toISOString(),
            ...payload
        } as Interview;
        return of(newInterview).pipe(delay(200));
    }

    updateInterview(id: number, payload: Partial<Interview>): Observable<Interview> {
        const existing = MOCK_INTERVIEWS.find((i) => i.id === id);
        const updated = { ...existing, ...payload } as Interview;
        return of(updated).pipe(delay(200));
    }

    // --- Offers ---

    getOffers(): Observable<JobOffer[]> {
        return of(MOCK_OFFERS).pipe(delay(300));
    }

    createOffer(payload: Partial<JobOffer>): Observable<JobOffer> {
        const newOffer: JobOffer = {
            id: Date.now(),
            status: 'draft',
            created_at: new Date().toISOString(),
            ...payload
        } as JobOffer;
        return of(newOffer).pipe(delay(200));
    }

    updateOffer(id: number, payload: Partial<JobOffer>): Observable<JobOffer> {
        const existing = MOCK_OFFERS.find((o) => o.id === id);
        const updated = { ...existing, ...payload } as JobOffer;
        return of(updated).pipe(delay(200));
    }

    // --- Onboarding ---

    getOnboardings(): Observable<Onboarding[]> {
        return of(MOCK_ONBOARDINGS).pipe(delay(300));
    }

    createOnboarding(payload: Partial<Onboarding>): Observable<Onboarding> {
        const newOnboarding: Onboarding = {
            id: Date.now(),
            status: 'not_started',
            tasks: [],
            documents_submitted: [],
            documents_pending: [],
            overall_progress: 0,
            created_at: new Date().toISOString(),
            ...payload
        } as Onboarding;
        return of(newOnboarding).pipe(delay(200));
    }

    updateOnboarding(id: number, payload: Partial<Onboarding>): Observable<Onboarding> {
        const existing = MOCK_ONBOARDINGS.find((o) => o.id === id);
        const updated = { ...existing, ...payload } as Onboarding;
        return of(updated).pipe(delay(200));
    }
}
