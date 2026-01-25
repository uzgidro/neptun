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
import { TabsModule } from 'primeng/tabs';
import { Dialog } from 'primeng/dialog';
import { ProgressBar } from 'primeng/progressbar';
import { Rating } from 'primeng/rating';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import {
    Vacancy,
    Candidate,
    Interview,
    JobOffer,
    Onboarding,
    OnboardingTask,
    ReferenceCheck,
    VACANCY_STATUSES,
    CANDIDATE_STATUSES,
    EMPLOYMENT_TYPES,
    VACANCY_PRIORITIES,
    INTERVIEW_TYPES,
    INTERVIEW_RECOMMENDATIONS,
    OFFER_STATUSES,
    ONBOARDING_CATEGORIES,
    CANDIDATE_SOURCES,
    RECRUITING_STAGES,
    VacancyStatus,
    CandidateStatus,
    OnboardingStatus,
    RecruitingStage
} from '@/core/interfaces/hrm/recruiting';

@Component({
    selector: 'app-recruiting',
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
        Tooltip,
        Tag,
        TabsModule,
        Dialog,
        ProgressBar,
        Rating,
        Textarea,
        Select,
        DatePicker,
        InputNumber
    ],
    templateUrl: './recruiting.component.html',
    styleUrl: './recruiting.component.scss'
})
export class RecruitingComponent implements OnInit, OnDestroy {
    // =====================
    // ДАННЫЕ
    // =====================
    vacancies: Vacancy[] = [];
    candidates: Candidate[] = [];
    onboardings: Onboarding[] = [];
    loading: boolean = true;
    activeTab: number = 0;

    // Диалоги
    displayVacancyDialog: boolean = false;
    displayCandidateDialog: boolean = false;
    displayCandidateDetailDialog: boolean = false;
    displayInterviewDialog: boolean = false;
    displayInterviewFeedbackDialog: boolean = false;
    displayOfferDialog: boolean = false;
    displayReferenceDialog: boolean = false;
    displayRejectDialog: boolean = false;
    displayOnboardingDialog: boolean = false;
    displayDeleteDialog: boolean = false;
    displayApprovalDialog: boolean = false;

    // Выбранные объекты
    selectedVacancy: Vacancy | null = null;
    selectedCandidate: Candidate | null = null;
    selectedInterview: Interview | null = null;
    selectedOnboarding: Onboarding | null = null;

    // Формы
    vacancyForm: FormGroup;
    candidateForm: FormGroup;
    interviewForm: FormGroup;
    feedbackForm: FormGroup;
    offerForm: FormGroup;
    referenceForm: FormGroup;
    rejectForm: FormGroup;

    submitted: boolean = false;
    isEditMode: boolean = false;
    private nextId = 100;

    // Справочники
    departments = [
        { id: 1, name: 'IT отдел' },
        { id: 2, name: 'Бухгалтерия' },
        { id: 3, name: 'Отдел кадров' },
        { id: 4, name: 'Юридический отдел' },
        { id: 5, name: 'Отдел продаж' },
        { id: 6, name: 'Маркетинг' },
        { id: 7, name: 'Администрация' }
    ];

    positions = [
        { id: 1, name: 'Senior разработчик' },
        { id: 2, name: 'Middle разработчик' },
        { id: 3, name: 'Junior разработчик' },
        { id: 4, name: 'Бухгалтер' },
        { id: 5, name: 'HR-менеджер' },
        { id: 6, name: 'Юрист' },
        { id: 7, name: 'Менеджер по продажам' },
        { id: 8, name: 'Маркетолог' },
        { id: 9, name: 'Руководитель отдела' }
    ];

    interviewers = [
        { id: 1, name: 'Кузнецов Сергей (HR)' },
        { id: 2, name: 'Иванов Иван (Тех. директор)' },
        { id: 3, name: 'Соколов Андрей (Ген. директор)' },
        { id: 4, name: 'Михайлова Татьяна (HR)' }
    ];

    vacancyStatuses = VACANCY_STATUSES;
    candidateStatuses = CANDIDATE_STATUSES;
    employmentTypes = EMPLOYMENT_TYPES;
    vacancyPriorities = VACANCY_PRIORITIES;
    interviewTypes = INTERVIEW_TYPES;
    interviewRecommendations = INTERVIEW_RECOMMENDATIONS;
    offerStatuses = OFFER_STATUSES;
    onboardingCategories = ONBOARDING_CATEGORIES;
    candidateSources = CANDIDATE_SOURCES;
    recruitingStages = RECRUITING_STAGES;

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.vacancyForm = this.fb.group({
            title: ['', Validators.required],
            department_id: [null, Validators.required],
            position_id: [null, Validators.required],
            description: ['', Validators.required],
            requirements: ['', Validators.required],
            responsibilities: [''],
            experience_years: [null],
            salary_from: [null],
            salary_to: [null],
            employment_type: [null, Validators.required],
            priority: [null],
            deadline: [null],
            request_justification: ['']
        });

