import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { Tooltip } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { Rating } from 'primeng/rating';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { ProgressBar } from 'primeng/progressbar';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { Textarea } from 'primeng/textarea';
import { AccordionModule } from 'primeng/accordion';
import { Timeline } from 'primeng/timeline';
import { KnobModule } from 'primeng/knob';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import {
    AssessmentSession,
    AssessmentBlock,
    CompetencyAssessment,
    AssessmentReport,
    DevelopmentPlan,
    SessionCandidate,
    BlockResult,
    CompetencyBlockScore,
    STANDARD_COMPETENCIES,
    ASSESSMENT_TYPES,
    ASSESSMENT_STATUSES,
    SESSION_STATUSES,
    BLOCK_TYPES,
    ACTIVITY_TYPES,
    PLAN_STATUSES,
    COMPETENCY_CATEGORIES,
    SessionStatus,
    BlockType,
    PlanStatus,
    ActivityType,
    AssessmentStatus
} from '@/core/interfaces/hrm/competency';

@Component({
    selector: 'app-competency-assessment',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonDirective,
        IconField,
        InputIcon,
        InputText,
        ReactiveFormsModule,
        FormsModule,
        DeleteConfirmationComponent,
        Tooltip,
        Tag,
        Rating,
        Card,
        Dialog,
        TabsModule,
        ProgressBar,
        MultiSelect,
        Select,
        DatePicker,
        InputNumber,
        Textarea,
        AccordionModule,
        Timeline,
        KnobModule
    ],
    templateUrl: './competency-assessment.component.html',
    styleUrl: './competency-assessment.component.scss'
})
export class CompetencyAssessmentComponent implements OnInit, OnDestroy {
    // =====================
    // ДАННЫЕ
    // =====================
    sessions: AssessmentSession[] = [];
    assessments: CompetencyAssessment[] = [];
    developmentPlans: DevelopmentPlan[] = [];
    loading: boolean = true;

    // Активная вкладка
    activeTabIndex: number = 0;

    // Диалоги
    displaySessionDialog: boolean = false;
    displayBlockDialog: boolean = false;
    displayEvaluationDialog: boolean = false;
    displayReportDialog: boolean = false;
    displayPlanDialog: boolean = false;
    displayDeleteDialog: boolean = false;
    displayCandidateDialog: boolean = false;
    displayMonitoringDialog: boolean = false;

    // Текущие объекты
    selectedSession: AssessmentSession | null = null;
    selectedBlock: AssessmentBlock | null = null;
    selectedAssessment: CompetencyAssessment | null = null;
    selectedPlan: DevelopmentPlan | null = null;
    currentReport: AssessmentReport | null = null;

    // Формы
    sessionForm: FormGroup;
    blockForm: FormGroup;
    evaluationForm: FormGroup;
    planForm: FormGroup;
    activityForm: FormGroup;

    submitted: boolean = false;
    isEditMode: boolean = false;
    private nextId = 100;

    // Справочники
    employees = [
        { id: 1, name: 'Иванов Иван Иванович', department: 'IT отдел', position: 'Старший разработчик' },
        { id: 2, name: 'Петров Петр Петрович', department: 'IT отдел', position: 'Разработчик' },
        { id: 3, name: 'Сидорова Анна Михайловна', department: 'Бухгалтерия', position: 'Главный бухгалтер' },
        { id: 4, name: 'Козлов Алексей Сергеевич', department: 'Юридический отдел', position: 'Юрист' },
        { id: 5, name: 'Новикова Елена Владимировна', department: 'Отдел продаж', position: 'Менеджер по продажам' },
        { id: 6, name: 'Морозов Дмитрий Александрович', department: 'IT отдел', position: 'DevOps инженер' },
        { id: 7, name: 'Волкова Ольга Николаевна', department: 'Бухгалтерия', position: 'Бухгалтер' },
        { id: 8, name: 'Соколов Андрей Викторович', department: 'Администрация', position: 'Генеральный директор' }
    ];

    assessors = [
        { id: 9, name: 'Кузнецов Сергей Павлович', role: 'HR-директор' },
        { id: 10, name: 'Михайлова Татьяна Ивановна', role: 'HR-специалист' },
        { id: 11, name: 'Федоров Игорь Анатольевич', role: 'Внешний консультант' }
    ];

    standardCompetencies = STANDARD_COMPETENCIES;
    assessmentTypes = ASSESSMENT_TYPES;
    assessmentStatuses = ASSESSMENT_STATUSES;
    sessionStatuses = SESSION_STATUSES;
    blockTypes = BLOCK_TYPES;
    activityTypes = ACTIVITY_TYPES;
    planStatuses = PLAN_STATUSES;
    competencyCategories = COMPETENCY_CATEGORIES;

