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
    { value: 'full_time', label: 'HRM.RECRUITING.EMPLOYMENT_TYPE.FULL_TIME' },
    { value: 'part_time', label: 'HRM.RECRUITING.EMPLOYMENT_TYPE.PART_TIME' },
    { value: 'contract', label: 'HRM.RECRUITING.EMPLOYMENT_TYPE.CONTRACT' },
    { value: 'internship', label: 'HRM.RECRUITING.EMPLOYMENT_TYPE.INTERNSHIP' },
    { value: 'remote', label: 'HRM.RECRUITING.EMPLOYMENT_TYPE.REMOTE' }
];

export const VACANCY_STATUSES: { value: VacancyStatus; label: string }[] = [
    { value: 'draft', label: 'HRM.RECRUITING.VACANCY_STATUS.DRAFT' },
    { value: 'pending_approval', label: 'HRM.RECRUITING.VACANCY_STATUS.PENDING_APPROVAL' },
    { value: 'approved', label: 'HRM.RECRUITING.VACANCY_STATUS.APPROVED' },
    { value: 'open', label: 'HRM.RECRUITING.VACANCY_STATUS.OPEN' },
    { value: 'on_hold', label: 'HRM.RECRUITING.VACANCY_STATUS.ON_HOLD' },
    { value: 'closed', label: 'HRM.RECRUITING.VACANCY_STATUS.CLOSED' },
    { value: 'cancelled', label: 'HRM.RECRUITING.VACANCY_STATUS.CANCELLED' }
];

export const VACANCY_PRIORITIES: { value: VacancyPriority; label: string }[] = [
    { value: 'low', label: 'HRM.RECRUITING.PRIORITY.LOW' },
    { value: 'normal', label: 'HRM.RECRUITING.PRIORITY.NORMAL' },
    { value: 'high', label: 'HRM.RECRUITING.PRIORITY.HIGH' },
    { value: 'urgent', label: 'HRM.RECRUITING.PRIORITY.URGENT' }
];

export const CANDIDATE_STATUSES: { value: CandidateStatus; label: string }[] = [
    { value: 'new', label: 'HRM.RECRUITING.CANDIDATE_STATUS.NEW' },
    { value: 'screening', label: 'HRM.RECRUITING.CANDIDATE_STATUS.SCREENING' },
    { value: 'phone_interview', label: 'HRM.RECRUITING.CANDIDATE_STATUS.PHONE_INTERVIEW' },
    { value: 'interview', label: 'HRM.RECRUITING.CANDIDATE_STATUS.INTERVIEW' },
    { value: 'technical_test', label: 'HRM.RECRUITING.CANDIDATE_STATUS.TECHNICAL_TEST' },
    { value: 'reference_check', label: 'HRM.RECRUITING.CANDIDATE_STATUS.REFERENCE_CHECK' },
    { value: 'background_check', label: 'HRM.RECRUITING.CANDIDATE_STATUS.BACKGROUND_CHECK' },
    { value: 'offer', label: 'HRM.RECRUITING.CANDIDATE_STATUS.OFFER' },
    { value: 'offer_accepted', label: 'HRM.RECRUITING.CANDIDATE_STATUS.OFFER_ACCEPTED' },
    { value: 'hired', label: 'HRM.RECRUITING.CANDIDATE_STATUS.HIRED' },
    { value: 'rejected', label: 'HRM.RECRUITING.CANDIDATE_STATUS.REJECTED' },
    { value: 'withdrawn', label: 'HRM.RECRUITING.CANDIDATE_STATUS.WITHDRAWN' }
];

export const RECRUITING_STAGES: { value: RecruitingStage; label: string; order: number }[] = [
    { value: 'application', label: 'HRM.RECRUITING.STAGE.APPLICATION', order: 1 },
    { value: 'screening', label: 'HRM.RECRUITING.STAGE.SCREENING', order: 2 },
    { value: 'interview', label: 'HRM.RECRUITING.STAGE.INTERVIEW', order: 3 },
    { value: 'assessment', label: 'HRM.RECRUITING.STAGE.ASSESSMENT', order: 4 },
    { value: 'verification', label: 'HRM.RECRUITING.STAGE.VERIFICATION', order: 5 },
    { value: 'offer', label: 'HRM.RECRUITING.STAGE.OFFER', order: 6 },
    { value: 'hired', label: 'HRM.RECRUITING.STAGE.HIRED', order: 7 },
    { value: 'closed', label: 'HRM.RECRUITING.STAGE.CLOSED', order: 8 }
];

