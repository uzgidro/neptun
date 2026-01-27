import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import {
    EmployeeProfile,
    LeaveBalance,
    MyVacationRequest,
    MySalaryInfo,
    MyTraining,
    MyCompetencies,
    MyNotification,
    MyTask,
    MyDocument
} from '@/core/interfaces/hrm/employee-cabinet';

const MY_PROFILE = '/my-profile';
const MY_LEAVE_BALANCE = '/my-leave-balance';
const MY_VACATIONS = '/my-vacations';
const MY_SALARY = '/my-salary';
const MY_TRAINING = '/my-training';
const MY_COMPETENCIES = '/my-competencies';
const MY_NOTIFICATIONS = '/my-notifications';
const MY_TASKS = '/my-tasks';
const MY_DOCUMENTS = '/my-documents';

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
    getMySalaryInfo(): Observable<MySalaryInfo> {
        return this.http.get<MySalaryInfo>(BASE_URL + MY_SALARY);
    }

    downloadPayslip(paymentId: number): Observable<Blob> {
        return this.http.get(BASE_URL + MY_SALARY + '/payslip/' + paymentId, {
            responseType: 'blob'
        });
    }

    // Training
    getMyTraining(): Observable<MyTraining> {
        return this.http.get<MyTraining>(BASE_URL + MY_TRAINING);
    }

    // Competencies
    getMyCompetencies(): Observable<MyCompetencies> {
        return this.http.get<MyCompetencies>(BASE_URL + MY_COMPETENCIES);
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
