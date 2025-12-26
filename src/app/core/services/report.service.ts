import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Report, ReportPayload, ReportStatus } from '@/core/interfaces/report';

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private mockReports: Report[] = [
        {
            id: 1,
            number: 'Р-001',
            date: '2025-01-10',
            from: 'Сидоров А.А.',
            to: 'Директор',
            subject: 'О необходимости ремонта оборудования',
            content: 'Прошу рассмотреть вопрос о проведении капитального ремонта турбины №3',
            status: 'approved',
            resolution: 'Одобрено. Включить в план ремонта на февраль.',
            createdAt: '2025-01-10T09:00:00'
        },
        {
            id: 2,
            number: 'Р-002',
            date: '2025-01-15',
            from: 'Козлов В.В.',
            to: 'Начальник отдела',
            subject: 'О предоставлении отпуска',
            content: 'Прошу предоставить очередной отпуск с 01.02.2025 по 14.02.2025',
            status: 'pending',
            createdAt: '2025-01-15T10:30:00'
        },
        {
            id: 3,
            number: 'Р-003',
            date: '2025-01-20',
            from: 'Николаев П.С.',
            to: 'Директор',
            subject: 'О закупке материалов',
            content: 'Прошу выделить средства на закупку расходных материалов для ремонта',
            status: 'rejected',
            resolution: 'Отклонено. Бюджет на текущий квартал исчерпан.',
            createdAt: '2025-01-20T14:00:00'
        },
        {
            id: 4,
            number: 'Р-004',
            date: '2025-02-01',
            from: 'Иванова М.К.',
            to: 'Главный инженер',
            subject: 'О командировке',
            content: 'Прошу направить в командировку для участия в конференции',
            status: 'pending',
            createdAt: '2025-02-01T11:00:00'
        },
        {
            id: 5,
            number: 'Р-005',
            date: '2025-02-05',
            from: 'Петров И.И.',
            to: 'Директор',
            subject: 'О премировании сотрудников',
            content: 'Прошу рассмотреть вопрос о премировании сотрудников участка №2',
            status: 'approved',
            resolution: 'Согласовано. Подготовить приказ о премировании.',
            createdAt: '2025-02-05T16:00:00'
        }
    ];

    private nextId = 6;

    getAll(): Observable<Report[]> {
        return of([...this.mockReports]).pipe(delay(300));
    }

    getById(id: number): Observable<Report | undefined> {
        const report = this.mockReports.find(r => r.id === id);
        return of(report).pipe(delay(200));
    }

    create(payload: ReportPayload): Observable<Report> {
        const newReport: Report = {
            id: this.nextId++,
            ...payload,
            createdAt: new Date().toISOString()
        };
        this.mockReports.unshift(newReport);
        return of(newReport).pipe(delay(300));
    }

    update(id: number, payload: ReportPayload): Observable<Report> {
        const index = this.mockReports.findIndex(r => r.id === id);
        if (index !== -1) {
            this.mockReports[index] = {
                ...this.mockReports[index],
                ...payload,
                updatedAt: new Date().toISOString()
            };
            return of(this.mockReports[index]).pipe(delay(300));
        }
        throw new Error('Report not found');
    }

    delete(id: number): Observable<void> {
        const index = this.mockReports.findIndex(r => r.id === id);
        if (index !== -1) {
            this.mockReports.splice(index, 1);
        }
        return of(undefined).pipe(delay(300));
    }

    getStatusLabel(status: ReportStatus): string {
        const labels: Record<ReportStatus, string> = {
            pending: 'На рассмотрении',
            approved: 'Одобрен',
            rejected: 'Отклонён'
        };
        return labels[status];
    }

    getStatusSeverity(status: ReportStatus): 'info' | 'warn' | 'success' | 'danger' | 'secondary' | 'contrast' {
        const severities: Record<ReportStatus, 'warn' | 'success' | 'danger'> = {
            pending: 'warn',
            approved: 'success',
            rejected: 'danger'
        };
        return severities[status];
    }
}
