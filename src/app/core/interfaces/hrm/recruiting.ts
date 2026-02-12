// =====================
// ВАКАНСИИ
// =====================

export interface Vacancy {
    id: number;
    title: string;
    department_id: number;
    department_name?: string;
    position_id: number;
    position_name?: string;
    description: string;
    requirements: string;
    responsibilities?: string;
    education_requirements?: string;
    experience_years?: number;
    skills?: string[];
    salary_from?: number;
    salary_to?: number;
    employment_type: EmploymentType;
    status: VacancyStatus;
    priority?: VacancyPriority;

    // Workflow
    requested_by?: number;
    requested_by_name?: string;
    request_date?: string;
    request_justification?: string;
    approved_by?: number;
    approved_by_name?: string;
    approved_date?: string;
    rejection_reason?: string;
    finance_approved?: boolean;
    finance_approved_by?: string;
    finance_approved_date?: string;

    // Publishing
    published_at?: string;
    deadline?: string;
    publish_portals?: string[];

    // Stats
    applications_count?: number;
    interviews_count?: number;
    offers_count?: number;

    closed_at?: string;
    closed_reason?: string;
    hired_candidate_id?: number;
    created_at?: string;
    updated_at?: string;
}

export interface VacancyRequest {
    id: number;
    vacancy_id?: number;
    department_id: number;
    department_name?: string;
    position_id: number;
    position_name?: string;
    requested_by: number;
    requested_by_name?: string;
    request_date: string;
    justification: string;
    headcount: number;
    urgency: VacancyPriority;
    salary_budget_from?: number;
    salary_budget_to?: number;
    status: RequestStatus;
    hr_comments?: string;
    finance_comments?: string;
    approved_by?: number;
    approved_by_name?: string;
    approved_date?: string;
    rejection_reason?: string;
}

// =====================
// КАНДИДАТЫ
// =====================

export interface Candidate {
    id: number;
    vacancy_id: number;
    vacancy_title?: string;
    full_name: string;
    email: string;
    phone: string;
    birth_date?: string;
    address?: string;
    resume_url?: string;
    photo_url?: string;
    cover_letter?: string;
    source: CandidateSource;
    status: CandidateStatus;
    stage: RecruitingStage;

    // Квалификация
    education?: Education[];
    experience?: WorkExperience[];
    skills?: string[];
    languages?: Language[];
    certifications?: string[];

    // Оценка
    rating?: number;
    hr_rating?: number;
    technical_rating?: number;
    cultural_fit_rating?: number;

    // Зарплатные ожидания
    salary_expectation?: number;
    notice_period_days?: number;
    available_from?: string;

    // Проверки
    reference_checks?: ReferenceCheck[];
    background_check?: BackgroundCheck;
    documents_verified?: boolean;

    // История
    interviews?: Interview[];
    notes?: CandidateNote[];
    status_history?: StatusChange[];

    // Оффер
    offer?: JobOffer;

    // Найм
    hired_date?: string;
    employee_id?: number;

    rejection_reason?: string;
    rejection_date?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Education {
    institution: string;
    degree: string;
    field_of_study: string;
    start_year: number;
    end_year?: number;
    is_current?: boolean;
    verified?: boolean;
}

export interface WorkExperience {
    company: string;
    position: string;
    start_date: string;
    end_date?: string;
    is_current?: boolean;
    description?: string;
    achievements?: string[];
}

export interface Language {
    language: string;
    level: LanguageLevel;
}

// =====================
// СОБЕСЕДОВАНИЯ
// =====================

export interface Interview {
    id: number;
    candidate_id: number;
    candidate_name?: string;
    vacancy_id: number;
    interviewer_id: number;
    interviewer_name?: string;
    interview_type: InterviewType;
    stage: InterviewStage;
    scheduled_at: string;
    duration_minutes: number;
    location?: string;
    meeting_link?: string;
    status: InterviewStatus;

