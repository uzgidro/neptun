import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { Vacancy, Candidate, Interview, JobOffer, Onboarding } from '@/core/interfaces/hrm/recruiting';

const RECRUITING = '/hrm/recruiting';
const USE_MOCK = !BASE_URL;

// =====================
// MOCK DATA
// =====================

const MOCK_VACANCIES: Vacancy[] = [
    {
        id: 1,
        title: 'Главный инженер производственного оборудования',
        department_id: 10,
        department_name: 'Молокозавод «Чирчик»',
        position_id: 101,
        position_name: 'Главный инженер',
        description: 'Руководство эксплуатацией и техническим обслуживанием производственного оборудования Молокозавода «Чирчик» мощностью 620 тонн/ч.',
        requirements: 'Высшее техническое образование (молочное производство), стаж работы от 10 лет, опыт управления производственным оборудованием мощностью от 100 тонн/ч.',
        employment_type: 'full_time',
        status: 'open',
        priority: 'high',
        salary_from: 15000000,
        salary_to: 25000000,
        applications_count: 12,
        interviews_count: 4,
        offers_count: 1,
        published_at: '2026-01-15T09:00:00Z',
        deadline: '2026-04-01T23:59:59Z',
        created_at: '2026-01-10T08:00:00Z',
        updated_at: '2026-02-20T14:30:00Z'
    },
    {
        id: 2,
        title: 'Инженер-механик',
        department_id: 11,
        department_name: 'Молокозавод «Джизак»',
        position_id: 102,
        position_name: 'Инженер-механик',
        description: 'Обслуживание технологических систем и технологического оборудования Молокозавода «Джизак».',
        requirements: 'Высшее техническое образование, стаж от 5 лет, допуск к работе с промышленным оборудованием.',
        employment_type: 'full_time',
        status: 'open',
        priority: 'normal',
        salary_from: 8000000,
        salary_to: 12000000,
        applications_count: 8,
        interviews_count: 2,
        offers_count: 0,
        published_at: '2026-02-01T09:00:00Z',
        deadline: '2026-03-31T23:59:59Z',
        created_at: '2026-01-28T10:00:00Z',
        updated_at: '2026-02-15T11:00:00Z'
    },
    {
        id: 3,
        title: 'Специалист по охране труда',
        department_id: 12,
        department_name: 'Управление безопасности',
        position_id: 103,
        position_name: 'Специалист по ОТ и ТБ',
        description: 'Организация и контроль мероприятий по охране труда и промышленной безопасности на молочных предприятиях.',
        requirements: 'Высшее образование в области охраны труда или техносферной безопасности, стаж от 3 лет.',
        employment_type: 'full_time',
        status: 'draft',
        priority: 'normal',
        salary_from: 7000000,
        salary_to: 10000000,
        applications_count: 0,
        interviews_count: 0,
        offers_count: 0,
        created_at: '2026-02-25T08:00:00Z',
        updated_at: '2026-02-25T08:00:00Z'
    },
    {
        id: 4,
        title: 'Оператор производственных линий',
        department_id: 13,
        department_name: 'Молокозавод «Андижан»',
        position_id: 104,
        position_name: 'Оператор',
        description: 'Управление работой производственных линий, контроль параметров выработки продукции.',
        requirements: 'Среднее специальное или высшее техническое образование, опыт работы на молокозаводе от 2 лет.',
        employment_type: 'full_time',
        status: 'closed',
        priority: 'low',
        salary_from: 5000000,
        salary_to: 8000000,
        applications_count: 15,
        interviews_count: 6,
        offers_count: 1,
        published_at: '2025-11-01T09:00:00Z',
        deadline: '2026-01-31T23:59:59Z',
        closed_at: '2026-02-10T16:00:00Z',
        closed_reason: 'Кандидат принят на должность',
        hired_candidate_id: 5,
        created_at: '2025-10-28T08:00:00Z',
        updated_at: '2026-02-10T16:00:00Z'
    }
];

