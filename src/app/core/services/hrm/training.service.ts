import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { BASE_URL } from '@/core/services/api.service';
import { Training, TrainingPayload, TrainingParticipant, Certificate, DevelopmentPlan, DevelopmentGoal } from '@/core/interfaces/hrm/training';

const API_URL = BASE_URL + '/hrm/training';
const USE_MOCK = !BASE_URL;

const MOCK_TRAININGS: Training[] = [
    {
        id: 1, title: 'Охрана труда и промышленная безопасность', description: 'Обязательное обучение по охране труда для сотрудников энергетических объектов',
        training_type: 'course', provider: 'Центр ОТ и ПБ', start_date: '2026-03-10', end_date: '2026-03-14', duration_hours: 40,
        location: 'Учебный центр, г.Ташкент', is_online: false, max_participants: 30, current_participants: 24, status: 'planned', cost: 5000000, certificate_provided: true
    },
    {
        id: 2, title: 'SAP ERP: Модуль управления персоналом', description: 'Углублённое обучение модулю HR в SAP',
        training_type: 'course', provider: 'SAP Academy', start_date: '2026-02-01', end_date: '2026-02-15', duration_hours: 80,
        location: 'Онлайн', is_online: true, max_participants: 20, current_participants: 18, status: 'in_progress', cost: 15000000, certificate_provided: true
    },
    {
        id: 3, title: 'Управление проектами (PMI)', description: 'Подготовка к сертификации PMP',
        training_type: 'certification', provider: 'PMI Chapter Uzbekistan', start_date: '2026-01-15', end_date: '2026-02-28', duration_hours: 120,
        location: 'Бизнес-центр «Пойтахт»', is_online: false, max_participants: 15, current_participants: 12, status: 'completed', cost: 25000000, certificate_provided: true
    },
    {
        id: 4, title: 'Деловой английский язык (B2)', description: 'Курс делового английского для руководителей',
        training_type: 'course', provider: 'British Council', start_date: '2026-03-01', end_date: '2026-06-30', duration_hours: 96,
        location: 'Онлайн', is_online: true, max_participants: 12, current_participants: 10, status: 'in_progress', cost: 8000000, certificate_provided: true
    },
    {
        id: 5, title: 'Семинар: Новое в трудовом законодательстве 2026', description: 'Обзор изменений в ТК РУз',
        training_type: 'seminar', provider: 'Юридический консалтинг', start_date: '2026-04-05', end_date: '2026-04-05', duration_hours: 8,
        location: 'Конференц-зал, ГО', is_online: false, max_participants: 50, current_participants: 35, status: 'planned', cost: 2000000, certificate_provided: false
    },
    {
        id: 6, title: 'Лидерство и управление командой', description: 'Воркшоп для руководителей среднего звена',
        training_type: 'workshop', provider: 'HR Academy', start_date: '2026-02-20', end_date: '2026-02-22', duration_hours: 24,
        location: 'Учебный центр, г.Ташкент', is_online: false, max_participants: 20, current_participants: 20, status: 'completed', cost: 12000000, certificate_provided: true
    }
];

const MOCK_PARTICIPANTS: TrainingParticipant[] = [
    { id: 1, training_id: 1, employee_id: 1, employee_name: 'Каримов Бахтиёр Рустамович', enrollment_date: '2026-02-15', status: 'enrolled', training_title: 'Охрана труда и промышленная безопасность' },
    { id: 2, training_id: 1, employee_id: 2, employee_name: 'Султанова Дилноза Камолидиновна', enrollment_date: '2026-02-16', status: 'enrolled', training_title: 'Охрана труда и промышленная безопасность' },
    { id: 3, training_id: 3, employee_id: 3, employee_name: 'Рахимов Отабек Шухратович', enrollment_date: '2026-01-10', completion_date: '2026-02-28', status: 'completed', score: 92, training_title: 'Управление проектами (PMI)' },
    { id: 4, training_id: 2, employee_id: 4, employee_name: 'Абдуллаев Жасур Тохирович', enrollment_date: '2026-01-25', status: 'in_progress', training_title: 'SAP ERP: Модуль управления персоналом' },
    { id: 5, training_id: 6, employee_id: 5, employee_name: 'Мирзаева Нодира Бахтиёровна', enrollment_date: '2026-02-10', completion_date: '2026-02-22', status: 'completed', score: 88, training_title: 'Лидерство и управление командой' }
];