    // Оценка
    competency_scores?: InterviewScore[];
    overall_rating?: number;
    strengths?: string[];
    weaknesses?: string[];
    feedback?: string;
    recommendation?: InterviewRecommendation;

    // Вопросы/ответы
    questions?: InterviewQuestion[];

    completed_at?: string;
    created_at?: string;
}

export interface InterviewScore {
    competency: string;
    score: number;
    notes?: string;
}

export interface InterviewQuestion {
    question: string;
    answer?: string;
    score?: number;
    notes?: string;
}

// =====================
// ПРОВЕРКИ
// =====================

export interface ReferenceCheck {
    id: number;
    candidate_id: number;
    referee_name: string;
    referee_position: string;
    referee_company: string;
    referee_phone: string;
    referee_email?: string;
    relationship: string;
    status: CheckStatus;
    contacted_at?: string;
    feedback?: string;
    rating?: number;
    verified_employment?: boolean;
    verified_position?: boolean;
    would_rehire?: boolean;
    notes?: string;
    checked_by?: number;
    checked_by_name?: string;
    completed_at?: string;
}

export interface BackgroundCheck {
    id: number;
    candidate_id: number;
    status: CheckStatus;
    criminal_record_clear?: boolean;
    education_verified?: boolean;
    employment_verified?: boolean;
    credit_check_passed?: boolean;
    initiated_at: string;
    completed_at?: string;
    notes?: string;
    documents?: string[];
}

// =====================
// ОФФЕР
// =====================

export interface JobOffer {
    id: number;
    candidate_id: number;
    vacancy_id: number;
    offered_salary: number;
    offered_position: string;
    offered_department: string;
    start_date: string;
    contract_type: ContractType;
    probation_period_months: number;
    benefits?: string[];
    bonus_structure?: string;
    other_terms?: string;

    status: OfferStatus;
    sent_at?: string;
    expires_at?: string;
    responded_at?: string;
    response_notes?: string;
    negotiation_notes?: string;

    approved_by?: number;
    approved_by_name?: string;
    approved_at?: string;

    signed_at?: string;
    created_at?: string;
}

// =====================
// АДАПТАЦИЯ
// =====================

export interface Onboarding {
    id: number;
    employee_id: number;
    employee_name?: string;
    vacancy_id?: number;
    start_date: string;
    end_date?: string;
    status: OnboardingStatus;

    // Наставник
    mentor_id?: number;
    mentor_name?: string;

    // Задачи адаптации
    tasks: OnboardingTask[];

    // Документы
    documents_submitted: string[];
    documents_pending: string[];

    // IT настройка
    email_created?: boolean;
    system_access_granted?: boolean;
    equipment_provided?: boolean;

    // Обучение
    training_sessions?: TrainingSession[];

    // Оценка прогресса
    progress_reviews?: ProgressReview[];
    overall_progress: number;

