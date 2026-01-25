import { Component,OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { Card } from 'primeng/card';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Avatar } from 'primeng/avatar';
import { Badge } from 'primeng/badge';
import { Tooltip } from 'primeng/tooltip';
import { ProgressBar } from 'primeng/progressbar';
import { Ripple } from 'primeng/ripple';
import {
    HRMDashboard,
    DashboardNotification,
    QuickAction,
    QUICK_ACTIONS
} from '@/core/interfaces/hrm/dashboard';
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
        name: 'Иванов Иван Петрович',
        position: 'HR-директор'
    };

    quickActions: QuickAction[] = QUICK_ACTIONS;
    currentDate: Date = new Date();

    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.loadDashboardData();
    }

    private loadDashboardData(): void {
        this.loading = true;

        setTimeout(() => {
            this.dashboard = {
                widgets: {
                    total_employees: 156,
                    active_employees: 148,
                    on_vacation: 12,
                    on_sick_leave: 3,
                    new_employees_month: 5,
                    turnover_rate: 3.2,
                    open_vacancies: 8,
                    candidates_in_process: 23,
                    pending_approvals: 7,
                    planned_trainings: 4,
                    assessments_in_progress: 2,
                    salary_pending_approval: 1
                },
                tasks: [
                    {
                        id: 1,
                        type: 'vacation_approval',
                        title: 'Согласовать заявления на отпуск',
                        count: 3,
                        priority: 'high',
                        due_date: '2025-01-25',
                        link: '/hrm/vacations',
                        icon: 'pi-calendar',
                        color: 'orange'
                    },
                    {
                        id: 2,
                        type: 'candidate_review',
                        title: 'Рассмотреть резюме кандидатов',
                        count: 5,
                        priority: 'medium',
                        link: '/hrm/recruiting',
                        icon: 'pi-users',
                        color: 'blue'
                    },
                    {
                        id: 3,
                        type: 'assessment_review',
                        title: 'Провести оценку компетенций',
                        count: 4,
                        priority: 'medium',
                        due_date: '2025-01-31',
                        link: '/hrm/competency',
                        icon: 'pi-chart-bar',
                        color: 'purple'
                    },
                    {
                        id: 4,
                        type: 'salary_approval',
                        title: 'Утвердить расчет зарплаты за январь',
                        priority: 'urgent',
                        due_date: '2025-01-28',
                        link: '/hrm/salary',
                        icon: 'pi-dollar',
                        color: 'green'
                    },
                    {
                        id: 5,
                        type: 'probation_review',
                        title: 'Оценить испытательный срок',
                        count: 2,
                        priority: 'high',
                        due_date: '2025-01-30',
                        link: '/hrm/personnel-records',
                        icon: 'pi-clock',
                        color: 'red'
                    }
                ],
                events: [
                    {
                        id: 1,
                        type: 'training',
                        title: 'Начало квартального обучения',
                        description: 'Программа развития лидерских качеств',
                        date: '2025-01-25',
                        time: '10:00',
                        location: 'Конференц-зал А',
                        icon: 'pi-book',
                        color: 'blue'
                    },
                    {
                        id: 2,
                        type: 'meeting',
                        title: 'Совещание по кадровому резерву',
                        date: '2025-01-28',
                        time: '14:00',
                        location: 'Онлайн (Zoom)',
                        participants: ['Соколов А.В.', 'Петрова М.И.'],
                        icon: 'pi-users',
                        color: 'purple'
                    },
                    {
                        id: 3,
                        type: 'deadline',
                        title: 'Завершение оценки компетенций',
                        description: 'Финальный срок сдачи отчетов',
                        date: '2025-01-31',
                        icon: 'pi-clock',
                        color: 'red'
                    },
                    {
                        id: 4,
                        type: 'interview',
                        title: 'Собеседование: Senior Developer',
                        description: 'Кузнецова Мария - финальное интервью',
                        date: '2025-01-27',
                        time: '11:00',
                        icon: 'pi-user',
                        color: 'cyan'
                    },
                    {
                        id: 5,
                        type: 'training',
                        title: 'Внедрение новых HR-политик',
                        date: '2025-02-05',
                        icon: 'pi-file',
                        color: 'green'
                    }
                ],
                notifications: [
                    {
                        id: 1,
                        type: 'approval_request',
                        title: 'Новая заявка на отпуск',
                        message: 'Сидоров П.А. подал заявку на отпуск с 01.02 по 14.02',
                        created_at: '2025-01-24T09:30:00',
                        read: false,
                        link: '/hrm/vacations',
                        icon: 'pi-calendar',
                        severity: 'info'
                    },
                    {
                        id: 2,
                        type: 'deadline_reminder',
                        title: 'Приближается дедлайн',
                        message: 'Расчет зарплаты должен быть утвержден до 28.01',
                        created_at: '2025-01-24T08:00:00',
                        read: false,
                        icon: 'pi-exclamation-triangle',
                        severity: 'warn'
                    },
                    {
                        id: 3,
                        type: 'new_employee',
                        title: 'Новый сотрудник',
                        message: 'Егорова С.П. приступила к работе в отделе продаж',
                        created_at: '2025-01-23T10:00:00',
                        read: true,
                        icon: 'pi-user-plus',
                        severity: 'success'
                    }
                ],
                recentActivity: [
                    {
                        id: 1,
                        type: 'vacation_approved',
                        title: 'Отпуск согласован',
                        description: 'Заявка на отпуск Морозова А.К. одобрена',
                        user_name: 'Система',
                        timestamp: '2025-01-24T11:30:00',
                        icon: 'pi-check-circle',
                        color: 'green'
                    },
                    {
                        id: 2,
                        type: 'employee_hired',
                        title: 'Новый сотрудник',
                        description: 'Егорова С.П. оформлена на должность менеджера по продажам',
                        user_name: 'Михайлова Т.В.',
                        timestamp: '2025-01-23T16:45:00',
                        icon: 'pi-user-plus',
                        color: 'blue'
                    },
                    {
                        id: 3,
                        type: 'training_completed',
                        title: 'Обучение завершено',
                        description: '12 сотрудников завершили курс "Эффективные коммуникации"',
                        user_name: 'Система',
                        timestamp: '2025-01-23T14:00:00',
                        icon: 'pi-book',
                        color: 'purple'
                    },
                    {
                        id: 4,
                        type: 'vacancy_published',
                        title: 'Вакансия опубликована',
                        description: 'Вакансия "Middle Backend разработчик" размещена на портале',
                        user_name: 'Кузнецов С.А.',
                        timestamp: '2025-01-22T10:30:00',
                        icon: 'pi-briefcase',
                        color: 'cyan'
                    }
                ],
                upcomingBirthdays: [
                    {
                        employee_id: 45,
                        employee_name: 'Козлова Анна Сергеевна',
                        department_name: 'Маркетинг',
                        position_name: 'Маркетолог',
                        birth_date: '1990-01-26',
                        days_until: 2
                    },
                    {
                        employee_id: 78,
                        employee_name: 'Новиков Дмитрий Александрович',
                        department_name: 'IT отдел',
                        position_name: 'Разработчик',
                        birth_date: '1988-01-29',
                        days_until: 5
                    },
                    {
                        employee_id: 23,
                        employee_name: 'Федорова Елена Викторовна',
                        department_name: 'Бухгалтерия',
                        position_name: 'Главный бухгалтер',
                        birth_date: '1975-02-03',
                        days_until: 10
                    }
                ],
                expiringProbations: [
                    {
                        employee_id: 150,
                        employee_name: 'Смирнов Алексей Игоревич',
                        department_name: 'IT отдел',
                        position_name: 'Junior разработчик',
                        probation_end_date: '2025-01-30',
                        days_remaining: 6,
                        mentor_name: 'Иванов И.П.',
                        status: 'on_track'
                    },
                    {
                        employee_id: 152,
                        employee_name: 'Волкова Ольга Петровна',
                        department_name: 'Отдел продаж',
                        position_name: 'Менеджер по продажам',
                        probation_end_date: '2025-02-15',
                        days_remaining: 22,
                        mentor_name: 'Соколов А.В.',
                        status: 'at_risk'
                    }
                ]
            };

            this.loading = false;
        }, 500);
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
        notification.read = true;
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
