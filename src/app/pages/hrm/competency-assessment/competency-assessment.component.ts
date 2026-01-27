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
    employees: any[] = [];
    assessors: any[] = [];

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
        this.loadData();
    }

    private loadData(): void {
        this.loading = false;
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