    completion_date?: string;
    notes?: string;
    created_at?: string;
}

export interface OnboardingTask {
    id: number;
    title: string;
    description?: string;
    category: OnboardingCategory;
    assigned_to?: number;
    assigned_to_name?: string;
    due_date?: string;
    status: TaskStatus;
    completed_at?: string;
    notes?: string;
}

export interface TrainingSession {
    id: number;
    title: string;
    description?: string;
    trainer_id?: number;
    trainer_name?: string;
    scheduled_at: string;
    duration_minutes: number;
    status: TaskStatus;
    feedback?: string;
    score?: number;
}

export interface ProgressReview {
    id: number;
    review_date: string;
    reviewer_id: number;
    reviewer_name?: string;
    period: string;
    performance_rating: number;
    adaptation_rating: number;
    feedback: string;
    areas_of_improvement?: string[];
    recommendations?: string;
    continue_employment: boolean;
}

export interface CandidateNote {
    id: number;
    author_id: number;
    author_name?: string;
    content: string;
    created_at: string;
}

export interface StatusChange {
    from_status: CandidateStatus;
    to_status: CandidateStatus;
    changed_by: number;
    changed_by_name?: string;
    changed_at: string;
    reason?: string;
}

// =====================
// ТИПЫ И КОНСТАНТЫ
// =====================

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote';
export type VacancyStatus = 'draft' | 'pending_approval' | 'approved' | 'open' | 'on_hold' | 'closed' | 'cancelled';
export type VacancyPriority = 'low' | 'normal' | 'high' | 'urgent';
export type RequestStatus = 'pending' | 'hr_review' | 'finance_review' | 'approved' | 'rejected';
export type CandidateSource = 'website' | 'job_portal' | 'gov_portal' | 'referral' | 'agency' | 'social_media' | 'direct' | 'other';
export type CandidateStatus = 'new' | 'screening' | 'phone_interview' | 'interview' | 'technical_test' | 'reference_check' | 'background_check' | 'offer' | 'offer_accepted' | 'hired' | 'rejected' | 'withdrawn';
export type RecruitingStage = 'application' | 'screening' | 'interview' | 'assessment' | 'verification' | 'offer' | 'hired' | 'closed';
export type InterviewType = 'phone' | 'video' | 'in_person' | 'technical' | 'hr' | 'panel' | 'final';
export type InterviewStage = 'initial' | 'technical' | 'manager' | 'final';
export type InterviewStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
export type InterviewRecommendation = 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';
export type CheckStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type OfferStatus = 'draft' | 'pending_approval' | 'approved' | 'sent' | 'accepted' | 'declined' | 'negotiating' | 'expired' | 'withdrawn';
export type ContractType = 'permanent' | 'fixed_term' | 'probation' | 'contractor';
export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'extended' | 'terminated';
export type OnboardingCategory = 'documents' | 'it_setup' | 'training' | 'introduction' | 'compliance' | 'department';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';
export type LanguageLevel = 'basic' | 'intermediate' | 'advanced' | 'fluent' | 'native';

// Константы
export const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
    { value: 'full_time', label: 'Полная занятость' },
    { value: 'part_time', label: 'Частичная занятость' },
    { value: 'contract', label: 'Контракт' },
    { value: 'internship', label: 'Стажировка' },
    { value: 'remote', label: 'Удалённая работа' }
];

export const VACANCY_STATUSES: { value: VacancyStatus; label: string }[] = [
    { value: 'draft', label: 'Черновик' },
    { value: 'pending_approval', label: 'На согласовании' },
    { value: 'approved', label: 'Согласована' },
    { value: 'open', label: 'Открыта' },
    { value: 'on_hold', label: 'Приостановлена' },
    { value: 'closed', label: 'Закрыта' },
    { value: 'cancelled', label: 'Отменена' }
];

export const VACANCY_PRIORITIES: { value: VacancyPriority; label: string }[] = [
    { value: 'low', label: 'Низкий' },
    { value: 'normal', label: 'Обычный' },
    { value: 'high', label: 'Высокий' },
    { value: 'urgent', label: 'Срочный' }
];

export const CANDIDATE_STATUSES: { value: CandidateStatus; label: string }[] = [
    { value: 'new', label: 'Новый' },
    { value: 'screening', label: 'Первичный отбор' },
    { value: 'phone_interview', label: 'Телефонное интервью' },
    { value: 'interview', label: 'Собеседование' },
    { value: 'technical_test', label: 'Техническое задание' },
    { value: 'reference_check', label: 'Проверка рекомендаций' },
    { value: 'background_check', label: 'Проверка документов' },
    { value: 'offer', label: 'Оффер' },
    { value: 'offer_accepted', label: 'Оффер принят' },
    { value: 'hired', label: 'Принят на работу' },
    { value: 'rejected', label: 'Отклонён' },
    { value: 'withdrawn', label: 'Отказ кандидата' }
];