        this.candidateForm = this.fb.group({
            vacancy_id: [null, Validators.required],
            full_name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            source: [null, Validators.required],
            salary_expectation: [null],
            available_from: [null],
            cover_letter: ['']
        });

        this.interviewForm = this.fb.group({
            interview_type: [null, Validators.required],
            interviewer_id: [null, Validators.required],
            scheduled_at: [null, Validators.required],
            duration_minutes: [60, [Validators.required, Validators.min(15)]],
            location: [''],
            meeting_link: ['']
        });

        this.feedbackForm = this.fb.group({
            overall_rating: [3, Validators.required],
            recommendation: [null, Validators.required],
            strengths: [''],
            weaknesses: [''],
            feedback: ['', Validators.required]
        });

        this.offerForm = this.fb.group({
            offered_salary: [null, Validators.required],
            start_date: [null, Validators.required],
            probation_period_months: [3, Validators.required],
            benefits: [''],
            other_terms: ['']
        });

        this.referenceForm = this.fb.group({
            referee_name: ['', Validators.required],
            referee_position: ['', Validators.required],
            referee_company: ['', Validators.required],
            referee_phone: ['', Validators.required],
            relationship: ['', Validators.required]
        });

        this.rejectForm = this.fb.group({
            rejection_reason: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadMockData();
    }

    private loadMockData(): void {
        setTimeout(() => {
            this.vacancies = [
                {
                    id: 1,
                    title: 'Senior Frontend разработчик',
                    department_id: 1,
                    department_name: 'IT отдел',
                    position_id: 1,
                    position_name: 'Senior разработчик',
                    description: 'Разработка и поддержка frontend части корпоративных приложений на Angular',
                    requirements: 'Опыт работы от 5 лет, глубокое знание Angular, TypeScript, RxJS',
                    responsibilities: 'Разработка UI компонентов, код-ревью, менторство junior разработчиков',
                    experience_years: 5,
                    salary_from: 250000,
                    salary_to: 350000,
                    employment_type: 'full_time',
                    status: 'open',
                    priority: 'high',
                    published_at: '2024-12-01',
                    deadline: '2025-02-01',
                    applications_count: 15,
                    interviews_count: 5,
                    offers_count: 1,
                    requested_by: 2,
                    requested_by_name: 'Иванов Иван',
                    request_date: '2024-11-15',
                    approved_by: 3,
                    approved_by_name: 'Соколов Андрей',
                    approved_date: '2024-11-20',
                    finance_approved: true
                },
                {
                    id: 2,
                    title: 'Middle Backend разработчик',
                    department_id: 1,
                    department_name: 'IT отдел',
                    position_id: 2,
                    position_name: 'Middle разработчик',
                    description: 'Разработка серверной части на Python/Django',
                    requirements: 'Опыт работы от 3 лет, знание Python, Django, PostgreSQL',
                    experience_years: 3,
                    salary_from: 180000,
                    salary_to: 250000,
                    employment_type: 'full_time',
                    status: 'open',
                    priority: 'normal',
                    published_at: '2024-12-10',
                    applications_count: 23,
                    interviews_count: 8
                },
                {
                    id: 3,
                    title: 'HR-менеджер',
                    department_id: 3,
                    department_name: 'Отдел кадров',
                    position_id: 5,
                    position_name: 'HR-менеджер',
                    description: 'Подбор и адаптация персонала',
                    requirements: 'Опыт работы от 2 лет в сфере HR',
                    experience_years: 2,
                    salary_from: 100000,
                    salary_to: 140000,
                    employment_type: 'full_time',
                    status: 'pending_approval',
                    priority: 'normal',
                    requested_by: 4,
                    requested_by_name: 'Михайлова Татьяна',
                    request_date: '2024-12-15',
                    request_justification: 'Увеличение нагрузки на HR отдел в связи с расширением компании'
                },
                {
                    id: 4,
                    title: 'Менеджер по продажам B2B',
                    department_id: 5,
                    department_name: 'Отдел продаж',
                    position_id: 7,
                    position_name: 'Менеджер по продажам',
                    description: 'Активные продажи корпоративным клиентам',
                    requirements: 'Опыт в B2B продажах от 2 лет',
                    salary_from: 120000,
                    salary_to: 200000,
                    employment_type: 'full_time',
                    status: 'closed',
                    published_at: '2024-11-01',
                    closed_at: '2024-12-20',
                    closed_reason: 'Позиция закрыта',
                    applications_count: 30,
                    hired_candidate_id: 10
                }
            ];

            this.candidates = [
                {
                    id: 1,
                    vacancy_id: 1,
                    vacancy_title: 'Senior Frontend разработчик',
                    full_name: 'Смирнов Александр Павлович',
                    email: 'smirnov.a@mail.ru',
                    phone: '+7 (916) 123-45-67',
                    source: 'job_portal',
                    status: 'interview',
                    stage: 'interview',
                    rating: 4,
                    hr_rating: 4,
                    salary_expectation: 300000,
                    experience: [
                        { company: 'TechCorp', position: 'Frontend Developer', start_date: '2020-01-01', end_date: '2024-01-01', description: 'Разработка на Angular' }
                    ],
                    interviews: [
                        { id: 1, candidate_id: 1, vacancy_id: 1, interviewer_id: 1, interviewer_name: 'Кузнецов Сергей (HR)', interview_type: 'phone', stage: 'initial', scheduled_at: '2024-12-10T10:00:00', duration_minutes: 30, status: 'completed', overall_rating: 4, recommendation: 'yes', feedback: 'Хороший кандидат, рекомендую на техническое интервью' },
                        { id: 2, candidate_id: 1, vacancy_id: 1, interviewer_id: 2, interviewer_name: 'Иванов Иван (Тех. директор)', interview_type: 'technical', stage: 'technical', scheduled_at: '2024-12-18T14:00:00', duration_minutes: 60, status: 'scheduled' }
                    ],
                    created_at: '2024-12-05'
                },
                {
                    id: 2,
                    vacancy_id: 1,
                    vacancy_title: 'Senior Frontend разработчик',
                    full_name: 'Кузнецова Мария Игоревна',
                    email: 'kuznetsova.m@gmail.com',
                    phone: '+7 (925) 234-56-78',
                    source: 'referral',
                    status: 'offer',
                    stage: 'offer',
                    rating: 5,
                    hr_rating: 5,
                    technical_rating: 5,
                    salary_expectation: 320000,
                    interviews: [
                        { id: 3, candidate_id: 2, vacancy_id: 1, interviewer_id: 1, interviewer_name: 'Кузнецов Сергей (HR)', interview_type: 'phone', stage: 'initial', scheduled_at: '2024-12-08T11:00:00', duration_minutes: 30, status: 'completed', overall_rating: 5, recommendation: 'strong_yes', feedback: 'Отличный кандидат!' },
                        { id: 4, candidate_id: 2, vacancy_id: 1, interviewer_id: 2, interviewer_name: 'Иванов Иван (Тех. директор)', interview_type: 'technical', stage: 'technical', scheduled_at: '2024-12-12T14:00:00', duration_minutes: 90, status: 'completed', overall_rating: 5, recommendation: 'strong_yes', feedback: 'Высокий уровень технических знаний' },
                        { id: 5, candidate_id: 2, vacancy_id: 1, interviewer_id: 3, interviewer_name: 'Соколов Андрей (Ген. директор)', interview_type: 'final', stage: 'final', scheduled_at: '2024-12-15T16:00:00', duration_minutes: 45, status: 'completed', overall_rating: 5, recommendation: 'strong_yes' }
                    ],
                    reference_checks: [
                        { id: 1, candidate_id: 2, referee_name: 'Петров Сергей', referee_position: 'CTO', referee_company: 'PrevCompany', referee_phone: '+7 999 111 22 33', relationship: 'Руководитель', status: 'completed', feedback: 'Отличный специалист', rating: 5, would_rehire: true }
                    ],
                    offer: {
                        id: 1,
                        candidate_id: 2,
                        vacancy_id: 1,
                        offered_salary: 330000,
                        offered_position: 'Senior Frontend разработчик',
                        offered_department: 'IT отдел',
                        start_date: '2025-01-15',
                        contract_type: 'permanent',
                        probation_period_months: 3,
                        benefits: ['ДМС', 'Обучение', 'Гибкий график'],
                        status: 'sent',
                        sent_at: '2024-12-20',
                        expires_at: '2024-12-27'
                    },
                    created_at: '2024-12-03'
                },
                {
                    id: 3,
                    vacancy_id: 2,
                    vacancy_title: 'Middle Backend разработчик',
                    full_name: 'Попов Дмитрий Сергеевич',
                    email: 'popov.d@yandex.ru',
                    phone: '+7 (903) 345-67-89',
                    source: 'job_portal',
                    status: 'screening',
                    stage: 'screening',
                    created_at: '2024-12-12'
                },
                {
                    id: 4,
                    vacancy_id: 2,
                    vacancy_title: 'Middle Backend разработчик',
                    full_name: 'Федорова Анастасия Владимировна',
                    email: 'fedorova.a@inbox.ru',
                    phone: '+7 (917) 456-78-90',
                    source: 'gov_portal',
                    status: 'new',
                    stage: 'application',
                    created_at: '2024-12-18'
                },
                {
                    id: 5,
                    vacancy_id: 1,
                    vacancy_title: 'Senior Frontend разработчик',
                    full_name: 'Белов Максим Юрьевич',
                    email: 'belov.m@yandex.ru',
                    phone: '+7 (909) 789-01-23',
                    source: 'social_media',
                    status: 'rejected',
                    stage: 'closed',
                    rating: 2,
                    rejection_reason: 'Недостаточно опыта работы с Angular',
                    rejection_date: '2024-12-10',
                    created_at: '2024-12-08'
                }
            ];

            this.onboardings = [
                {
                    id: 1,
                    employee_id: 100,
                    employee_name: 'Егорова Светлана Петровна',
                    vacancy_id: 4,
                    start_date: '2024-12-23',
                    status: 'in_progress',
                    mentor_id: 7,
                    mentor_name: 'Волкова Ольга Николаевна',
                    tasks: [
                        { id: 1, title: 'Оформление документов', category: 'documents', status: 'completed', completed_at: '2024-12-23' },
                        { id: 2, title: 'Создание учетной записи', category: 'it_setup', status: 'completed', completed_at: '2024-12-23' },
                        { id: 3, title: 'Вводное обучение', category: 'training', status: 'in_progress', due_date: '2024-12-27' },
                        { id: 4, title: 'Знакомство с командой', category: 'introduction', status: 'pending', due_date: '2024-12-24' },
                        { id: 5, title: 'Изучение политик компании', category: 'compliance', status: 'pending', due_date: '2024-12-30' }
                    ],
                    documents_submitted: ['Паспорт', 'ИНН', 'СНИЛС', 'Трудовая книжка'],
                    documents_pending: ['Фото 3x4'],
                    email_created: true,
                    system_access_granted: true,
                    equipment_provided: false,
                    overall_progress: 40
                }
            ];

            this.loading = false;
        }, 500);
    }

    // =====================
    // ВАКАНСИИ
    // =====================

    openVacancyDialog(): void {
        this.isEditMode = false;
        this.selectedVacancy = null;
        this.submitted = false;
        this.vacancyForm.reset();
        this.displayVacancyDialog = true;
    }

    openEditVacancyDialog(vacancy: Vacancy): void {
        this.isEditMode = true;
        this.selectedVacancy = vacancy;
        this.submitted = false;

        this.vacancyForm.patchValue({
            title: vacancy.title,
            department_id: this.departments.find(d => d.id === vacancy.department_id),
            position_id: this.positions.find(p => p.id === vacancy.position_id),
            description: vacancy.description,
            requirements: vacancy.requirements,
            responsibilities: vacancy.responsibilities || '',
            experience_years: vacancy.experience_years,
            salary_from: vacancy.salary_from,
            salary_to: vacancy.salary_to,
            employment_type: this.employmentTypes.find(t => t.value === vacancy.employment_type),
            priority: this.vacancyPriorities.find(p => p.value === vacancy.priority),
            deadline: vacancy.deadline ? new Date(vacancy.deadline) : null,
            request_justification: vacancy.request_justification || ''
        });

        this.displayVacancyDialog = true;
    }

    saveVacancy(): void {
        this.submitted = true;
        if (this.vacancyForm.invalid) return;

        const formValue = this.vacancyForm.value;

        if (this.isEditMode && this.selectedVacancy) {
            const index = this.vacancies.findIndex(v => v.id === this.selectedVacancy!.id);
            if (index !== -1) {
                this.vacancies[index] = {
                    ...this.vacancies[index],
                    title: formValue.title,
                    department_id: formValue.department_id?.id,
                    department_name: formValue.department_id?.name,
                    position_id: formValue.position_id?.id,
                    position_name: formValue.position_id?.name,
                    description: formValue.description,
                    requirements: formValue.requirements,
                    responsibilities: formValue.responsibilities,
                    experience_years: formValue.experience_years,
                    salary_from: formValue.salary_from,
                    salary_to: formValue.salary_to,
                    employment_type: formValue.employment_type?.value,
                    priority: formValue.priority?.value,
                    deadline: formValue.deadline instanceof Date ? formValue.deadline.toISOString().split('T')[0] : formValue.deadline,
                    request_justification: formValue.request_justification
                };
                this.vacancies = [...this.vacancies];
                this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Вакансия обновлена' });
            }
        } else {
            const newVacancy: Vacancy = {
                id: this.nextId++,
                title: formValue.title,
                department_id: formValue.department_id?.id,
                department_name: formValue.department_id?.name,
                position_id: formValue.position_id?.id,
                position_name: formValue.position_id?.name,
                description: formValue.description,
                requirements: formValue.requirements,
                responsibilities: formValue.responsibilities,
                experience_years: formValue.experience_years,
                salary_from: formValue.salary_from,
                salary_to: formValue.salary_to,
                employment_type: formValue.employment_type?.value,
                priority: formValue.priority?.value || 'normal',
                deadline: formValue.deadline instanceof Date ? formValue.deadline.toISOString().split('T')[0] : formValue.deadline,
                request_justification: formValue.request_justification,
                status: 'draft',
                applications_count: 0,
                requested_by: 1,
                requested_by_name: 'Текущий пользователь',
                request_date: new Date().toISOString().split('T')[0]
            };
            this.vacancies = [...this.vacancies, newVacancy];
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Вакансия создана' });
        }

        this.displayVacancyDialog = false;
    }

    submitForApproval(vacancy: Vacancy): void {
        const index = this.vacancies.findIndex(v => v.id === vacancy.id);
        if (index !== -1) {
            this.vacancies[index].status = 'pending_approval';
            this.vacancies = [...this.vacancies];
            this.messageService.add({ severity: 'info', summary: 'Отправлено', detail: 'Вакансия отправлена на согласование' });
        }
    }

    approveVacancy(vacancy: Vacancy): void {
        const index = this.vacancies.findIndex(v => v.id === vacancy.id);
        if (index !== -1) {
            this.vacancies[index] = {
                ...this.vacancies[index],
                status: 'approved',
                approved_by: 3,
                approved_by_name: 'Соколов Андрей',
                approved_date: new Date().toISOString().split('T')[0],
                finance_approved: true
            };
            this.vacancies = [...this.vacancies];
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Вакансия согласована' });
        }
    }

    publishVacancy(vacancy: Vacancy): void {
        const index = this.vacancies.findIndex(v => v.id === vacancy.id);
        if (index !== -1) {
            this.vacancies[index] = {
                ...this.vacancies[index],
                status: 'open',
                published_at: new Date().toISOString().split('T')[0]
            };
            this.vacancies = [...this.vacancies];
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Вакансия опубликована на портале госслужбы' });
        }
    }

    closeVacancy(vacancy: Vacancy): void {
        const index = this.vacancies.findIndex(v => v.id === vacancy.id);
        if (index !== -1) {
            this.vacancies[index] = {
                ...this.vacancies[index],
                status: 'closed',
                closed_at: new Date().toISOString().split('T')[0]
            };
            this.vacancies = [...this.vacancies];
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Вакансия закрыта' });
        }
    }

    // =====================
    // КАНДИДАТЫ
    // =====================

    openCandidateDialog(): void {
        this.isEditMode = false;
        this.selectedCandidate = null;
        this.submitted = false;
        this.candidateForm.reset();
        this.displayCandidateDialog = true;
    }

    openCandidateDetail(candidate: Candidate): void {
        this.selectedCandidate = candidate;
        this.displayCandidateDetailDialog = true;
    }

    saveCandidate(): void {
        this.submitted = true;
        if (this.candidateForm.invalid) return;

        const formValue = this.candidateForm.value;
        const selectedVacancy = this.vacancies.find(v => v.id === formValue.vacancy_id?.id);

        const newCandidate: Candidate = {
            id: this.nextId++,
            vacancy_id: formValue.vacancy_id?.id,
            vacancy_title: selectedVacancy?.title,
            full_name: formValue.full_name,
            email: formValue.email,
            phone: formValue.phone,
            source: formValue.source?.value,
            salary_expectation: formValue.salary_expectation,
            available_from: formValue.available_from instanceof Date ? formValue.available_from.toISOString().split('T')[0] : formValue.available_from,
            cover_letter: formValue.cover_letter,
            status: 'new',
            stage: 'application',
            created_at: new Date().toISOString().split('T')[0]
        };

        this.candidates = [...this.candidates, newCandidate];

        // Обновляем счетчик заявок
        if (selectedVacancy) {
            const vacancyIndex = this.vacancies.findIndex(v => v.id === selectedVacancy.id);
            if (vacancyIndex !== -1) {
                this.vacancies[vacancyIndex].applications_count = (this.vacancies[vacancyIndex].applications_count || 0) + 1;
                this.vacancies = [...this.vacancies];
            }
        }

        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Кандидат добавлен' });
        this.displayCandidateDialog = false;
    }

    // Скрининг кандидата
    screenCandidate(candidate: Candidate, passed: boolean): void {
        const index = this.candidates.findIndex(c => c.id === candidate.id);
        if (index !== -1) {
            if (passed) {
                this.candidates[index] = {
                    ...this.candidates[index],
                    status: 'screening',
                    stage: 'screening'
                };
                this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Кандидат прошел первичный отбор' });
            } else {
                this.selectedCandidate = candidate;
                this.rejectForm.reset();
                this.displayRejectDialog = true;
            }
            this.candidates = [...this.candidates];
        }
    }

    // =====================
    // СОБЕСЕДОВАНИЯ
    // =====================

    openInterviewDialog(candidate: Candidate): void {
        this.selectedCandidate = candidate;
        this.submitted = false;
        this.interviewForm.reset({ duration_minutes: 60 });
        this.displayInterviewDialog = true;
    }

    scheduleInterview(): void {
        this.submitted = true;
        if (this.interviewForm.invalid || !this.selectedCandidate) return;

        const formValue = this.interviewForm.value;
        const interviewer = this.interviewers.find(i => i.id === formValue.interviewer_id?.id);

        const newInterview: Interview = {
            id: this.nextId++,
            candidate_id: this.selectedCandidate.id,
            vacancy_id: this.selectedCandidate.vacancy_id,
            interviewer_id: formValue.interviewer_id?.id,
            interviewer_name: interviewer?.name,
            interview_type: formValue.interview_type?.value,
            stage: formValue.interview_type?.value === 'phone' ? 'initial' :
                   formValue.interview_type?.value === 'technical' ? 'technical' : 'manager',
            scheduled_at: formValue.scheduled_at instanceof Date ? formValue.scheduled_at.toISOString() : formValue.scheduled_at,
            duration_minutes: formValue.duration_minutes,
            location: formValue.location,
            meeting_link: formValue.meeting_link,
            status: 'scheduled'
        };

        const candidateIndex = this.candidates.findIndex(c => c.id === this.selectedCandidate!.id);
        if (candidateIndex !== -1) {
            if (!this.candidates[candidateIndex].interviews) {
                this.candidates[candidateIndex].interviews = [];
            }
            this.candidates[candidateIndex].interviews!.push(newInterview);

            // Обновляем статус кандидата
            if (this.candidates[candidateIndex].status === 'screening' || this.candidates[candidateIndex].status === 'new') {
                this.candidates[candidateIndex].status = 'phone_interview';
                this.candidates[candidateIndex].stage = 'interview';
            } else if (this.candidates[candidateIndex].status === 'phone_interview') {
                this.candidates[candidateIndex].status = 'interview';
            }

            this.candidates = [...this.candidates];
        }

        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Собеседование запланировано' });
        this.displayInterviewDialog = false;
    }

    openFeedbackDialog(candidate: Candidate, interview: Interview): void {
        this.selectedCandidate = candidate;
        this.selectedInterview = interview;
        this.feedbackForm.reset({ overall_rating: 3 });
        this.displayInterviewFeedbackDialog = true;
    }

    saveFeedback(): void {
        this.submitted = true;
        if (this.feedbackForm.invalid || !this.selectedCandidate || !this.selectedInterview) return;

        const formValue = this.feedbackForm.value;

        const candidateIndex = this.candidates.findIndex(c => c.id === this.selectedCandidate!.id);
        if (candidateIndex !== -1 && this.candidates[candidateIndex].interviews) {
            const interviewIndex = this.candidates[candidateIndex].interviews!.findIndex(i => i.id === this.selectedInterview!.id);
            if (interviewIndex !== -1) {
                this.candidates[candidateIndex].interviews![interviewIndex] = {
                    ...this.candidates[candidateIndex].interviews![interviewIndex],
                    status: 'completed',
                    overall_rating: formValue.overall_rating,
                    recommendation: formValue.recommendation?.value,
                    strengths: formValue.strengths ? formValue.strengths.split(',').map((s: string) => s.trim()) : [],
                    weaknesses: formValue.weaknesses ? formValue.weaknesses.split(',').map((s: string) => s.trim()) : [],
                    feedback: formValue.feedback,
                    completed_at: new Date().toISOString()
                };

                // Обновляем рейтинг кандидата
                const interview = this.candidates[candidateIndex].interviews![interviewIndex];
                if (interview.interview_type === 'hr' || interview.interview_type === 'phone') {
                    this.candidates[candidateIndex].hr_rating = formValue.overall_rating;
                } else if (interview.interview_type === 'technical') {
                    this.candidates[candidateIndex].technical_rating = formValue.overall_rating;
                }

                this.candidates = [...this.candidates];
            }
        }

        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Обратная связь сохранена' });
        this.displayInterviewFeedbackDialog = false;
    }

    // =====================
    // ПРОВЕРКИ
    // =====================

    openReferenceDialog(candidate: Candidate): void {
        this.selectedCandidate = candidate;
        this.submitted = false;
        this.referenceForm.reset();
        this.displayReferenceDialog = true;
    }

    addReference(): void {
        this.submitted = true;
        if (this.referenceForm.invalid || !this.selectedCandidate) return;

        const formValue = this.referenceForm.value;

        const newReference: ReferenceCheck = {
            id: this.nextId++,
            candidate_id: this.selectedCandidate.id,
            referee_name: formValue.referee_name,
            referee_position: formValue.referee_position,
            referee_company: formValue.referee_company,
            referee_phone: formValue.referee_phone,
            relationship: formValue.relationship,
            status: 'pending'
        };

        const candidateIndex = this.candidates.findIndex(c => c.id === this.selectedCandidate!.id);
        if (candidateIndex !== -1) {
            if (!this.candidates[candidateIndex].reference_checks) {
                this.candidates[candidateIndex].reference_checks = [];
            }
            this.candidates[candidateIndex].reference_checks!.push(newReference);

            if (this.candidates[candidateIndex].status === 'interview') {
                this.candidates[candidateIndex].status = 'reference_check';
                this.candidates[candidateIndex].stage = 'verification';
            }

            this.candidates = [...this.candidates];
        }

        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Рекомендация добавлена' });
        this.displayReferenceDialog = false;
    }

    completeReferenceCheck(candidate: Candidate, reference: ReferenceCheck): void {
        const candidateIndex = this.candidates.findIndex(c => c.id === candidate.id);
        if (candidateIndex !== -1 && this.candidates[candidateIndex].reference_checks) {
            const refIndex = this.candidates[candidateIndex].reference_checks!.findIndex(r => r.id === reference.id);
            if (refIndex !== -1) {
                this.candidates[candidateIndex].reference_checks![refIndex] = {
                    ...this.candidates[candidateIndex].reference_checks![refIndex],
                    status: 'completed',
                    feedback: 'Положительный отзыв',
                    rating: 4,
                    would_rehire: true,
                    completed_at: new Date().toISOString()
                };
                this.candidates = [...this.candidates];
                this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Проверка рекомендации завершена' });
            }
        }
    }

    // =====================
    // ОФФЕРЫ
    // =====================

    openOfferDialog(candidate: Candidate): void {
        this.selectedCandidate = candidate;
        this.submitted = false;

        const vacancy = this.vacancies.find(v => v.id === candidate.vacancy_id);
        this.offerForm.patchValue({
            offered_salary: candidate.salary_expectation || vacancy?.salary_to,
            start_date: new Date(new Date().setDate(new Date().getDate() + 14)),
            probation_period_months: 3
        });

        this.displayOfferDialog = true;
    }

    sendOffer(): void {
        this.submitted = true;
        if (this.offerForm.invalid || !this.selectedCandidate) return;

        const formValue = this.offerForm.value;
        const vacancy = this.vacancies.find(v => v.id === this.selectedCandidate!.vacancy_id);

        const newOffer: JobOffer = {
            id: this.nextId++,
            candidate_id: this.selectedCandidate.id,
            vacancy_id: this.selectedCandidate.vacancy_id,
            offered_salary: formValue.offered_salary,
            offered_position: vacancy?.position_name || '',
            offered_department: vacancy?.department_name || '',
            start_date: formValue.start_date instanceof Date ? formValue.start_date.toISOString().split('T')[0] : formValue.start_date,
            contract_type: 'permanent',
            probation_period_months: formValue.probation_period_months,
            benefits: formValue.benefits ? formValue.benefits.split(',').map((b: string) => b.trim()) : [],
            other_terms: formValue.other_terms,
            status: 'sent',
            sent_at: new Date().toISOString().split('T')[0],
            expires_at: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
        };

        const candidateIndex = this.candidates.findIndex(c => c.id === this.selectedCandidate!.id);
        if (candidateIndex !== -1) {
            this.candidates[candidateIndex] = {
                ...this.candidates[candidateIndex],
                offer: newOffer,
                status: 'offer',
                stage: 'offer'
            };
            this.candidates = [...this.candidates];
        }

        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Оффер отправлен кандидату' });
        this.displayOfferDialog = false;
    }

    acceptOffer(candidate: Candidate): void {
        const index = this.candidates.findIndex(c => c.id === candidate.id);
        if (index !== -1 && this.candidates[index].offer) {
            this.candidates[index].offer!.status = 'accepted';
            this.candidates[index].offer!.responded_at = new Date().toISOString().split('T')[0];
            this.candidates[index].status = 'offer_accepted';
            this.candidates = [...this.candidates];
            this.messageService.add({ severity: 'success', summary: 'Отлично!', detail: 'Кандидат принял предложение' });
        }
    }

    // =====================
    // НАЙМ И АДАПТАЦИЯ
    // =====================

    hireCandidate(candidate: Candidate): void {
        const index = this.candidates.findIndex(c => c.id === candidate.id);
        if (index !== -1) {
            const employeeId = this.nextId++;

            this.candidates[index] = {
                ...this.candidates[index],
                status: 'hired',
                stage: 'hired',
                hired_date: new Date().toISOString().split('T')[0],
                employee_id: employeeId
            };

            // Создаем запись онбординга
            const newOnboarding: Onboarding = {
                id: this.nextId++,
                employee_id: employeeId,
                employee_name: candidate.full_name,
                vacancy_id: candidate.vacancy_id,
                start_date: candidate.offer?.start_date || new Date().toISOString().split('T')[0],
                status: 'not_started',
                tasks: [
                    { id: 1, title: 'Оформление документов', category: 'documents', status: 'pending', due_date: candidate.offer?.start_date },
                    { id: 2, title: 'Создание учетной записи email', category: 'it_setup', status: 'pending' },
                    { id: 3, title: 'Настройка доступа к системам', category: 'it_setup', status: 'pending' },
                    { id: 4, title: 'Вводное обучение', category: 'training', status: 'pending' },
                    { id: 5, title: 'Знакомство с командой', category: 'introduction', status: 'pending' },
                    { id: 6, title: 'Ознакомление с политиками компании', category: 'compliance', status: 'pending' }
                ],
                documents_submitted: [],
                documents_pending: ['Паспорт', 'ИНН', 'СНИЛС', 'Трудовая книжка', 'Фото 3x4', 'Диплом'],
                overall_progress: 0
            };

            this.onboardings = [...this.onboardings, newOnboarding];

            // Закрываем вакансию
            const vacancyIndex = this.vacancies.findIndex(v => v.id === candidate.vacancy_id);
            if (vacancyIndex !== -1) {
                this.vacancies[vacancyIndex] = {
                    ...this.vacancies[vacancyIndex],
                    status: 'closed',
                    closed_at: new Date().toISOString().split('T')[0],
                    hired_candidate_id: candidate.id
                };
                this.vacancies = [...this.vacancies];
            }

            this.candidates = [...this.candidates];
            this.messageService.add({ severity: 'success', summary: 'Поздравляем!', detail: 'Сотрудник успешно принят на работу' });
        }
    }

    assignMentor(onboarding: Onboarding): void {
        const index = this.onboardings.findIndex(o => o.id === onboarding.id);
        if (index !== -1) {
            this.onboardings[index] = {
                ...this.onboardings[index],
                mentor_id: 7,
                mentor_name: 'Волкова Ольга Николаевна',
                status: 'in_progress'
            };
            this.onboardings = [...this.onboardings];
            this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Наставник назначен' });
        }
    }

    completeOnboardingTask(onboarding: Onboarding, task: OnboardingTask): void {
        const onboardingIndex = this.onboardings.findIndex(o => o.id === onboarding.id);
        if (onboardingIndex !== -1) {
            const taskIndex = this.onboardings[onboardingIndex].tasks.findIndex(t => t.id === task.id);
            if (taskIndex !== -1) {
                this.onboardings[onboardingIndex].tasks[taskIndex] = {
                    ...this.onboardings[onboardingIndex].tasks[taskIndex],
                    status: 'completed',
                    completed_at: new Date().toISOString()
                };

                // Пересчитываем прогресс
                const completedTasks = this.onboardings[onboardingIndex].tasks.filter(t => t.status === 'completed').length;
                const totalTasks = this.onboardings[onboardingIndex].tasks.length;
                this.onboardings[onboardingIndex].overall_progress = Math.round((completedTasks / totalTasks) * 100);

                this.onboardings = [...this.onboardings];
                this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Задача выполнена' });
            }
        }
    }

    // =====================
    // ОТКЛОНЕНИЕ
    // =====================

    openRejectDialog(candidate: Candidate): void {
        this.selectedCandidate = candidate;
        this.rejectForm.reset();
        this.displayRejectDialog = true;
    }

    rejectCandidate(): void {
        this.submitted = true;
        if (this.rejectForm.invalid || !this.selectedCandidate) return;

        const index = this.candidates.findIndex(c => c.id === this.selectedCandidate!.id);
        if (index !== -1) {
            this.candidates[index] = {
                ...this.candidates[index],
                status: 'rejected',
                stage: 'closed',
                rejection_reason: this.rejectForm.value.rejection_reason,
                rejection_date: new Date().toISOString().split('T')[0]
            };
            this.candidates = [...this.candidates];
            this.messageService.add({ severity: 'info', summary: 'Готово', detail: 'Кандидат отклонён, уведомление отправлено' });
        }

        this.displayRejectDialog = false;
    }

    // =====================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // =====================

    onGlobalFilter(table: Table, event: Event): void {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getVacancyStatusSeverity(status: VacancyStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'open': return 'success';
            case 'approved': return 'info';
            case 'pending_approval': return 'warn';
            case 'draft': return 'secondary';
            case 'on_hold': return 'warn';
            case 'closed': return 'danger';
            case 'cancelled': return 'danger';
            default: return 'info';
        }
    }

    getCandidateStatusSeverity(status: CandidateStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'hired': return 'success';
            case 'offer_accepted': return 'success';
            case 'offer': return 'info';
            case 'interview': return 'info';
            case 'phone_interview': return 'info';
            case 'reference_check': return 'warn';
            case 'background_check': return 'warn';
            case 'technical_test': return 'warn';
            case 'screening': return 'secondary';
            case 'new': return 'secondary';
            case 'rejected': return 'danger';
            case 'withdrawn': return 'danger';
            default: return 'info';
        }
    }