const MOCK_CANDIDATES: Candidate[] = [
    {
        id: 1,
        vacancy_id: 1,
        vacancy_title: 'Главный инженер производственного оборудования',
        full_name: 'Рахимов Алишер Маратович',
        email: 'rakhimov.a@mail.uz',
        phone: '+998901234567',
        source: 'job_portal',
        status: 'interview',
        stage: 'interview',
        rating: 4.5,
        skills: ['Молочное производство', 'Управление персоналом', 'AutoCAD', 'SCADA'],
        salary_expectation: 22000000,
        created_at: '2026-01-20T10:00:00Z',
        updated_at: '2026-02-18T14:00:00Z'
    },
    {
        id: 2,
        vacancy_id: 1,
        vacancy_title: 'Главный инженер производственного оборудования',
        full_name: 'Норматов Бобур Шухратович',
        email: 'normatov.b@mail.uz',
        phone: '+998931112233',
        source: 'referral',
        status: 'technical_test',
        stage: 'assessment',
        rating: 4.0,
        skills: ['Производственные линии', 'Техническое обслуживание', 'Электроника'],
        salary_expectation: 20000000,
        created_at: '2026-01-22T11:00:00Z',
        updated_at: '2026-02-20T09:00:00Z'
    },
    {
        id: 3,
        vacancy_id: 2,
        vacancy_title: 'Инженер-механик',
        full_name: 'Юлдашева Дилноза Камоловна',
        email: 'yuldasheva.d@mail.uz',
        phone: '+998942223344',
        source: 'website',
        status: 'screening',
        stage: 'screening',
        rating: 3.5,
        skills: ['Электротехника', 'Трансформаторы', 'Высоковольтное оборудование'],
        salary_expectation: 10000000,
        created_at: '2026-02-05T08:30:00Z',
        updated_at: '2026-02-10T10:00:00Z'
    },
    {
        id: 4,
        vacancy_id: 2,
        vacancy_title: 'Инженер-механик',
        full_name: 'Хасанов Фаррух Тимурович',
        email: 'khasanov.f@mail.uz',
        phone: '+998905556677',
        source: 'gov_portal',
        status: 'offer',
        stage: 'offer',
        rating: 4.8,
        skills: ['Электроснабжение', 'Релейная защита', 'АСУ ТП', 'SCADA'],
        salary_expectation: 11000000,
        created_at: '2026-02-03T09:00:00Z',
        updated_at: '2026-02-28T15:00:00Z'
    },
    {
        id: 5,
        vacancy_id: 4,
        vacancy_title: 'Оператор производственных линий',
        full_name: 'Мирзаев Жавохир Абдуллаевич',
        email: 'mirzaev.j@mail.uz',
        phone: '+998977778899',
        source: 'direct',
        status: 'hired',
        stage: 'hired',
        rating: 4.2,
        skills: ['Производственные линии', 'Мониторинг', 'Техобслуживание'],
        hired_date: '2026-02-10T09:00:00Z',
        employee_id: 1050,
        created_at: '2025-11-10T08:00:00Z',
        updated_at: '2026-02-10T09:00:00Z'
    }
];

