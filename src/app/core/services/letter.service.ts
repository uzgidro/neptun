import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Letter, LetterPayload, LetterType, LetterStatus } from '@/core/interfaces/letter';

@Injectable({
    providedIn: 'root'
})
export class LetterService {
    private mockLetters: Letter[] = [
        {
            id: 1,
            number: 'ВХ-001/2025',
            date: '2025-01-08',
            type: 'incoming',
            from: 'Министерство сельского хозяйства',
            to: 'АО "МолокоПром"',
            subject: 'О предоставлении отчёта за 2024 год',
            content: 'Просим предоставить годовой отчёт о деятельности организации',
            status: 'read',
            createdAt: '2025-01-08T09:00:00'
        },
        {
            id: 2,
            number: 'ИСХ-001/2025',
            date: '2025-01-10',
            type: 'outgoing',
            from: 'АО "МолокоПром"',
            to: 'Министерство сельского хозяйства',
            subject: 'Годовой отчёт за 2024 год',
            content: 'Направляем годовой отчёт о деятельности организации за 2024 год',
            status: 'sent',
            createdAt: '2025-01-10T14:00:00'
        },
        {
            id: 3,
            number: 'ВХ-002/2025',
            date: '2025-01-15',
            type: 'incoming',
            from: 'Кабинет Министров',
            to: 'АО "МолокоПром"',
            subject: 'О проведении совещания',
            content: 'Приглашаем на совещание по вопросам развития молочной отрасли',
            status: 'received',
            createdAt: '2025-01-15T10:30:00'
        },
        {
            id: 4,
            number: 'ИСХ-002/2025',
            date: '2025-01-20',
            type: 'outgoing',
            from: 'АО "МолокоПром"',
            to: 'Подрядная организация',
            subject: 'О выполнении работ',
            content: 'Просим ускорить выполнение работ по договору №123',
            status: 'draft',
            createdAt: '2025-01-20T11:00:00'
        },
        {
            id: 5,
            number: 'ВХ-003/2025',
            date: '2025-02-01',
            type: 'incoming',
            from: 'Партнёрская организация',
            to: 'АО "МолокоПром"',
            subject: 'Коммерческое предложение',
            content: 'Направляем коммерческое предложение на поставку оборудования',
            status: 'read',
            createdAt: '2025-02-01T16:00:00'
        }
    ];

    private nextId = 6;

    getAll(): Observable<Letter[]> {
        return of([...this.mockLetters]).pipe(delay(300));
    }

    getById(id: number): Observable<Letter | undefined> {
        const letter = this.mockLetters.find(l => l.id === id);
        return of(letter).pipe(delay(200));
    }

    create(payload: LetterPayload): Observable<Letter> {
        const newLetter: Letter = {
            id: this.nextId++,
            ...payload,
            createdAt: new Date().toISOString()
        };
        this.mockLetters.unshift(newLetter);
        return of(newLetter).pipe(delay(300));
    }

    update(id: number, payload: LetterPayload): Observable<Letter> {
        const index = this.mockLetters.findIndex(l => l.id === id);
        if (index !== -1) {
            this.mockLetters[index] = {
                ...this.mockLetters[index],
                ...payload,
                updatedAt: new Date().toISOString()
            };
            return of(this.mockLetters[index]).pipe(delay(300));
        }
        throw new Error('Letter not found');
    }

    delete(id: number): Observable<void> {
        const index = this.mockLetters.findIndex(l => l.id === id);
        if (index !== -1) {
            this.mockLetters.splice(index, 1);
        }
        return of(undefined).pipe(delay(300));
    }

    getTypeLabel(type: LetterType): string {
        const labels: Record<LetterType, string> = {
            incoming: 'Входящее',
            outgoing: 'Исходящее'
        };
        return labels[type];
    }

    getTypeSeverity(type: LetterType): 'info' | 'warn' | 'success' | 'danger' | 'secondary' | 'contrast' {
        const severities: Record<LetterType, 'info' | 'success'> = {
            incoming: 'info',
            outgoing: 'success'
        };
        return severities[type];
    }

    getStatusLabel(status: LetterStatus): string {
        const labels: Record<LetterStatus, string> = {
            draft: 'Черновик',
            sent: 'Отправлено',
            received: 'Получено',
            read: 'Прочитано'
        };
        return labels[status];
    }

    getStatusSeverity(status: LetterStatus): 'info' | 'warn' | 'success' | 'danger' | 'secondary' | 'contrast' {
        const severities: Record<LetterStatus, 'info' | 'warn' | 'success' | 'secondary'> = {
            draft: 'secondary',
            sent: 'info',
            received: 'warn',
            read: 'success'
        };
        return severities[status];
    }
}