    getOnboardingStatusSeverity(status: OnboardingStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'info';
            case 'not_started': return 'secondary';
            case 'extended': return 'warn';
            case 'terminated': return 'danger';
            default: return 'info';
        }
    }

    getStatusLabel(status: string, type: 'vacancy' | 'candidate' | 'onboarding'): string {
        let list: { value: string; label: string }[] = [];
        if (type === 'vacancy') list = this.vacancyStatuses;
        else if (type === 'candidate') list = this.candidateStatuses;
        const found = list.find(s => s.value === status);
        return found ? found.label : status;
    }

    getVacanciesForSelect() {
        return this.vacancies
            .filter(v => v.status === 'open')
            .map(v => ({ id: v.id, name: v.title }));
    }

    getStageProgress(stage: RecruitingStage): number {
        const stageInfo = this.recruitingStages.find(s => s.value === stage);
        return stageInfo ? (stageInfo.order / 8) * 100 : 0;
    }

    // Геттеры для статистики
    get openVacanciesCount(): number {
        return this.vacancies.filter(v => v.status === 'open').length;
    }

    get pendingApprovalCount(): number {
        return this.vacancies.filter(v => v.status === 'pending_approval').length;
    }

    get newCandidatesCount(): number {
        return this.candidates.filter(c => c.status === 'new').length;
    }

    get interviewingCount(): number {
        return this.candidates.filter(c => ['phone_interview', 'interview', 'technical_test'].includes(c.status)).length;
    }

    get offersCount(): number {
        return this.candidates.filter(c => c.status === 'offer' || c.status === 'offer_accepted').length;
    }

    get activeOnboardingsCount(): number {
        return this.onboardings.filter(o => o.status === 'in_progress').length;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