export const INTERVIEW_TYPES: { value: InterviewType; label: string }[] = [
    { value: 'phone', label: 'HRM.RECRUITING.INTERVIEW_TYPE.PHONE' },
    { value: 'video', label: 'HRM.RECRUITING.INTERVIEW_TYPE.VIDEO' },
    { value: 'in_person', label: 'HRM.RECRUITING.INTERVIEW_TYPE.IN_PERSON' },
    { value: 'technical', label: 'HRM.RECRUITING.INTERVIEW_TYPE.TECHNICAL' },
    { value: 'hr', label: 'HRM.RECRUITING.INTERVIEW_TYPE.HR' },
    { value: 'panel', label: 'HRM.RECRUITING.INTERVIEW_TYPE.PANEL' },
    { value: 'final', label: 'HRM.RECRUITING.INTERVIEW_TYPE.FINAL' }
];

export const INTERVIEW_RECOMMENDATIONS: { value: InterviewRecommendation; label: string; color: string }[] = [
    { value: 'strong_yes', label: 'HRM.RECRUITING.RECOMMENDATION.STRONG_YES', color: 'success' },
    { value: 'yes', label: 'HRM.RECRUITING.RECOMMENDATION.YES', color: 'info' },
    { value: 'maybe', label: 'HRM.RECRUITING.RECOMMENDATION.MAYBE', color: 'warn' },
    { value: 'no', label: 'HRM.RECRUITING.RECOMMENDATION.NO', color: 'danger' },
    { value: 'strong_no', label: 'HRM.RECRUITING.RECOMMENDATION.STRONG_NO', color: 'danger' }
];

export const OFFER_STATUSES: { value: OfferStatus; label: string }[] = [
    { value: 'draft', label: 'HRM.RECRUITING.OFFER_STATUS.DRAFT' },
    { value: 'pending_approval', label: 'HRM.RECRUITING.OFFER_STATUS.PENDING_APPROVAL' },
    { value: 'approved', label: 'HRM.RECRUITING.OFFER_STATUS.APPROVED' },
    { value: 'sent', label: 'HRM.RECRUITING.OFFER_STATUS.SENT' },
    { value: 'accepted', label: 'HRM.RECRUITING.OFFER_STATUS.ACCEPTED' },
    { value: 'declined', label: 'HRM.RECRUITING.OFFER_STATUS.DECLINED' },
    { value: 'negotiating', label: 'HRM.RECRUITING.OFFER_STATUS.NEGOTIATING' },
    { value: 'expired', label: 'HRM.RECRUITING.OFFER_STATUS.EXPIRED' },
    { value: 'withdrawn', label: 'HRM.RECRUITING.OFFER_STATUS.WITHDRAWN' }
];

export const ONBOARDING_CATEGORIES: { value: OnboardingCategory; label: string; icon: string }[] = [
    { value: 'documents', label: 'HRM.RECRUITING.ONBOARDING.CAT_DOCUMENTS', icon: 'pi pi-file' },
    { value: 'it_setup', label: 'HRM.RECRUITING.ONBOARDING.CAT_IT_SETUP', icon: 'pi pi-desktop' },
    { value: 'training', label: 'HRM.RECRUITING.ONBOARDING.CAT_TRAINING', icon: 'pi pi-book' },
    { value: 'introduction', label: 'HRM.RECRUITING.ONBOARDING.CAT_INTRODUCTION', icon: 'pi pi-users' },
    { value: 'compliance', label: 'HRM.RECRUITING.ONBOARDING.CAT_COMPLIANCE', icon: 'pi pi-shield' },
    { value: 'department', label: 'HRM.RECRUITING.ONBOARDING.CAT_DEPARTMENT', icon: 'pi pi-building' }
];

export const CANDIDATE_SOURCES: { value: CandidateSource; label: string }[] = [
    { value: 'website', label: 'HRM.RECRUITING.SOURCE.WEBSITE' },
    { value: 'job_portal', label: 'HRM.RECRUITING.SOURCE.JOB_PORTAL' },
    { value: 'gov_portal', label: 'HRM.RECRUITING.SOURCE.GOV_PORTAL' },
    { value: 'referral', label: 'HRM.RECRUITING.SOURCE.REFERRAL' },
    { value: 'agency', label: 'HRM.RECRUITING.SOURCE.AGENCY' },
    { value: 'social_media', label: 'HRM.RECRUITING.SOURCE.SOCIAL_MEDIA' },
    { value: 'direct', label: 'HRM.RECRUITING.SOURCE.DIRECT' },
    { value: 'other', label: 'HRM.RECRUITING.SOURCE.OTHER' }
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
