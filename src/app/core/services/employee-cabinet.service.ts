import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, map } from 'rxjs';
import {
    EmployeeProfile,
    LeaveBalance,
    MyVacationRequest,
    MySalaryInfo,
    SalaryPayment,
    SalaryPaymentStatus,
    MyTraining,
    CompletedTraining,
    CurrentTraining,
    AssignedTraining,
    MyCompetencies,
    CompetencyScore,
    MyNotification,
    MyTask,
    MyDocument
} from '@/core/interfaces/hrm/employee-cabinet';
import { Salary, SalaryStatus } from '@/core/interfaces/hrm/salary';

const MY_PROFILE = '/my-profile';
const MY_LEAVE_BALANCE = '/my-leave-balance';
const MY_VACATIONS = '/my-vacations';
const MY_SALARY = '/my-salary';
const MY_TRAINING = '/my-training';
const MY_COMPETENCIES = '/my-competencies';
const MY_NOTIFICATIONS = '/my-notifications';
const MY_TASKS = '/my-tasks';
const MY_DOCUMENTS = '/my-documents';

// Flat backend response shapes for type safety (S4)
interface FlatTrainingItem {
    id: number;
    course_id?: number;
    course_name?: string;
    title?: string;
    course_type?: string;
    training_type?: string;
    status: string;
    score?: number;
    certificate_number?: string;
    certificate_url?: string;
    completed_at?: string;
    end_date?: string;
    started_at?: string;
    start_date?: string;
    deadline?: string;
    progress_percent?: number;
    progress?: number;
    modules_completed?: number;
    modules_total?: number;
    assigned_at?: string;
    created_at?: string;
    assigned_by_name?: string;
    is_mandatory?: boolean;
}

interface FlatCompetencyItem {
    id?: number;
    employee_id?: number;
    competency_id?: number;
    competency_name?: string;
    name?: string;
    category?: string;
    current_level?: number;
    level?: number;
    score?: number;
    max_level?: number;
    target_level?: number;
    target_date?: string;
    last_assessed_at?: string;
    assessed_at?: string;
}

// Mapper functions (S3)
const ASSIGNED_STATUSES = ['assigned', 'not_started', 'pending'];

function mapSalaryStatus(s: SalaryStatus): SalaryPaymentStatus {
    switch (s) {
        case 'paid': return 'paid';
        case 'approved': return 'approved';
        case 'calculated': return 'calculated';
        case 'rejected': return 'rejected';
        default: return 'pending';
    }
}

function salaryToPayment(s: Salary): SalaryPayment {
    return {
        id: s.id,
        period_month: s.period_month,
        period_year: s.period_year,
        gross_salary: s.gross_salary,
        total_deductions: s.total_deductions,
        net_salary: s.net_salary,
        paid_at: s.paid_at,
        status: mapSalaryStatus(s.status)
    };
}

function mapSalaryArrayToInfo(items: Salary[]): MySalaryInfo | null {
    if (items.length === 0) {
        return null;
    }
    const sorted = [...items].sort((a, b) => {
        if (b.period_year !== a.period_year) return b.period_year - a.period_year;
        return b.period_month - a.period_month;
    });
    const latest = sorted[0];
    return {
        employee_id: latest.employee_id,
        current_salary: {
            base_salary: latest.base_salary ?? 0,
            total_allowances: (latest.rank_allowance ?? 0) + (latest.education_allowance ?? 0) + (latest.seniority_allowance ?? 0) + (latest.other_allowances ?? 0),
            gross_salary: latest.gross_salary ?? 0
        },
        last_payment: salaryToPayment(latest),
        payment_history: sorted.map(salaryToPayment)
    };
}

function mapTrainingArrayToMyTraining(items: FlatTrainingItem[]): MyTraining {
    const completed: CompletedTraining[] = items
        .filter((t) => t.status === 'completed')
        .map((t) => ({
            id: t.id,
            course_id: t.course_id ?? t.id,
            course_name: t.course_name ?? t.title ?? '',
            course_type: t.course_type ?? t.training_type ?? '',
            completed_at: t.completed_at ?? t.end_date ?? '',
            score: t.score,
            certificate_number: t.certificate_number,
            certificate_url: t.certificate_url
        }));
    const in_progress: CurrentTraining[] = items
        .filter((t) => t.status === 'in_progress')
        .map((t) => ({
            id: t.id,
            course_id: t.course_id ?? t.id,
            course_name: t.course_name ?? t.title ?? '',
            course_type: t.course_type ?? t.training_type ?? '',
            started_at: t.started_at ?? t.start_date ?? '',
            deadline: t.deadline,
            progress_percent: t.progress_percent ?? t.progress ?? 0,
            modules_completed: t.modules_completed ?? 0,
            modules_total: t.modules_total ?? 0
        }));
    const assigned: AssignedTraining[] = items
        .filter((t) => ASSIGNED_STATUSES.includes(t.status))
        .map((t) => ({
            id: t.id,
            course_id: t.course_id ?? t.id,
            course_name: t.course_name ?? t.title ?? '',
            course_type: t.course_type ?? t.training_type ?? '',
            assigned_at: t.assigned_at ?? t.created_at ?? '',
            start_date: t.start_date ?? '',
            deadline: t.deadline ?? '',
            assigned_by_name: t.assigned_by_name ?? '',
            is_mandatory: t.is_mandatory ?? false
        }));
    return { completed, in_progress, assigned };
}

