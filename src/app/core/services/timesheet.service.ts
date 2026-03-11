import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { EmployeeTimesheet, TimesheetEntry, Holiday, TimesheetFilter, TimesheetCorrection } from '@/core/interfaces/hrm/timesheet';
import { HttpParams } from '@angular/common/http';

const TIMESHEET = '/hrm/timesheet';
const HOLIDAYS = '/hrm/holidays';

@Injectable({
    providedIn: 'root'
})
export class TimesheetService extends ApiService {
    // Timesheet data
    getTimesheets(filter: TimesheetFilter): Observable<EmployeeTimesheet[]> {
        let params = new HttpParams()
            .set('month', filter.month.toString())
            .set('year', filter.year.toString());

        if (filter.department_id) {
            params = params.set('department_id', filter.department_id.toString());
        }
        if (filter.employee_id) {
            params = params.set('employee_id', filter.employee_id.toString());
        }

        return this.http.get<EmployeeTimesheet[]>(this.BASE_URL + TIMESHEET, { params });
    }

    // Update timesheet entry
    updateTimesheetEntry(entryId: number, data: Partial<TimesheetEntry>): Observable<TimesheetEntry> {
        return this.http.patch<TimesheetEntry>(this.BASE_URL + TIMESHEET + '/' + entryId, data);
    }

    // Holidays
    getHolidays(year?: number): Observable<Holiday[]> {
        let params = new HttpParams();
        if (year) {
            params = params.set('year', year.toString());
        }
        return this.http.get<Holiday[]>(this.BASE_URL + HOLIDAYS, { params });
    }

    createHoliday(holiday: Omit<Holiday, 'id'>): Observable<Holiday> {
        return this.http.post<Holiday>(this.BASE_URL + HOLIDAYS, holiday);
    }

    deleteHoliday(id: number): Observable<any> {
        return this.http.delete(this.BASE_URL + HOLIDAYS + '/' + id);
    }

    // Corrections
    getCorrections(): Observable<TimesheetCorrection[]> {
        return this.http.get<TimesheetCorrection[]>(this.BASE_URL + TIMESHEET + '/corrections');
    }

    requestCorrection(data: Omit<TimesheetCorrection, 'id' | 'status' | 'requested_at'>): Observable<TimesheetCorrection> {
        return this.http.post<TimesheetCorrection>(this.BASE_URL + TIMESHEET + '/corrections', data);
    }

    approveCorrection(id: number): Observable<TimesheetCorrection> {
        return this.http.post<TimesheetCorrection>(this.BASE_URL + TIMESHEET + '/corrections/' + id + '/approve', {});
    }

    rejectCorrection(id: number, reason: string): Observable<TimesheetCorrection> {
        return this.http.post<TimesheetCorrection>(this.BASE_URL + TIMESHEET + '/corrections/' + id + '/reject', { reason });
    }

    // Export
    exportToExcel(filter: TimesheetFilter): Observable<Blob> {
        let params = new HttpParams()
            .set('month', filter.month.toString())
            .set('year', filter.year.toString());

        if (filter.department_id) {
            params = params.set('department_id', filter.department_id.toString());
        }

        return this.http.get(this.BASE_URL + TIMESHEET + '/export', {
            params,
            responseType: 'blob'
        });
    }
}
