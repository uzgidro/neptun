import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { HRMDashboard, DashboardNotification } from '@/core/interfaces/hrm/dashboard';

const HRM_DASHBOARD = '/hrm/dashboard';

@Injectable({
    providedIn: 'root'
})
export class HRMDashboardService extends ApiService {
    getDashboard(): Observable<HRMDashboard> {
        return this.http.get<HRMDashboard>(BASE_URL + HRM_DASHBOARD);
    }

    markNotificationAsRead(notificationId: number): Observable<DashboardNotification> {
        return this.http.patch<DashboardNotification>(
            BASE_URL + HRM_DASHBOARD + '/notifications/' + notificationId + '/read',
            {}
        );
    }

    markAllNotificationsAsRead(): Observable<void> {
        return this.http.post<void>(BASE_URL + HRM_DASHBOARD + '/notifications/read-all', {});
    }
}
