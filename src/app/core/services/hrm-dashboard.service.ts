import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { HRMDashboard, DashboardNotification } from '@/core/interfaces/hrm/dashboard';

const HRM_DASHBOARD = '/hrm/dashboard';
const USE_MOCK = !BASE_URL;

const MOCK_DASHBOARD: HRMDashboard = {
    widgets: {
        total_employees: 4872,
        active_employees: 4651,
        on_vacation: 134,
        on_sick_leave: 47,
        new_employees_month: 23,
        turnover_rate: 3.2,
        open_vacancies: 18,
        candidates_in_process: 41,
        pending_approvals: 12,
        planned_trainings: 7,
        assessments_in_progress: 3,
        salary_pending_approval: 5
    },
    tasks: [
        {
            id: 1,
            type: 'vacation_approval',
            title: 'Согласование отпусков',
            description: 'Ожидают согласования заявки на отпуск',
            count: 8,
            priority: 'high',
            due_date: '2026-03-07',
            link: '/hrm/vacations/pending',
            icon: 'pi-calendar',
            color: 'orange'
        },
        {
            id: 2,
            type: 'salary_approval',
            title: 'Утверждение расчета ЗП',
            description: 'Расчет заработной платы за февраль 2026',
            count: 1,
            priority: 'urgent',
            due_date: '2026-03-05',
            link: '/hrm/salary/approval',
            icon: 'pi-dollar',
            color: 'red'
        },
        {
            id: 3,
            type: 'candidate_review',
            title: 'Рассмотрение кандидатов',
            description: 'Новые кандидаты на должности инженеров',
            count: 5,
            priority: 'medium',
            due_date: '2026-03-10',
            link: '/hrm/recruiting/candidates',
            icon: 'pi-user',
            color: 'blue'
        },
        {
            id: 4,
            type: 'probation_review',
            title: 'Оценка испытательного срока',
            description: 'Завершается испытательный срок у 3 сотрудников',
            count: 3,
            priority: 'high',
            due_date: '2026-03-15',
            link: '/hrm/personnel-records/probation',
            icon: 'pi-clock',
            color: 'purple'
        },
        {
            id: 5,
            type: 'document_review',
            title: 'Проверка документов',
            description: 'Требуют проверки личные дела',
            count: 6,
            priority: 'low',
            due_date: '2026-03-20',
            link: '/hrm/personnel-records/documents',
            icon: 'pi-file',
            color: 'cyan'
        }
    ],
    events: [
        {
            id: 1,
            type: 'training',
            title: 'Обучение по охране труда',
            description: 'Ежегодное обучение по технике безопасности на производстве',
            date: '2026-03-10',
            time: '09:00',
            location: 'Конференц-зал, Молокозавод «Чирчик»',
            participants: ['Техническое управление', 'Служба эксплуатации'],
            link: '/hrm/training/1',
            icon: 'pi-book',
            color: 'blue'
        },
        {
            id: 2,
            type: 'meeting',
            title: 'Совещание по кадровой политике',
            description: 'Обсуждение плана набора персонала на 2026 год',
            date: '2026-03-06',
            time: '14:00',
            location: 'Главный офис, г. Ташкент',
            participants: ['HR-департамент', 'Руководство'],
            icon: 'pi-users',
            color: 'purple'
        },
        {
            id: 3,
            type: 'holiday',
            title: 'Навруз',
            description: 'Государственный праздник — Навруз',
            date: '2026-03-21',
            icon: 'pi-star',
            color: 'yellow'
        },
        {
            id: 4,
            type: 'interview',
            title: 'Собеседование — Главный инженер',
            description: 'Собеседование на позицию главного инженера Молокозавода «Андижан»',
            date: '2026-03-08',
            time: '11:00',
            location: 'Главный офис, г. Ташкент',
            icon: 'pi-user',
            color: 'cyan'
        },
        {
            id: 5,
            type: 'birthday',
            title: 'День рождения — Хасанов Бахтиёр',
            date: '2026-03-12',
            icon: 'pi-gift',
            color: 'pink'
        }
    ],
    notifications: [
        {
            id: 1,
            type: 'approval_request',
            title: 'Новая заявка на отпуск',
            message: 'Каримов Алишер подал заявку на ежегодный отпуск с 15.03 по 29.03.2026',
            created_at: '2026-03-04T08:30:00Z',
            read: false,
            link: '/hrm/vacations/101',
            icon: 'pi-calendar',
            severity: 'info'
        },
        {
            id: 2,
            type: 'deadline_reminder',
            title: 'Срок сдачи расчета ЗП',
            message: 'Необходимо утвердить расчет заработной платы за февраль до 05.03.2026',
            created_at: '2026-03-04T07:00:00Z',
            read: false,
            link: '/hrm/salary/approval',
            icon: 'pi-clock',
            severity: 'warn'
        },
        {
            id: 3,
            type: 'new_employee',
            title: 'Новый сотрудник',
            message: 'Оформлен прием на работу: Рахматуллаев Сардор — Инженер-технолог, Молокозавод «Джизак»',
            created_at: '2026-03-03T16:45:00Z',
            read: true,
            link: '/hrm/personnel-records/312',
            icon: 'pi-user-plus',
            severity: 'success'
        },
        {
            id: 4,
            type: 'system_alert',
            title: 'Обновление системы',
            message: 'Запланировано техническое обслуживание модуля HRM 06.03.2026 с 22:00 до 02:00',
            created_at: '2026-03-03T12:00:00Z',
            read: true,
            icon: 'pi-cog',
            severity: 'info'
        },
        {
            id: 5,
            type: 'approval_result',
            title: 'Отпуск одобрен',
            message: 'Заявка на отпуск Мирзаева Дильшода одобрена начальником управления',
            created_at: '2026-03-02T15:30:00Z',
            read: true,
            link: '/hrm/vacations/98',
            icon: 'pi-check-circle',
            severity: 'success'
        }
    ],
    recentActivity: [
        {
            id: 1,
            type: 'employee_hired',
            title: 'Прием на работу',
            description: 'Рахматуллаев Сардор принят на должность инженера-технолога',
            user_name: 'Нурматов Фаррух',
            timestamp: '2026-03-03T16:45:00Z',
            icon: 'pi-user-plus',
            color: 'green'
        },
        {
            id: 2,
            type: 'vacation_approved',
            title: 'Отпуск одобрен',
            description: 'Ежегодный отпуск Мирзаева Дильшода (14 дней)',
            user_name: 'Исмоилов Бахром',
            timestamp: '2026-03-02T15:30:00Z',
            icon: 'pi-check-circle',
            color: 'blue'
        },
        {
            id: 3,
            type: 'training_completed',
            title: 'Обучение завершено',
            description: 'Курс "Безопасность на производственных объектах" — 12 сотрудников',
            user_name: 'Система',
            timestamp: '2026-03-01T18:00:00Z',
            icon: 'pi-book',
            color: 'cyan'
        },
        {
            id: 4,
            type: 'salary_approved',
            title: 'ЗП утверждена',
            description: 'Расчет заработной платы за январь 2026 утвержден',
            user_name: 'Хамидов Акбар',
            timestamp: '2026-02-28T14:00:00Z',
            icon: 'pi-dollar',
            color: 'purple'
        },
        {
            id: 5,
            type: 'vacancy_published',
            title: 'Вакансия опубликована',
            description: 'Опубликована вакансия: Главный инженер, Молокозавод «Андижан»',
            user_name: 'Нурматов Фаррух',
            timestamp: '2026-02-27T10:00:00Z',
            icon: 'pi-briefcase',
            color: 'orange'
        }
    ],
    upcomingBirthdays: [
        {
            employee_id: 45,
            employee_name: 'Хасанов Бахтиёр',
            department_name: 'Техническое управление',
            position_name: 'Старший инженер-технолог',
            birth_date: '1985-03-12',
            days_until: 8
        },
        {
            employee_id: 112,
            employee_name: 'Юлдашева Нигора',
            department_name: 'Бухгалтерия',
            position_name: 'Главный бухгалтер',
            birth_date: '1979-03-18',
            days_until: 14
        },
        {
            employee_id: 203,
            employee_name: 'Абдуллаев Шухрат',
            department_name: 'Служба эксплуатации Молокозавода «Чирчик»',
            position_name: 'Начальник смены',
            birth_date: '1990-03-22',
            days_until: 18
        }
    ],
    expiringProbations: [
        {
            employee_id: 310,
            employee_name: 'Тошматов Жасур',
            department_name: 'IT-департамент',
            position_name: 'Системный администратор',
            probation_end_date: '2026-03-15',
            days_remaining: 11,
            mentor_name: 'Расулов Озод',
            status: 'on_track'
        },
        {
            employee_id: 311,
            employee_name: 'Ким Анастасия',
            department_name: 'Планово-экономический отдел',
            position_name: 'Экономист',
            probation_end_date: '2026-03-20',
            days_remaining: 16,
            mentor_name: 'Юлдашева Нигора',
            status: 'on_track'
        },
        {
            employee_id: 312,
            employee_name: 'Рахматуллаев Сардор',
            department_name: 'Молокозавод «Джизак»',
            position_name: 'Инженер-технолог',
            probation_end_date: '2026-06-03',
            days_remaining: 91,
            mentor_name: 'Хасанов Бахтиёр',
            status: 'on_track'
        }
    ]
};

