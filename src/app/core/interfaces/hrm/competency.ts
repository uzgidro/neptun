// =====================
// БАЗОВЫЕ ИНТЕРФЕЙСЫ КОМПЕТЕНЦИЙ
// =====================

export interface Competency {
    id: number;
    name: string;
    description: string;
    category: CompetencyCategory;
    level_definitions: LevelDefinition[];
    created_at?: string;
    updated_at?: string;
}

export interface LevelDefinition {
    level: number;
    name: string;
    description: string;
}

// =====================
// СЕССИЯ ОЦЕНКИ (ASSESSMENT CENTER)
// =====================

export interface AssessmentSession {
    id: number;
    name: string;
    description?: string;
    session_date: string;
    start_time: string;
    end_time: string;
    location?: string;
    status: SessionStatus;

    // Компетенции для оценки
    competencies_to_assess: SessionCompetency[];

    // Участники
    candidates: SessionCandidate[];

    // Ассессоры (оценщики)
    assessors: SessionAssessor[];

    // Блоки оценки
    assessment_blocks: AssessmentBlock[];

    // Расписание
    schedule: ScheduleItem[];

    created_by?: number;
    created_by_name?: string;
    created_at?: string;
    updated_at?: string;
}

export interface SessionCompetency {
    competency_id: number;
    competency_name: string;
    category: CompetencyCategory;
    weight: number; // Вес компетенции в общей оценке (0-100)
}

export interface SessionCandidate {
    employee_id: number;
    employee_name: string;
    department_id?: number;
    department_name?: string;
    position_name?: string;
    invitation_status: InvitationStatus;
    invitation_sent_at?: string;
    response_at?: string;
    decline_reason?: string;
}

export interface SessionAssessor {
    assessor_id: number;
    assessor_name: string;
    role: AssessorRole;
    assigned_blocks: number[]; // IDs блоков, за которые отвечает
}

export interface ScheduleItem {
    id: number;
    block_id: number;
    block_name: string;
    start_time: string;
    end_time: string;
    room?: string;
    participants: number[]; // employee_ids
}

// =====================
// БЛОКИ ОЦЕНКИ
// =====================

export interface AssessmentBlock {
    id: number;
    session_id: number;
    block_type: BlockType;
    name: string;
    description?: string;
    duration_minutes: number;
    order: number;
    status: BlockStatus;

    // Связанные компетенции
    competencies: number[]; // competency_ids

    // Содержимое блока
    content?: BlockContent;

    // Результаты
    results?: BlockResult[];
}

export interface BlockContent {
    // Для письменного тестирования
    questions?: TestQuestion[];

    // Для интервью
    interview_questions?: InterviewQuestion[];

    // Для группового обсуждения
    group_task?: GroupTask;

    // Для деловой игры
    business_case?: BusinessCase;
}

export interface TestQuestion {
    id: number;
    question: string;
    question_type: QuestionType;
    options?: string[];
    correct_answer?: string | string[];
    points: number;
    competency_id: number;
}

export interface InterviewQuestion {
    id: number;
    question: string;
    competency_id: number;
    expected_behavior: string;
    scoring_guide: string;
}

export interface GroupTask {
    title: string;
    description: string;
    duration_minutes: number;
    evaluation_criteria: string[];
    competencies_assessed: number[];
}

export interface BusinessCase {
    title: string;
    scenario: string;
    background_info: string;
    tasks: string[];
    resources_provided?: string[];
    evaluation_criteria: string[];
    competencies_assessed: number[];
}

export interface BlockResult {
    employee_id: number;
    employee_name: string;
    scores: CompetencyBlockScore[];
    notes?: string;
    assessor_id: number;
    assessor_name: string;
    evaluated_at: string;
}

export interface CompetencyBlockScore {
    competency_id: number;
    competency_name: string;
    score: number; // 1-5
    observations?: string;
}

// =====================
// ОЦЕНКА КОМПЕТЕНЦИЙ (ИНДИВИДУАЛЬНАЯ)
// =====================

export interface CompetencyAssessment {
    id: number;
    session_id?: number;
    employee_id: number;
    employee_name: string;
    department_name?: string;
    position_name?: string;
    assessor_id: number;
    assessor_name?: string;
    assessment_date: string;
    assessment_type: AssessmentType;
    status: AssessmentStatus;
    overall_score?: number;
    competency_scores: CompetencyScore[];
    feedback?: string;
    development_recommendations?: string;
    strengths?: string[];
    development_areas?: string[];
    career_recommendations?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CompetencyScore {
    id: number;
    assessment_id: number;
    competency_id: number;
    competency_name?: string;
    category?: CompetencyCategory;
    expected_level: number;
    actual_level: number;
    gap: number;
    notes?: string;
}

// =====================
// ОТЧЁТ ПО ОЦЕНКЕ
// =====================

export interface AssessmentReport {
    id: number;
    session_id?: number;
    employee_id: number;
    employee_name: string;
    department_name?: string;
    position_name?: string;
    assessment_date: string;
    report_generated_at: string;