const MOCK_INTERVIEWS: Interview[] = [
    {
        id: 1,
        candidate_id: 1,
        candidate_name: 'Рахимов Алишер Маратович',
        vacancy_id: 1,
        interviewer_id: 50,
        interviewer_name: 'Каримов Бахтиёр Рустамович',
        interview_type: 'technical',
        stage: 'technical',
        scheduled_at: '2026-03-05T10:00:00Z',
        duration_minutes: 60,
        location: 'Молокозавод «Чирчик», кабинет 204',
        status: 'scheduled',
        overall_rating: undefined,
        recommendation: undefined,
        created_at: '2026-02-25T14:00:00Z'
    },
    {
        id: 2,
        candidate_id: 2,
        candidate_name: 'Норматов Бобур Шухратович',
        vacancy_id: 1,
        interviewer_id: 51,
        interviewer_name: 'Сафаров Отабек Рашидович',
        interview_type: 'hr',
        stage: 'initial',
        scheduled_at: '2026-02-20T14:00:00Z',
        duration_minutes: 45,
        location: 'Головной офис, переговорная 3',
        status: 'completed',
        overall_rating: 4.0,
        recommendation: 'yes',
        feedback: 'Хороший кандидат, имеет релевантный опыт в молочном производстве. Рекомендуется к техническому собеседованию.',
        completed_at: '2026-02-20T15:00:00Z',
        created_at: '2026-02-15T10:00:00Z'
    },
    {
        id: 3,
        candidate_id: 4,
        candidate_name: 'Хасанов Фаррух Тимурович',
        vacancy_id: 2,
        interviewer_id: 52,
        interviewer_name: 'Ташматов Рустам Ильхомович',
        interview_type: 'final',
        stage: 'final',
        scheduled_at: '2026-02-27T11:00:00Z',
        duration_minutes: 90,
        location: 'Молокозавод «Джизак», кабинет директора',
        status: 'completed',
        overall_rating: 4.8,
        recommendation: 'strong_yes',
        feedback: 'Отличный специалист с глубокими знаниями в технологии и автоматизации производства. Настоятельно рекомендуется к найму.',
        completed_at: '2026-02-27T12:30:00Z',
        created_at: '2026-02-22T09:00:00Z'
    }
];

const MOCK_OFFERS: JobOffer[] = [
    {
        id: 1,
        candidate_id: 4,
        vacancy_id: 2,
        offered_salary: 11500000,
        offered_position: 'Инженер-механик',
        offered_department: 'Молокозавод «Джизак»',
        start_date: '2026-04-01',
        contract_type: 'permanent',
        probation_period_months: 3,
        benefits: ['ДМС', 'Служебный транспорт', 'Питание'],
        status: 'sent',
        sent_at: '2026-03-01T10:00:00Z',
        expires_at: '2026-03-15T23:59:59Z',
        approved_by: 50,
        approved_by_name: 'Каримов Бахтиёр Рустамович',
        approved_at: '2026-02-28T16:00:00Z',
        created_at: '2026-02-28T14:00:00Z'
    },
    {
        id: 2,
        candidate_id: 5,
        vacancy_id: 4,
        offered_salary: 7000000,
        offered_position: 'Оператор производственных линий',
        offered_department: 'Молокозавод «Андижан»',
        start_date: '2026-02-10',
        contract_type: 'permanent',
        probation_period_months: 3,
        benefits: ['ДМС', 'Питание'],
        status: 'accepted',
        sent_at: '2026-01-25T10:00:00Z',
        responded_at: '2026-01-28T09:00:00Z',
        signed_at: '2026-02-05T10:00:00Z',
        approved_by: 53,
        approved_by_name: 'Абдуллаев Нодир Бахтиёрович',
        approved_at: '2026-01-24T15:00:00Z',
        created_at: '2026-01-24T12:00:00Z'
    }
];

const MOCK_ONBOARDINGS: Onboarding[] = [
    {
        id: 1,
        employee_id: 1050,
        employee_name: 'Мирзаев Жавохир Абдуллаевич',
        vacancy_id: 4,
        start_date: '2026-02-10',
        end_date: '2026-05-10',
        status: 'in_progress',
        mentor_id: 55,
        mentor_name: 'Исмоилов Сардор Бахромович',
        tasks: [
            { id: 1, title: 'Оформление документов в отделе кадров', category: 'documents', status: 'completed', completed_at: '2026-02-10T12:00:00Z' },
            { id: 2, title: 'Получение пропуска и спецодежды', category: 'compliance', status: 'completed', completed_at: '2026-02-10T15:00:00Z' },
            { id: 3, title: 'Настройка рабочего места и доступов', category: 'it_setup', status: 'completed', completed_at: '2026-02-11T10:00:00Z' },
            { id: 4, title: 'Инструктаж по технике безопасности на молокозаводе', category: 'compliance', status: 'completed', completed_at: '2026-02-12T14:00:00Z' },
            { id: 5, title: 'Знакомство с коллективом и руководством', category: 'introduction', status: 'completed', completed_at: '2026-02-13T11:00:00Z' },
            { id: 6, title: 'Обучение работе с АСУ ТП производственных линий', category: 'training', status: 'in_progress', due_date: '2026-03-15' },
            { id: 7, title: 'Стажировка на рабочем месте под наблюдением наставника', category: 'department', status: 'pending', due_date: '2026-04-10' },
            { id: 8, title: 'Сдача экзамена по эксплуатации производственных линий', category: 'training', status: 'pending', due_date: '2026-05-01' }
        ],
        documents_submitted: ['Паспорт', 'Диплом', 'Трудовая книжка', 'ИНН', 'Медицинская справка'],
        documents_pending: ['Сертификат по ТБ', 'Допуск к высоте'],
        email_created: true,
        system_access_granted: true,
        equipment_provided: true,
        overall_progress: 62,
        created_at: '2026-02-10T08:00:00Z'
    }
];