const MOCK_PLANS: DevelopmentPlan[] = [
    {
        id: 1, employee_id: 1, employee_name: 'Каримов Бахтиёр Рустамович', title: 'Развитие управленческих компетенций',
        description: 'План развития на 2026 год', start_date: '2026-01-01', target_date: '2026-12-31', status: 'active',
        goals: [
            { id: 1, plan_id: 1, title: 'Пройти курс PMI', target_date: '2026-06-30', status: 'in_progress', progress_percent: 45 },
            { id: 2, plan_id: 1, title: 'Получить сертификат PMP', target_date: '2026-09-30', status: 'not_started', progress_percent: 0 }
        ]
    },
    {
        id: 2, employee_id: 3, employee_name: 'Рахимов Отабек Шухратович', title: 'Техническое развитие',
        description: 'Повышение квалификации в области производства', start_date: '2026-01-01', target_date: '2026-06-30', status: 'active',
        goals: [
            { id: 3, plan_id: 2, title: 'Изучить новое оборудование', target_date: '2026-04-30', status: 'in_progress', progress_percent: 70 },
            { id: 4, plan_id: 2, title: 'Сдать аттестацию', target_date: '2026-06-30', status: 'not_started', progress_percent: 0 }
        ]
    }
];

@Injectable({
    providedIn: 'root'
})
export class TrainingService {
    private http = inject(HttpClient);

    // Trainings
    getTrainings(params?: { status?: string; type?: string }): Observable<Training[]> {
        if (USE_MOCK) {
            let result = [...MOCK_TRAININGS];
            if (params?.status) result = result.filter(t => t.status === params.status);
            if (params?.type) result = result.filter(t => t.training_type === params.type);
            return of(result).pipe(delay(200));
        }
        let httpParams = new HttpParams();
        if (params?.status) httpParams = httpParams.set('status', params.status);
        if (params?.type) httpParams = httpParams.set('type', params.type);
        return this.http.get<Training[]>(`${API_URL}/trainings`, { params: httpParams });
    }

    getTrainingById(id: number): Observable<Training> {
        if (USE_MOCK) return of(MOCK_TRAININGS.find(t => t.id === id) || MOCK_TRAININGS[0]).pipe(delay(150));
        return this.http.get<Training>(`${API_URL}/trainings/${id}`);
    }

    createTraining(payload: TrainingPayload): Observable<Training> {
        if (USE_MOCK) return of({ ...MOCK_TRAININGS[0], ...payload, id: Date.now() } as Training).pipe(delay(200));
        return this.http.post<Training>(`${API_URL}/trainings`, payload);
    }

    updateTraining(id: number, payload: Partial<TrainingPayload>): Observable<Training> {
        if (USE_MOCK) return of({ ...MOCK_TRAININGS[0], ...payload, id } as Training).pipe(delay(200));
        return this.http.put<Training>(`${API_URL}/trainings/${id}`, payload);
    }

    deleteTraining(id: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(`${API_URL}/trainings/${id}`);
    }

    // Participants
    getParticipants(trainingId: number): Observable<TrainingParticipant[]> {
        if (USE_MOCK) return of(MOCK_PARTICIPANTS.filter(p => p.training_id === trainingId)).pipe(delay(200));
        return this.http.get<TrainingParticipant[]>(`${API_URL}/trainings/${trainingId}/participants`);
    }

    enrollParticipant(trainingId: number, employeeId: number): Observable<TrainingParticipant> {
        if (USE_MOCK) return of({ ...MOCK_PARTICIPANTS[0], id: Date.now(), training_id: trainingId, employee_id: employeeId }).pipe(delay(200));
        return this.http.post<TrainingParticipant>(`${API_URL}/trainings/${trainingId}/participants`, { employee_id: employeeId });
    }

    removeParticipant(trainingId: number, participantId: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(`${API_URL}/trainings/${trainingId}/participants/${participantId}`);
    }

    completeParticipant(trainingId: number, participantId: number, score?: number): Observable<TrainingParticipant> {
        if (USE_MOCK) return of({ ...MOCK_PARTICIPANTS[0], status: 'completed' as const, score }).pipe(delay(200));
        return this.http.post<TrainingParticipant>(`${API_URL}/trainings/${trainingId}/participants/${participantId}/complete`, { score });
    }