const MOCK_NOTIFICATION_READ: DashboardNotification = {
    id: 1,
    type: 'approval_request',
    title: 'Новая заявка на отпуск',
    message: 'Каримов Алишер подал заявку на ежегодный отпуск с 15.03 по 29.03.2026',
    created_at: '2026-03-04T08:30:00Z',
    read: true,
    link: '/hrm/vacations/101',
    icon: 'pi-calendar',
    severity: 'info'
};

@Injectable({
    providedIn: 'root'
})
export class HRMDashboardService extends ApiService {
    getDashboard(): Observable<HRMDashboard> {
        if (USE_MOCK) return of(MOCK_DASHBOARD).pipe(delay(200));
        return this.http.get<HRMDashboard>(BASE_URL + HRM_DASHBOARD);
    }

    markNotificationAsRead(notificationId: number): Observable<DashboardNotification> {
        if (USE_MOCK) return of({ ...MOCK_NOTIFICATION_READ, id: notificationId }).pipe(delay(200));
        return this.http.patch<DashboardNotification>(
            BASE_URL + HRM_DASHBOARD + '/notifications/' + notificationId + '/read',
            {}
        );
    }

    markAllNotificationsAsRead(): Observable<void> {
        if (USE_MOCK) return of(void 0).pipe(delay(200));
        return this.http.post<void>(BASE_URL + HRM_DASHBOARD + '/notifications/read-all', {});
    }
}