/**
 * @deprecated Use `HrmRecruitingService` from `@/core/services/hrm/recruiting.service` instead.
 * This service is kept for backward compatibility with existing components.
 */
@Injectable({
    providedIn: 'root'
})
export class RecruitingService extends ApiService {
    // Vacancies
    getVacancies(): Observable<Vacancy[]> {
        if (USE_MOCK) return of(MOCK_VACANCIES).pipe(delay(200));
        return this.http.get<Vacancy[]>(BASE_URL + RECRUITING + '/vacancies');
    }

    getVacancy(id: number): Observable<Vacancy> {
        if (USE_MOCK) return of(MOCK_VACANCIES.find((v) => v.id === id) ?? MOCK_VACANCIES[0]).pipe(delay(200));
        return this.http.get<Vacancy>(BASE_URL + RECRUITING + '/vacancies/' + id);
    }

    createVacancy(data: Partial<Vacancy>): Observable<Vacancy> {
        if (USE_MOCK) return of({ ...MOCK_VACANCIES[0], ...data, id: Date.now() } as Vacancy).pipe(delay(200));
        return this.http.post<Vacancy>(BASE_URL + RECRUITING + '/vacancies', data);
    }

    updateVacancy(id: number, data: Partial<Vacancy>): Observable<Vacancy> {
        if (USE_MOCK) return of({ ...MOCK_VACANCIES[0], ...data, id } as Vacancy).pipe(delay(200));
        return this.http.patch<Vacancy>(BASE_URL + RECRUITING + '/vacancies/' + id, data);
    }

    deleteVacancy(id: number): Observable<any> {
        if (USE_MOCK) return of({ success: true }).pipe(delay(200));
        return this.http.delete(BASE_URL + RECRUITING + '/vacancies/' + id);
    }

    publishVacancy(id: number): Observable<Vacancy> {
        if (USE_MOCK) return of({ ...(MOCK_VACANCIES.find((v) => v.id === id) ?? MOCK_VACANCIES[0]), status: 'open' as const, published_at: new Date().toISOString() }).pipe(delay(200));
        return this.http.post<Vacancy>(BASE_URL + RECRUITING + '/vacancies/' + id + '/publish', {});
    }

    closeVacancy(id: number): Observable<Vacancy> {
        if (USE_MOCK) return of({ ...(MOCK_VACANCIES.find((v) => v.id === id) ?? MOCK_VACANCIES[0]), status: 'closed' as const, closed_at: new Date().toISOString() }).pipe(delay(200));
        return this.http.post<Vacancy>(BASE_URL + RECRUITING + '/vacancies/' + id + '/close', {});
    }

    // Candidates
    getCandidates(): Observable<Candidate[]> {
        if (USE_MOCK) return of(MOCK_CANDIDATES).pipe(delay(200));
        return this.http.get<Candidate[]>(BASE_URL + RECRUITING + '/candidates');
    }

    getCandidate(id: number): Observable<Candidate> {
        if (USE_MOCK) return of(MOCK_CANDIDATES.find((c) => c.id === id) ?? MOCK_CANDIDATES[0]).pipe(delay(200));
        return this.http.get<Candidate>(BASE_URL + RECRUITING + '/candidates/' + id);
    }