export const RECRUITING_STAGES: { value: RecruitingStage; label: string; order: number }[] = [
    { value: 'application', label: 'Заявка', order: 1 },
    { value: 'screening', label: 'Отбор', order: 2 },
    { value: 'interview', label: 'Собеседование', order: 3 },
    { value: 'assessment', label: 'Оценка', order: 4 },
    { value: 'verification', label: 'Проверка', order: 5 },
    { value: 'offer', label: 'Оффер', order: 6 },
    { value: 'hired', label: 'Найм', order: 7 },
    { value: 'closed', label: 'Закрыто', order: 8 }
];

export const INTERVIEW_TYPES: { value: InterviewType; label: string }[] = [
    { value: 'phone', label: 'Телефонное' },
    { value: 'video', label: 'Видеозвонок' },
    { value: 'in_person', label: 'Очное' },
    { value: 'technical', label: 'Техническое' },
    { value: 'hr', label: 'HR интервью' },
    { value: 'panel', label: 'Панельное' },
    { value: 'final', label: 'Финальное' }
];

export const INTERVIEW_RECOMMENDATIONS: { value: InterviewRecommendation; label: string; color: string }[] = [
    { value: 'strong_yes', label: 'Однозначно да', color: 'success' },
    { value: 'yes', label: 'Да', color: 'info' },
    { value: 'maybe', label: 'Возможно', color: 'warn' },
    { value: 'no', label: 'Нет', color: 'danger' },
    { value: 'strong_no', label: 'Однозначно нет', color: 'danger' }
];

export const OFFER_STATUSES: { value: OfferStatus; label: string }[] = [
    { value: 'draft', label: 'Черновик' },
    { value: 'pending_approval', label: 'На согласовании' },
    { value: 'approved', label: 'Согласован' },
    { value: 'sent', label: 'Отправлен' },
    { value: 'accepted', label: 'Принят' },
    { value: 'declined', label: 'Отклонён' },
    { value: 'negotiating', label: 'Переговоры' },
    { value: 'expired', label: 'Истёк' },
    { value: 'withdrawn', label: 'Отозван' }
];

export const ONBOARDING_CATEGORIES: { value: OnboardingCategory; label: string; icon: string }[] = [
    { value: 'documents', label: 'Документы', icon: 'pi pi-file' },
    { value: 'it_setup', label: 'IT настройка', icon: 'pi pi-desktop' },
    { value: 'training', label: 'Обучение', icon: 'pi pi-book' },
    { value: 'introduction', label: 'Знакомство', icon: 'pi pi-users' },
    { value: 'compliance', label: 'Комплаенс', icon: 'pi pi-shield' },
    { value: 'department', label: 'Отдел', icon: 'pi pi-building' }
];

export const CANDIDATE_SOURCES: { value: CandidateSource; label: string }[] = [
    { value: 'website', label: 'Сайт компании' },
    { value: 'job_portal', label: 'Портал вакансий' },
    { value: 'gov_portal', label: 'Портал госслужбы' },
    { value: 'referral', label: 'Рекомендация сотрудника' },
    { value: 'agency', label: 'Кадровое агентство' },
    { value: 'social_media', label: 'Социальные сети' },
    { value: 'direct', label: 'Прямое обращение' },
    { value: 'other', label: 'Другое' }
];

// Payloads
export interface VacancyPayload {
    title: string;
    department_id: number;
    position_id: number;
    description: string;
    requirements: string;
    salary_from?: number;
    salary_to?: number;
    employment_type: EmploymentType;
}

export interface CandidatePayload {
    vacancy_id: number;
    full_name: string;
    email: string;
    phone: string;
    cover_letter?: string;
    source: CandidateSource;
}

// Screening criteria
export interface ScreeningCriteria {
    min_experience_years?: number;
    required_education?: string[];
    required_skills?: string[];
    max_salary_expectation?: number;
    location_match?: boolean;
}

export interface ScreeningResult {
    candidate_id: number;
    passed: boolean;
    score: number;
    matched_criteria: string[];
    failed_criteria: string[];
    auto_reject: boolean;
    notes?: string;
}