    // Оценки кандидата (для диалога оценки)
    candidateScores: { [competencyId: number]: number } = {};
    candidateNotes: { [competencyId: number]: string } = {};
    evaluatingCandidate: SessionCandidate | null = null;
    evaluatingBlock: AssessmentBlock | null = null;

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.sessionForm = this.fb.group({
            name: ['', Validators.required],
            description: [''],
            session_date: [null, Validators.required],
            start_time: ['09:00', Validators.required],
            end_time: ['18:00', Validators.required],
            location: [''],
            competencies: [[], Validators.required],
            candidates: [[], Validators.required],
            assessors: [[], Validators.required]
        });

        this.blockForm = this.fb.group({
            block_type: [null, Validators.required],
            name: ['', Validators.required],
            description: [''],
            duration_minutes: [60, [Validators.required, Validators.min(15)]],
            competencies: [[], Validators.required]
        });

        this.evaluationForm = this.fb.group({
            general_notes: ['']
        });

        this.planForm = this.fb.group({
            employee_id: [null, Validators.required],
            start_date: [null, Validators.required],
            end_date: [null, Validators.required],
            competency_targets: [[]],
            notes: ['']
        });

        this.activityForm = this.fb.group({
            activity_type: [null, Validators.required],
            title: ['', Validators.required],
            description: [''],
            competencies: [[]],
            start_date: [null],
            end_date: [null],
            provider: ['']
        });
    }

    ngOnInit() {
        this.loadMockData();
    }

    private loadMockData(): void {
        setTimeout(() => {
            // Mock сессии оценки
            this.sessions = [
                {
                    id: 1,
                    name: 'Ассессмент-центр Q1 2025',
                    description: 'Оценка кадрового резерва на руководящие позиции',
                    session_date: '2025-02-15',
                    start_time: '09:00',
                    end_time: '18:00',
                    location: 'Конференц-зал А',
                    status: 'completed',
                    competencies_to_assess: [
                        { competency_id: 1, competency_name: 'Коммуникация', category: 'soft', weight: 15 },
                        { competency_id: 2, competency_name: 'Лидерство', category: 'leadership', weight: 20 },
                        { competency_id: 3, competency_name: 'Аналитическое мышление', category: 'core', weight: 15 },
                        { competency_id: 4, competency_name: 'Принятие решений', category: 'core', weight: 20 },
                        { competency_id: 5, competency_name: 'Работа в команде', category: 'soft', weight: 15 },
                        { competency_id: 6, competency_name: 'Профессиональные знания', category: 'technical', weight: 15 }
                    ],
                    candidates: [
                        { employee_id: 1, employee_name: 'Иванов Иван Иванович', department_id: 1, department_name: 'IT отдел', position_name: 'Старший разработчик', invitation_status: 'accepted', invitation_sent_at: '2025-01-20', response_at: '2025-01-21' },
                        { employee_id: 4, employee_name: 'Козлов Алексей Сергеевич', department_id: 3, department_name: 'Юридический отдел', position_name: 'Юрист', invitation_status: 'accepted', invitation_sent_at: '2025-01-20', response_at: '2025-01-22' },
                        { employee_id: 6, employee_name: 'Морозов Дмитрий Александрович', department_id: 1, department_name: 'IT отдел', position_name: 'DevOps инженер', invitation_status: 'accepted', invitation_sent_at: '2025-01-20', response_at: '2025-01-21' }
                    ],
                    assessors: [
                        { assessor_id: 9, assessor_name: 'Кузнецов Сергей Павлович', role: 'lead', assigned_blocks: [1, 2, 3, 4] },
                        { assessor_id: 10, assessor_name: 'Михайлова Татьяна Ивановна', role: 'observer', assigned_blocks: [1, 2, 3, 4] }
                    ],
                    assessment_blocks: [
                        { id: 1, session_id: 1, block_type: 'written_test', name: 'Письменное тестирование', description: 'Профессиональные знания и аналитика', duration_minutes: 60, order: 1, status: 'completed', competencies: [3, 6] },
                        { id: 2, session_id: 1, block_type: 'interview', name: 'Интервью по компетенциям', description: 'Оценка soft skills и лидерства', duration_minutes: 45, order: 2, status: 'completed', competencies: [1, 2] },
                        { id: 3, session_id: 1, block_type: 'group_discussion', name: 'Групповое обсуждение', description: 'Решение бизнес-кейса в группе', duration_minutes: 90, order: 3, status: 'completed', competencies: [1, 5] },
                        { id: 4, session_id: 1, block_type: 'business_game', name: 'Деловая игра', description: 'Симуляция управленческих решений', duration_minutes: 120, order: 4, status: 'completed', competencies: [2, 4] }
                    ],
                    schedule: [
                        { id: 1, block_id: 1, block_name: 'Письменное тестирование', start_time: '09:00', end_time: '10:00', room: 'Аудитория 1', participants: [1, 4, 6] },
                        { id: 2, block_id: 2, block_name: 'Интервью по компетенциям', start_time: '10:30', end_time: '12:30', room: 'Переговорная', participants: [1, 4, 6] },
                        { id: 3, block_id: 3, block_name: 'Групповое обсуждение', start_time: '13:30', end_time: '15:00', room: 'Конференц-зал А', participants: [1, 4, 6] },
                        { id: 4, block_id: 4, block_name: 'Деловая игра', start_time: '15:30', end_time: '17:30', room: 'Конференц-зал А', participants: [1, 4, 6] }
                    ],
                    created_by: 9,
                    created_by_name: 'Кузнецов Сергей Павлович',
                    created_at: '2025-01-15'
                },
                {
                    id: 2,
                    name: 'Ассессмент-центр Q2 2025',
                    description: 'Оценка специалистов отдела продаж',
                    session_date: '2025-04-20',
                    start_time: '09:00',
                    end_time: '17:00',
                    location: 'Конференц-зал Б',
                    status: 'scheduled',
                    competencies_to_assess: [
                        { competency_id: 1, competency_name: 'Коммуникация', category: 'soft', weight: 25 },
                        { competency_id: 4, competency_name: 'Принятие решений', category: 'core', weight: 20 },
                        { competency_id: 5, competency_name: 'Работа в команде', category: 'soft', weight: 20 },
                        { competency_id: 10, competency_name: 'Клиентоориентированность', category: 'functional', weight: 35 }
                    ],
                    candidates: [
                        { employee_id: 5, employee_name: 'Новикова Елена Владимировна', department_id: 4, department_name: 'Отдел продаж', position_name: 'Менеджер по продажам', invitation_status: 'accepted', invitation_sent_at: '2025-03-15', response_at: '2025-03-16' },
                        { employee_id: 7, employee_name: 'Волкова Ольга Николаевна', department_id: 2, department_name: 'Бухгалтерия', position_name: 'Бухгалтер', invitation_status: 'pending', invitation_sent_at: '2025-03-15' }
                    ],
                    assessors: [
                        { assessor_id: 10, assessor_name: 'Михайлова Татьяна Ивановна', role: 'lead', assigned_blocks: [5, 6] }
                    ],
                    assessment_blocks: [
                        { id: 5, session_id: 2, block_type: 'interview', name: 'Интервью', duration_minutes: 45, order: 1, status: 'pending', competencies: [1, 10] },
                        { id: 6, session_id: 2, block_type: 'business_game', name: 'Ролевая игра: Переговоры с клиентом', duration_minutes: 60, order: 2, status: 'pending', competencies: [4, 10] }
                    ],
                    schedule: [],
                    created_by: 10,
                    created_by_name: 'Михайлова Татьяна Ивановна',
                    created_at: '2025-03-10'
                }
            ];

            // Mock оценки (результаты)
            this.assessments = [
                {
                    id: 1,
                    session_id: 1,
                    employee_id: 1,
                    employee_name: 'Иванов Иван Иванович',
                    department_name: 'IT отдел',
                    position_name: 'Старший разработчик',
                    assessor_id: 9,
                    assessor_name: 'Кузнецов Сергей Павлович',
                    assessment_date: '2025-02-15',
                    assessment_type: 'assessment_center',
                    status: 'approved',
                    overall_score: 4.2,
                    competency_scores: [
                        { id: 1, assessment_id: 1, competency_id: 1, competency_name: 'Коммуникация', category: 'soft', expected_level: 4, actual_level: 4, gap: 0 },
                        { id: 2, assessment_id: 1, competency_id: 2, competency_name: 'Лидерство', category: 'leadership', expected_level: 4, actual_level: 4, gap: 0 },
                        { id: 3, assessment_id: 1, competency_id: 3, competency_name: 'Аналитическое мышление', category: 'core', expected_level: 4, actual_level: 5, gap: 1, notes: 'Отличные аналитические способности' },
                        { id: 4, assessment_id: 1, competency_id: 4, competency_name: 'Принятие решений', category: 'core', expected_level: 4, actual_level: 4, gap: 0 },
                        { id: 5, assessment_id: 1, competency_id: 5, competency_name: 'Работа в команде', category: 'soft', expected_level: 4, actual_level: 4, gap: 0 },
                        { id: 6, assessment_id: 1, competency_id: 6, competency_name: 'Профессиональные знания', category: 'technical', expected_level: 5, actual_level: 5, gap: 0 }
                    ],
                    feedback: 'Показал высокий уровень профессионализма и лидерские качества',
                    strengths: ['Аналитическое мышление', 'Профессиональные знания', 'Системный подход'],
                    development_areas: ['Делегирование', 'Публичные выступления'],
                    career_recommendations: 'Рекомендуется к включению в кадровый резерв на позицию руководителя проектов'
                },
                {
                    id: 2,
                    session_id: 1,
                    employee_id: 4,
                    employee_name: 'Козлов Алексей Сергеевич',
                    department_name: 'Юридический отдел',
                    position_name: 'Юрист',
                    assessor_id: 9,
                    assessor_name: 'Кузнецов Сергей Павлович',
                    assessment_date: '2025-02-15',
                    assessment_type: 'assessment_center',
                    status: 'approved',
                    overall_score: 4.5,
                    competency_scores: [
                        { id: 7, assessment_id: 2, competency_id: 1, competency_name: 'Коммуникация', category: 'soft', expected_level: 4, actual_level: 5, gap: 1 },
                        { id: 8, assessment_id: 2, competency_id: 2, competency_name: 'Лидерство', category: 'leadership', expected_level: 4, actual_level: 4, gap: 0 },
                        { id: 9, assessment_id: 2, competency_id: 3, competency_name: 'Аналитическое мышление', category: 'core', expected_level: 4, actual_level: 5, gap: 1 },
                        { id: 10, assessment_id: 2, competency_id: 4, competency_name: 'Принятие решений', category: 'core', expected_level: 4, actual_level: 5, gap: 1 },
                        { id: 11, assessment_id: 2, competency_id: 5, competency_name: 'Работа в команде', category: 'soft', expected_level: 4, actual_level: 4, gap: 0 },
                        { id: 12, assessment_id: 2, competency_id: 6, competency_name: 'Профессиональные знания', category: 'technical', expected_level: 5, actual_level: 5, gap: 0 }
                    ],
                    feedback: 'Выдающиеся результаты по всем направлениям оценки',
                    strengths: ['Коммуникация', 'Аналитическое мышление', 'Принятие решений'],
                    development_areas: ['Управление стрессом'],
                    career_recommendations: 'Готов к назначению на позицию руководителя юридического отдела'
                },
                {
                    id: 3,
                    session_id: 1,
                    employee_id: 6,
                    employee_name: 'Морозов Дмитрий Александрович',
                    department_name: 'IT отдел',
                    position_name: 'DevOps инженер',
                    assessor_id: 9,
                    assessor_name: 'Кузнецов Сергей Павлович',
                    assessment_date: '2025-02-15',
                    assessment_type: 'assessment_center',
                    status: 'approved',
                    overall_score: 3.7,
                    competency_scores: [
                        { id: 13, assessment_id: 3, competency_id: 1, competency_name: 'Коммуникация', category: 'soft', expected_level: 4, actual_level: 3, gap: -1 },
                        { id: 14, assessment_id: 3, competency_id: 2, competency_name: 'Лидерство', category: 'leadership', expected_level: 4, actual_level: 3, gap: -1 },
                        { id: 15, assessment_id: 3, competency_id: 3, competency_name: 'Аналитическое мышление', category: 'core', expected_level: 4, actual_level: 4, gap: 0 },
                        { id: 16, assessment_id: 3, competency_id: 4, competency_name: 'Принятие решений', category: 'core', expected_level: 4, actual_level: 4, gap: 0 },
                        { id: 17, assessment_id: 3, competency_id: 5, competency_name: 'Работа в команде', category: 'soft', expected_level: 4, actual_level: 4, gap: 0 },
                        { id: 18, assessment_id: 3, competency_id: 6, competency_name: 'Профессиональные знания', category: 'technical', expected_level: 5, actual_level: 5, gap: 0 }
                    ],
                    feedback: 'Сильный технический специалист, требуется развитие soft skills',
                    strengths: ['Профессиональные знания', 'Техническая экспертиза'],
                    development_areas: ['Коммуникация', 'Лидерство', 'Презентационные навыки'],
                    career_recommendations: 'Рекомендуется программа развития лидерских качеств перед повышением'
                }
            ];

            // Mock планы развития
            this.developmentPlans = [
                {
                    id: 1,
                    employee_id: 6,
                    employee_name: 'Морозов Дмитрий Александрович',
                    assessment_id: 3,
                    session_id: 1,
                    created_date: '2025-02-20',
                    start_date: '2025-03-01',
                    end_date: '2026-02-28',
                    status: 'active',
                    competency_targets: [
                        { competency_id: 1, competency_name: 'Коммуникация', category: 'soft', current_level: 3, target_level: 4, deadline: '2025-08-31', progress: 25, current_achieved_level: 3 },
                        { competency_id: 2, competency_name: 'Лидерство', category: 'leadership', current_level: 3, target_level: 4, deadline: '2025-12-31', progress: 15, current_achieved_level: 3 }
                    ],
                    development_activities: [
                        { id: 1, activity_type: 'training', title: 'Тренинг «Эффективная коммуникация»', description: 'Двухдневный тренинг по развитию коммуникативных навыков', competencies: [1], start_date: '2025-04-15', end_date: '2025-04-16', status: 'completed', provider: 'HR Academy', cost: 500000, completion_date: '2025-04-16', result: 'Успешно завершен' },
                        { id: 2, activity_type: 'coaching', title: 'Индивидуальный коучинг', description: '10 сессий с коучем по развитию лидерских качеств', competencies: [2], start_date: '2025-05-01', end_date: '2025-10-31', status: 'in_progress', provider: 'Федоров Игорь (внешний коуч)' },
                        { id: 3, activity_type: 'project', title: 'Лидерство в мини-проекте', description: 'Руководство командой из 3 человек на внутреннем проекте', competencies: [1, 2], start_date: '2025-06-01', end_date: '2025-08-31', status: 'planned' }
                    ],
                    mentors: [
                        { mentor_id: 1, mentor_name: 'Иванов Иван Иванович', mentor_position: 'Старший разработчик', role: 'mentor', competencies: [2], start_date: '2025-03-01', meeting_frequency: 'Еженедельно' }
                    ],
                    interim_assessments: [
                        {
                            id: 1,
                            assessment_date: '2025-06-15',
                            assessor_id: 9,
                            assessor_name: 'Кузнецов Сергей Павлович',
                            competency_scores: [
                                { competency_id: 1, competency_name: 'Коммуникация', score: 3.5, notes: 'Заметен прогресс после тренинга' },
                                { competency_id: 2, competency_name: 'Лидерство', score: 3.2, notes: 'Коучинг в процессе' }
                            ],
                            overall_progress: 20,
                            feedback: 'Сотрудник активно работает над развитием, виден прогресс',
                            recommendations: 'Продолжить программу коучинга, добавить практику публичных выступлений'
                        }
                    ],
                    overall_progress: 20,
                    notes: 'План развития для подготовки к позиции тимлида',
                    created_by: 9,
                    created_by_name: 'Кузнецов Сергей Павлович',
                    approved_by: 8,
                    approved_by_name: 'Соколов Андрей Викторович',
                    approved_at: '2025-02-25'
                }
            ];

            this.loading = false;
        }, 500);
    }

    // =====================
    // СЕССИИ ОЦЕНКИ
    // =====================

    openSessionDialog(): void {
        this.isEditMode = false;
        this.selectedSession = null;
        this.submitted = false;
        this.sessionForm.reset({
            start_time: '09:00',
            end_time: '18:00'
        });
        this.displaySessionDialog = true;
    }

    openEditSessionDialog(session: AssessmentSession): void {
        this.isEditMode = true;
        this.selectedSession = session;
        this.submitted = false;

        const selectedCompetencies = this.standardCompetencies.filter(c =>
            session.competencies_to_assess.some(sc => sc.competency_id === c.id)
        );
        const selectedCandidates = this.employees.filter(e =>
            session.candidates.some(c => c.employee_id === e.id)
        );
        const selectedAssessors = this.assessors.filter(a =>
            session.assessors.some(sa => sa.assessor_id === a.id)
        );

        this.sessionForm.patchValue({
            name: session.name,
            description: session.description || '',
            session_date: new Date(session.session_date),
            start_time: session.start_time,
            end_time: session.end_time,
            location: session.location || '',
            competencies: selectedCompetencies,
            candidates: selectedCandidates,
            assessors: selectedAssessors
        });

        this.displaySessionDialog = true;
    }

    saveSession(): void {
        this.submitted = true;
        if (this.sessionForm.invalid) return;

        const formValue = this.sessionForm.value;
        const sessionDate = formValue.session_date instanceof Date
            ? formValue.session_date.toISOString().split('T')[0]
            : formValue.session_date;

        if (this.isEditMode && this.selectedSession) {
            const index = this.sessions.findIndex(s => s.id === this.selectedSession!.id);
            if (index !== -1) {
                this.sessions[index] = {
                    ...this.sessions[index],
                    name: formValue.name,
                    description: formValue.description,
                    session_date: sessionDate,
                    start_time: formValue.start_time,
                    end_time: formValue.end_time,
                    location: formValue.location,
                    competencies_to_assess: formValue.competencies.map((c: any) => ({
                        competency_id: c.id,
                        competency_name: c.name,
                        category: c.category,
                        weight: Math.floor(100 / formValue.competencies.length)
                    })),
                    candidates: formValue.candidates.map((e: any) => ({
                        employee_id: e.id,
                        employee_name: e.name,
                        department_name: e.department,
                        position_name: e.position,
                        invitation_status: 'pending' as const
                    })),
                    assessors: formValue.assessors.map((a: any) => ({
                        assessor_id: a.id,
                        assessor_name: a.name,
                        role: 'observer' as const,
                        assigned_blocks: []
                    }))
                };
                this.sessions = [...this.sessions];
                this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Сессия обновлена' });
            }
        } else {
            const newSession: AssessmentSession = {
                id: this.nextId++,
                name: formValue.name,
                description: formValue.description,
                session_date: sessionDate,
                start_time: formValue.start_time,
                end_time: formValue.end_time,
                location: formValue.location,
                status: 'planning',
                competencies_to_assess: formValue.competencies.map((c: any) => ({
                    competency_id: c.id,
                    competency_name: c.name,
                    category: c.category,
                    weight: Math.floor(100 / formValue.competencies.length)
                })),
                candidates: formValue.candidates.map((e: any) => ({
                    employee_id: e.id,
                    employee_name: e.name,
                    department_name: e.department,
                    position_name: e.position,
                    invitation_status: 'pending' as const
                })),
                assessors: formValue.assessors.map((a: any) => ({
                    assessor_id: a.id,
                    assessor_name: a.name,
                    role: 'observer' as const,
                    assigned_blocks: []
                })),
                assessment_blocks: [],
                schedule: [],
                created_by: 9,
                created_by_name: 'Кузнецов Сергей Павлович',
                created_at: new Date().toISOString().split('T')[0]
            };
            this.sessions = [...this.sessions, newSession];
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Сессия создана' });
        }

        this.displaySessionDialog = false;
    }

    sendInvitations(session: AssessmentSession): void {
        const index = this.sessions.findIndex(s => s.id === session.id);
        if (index !== -1) {
            this.sessions[index].candidates = this.sessions[index].candidates.map(c => ({
                ...c,
                invitation_status: 'pending' as const,
                invitation_sent_at: new Date().toISOString()
            }));
            this.sessions = [...this.sessions];
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Приглашения отправлены' });
        }
    }

    startSession(session: AssessmentSession): void {
        const index = this.sessions.findIndex(s => s.id === session.id);
        if (index !== -1) {
            this.sessions[index].status = 'in_progress';
            this.sessions = [...this.sessions];
            this.messageService.add({ severity: 'info', summary: 'Сессия начата', detail: 'Ассессмент-центр начался' });
        }
    }

    completeSession(session: AssessmentSession): void {
        const index = this.sessions.findIndex(s => s.id === session.id);
        if (index !== -1) {
            this.sessions[index].status = 'completed';
            this.sessions = [...this.sessions];
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Сессия завершена' });
        }
    }

    // =====================
    // БЛОКИ ОЦЕНКИ
    // =====================

    openBlockDialog(session: AssessmentSession): void {
        this.selectedSession = session;
        this.isEditMode = false;
        this.selectedBlock = null;
        this.submitted = false;
        this.blockForm.reset({ duration_minutes: 60 });
        this.displayBlockDialog = true;
    }

    saveBlock(): void {
        this.submitted = true;
        if (this.blockForm.invalid || !this.selectedSession) return;

        const formValue = this.blockForm.value;
        const sessionIndex = this.sessions.findIndex(s => s.id === this.selectedSession!.id);

        if (sessionIndex !== -1) {
            const newBlock: AssessmentBlock = {
                id: this.nextId++,
                session_id: this.selectedSession.id,
                block_type: formValue.block_type.value,
                name: formValue.name,
                description: formValue.description,
                duration_minutes: formValue.duration_minutes,
                order: this.sessions[sessionIndex].assessment_blocks.length + 1,
                status: 'pending',
                competencies: formValue.competencies.map((c: any) => c.id)
            };

            this.sessions[sessionIndex].assessment_blocks = [
                ...this.sessions[sessionIndex].assessment_blocks,
                newBlock
            ];
            this.sessions = [...this.sessions];
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Блок добавлен' });
        }

        this.displayBlockDialog = false;
    }

    completeBlock(session: AssessmentSession, block: AssessmentBlock): void {
        const sessionIndex = this.sessions.findIndex(s => s.id === session.id);
        if (sessionIndex !== -1) {
            const blockIndex = this.sessions[sessionIndex].assessment_blocks.findIndex(b => b.id === block.id);
            if (blockIndex !== -1) {
                this.sessions[sessionIndex].assessment_blocks[blockIndex].status = 'completed';
                this.sessions = [...this.sessions];
                this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Блок завершен' });
            }
        }
    }

    // =====================
    // ОЦЕНКА КАНДИДАТОВ
    // =====================

    openEvaluationDialog(session: AssessmentSession, candidate: SessionCandidate, block: AssessmentBlock): void {
        this.selectedSession = session;
        this.evaluatingCandidate = candidate;
        this.evaluatingBlock = block;

        // Инициализация оценок
        this.candidateScores = {};
        this.candidateNotes = {};
        session.competencies_to_assess.forEach(c => {
            this.candidateScores[c.competency_id] = 3;
            this.candidateNotes[c.competency_id] = '';
        });

        this.displayEvaluationDialog = true;
    }

    saveEvaluation(): void {
        if (!this.selectedSession || !this.evaluatingCandidate || !this.evaluatingBlock) return;

        const scores: CompetencyBlockScore[] = this.selectedSession.competencies_to_assess.map(c => ({
            competency_id: c.competency_id,
            competency_name: c.competency_name,
            score: this.candidateScores[c.competency_id] || 3,
            observations: this.candidateNotes[c.competency_id] || undefined
        }));

        const result: BlockResult = {
            employee_id: this.evaluatingCandidate.employee_id,
            employee_name: this.evaluatingCandidate.employee_name,
            scores: scores,
            notes: this.evaluationForm.value.general_notes || undefined,
            assessor_id: 9,
            assessor_name: 'Кузнецов Сергей Павлович',
            evaluated_at: new Date().toISOString()
        };

        // Добавляем результат в блок
        const sessionIndex = this.sessions.findIndex(s => s.id === this.selectedSession!.id);
        if (sessionIndex !== -1) {
            const blockIndex = this.sessions[sessionIndex].assessment_blocks.findIndex(b => b.id === this.evaluatingBlock!.id);
            if (blockIndex !== -1) {
                if (!this.sessions[sessionIndex].assessment_blocks[blockIndex].results) {
                    this.sessions[sessionIndex].assessment_blocks[blockIndex].results = [];
                }
                this.sessions[sessionIndex].assessment_blocks[blockIndex].results!.push(result);
                this.sessions = [...this.sessions];
            }
        }

        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Оценка сохранена' });
        this.displayEvaluationDialog = false;
    }

    // =====================
    // СОЗДАНИЕ ИТОГОВОЙ ОЦЕНКИ
    // =====================

    generateAssessment(session: AssessmentSession, candidate: SessionCandidate): void {
        // Собираем все оценки кандидата из всех блоков
        const allScores: { [competencyId: number]: number[] } = {};

        session.assessment_blocks.forEach(block => {
            if (block.results) {
                const candidateResult = block.results.find(r => r.employee_id === candidate.employee_id);
                if (candidateResult) {
                    candidateResult.scores.forEach(score => {
                        if (!allScores[score.competency_id]) {
                            allScores[score.competency_id] = [];
                        }
                        allScores[score.competency_id].push(score.score);
                    });
                }
            }
        });

        // Рассчитываем средние оценки
        const competencyScores = session.competencies_to_assess.map((c, index) => {
            const scores = allScores[c.competency_id] || [3];
            const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            return {
                id: this.nextId++,
                assessment_id: this.nextId,
                competency_id: c.competency_id,
                competency_name: c.competency_name,
                category: c.category,
                expected_level: 4,
                actual_level: Math.round(avgScore * 10) / 10,
                gap: Math.round((avgScore - 4) * 10) / 10
            };
        });

        const overallScore = competencyScores.reduce((sum, cs) => sum + cs.actual_level, 0) / competencyScores.length;

        // Определяем сильные стороны и области развития
        const strengths = competencyScores
            .filter(cs => cs.actual_level >= 4)
            .map(cs => cs.competency_name!);

        const developmentAreas = competencyScores
            .filter(cs => cs.actual_level < 4)
            .map(cs => cs.competency_name!);

        const newAssessment: CompetencyAssessment = {
            id: this.nextId++,
            session_id: session.id,
            employee_id: candidate.employee_id,
            employee_name: candidate.employee_name,
            department_name: candidate.department_name,
            position_name: candidate.position_name,
            assessor_id: 9,
            assessor_name: 'Кузнецов Сергей Павлович',
            assessment_date: new Date().toISOString().split('T')[0],
            assessment_type: 'assessment_center',
            status: 'completed',
            overall_score: Math.round(overallScore * 10) / 10,
            competency_scores: competencyScores,
            strengths: strengths,
            development_areas: developmentAreas
        };

        this.assessments = [...this.assessments, newAssessment];
        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Итоговая оценка сформирована' });
    }

    // =====================
    // ОТЧЁТЫ
    // =====================

    viewReport(assessment: CompetencyAssessment): void {
        this.currentReport = {
            id: assessment.id,
            session_id: assessment.session_id,
            employee_id: assessment.employee_id,
            employee_name: assessment.employee_name,
            department_name: assessment.department_name,
            position_name: assessment.position_name,
            assessment_date: assessment.assessment_date,
            report_generated_at: new Date().toISOString(),
            overall_score: assessment.overall_score || 0,
            competency_results: assessment.competency_scores.map(cs => ({
                competency_id: cs.competency_id,
                competency_name: cs.competency_name || '',
                category: cs.category || 'core',
                score: cs.actual_level,
                max_score: 5,
                percentage: (cs.actual_level / 5) * 100
            })),
            block_results: [],
            strengths: (assessment.strengths || []).map((s, i) => ({
                competency_id: i,
                competency_name: s,
                score: 5,
                description: 'Высокий уровень развития компетенции'
            })),
            development_areas: (assessment.development_areas || []).map((d, i) => {
                const cs = assessment.competency_scores.find(c => c.competency_name === d);
                return {
                    competency_id: i,
                    competency_name: d,
                    current_level: cs?.actual_level || 3,
                    target_level: 4,
                    gap: cs ? (4 - cs.actual_level) : 1,
                    priority: (cs && cs.actual_level < 3) ? 'high' as const : 'medium' as const,
                    recommended_actions: ['Тренинг', 'Практика', 'Менторинг']
                };
            }),
            career_recommendations: assessment.career_recommendations || 'Рекомендации не сформированы',
            training_recommendations: ['Развитие лидерских качеств', 'Коммуникативные навыки']
        };

        this.displayReportDialog = true;
    }

    approveAssessment(assessment: CompetencyAssessment): void {
        const index = this.assessments.findIndex(a => a.id === assessment.id);
        if (index !== -1) {
            this.assessments[index].status = 'approved';
            this.assessments = [...this.assessments];
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Оценка утверждена' });
        }
    }

    // =====================
    // ПЛАНЫ РАЗВИТИЯ
    // =====================

    openPlanDialog(assessment?: CompetencyAssessment): void {
        this.isEditMode = false;
        this.selectedPlan = null;
        this.submitted = false;

        if (assessment) {
            const employee = this.employees.find(e => e.id === assessment.employee_id);
            const targets = assessment.competency_scores
                .filter(cs => cs.gap < 0)
                .map(cs => ({
                    competency_id: cs.competency_id,
                    competency_name: cs.competency_name,
                    category: cs.category,
                    current_level: cs.actual_level,
                    target_level: cs.expected_level,
                    progress: 0
                }));

            this.planForm.patchValue({
                employee_id: employee,
                start_date: new Date(),
                end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                competency_targets: targets
            });
        } else {
            this.planForm.reset();
        }

        this.displayPlanDialog = true;
    }

    savePlan(): void {
        this.submitted = true;
        if (this.planForm.invalid) return;

        const formValue = this.planForm.value;

        const newPlan: DevelopmentPlan = {
            id: this.nextId++,
            employee_id: formValue.employee_id.id,
            employee_name: formValue.employee_id.name,
            created_date: new Date().toISOString().split('T')[0],
            start_date: formValue.start_date instanceof Date
                ? formValue.start_date.toISOString().split('T')[0]
                : formValue.start_date,
            end_date: formValue.end_date instanceof Date
                ? formValue.end_date.toISOString().split('T')[0]
                : formValue.end_date,
            status: 'draft',
            competency_targets: formValue.competency_targets || [],
            development_activities: [],
            mentors: [],
            interim_assessments: [],
            overall_progress: 0,
            notes: formValue.notes,
            created_by: 9,
            created_by_name: 'Кузнецов Сергей Павлович'
        };

        this.developmentPlans = [...this.developmentPlans, newPlan];
        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'План развития создан' });
        this.displayPlanDialog = false;
    }

    viewPlanDetails(plan: DevelopmentPlan): void {
        this.selectedPlan = plan;
        this.displayMonitoringDialog = true;
    }

    activatePlan(plan: DevelopmentPlan): void {
        const index = this.developmentPlans.findIndex(p => p.id === plan.id);
        if (index !== -1) {
            this.developmentPlans[index].status = 'active';
            this.developmentPlans = [...this.developmentPlans];
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'План активирован' });
        }
    }

    completePlan(plan: DevelopmentPlan): void {
        const index = this.developmentPlans.findIndex(p => p.id === plan.id);
        if (index !== -1) {
            this.developmentPlans[index].status = 'completed';
            this.developmentPlans[index].overall_progress = 100;
            this.developmentPlans = [...this.developmentPlans];
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'План завершен' });
        }
    }

    // =====================
    // УДАЛЕНИЕ
    // =====================

    openDeleteSessionDialog(session: AssessmentSession): void {
        this.selectedSession = session;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (this.selectedSession) {
            this.sessions = this.sessions.filter(s => s.id !== this.selectedSession!.id);
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Сессия удалена' });
        }
        this.displayDeleteDialog = false;
        this.selectedSession = null;
    }

    // =====================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // =====================

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getSessionStatusSeverity(status: SessionStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'info';
            case 'scheduled': return 'warn';
            case 'planning': return 'secondary';
            case 'cancelled': return 'danger';
            default: return 'info';
        }
    }

    getStatusSeverity(status: AssessmentStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'approved': return 'success';
            case 'completed': return 'info';
            case 'reviewed': return 'info';
            case 'in_progress': return 'warn';
            case 'draft': return 'secondary';
            default: return 'info';
        }
    }

    getPlanStatusSeverity(status: PlanStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'completed': return 'success';
            case 'active': return 'info';
            case 'on_hold': return 'warn';
            case 'draft': return 'secondary';
            case 'cancelled': return 'danger';
            default: return 'info';
        }
    }

    getBlockTypeLabel(type: BlockType): string {
        const found = this.blockTypes.find(t => t.value === type);
        return found ? found.label : type;
    }

    getBlockTypeIcon(type: BlockType): string {
        const found = this.blockTypes.find(t => t.value === type);
        return found ? found.icon : 'pi pi-file';
    }

    getStatusLabel(status: string): string {
        const found = this.assessmentStatuses.find(s => s.value === status);
        return found ? found.label : status;
    }

    getSessionStatusLabel(status: SessionStatus): string {
        const found = this.sessionStatuses.find(s => s.value === status);
        return found ? found.label : status;
    }

    getPlanStatusLabel(status: PlanStatus): string {
        const found = this.planStatuses.find(s => s.value === status);
        return found ? found.label : status;
    }

    getActivityTypeLabel(type: ActivityType): string {
        const found = this.activityTypes.find(t => t.value === type);
        return found ? found.label : type;
    }

    getCategoryLabel(category: string): string {
        const found = this.competencyCategories.find(c => c.value === category);
        return found ? found.label : category;
    }

    getScoreColor(score: number): string {
        if (score >= 4.5) return 'text-green-600';
        if (score >= 4) return 'text-blue-600';
        if (score >= 3) return 'text-yellow-600';
        return 'text-red-600';
    }

    // Геттеры для статистики
    get sessionsCount(): number {
        return this.sessions.length;
    }

    get completedSessionsCount(): number {
        return this.sessions.filter(s => s.status === 'completed').length;
    }

    get assessmentsCount(): number {
        return this.assessments.length;
    }

    get activePlansCount(): number {
        return this.developmentPlans.filter(p => p.status === 'active').length;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