    createCandidate(data: Partial<Candidate>): Observable<Candidate> {
        if (USE_MOCK) return of({ ...MOCK_CANDIDATES[0], ...data, id: Date.now() } as Candidate).pipe(delay(200));
        return this.http.post<Candidate>(BASE_URL + RECRUITING + '/candidates', data);
    }

    updateCandidate(id: number, data: Partial<Candidate>): Observable<Candidate> {
        if (USE_MOCK) return of({ ...MOCK_CANDIDATES[0], ...data, id } as Candidate).pipe(delay(200));
        return this.http.patch<Candidate>(BASE_URL + RECRUITING + '/candidates/' + id, data);
    }

    updateCandidateStage(id: number, stage: string): Observable<Candidate> {
        if (USE_MOCK) return of({ ...(MOCK_CANDIDATES.find((c) => c.id === id) ?? MOCK_CANDIDATES[0]), stage: stage as any, id } as Candidate).pipe(delay(200));
        return this.http.post<Candidate>(BASE_URL + RECRUITING + '/candidates/' + id + '/stage', { stage });
    }

    // Interviews
    getInterviews(): Observable<Interview[]> {
        if (USE_MOCK) return of(MOCK_INTERVIEWS).pipe(delay(200));
        return this.http.get<Interview[]>(BASE_URL + RECRUITING + '/interviews');
    }

    createInterview(data: Partial<Interview>): Observable<Interview> {
        if (USE_MOCK) return of({ ...MOCK_INTERVIEWS[0], ...data, id: Date.now() } as Interview).pipe(delay(200));
        return this.http.post<Interview>(BASE_URL + RECRUITING + '/interviews', data);
    }

    updateInterview(id: number, data: Partial<Interview>): Observable<Interview> {
        if (USE_MOCK) return of({ ...MOCK_INTERVIEWS[0], ...data, id } as Interview).pipe(delay(200));
        return this.http.patch<Interview>(BASE_URL + RECRUITING + '/interviews/' + id, data);
    }

    // Job Offers
    getOffers(): Observable<JobOffer[]> {
        if (USE_MOCK) return of(MOCK_OFFERS).pipe(delay(200));
        return this.http.get<JobOffer[]>(BASE_URL + RECRUITING + '/offers');
    }

    createOffer(data: Partial<JobOffer>): Observable<JobOffer> {
        if (USE_MOCK) return of({ ...MOCK_OFFERS[0], ...data, id: Date.now() } as JobOffer).pipe(delay(200));
        return this.http.post<JobOffer>(BASE_URL + RECRUITING + '/offers', data);
    }

    updateOffer(id: number, data: Partial<JobOffer>): Observable<JobOffer> {
        if (USE_MOCK) return of({ ...MOCK_OFFERS[0], ...data, id } as JobOffer).pipe(delay(200));
        return this.http.patch<JobOffer>(BASE_URL + RECRUITING + '/offers/' + id, data);
    }

    // Onboarding
    getOnboardings(): Observable<Onboarding[]> {
        if (USE_MOCK) return of(MOCK_ONBOARDINGS).pipe(delay(200));
        return this.http.get<Onboarding[]>(BASE_URL + RECRUITING + '/onboardings');
    }

    createOnboarding(data: Partial<Onboarding>): Observable<Onboarding> {
        if (USE_MOCK) return of({ ...MOCK_ONBOARDINGS[0], ...data, id: Date.now() } as Onboarding).pipe(delay(200));
        return this.http.post<Onboarding>(BASE_URL + RECRUITING + '/onboardings', data);
    }

    updateOnboarding(id: number, data: Partial<Onboarding>): Observable<Onboarding> {
        if (USE_MOCK) return of({ ...MOCK_ONBOARDINGS[0], ...data, id } as Onboarding).pipe(delay(200));
        return this.http.patch<Onboarding>(BASE_URL + RECRUITING + '/onboardings/' + id, data);
    }
}