    getEmployeeTrainings(employeeId: number): Observable<TrainingParticipant[]> {
        if (USE_MOCK) return of(MOCK_PARTICIPANTS.filter(p => p.employee_id === employeeId)).pipe(delay(200));
        return this.http.get<TrainingParticipant[]>(`${API_URL}/employees/${employeeId}/trainings`);
    }

    // Certificates
    getCertificates(employeeId: number): Observable<Certificate[]> {
        if (USE_MOCK) return of([
            { id: 1, employee_id: employeeId, employee_name: 'Каримов Б.Р.', certificate_name: 'PMP Certificate', issuing_organization: 'PMI', issue_date: '2026-02-28', expiry_date: '2029-02-28', certificate_number: 'PMP-2026-001' }
        ]).pipe(delay(200));
        return this.http.get<Certificate[]>(`${API_URL}/employees/${employeeId}/certificates`);
    }

    addCertificate(employeeId: number, certificate: Partial<Certificate>, file?: File): Observable<Certificate> {
        if (USE_MOCK) return of({ id: Date.now(), employee_id: employeeId, employee_name: '', certificate_name: '', issuing_organization: '', issue_date: '', ...certificate } as Certificate).pipe(delay(200));
        const formData = new FormData();
        Object.keys(certificate).forEach(key => {
            const value = (certificate as any)[key];
            if (value !== undefined && value !== null) formData.append(key, value);
        });
        if (file) formData.append('file', file);
        return this.http.post<Certificate>(`${API_URL}/employees/${employeeId}/certificates`, formData);
    }

    deleteCertificate(employeeId: number, certificateId: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(`${API_URL}/employees/${employeeId}/certificates/${certificateId}`);
    }

    // Development Plans
    getDevelopmentPlans(employeeId?: number): Observable<DevelopmentPlan[]> {
        if (USE_MOCK) {
            let result = [...MOCK_PLANS];
            if (employeeId) result = result.filter(p => p.employee_id === employeeId);
            return of(result).pipe(delay(200));
        }
        let params = new HttpParams();
        if (employeeId) params = params.set('employee_id', employeeId.toString());
        return this.http.get<DevelopmentPlan[]>(`${API_URL}/development-plans`, { params });
    }

    getDevelopmentPlanById(id: number): Observable<DevelopmentPlan> {
        if (USE_MOCK) return of(MOCK_PLANS.find(p => p.id === id) || MOCK_PLANS[0]).pipe(delay(150));
        return this.http.get<DevelopmentPlan>(`${API_URL}/development-plans/${id}`);
    }

    createDevelopmentPlan(plan: Partial<DevelopmentPlan>): Observable<DevelopmentPlan> {
        if (USE_MOCK) return of({ ...MOCK_PLANS[0], ...plan, id: Date.now() } as DevelopmentPlan).pipe(delay(200));
        return this.http.post<DevelopmentPlan>(`${API_URL}/development-plans`, plan);
    }

    updateDevelopmentPlan(id: number, plan: Partial<DevelopmentPlan>): Observable<DevelopmentPlan> {
        if (USE_MOCK) return of({ ...MOCK_PLANS[0], ...plan, id } as DevelopmentPlan).pipe(delay(200));
        return this.http.put<DevelopmentPlan>(`${API_URL}/development-plans/${id}`, plan);
    }

    deleteDevelopmentPlan(id: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(`${API_URL}/development-plans/${id}`);
    }

    // Goals
    addGoal(planId: number, goal: Partial<DevelopmentGoal>): Observable<DevelopmentGoal> {
        if (USE_MOCK) return of({ id: Date.now(), plan_id: planId, title: '', target_date: '', status: 'not_started' as const, progress_percent: 0, ...goal } as DevelopmentGoal).pipe(delay(200));
        return this.http.post<DevelopmentGoal>(`${API_URL}/development-plans/${planId}/goals`, goal);
    }

    updateGoal(planId: number, goalId: number, goal: Partial<DevelopmentGoal>): Observable<DevelopmentGoal> {
        if (USE_MOCK) return of({ id: goalId, plan_id: planId, title: '', target_date: '', status: 'in_progress' as const, progress_percent: 50, ...goal } as DevelopmentGoal).pipe(delay(200));
        return this.http.put<DevelopmentGoal>(`${API_URL}/development-plans/${planId}/goals/${goalId}`, goal);
    }

    deleteGoal(planId: number, goalId: number): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.delete<void>(`${API_URL}/development-plans/${planId}/goals/${goalId}`);
    }
}