function mapCompetencyArrayToMyCompetencies(items: FlatCompetencyItem[]): MyCompetencies {
    const competencies: CompetencyScore[] = items.map((c) => ({
        competency_id: c.competency_id ?? c.id ?? 0,
        competency_name: c.competency_name ?? c.name ?? '',
        category: c.category ?? '',
        current_level: c.current_level ?? c.level ?? c.score ?? 0,
        max_level: c.max_level ?? 5,
        target_level: c.target_level,
        target_date: c.target_date,
        last_assessed_at: c.last_assessed_at ?? c.assessed_at
    }));
    const dates = competencies.map((c) => c.last_assessed_at).filter(Boolean) as string[];
    const last_assessment_date = dates.length ? dates.sort()[dates.length - 1] : undefined;
    const average_score = competencies.length ? competencies.reduce((sum, c) => sum + c.current_level, 0) / competencies.length : 0;
    return {
        employee_id: 0,
        last_assessment_date,
        competencies,
        development_plan: [],
        average_score: Math.round(average_score * 100) / 100
    };
}

@Injectable({
    providedIn: 'root'
})
export class EmployeeCabinetService extends ApiService {
    // Profile
    getMyProfile(): Observable<EmployeeProfile> {
        return this.http.get<EmployeeProfile>(BASE_URL + MY_PROFILE);
    }

    updateMyProfile(payload: Partial<EmployeeProfile>): Observable<EmployeeProfile> {
        return this.http.patch<EmployeeProfile>(BASE_URL + MY_PROFILE, payload);
    }

    // Leave Balance
    getMyLeaveBalance(): Observable<LeaveBalance> {
        return this.http.get<LeaveBalance>(BASE_URL + MY_LEAVE_BALANCE);
    }

    // Vacations
    getMyVacations(): Observable<MyVacationRequest[]> {
        return this.http.get<MyVacationRequest[]>(BASE_URL + MY_VACATIONS);
    }

    createVacationRequest(payload: Partial<MyVacationRequest>): Observable<MyVacationRequest> {
        return this.http.post<MyVacationRequest>(BASE_URL + MY_VACATIONS, payload);
    }

    cancelVacationRequest(id: number): Observable<MyVacationRequest> {
        return this.http.post<MyVacationRequest>(BASE_URL + MY_VACATIONS + '/' + id + '/cancel', {});
    }

    // Salary
    getMySalaryInfo(): Observable<MySalaryInfo | null> {
        return this.http.get<MySalaryInfo | Salary[]>(BASE_URL + MY_SALARY).pipe(
            map((res) => {
                if (!Array.isArray(res)) {
                    return res as MySalaryInfo;
                }
                return mapSalaryArrayToInfo(res);
            })
        );
    }

    downloadPayslip(paymentId: number): Observable<Blob> {
        return this.http.get(BASE_URL + MY_SALARY + '/payslip/' + paymentId, {
            responseType: 'blob'
        });
    }

    // Training
    getMyTraining(): Observable<MyTraining> {
        return this.http.get<MyTraining | FlatTrainingItem[]>(BASE_URL + MY_TRAINING).pipe(
            map((res) => {
                if (!Array.isArray(res)) {
                    return res as MyTraining;
                }
                return mapTrainingArrayToMyTraining(res);
            })
        );
    }

    // Competencies
    getMyCompetencies(): Observable<MyCompetencies> {
        return this.http.get<MyCompetencies | FlatCompetencyItem[]>(BASE_URL + MY_COMPETENCIES).pipe(
            map((res) => {
                if (!Array.isArray(res)) {
                    return res as MyCompetencies;
                }
                return mapCompetencyArrayToMyCompetencies(res);
            })
        );
    }

    // Notifications
    getMyNotifications(): Observable<MyNotification[]> {
        return this.http.get<MyNotification[]>(BASE_URL + MY_NOTIFICATIONS);
    }

    markNotificationAsRead(id: number): Observable<MyNotification> {
        return this.http.patch<MyNotification>(BASE_URL + MY_NOTIFICATIONS + '/' + id + '/read', {});
    }

    markAllNotificationsAsRead(): Observable<any> {
        return this.http.post(BASE_URL + MY_NOTIFICATIONS + '/read-all', {});
    }

    // Tasks
    getMyTasks(): Observable<MyTask[]> {
        return this.http.get<MyTask[]>(BASE_URL + MY_TASKS);
    }

    // Documents
    getMyDocuments(): Observable<MyDocument[]> {
        return this.http.get<MyDocument[]>(BASE_URL + MY_DOCUMENTS);
    }

    downloadDocument(id: number): Observable<Blob> {
        return this.http.get(BASE_URL + MY_DOCUMENTS + '/' + id + '/download', {
            responseType: 'blob'
        });
    }
}