    // Общие результаты
    overall_score: number;
    percentile_rank?: number; // Место среди всех оцениваемых

    // Детальные оценки по компетенциям
    competency_results: CompetencyResult[];

    // Результаты по блокам
    block_results: BlockSummary[];

    // Сильные стороны
    strengths: StrengthItem[];

    // Области развития
    development_areas: DevelopmentArea[];

    // Рекомендации
    career_recommendations: string;
    training_recommendations: string[];

    // Сравнение с целевым профилем
    target_comparison?: TargetComparison;
}

export interface CompetencyResult {
    competency_id: number;
    competency_name: string;
    category: CompetencyCategory;
    score: number;
    max_score: number;
    percentage: number;
    trend?: 'up' | 'down' | 'stable'; // Сравнение с предыдущей оценкой
    previous_score?: number;
}

export interface BlockSummary {
    block_id: number;
    block_name: string;
    block_type: BlockType;
    score: number;
    max_score: number;
    percentage: number;
    notes?: string;
}

export interface StrengthItem {
    competency_id: number;
    competency_name: string;
    score: number;
    description: string;
}

export interface DevelopmentArea {
    competency_id: number;
    competency_name: string;
    current_level: number;
    target_level: number;
    gap: number;
    priority: 'high' | 'medium' | 'low';
    recommended_actions: string[];
}

export interface TargetComparison {
    position_id: number;
    position_name: string;
    overall_fit_percentage: number;
    competency_gaps: {
        competency_id: number;
        competency_name: string;
        required_level: number;
        actual_level: number;
        gap: number;
    }[];
}

// =====================
// ПЛАН РАЗВИТИЯ
// =====================

export interface DevelopmentPlan {
    id: number;
    employee_id: number;
    employee_name: string;
    assessment_id?: number;
    session_id?: number;
    created_date: string;
    start_date: string;
    end_date: string;
    status: PlanStatus;

    // Целевые уровни компетенций
    competency_targets: CompetencyTarget[];

    // Мероприятия по развитию
    development_activities: DevelopmentActivity[];

    // Наставники/коучи
    mentors: MentorAssignment[];

    // Промежуточные оценки
    interim_assessments: InterimAssessment[];

    // Прогресс
    overall_progress: number; // 0-100%

    notes?: string;
    created_by?: number;
    created_by_name?: string;
    approved_by?: number;
    approved_by_name?: string;
    approved_at?: string;
}

export interface CompetencyTarget {
    competency_id: number;
    competency_name: string;
    category: CompetencyCategory;
    current_level: number;
    target_level: number;
    deadline?: string;
    progress: number; // 0-100%
    current_achieved_level?: number;
}

export interface DevelopmentActivity {
    id: number;
    activity_type: ActivityType;
    title: string;
    description?: string;
    competencies: number[]; // competency_ids
    start_date?: string;
    end_date?: string;
    status: ActivityStatus;
    provider?: string; // Внешний провайдер или внутренний
    cost?: number;
    notes?: string;
    completion_date?: string;
    result?: string;
}

export interface MentorAssignment {
    mentor_id: number;
    mentor_name: string;
    mentor_position?: string;
    role: MentorRole;
    competencies: number[]; // Компетенции, по которым менторит
    start_date: string;
    end_date?: string;
    meeting_frequency?: string;
    notes?: string;
}

export interface InterimAssessment {
    id: number;
    assessment_date: string;
    assessor_id: number;
    assessor_name: string;
    competency_scores: {
        competency_id: number;
        competency_name: string;
        score: number;
        notes?: string;
    }[];
    overall_progress: number;
    feedback: string;
    recommendations?: string;
}

// =====================
// МОНИТОРИНГ
// =====================

export interface ProgressTracking {
    employee_id: number;
    employee_name: string;
    plan_id: number;
    tracking_date: string;

    // Прогресс по компетенциям
    competency_progress: {
        competency_id: number;
        competency_name: string;
        initial_level: number;
        current_level: number;
        target_level: number;
        progress_percentage: number;
    }[];

    // Выполненные мероприятия
    completed_activities: number;
    total_activities: number;

    // Следующие шаги
    upcoming_activities: {
        activity_id: number;
        title: string;
        due_date: string;
    }[];

