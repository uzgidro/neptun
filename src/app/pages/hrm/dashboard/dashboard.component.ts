import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Card } from 'primeng/card';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Avatar } from 'primeng/avatar';
import { Badge } from 'primeng/badge';
import { Tooltip } from 'primeng/tooltip';
import { ProgressBar } from 'primeng/progressbar';
import { Ripple } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import {
    HRMDashboard,
    DashboardNotification,
    QuickAction,
    QUICK_ACTIONS
} from '@/core/interfaces/hrm/dashboard';
import { HRMDashboardService } from '@/core/services/hrm-dashboard.service';
@Component({
    selector: 'app-hrm-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        Card,
        ButtonDirective,
        Tag,
        Avatar,
        Badge,
        Tooltip,
        ProgressBar,
        Ripple
    ],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss'
})
export class HRMDashboardComponent implements OnInit, OnDestroy {
    dashboard: HRMDashboard | null = null;
    loading: boolean = true;
    currentUser: { name: string; position: string; avatar?: string } = {
        name: '',
        position: ''
    };

    quickActions: QuickAction[] = QUICK_ACTIONS;
    currentDate: Date = new Date();

    private hrmDashboardService = inject(HRMDashboardService);
    private messageService = inject(MessageService);
    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.loadDashboardData();
    }

    private loadDashboardData(): void {
        this.loading = true;

        this.hrmDashboardService.getDashboard()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.dashboard = data;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось загрузить данные' });
                    console.error(err);
                },
                complete: () => (this.loading = false)
            });
    }

    getGreeting(): string {
        const hour = new Date().getHours();
        if (hour < 12) return 'Доброе утро';
        if (hour < 18) return 'Добрый день';
        return 'Добрый вечер';
    }

    getTaskPrioritySeverity(priority: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (priority) {
            case 'urgent': return 'danger';
            case 'high': return 'warn';
            case 'medium': return 'info';
            case 'low': return 'secondary';
            default: return 'info';
        }
    }

    getTaskPriorityLabel(priority: string): string {
        switch (priority) {
            case 'urgent': return 'Срочно';
            case 'high': return 'Высокий';
            case 'medium': return 'Средний';
            case 'low': return 'Низкий';
            default: return priority;
        }
    }

    getProbationStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
        switch (status) {
            case 'on_track': return 'success';
            case 'at_risk': return 'warn';
            case 'extended': return 'danger';
            default: return 'success';
        }
    }

    getProbationStatusLabel(status: string): string {
        switch (status) {
            case 'on_track': return 'По плану';
            case 'at_risk': return 'Под вопросом';
            case 'extended': return 'Продлён';
            default: return status;
        }
    }

    formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }

    formatDateTime(dateStr: string): string {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }

    formatTime(time: string): string {
        return time;
    }

    getRelativeTime(timestamp: string): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} мин. назад`;
        if (diffHours < 24) return `${diffHours} ч. назад`;
        if (diffDays === 1) return 'Вчера';
        if (diffDays < 7) return `${diffDays} дн. назад`;
        return date.toLocaleDateString('ru-RU');
    }

    getUnreadNotificationsCount(): number {
        return this.dashboard?.notifications.filter(n => !n.read).length || 0;
    }

    markNotificationAsRead(notification: DashboardNotification): void {
        this.hrmDashboardService.markNotificationAsRead(notification.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    notification.read = true;
                },
                error: (err) => console.error(err)
            });
    }

    refreshDashboard(): void {
        this.loadDashboardData();
    }

    getInitials(name: string): string {
        if (!name) return '';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
