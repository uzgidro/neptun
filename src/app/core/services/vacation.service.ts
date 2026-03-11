import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Vacation, VacationPayload, VacationBalance } from '@/core/interfaces/hrm/vacation';

const VACATIONS = '/hrm/vacations';

@Injectable({
    providedIn: 'root'
})
export class VacationService extends ApiService {
    // Vacations CRUD
    getVacations(): Observable<Vacation[]> {
        return this.http.get<Vacation[]>(this.BASE_URL + VACATIONS);
    }

    getVacation(id: number): Observable<Vacation> {
        return this.http.get<Vacation>(this.BASE_URL + VACATIONS + '/' + id);
    }

    createVacation(payload: VacationPayload): Observable<Vacation> {
        return this.http.post<Vacation>(this.BASE_URL + VACATIONS, payload);
    }

    updateVacation(id: number, payload: VacationPayload): Observable<Vacation> {
        return this.http.patch<Vacation>(this.BASE_URL + VACATIONS + '/' + id, payload);
    }

    deleteVacation(id: number): Observable<any> {
        return this.http.delete(this.BASE_URL + VACATIONS + '/' + id);
    }

    // Vacation status actions
    approveVacation(id: number): Observable<Vacation> {
        return this.http.post<Vacation>(this.BASE_URL + VACATIONS + '/' + id + '/approve', {});
    }

    rejectVacation(id: number, rejectionReason: string): Observable<Vacation> {
        return this.http.post<Vacation>(this.BASE_URL + VACATIONS + '/' + id + '/reject', { rejection_reason: rejectionReason });
    }

    cancelVacation(id: number): Observable<Vacation> {
        return this.http.post<Vacation>(this.BASE_URL + VACATIONS + '/' + id + '/cancel', {});
    }

    // Vacation balances
    getVacationBalances(): Observable<VacationBalance[]> {
        return this.http.get<VacationBalance[]>(this.BASE_URL + VACATIONS + '/balances');
    }

    getVacationBalance(employeeId: number): Observable<VacationBalance> {
        return this.http.get<VacationBalance>(this.BASE_URL + VACATIONS + '/balance/' + employeeId);
    }
}