    // Запланированные оценки
    upcoming_assessments: {
        date: string;
        type: string;
    }[];
}

// =====================
// ТИПЫ И КОНСТАНТЫ
// =====================

export type CompetencyCategory = 'technical' | 'soft' | 'leadership' | 'functional' | 'core';
export type AssessmentType = 'self' | 'manager' | '360' | 'technical_test' | 'interview' | 'assessment_center';
export type AssessmentStatus = 'draft' | 'in_progress' | 'completed' | 'reviewed' | 'approved';
export type SessionStatus = 'planning' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type InvitationStatus = 'pending' | 'accepted' | 'declined';
export type AssessorRole = 'lead' | 'observer' | 'expert';
export type BlockType = 'written_test' | 'interview' | 'group_discussion' | 'business_game' | 'presentation' | 'case_study';
export type BlockStatus = 'pending' | 'in_progress' | 'completed';
export type QuestionType = 'single_choice' | 'multiple_choice' | 'open' | 'case';
export type PlanStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ActivityType = 'training' | 'course' | 'mentoring' | 'coaching' | 'self_study' | 'project' | 'rotation' | 'conference';
export type ActivityStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';
export type MentorRole = 'mentor' | 'coach' | 'buddy';

// Стандартные компетенции для оценки
export const STANDARD_COMPETENCIES: { id: number; name: string; category: CompetencyCategory }[] = [
    { id: 1, name: 'Коммуникация', category: 'soft' },
    { id: 2, name: 'Лидерство', category: 'leadership' },
    { id: 3, name: 'Аналитическое мышление', category: 'core' },
    { id: 4, name: 'Принятие решений', category: 'core' },
    { id: 5, name: 'Работа в команде', category: 'soft' },
    { id: 6, name: 'Профессиональные знания', category: 'technical' },
    { id: 7, name: 'Управление временем', category: 'soft' },
    { id: 8, name: 'Стрессоустойчивость', category: 'soft' },
    { id: 9, name: 'Креативность', category: 'core' },
    { id: 10, name: 'Клиентоориентированность', category: 'functional' }
];

export const COMPETENCY_CATEGORIES: { value: CompetencyCategory; label: string }[] = [
    { value: 'technical', label: 'Технические' },
    { value: 'soft', label: 'Soft skills' },
    { value: 'leadership', label: 'Лидерские' },
    { value: 'functional', label: 'Функциональные' },
    { value: 'core', label: 'Ключевые' }
];

export const ASSESSMENT_TYPES: { value: AssessmentType; label: string }[] = [
    { value: 'self', label: 'Самооценка' },
    { value: 'manager', label: 'Оценка руководителя' },
    { value: '360', label: 'Оценка 360°' },
    { value: 'technical_test', label: 'Техническое тестирование' },
    { value: 'interview', label: 'Интервью' },
    { value: 'assessment_center', label: 'Ассессмент-центр' }
];

export const ASSESSMENT_STATUSES: { value: AssessmentStatus; label: string }[] = [
    { value: 'draft', label: 'Черновик' },
    { value: 'in_progress', label: 'В процессе' },
    { value: 'completed', label: 'Завершена' },
    { value: 'reviewed', label: 'Проверена' },
    { value: 'approved', label: 'Утверждена' }
];

export const SESSION_STATUSES: { value: SessionStatus; label: string }[] = [
    { value: 'planning', label: 'Планирование' },
    { value: 'scheduled', label: 'Запланирована' },
    { value: 'in_progress', label: 'В процессе' },
    { value: 'completed', label: 'Завершена' },
    { value: 'cancelled', label: 'Отменена' }
];

export const BLOCK_TYPES: { value: BlockType; label: string; icon: string }[] = [
    { value: 'written_test', label: 'Письменное тестирование', icon: 'pi pi-file-edit' },
    { value: 'interview', label: 'Интервью по компетенциям', icon: 'pi pi-comments' },
    { value: 'group_discussion', label: 'Групповое обсуждение', icon: 'pi pi-users' },
    { value: 'business_game', label: 'Деловая игра', icon: 'pi pi-briefcase' },
    { value: 'presentation', label: 'Презентация', icon: 'pi pi-desktop' },
    { value: 'case_study', label: 'Кейс-анализ', icon: 'pi pi-book' }
];

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
    { value: 'training', label: 'Тренинг' },
    { value: 'course', label: 'Курс обучения' },
    { value: 'mentoring', label: 'Менторинг' },
    { value: 'coaching', label: 'Коучинг' },
    { value: 'self_study', label: 'Самообучение' },
    { value: 'project', label: 'Проектная работа' },
    { value: 'rotation', label: 'Ротация' },
    { value: 'conference', label: 'Конференция' }
];

export const PLAN_STATUSES: { value: PlanStatus; label: string }[] = [
    { value: 'draft', label: 'Черновик' },
    { value: 'active', label: 'Активен' },
    { value: 'on_hold', label: 'Приостановлен' },
    { value: 'completed', label: 'Завершен' },
    { value: 'cancelled', label: 'Отменен' }
];

// Для совместимости с существующим кодом
export interface CompetencyMatrix {
    id: number;
    position_id: number;
    position_name?: string;
    competencies: PositionCompetency[];
    created_at?: string;
}

export interface PositionCompetency {
    competency_id: number;
    competency_name: string;
    required_level: number;
    is_critical: boolean;
}

export interface CompetencyPayload {
    name: string;
    description: string;
    category: CompetencyCategory;
    level_definitions: LevelDefinition[];
}

export interface AssessmentPayload {
    employee_id: number;
    assessment_type: AssessmentType;
    competency_scores: {
        competency_id: number;
        actual_level: number;
        notes?: string;
    }[];
    feedback?: string;
}
