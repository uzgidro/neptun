import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Call, CallPayload, CallType, CallStatus } from '../interfaces/call';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root'
})
export class CallService {
    private translate = inject(TranslateService);
    private calls: Call[] = [
        {
            id: 1,
            date: '2024-12-26',
            time: '09:30',
            type: 'incoming',
            callerName: 'Министерство энергетики',
            callerPhone: '+998 71 123 45 67',
            receiverName: 'Приёмная',
            duration: 320,
            status: 'completed',
            notes: 'Обсуждение квартального отчёта',
            createdAt: '2024-12-26T09:30:00Z'
        },
        {
            id: 2,
            date: '2024-12-26',
            time: '10:15',
            type: 'outgoing',
            callerName: 'Руководитель',
            callerPhone: '+998 71 234 56 78',
            receiverName: 'Чарвакская ГЭС',
            receiverPhone: '+998 70 123 45 67',
            duration: 185,
            status: 'completed',
            notes: 'Уточнение данных по выработке',
            createdAt: '2024-12-26T10:15:00Z'
        },
        {
            id: 3,
            date: '2024-12-26',
            time: '11:00',
            type: 'missed',
            callerName: 'Неизвестный',
            callerPhone: '+998 90 987 65 43',
            status: 'no_answer',
            createdAt: '2024-12-26T11:00:00Z'
        },
        {
            id: 4,
            date: '2024-12-25',
            time: '14:30',
            type: 'incoming',
            callerName: 'Кабинет Министров',
            callerPhone: '+998 71 239 82 10',
            receiverName: 'Директор',
            duration: 540,
            status: 'completed',
            notes: 'Совещание по вопросам водохранилищ',
            createdAt: '2024-12-25T14:30:00Z'
        },
        {
            id: 5,
            date: '2024-12-25',
            time: '16:00',
            type: 'outgoing',
            callerName: 'Секретарь',
            callerPhone: '+998 71 234 56 78',
            receiverName: 'Ходжикентская ГЭС',
            receiverPhone: '+998 70 234 56 78',
            duration: 0,
            status: 'busy',
            createdAt: '2024-12-25T16:00:00Z'
        },
        {
            id: 6,
            date: '2024-12-24',
            time: '09:00',
            type: 'incoming',
            callerName: 'Узбекгидроэнерго',
            callerPhone: '+998 71 150 00 00',
            receiverName: 'Заместитель директора',
            duration: 420,
            status: 'completed',
            notes: 'Координация работ по строительству',
            createdAt: '2024-12-24T09:00:00Z'
        },
        {
            id: 7,
            date: '2024-12-24',
            time: '11:30',
            type: 'outgoing',
            callerName: 'Руководитель',
            callerPhone: '+998 71 234 56 78',
            receiverName: 'Министерство финансов',
            receiverPhone: '+998 71 239 41 09',
            duration: 280,
            status: 'completed',
            notes: 'Обсуждение бюджета на следующий год',
            createdAt: '2024-12-24T11:30:00Z'
        },
        {
            id: 8,
            date: '2024-12-23',
            time: '15:45',
            type: 'missed',
            callerName: 'Поставщик оборудования',
            callerPhone: '+998 93 123 45 67',
            status: 'no_answer',
            notes: 'Перезвонить',
            createdAt: '2024-12-23T15:45:00Z'
        }
    ];

    private nextId = 9;

    getAll(): Observable<Call[]> {
        return of([...this.calls]).pipe(delay(300));
    }

    getById(id: number): Observable<Call | undefined> {
        return of(this.calls.find(c => c.id === id)).pipe(delay(200));
    }

    create(payload: CallPayload): Observable<Call> {
        const newCall: Call = {
            ...payload,
            id: this.nextId++,
            createdAt: new Date().toISOString()
        };
        this.calls.unshift(newCall);
        return of(newCall).pipe(delay(300));
    }

    update(id: number, payload: CallPayload): Observable<Call | null> {
        const index = this.calls.findIndex(c => c.id === id);
        if (index === -1) return of(null).pipe(delay(200));

        this.calls[index] = {
            ...this.calls[index],
            ...payload,
            updatedAt: new Date().toISOString()
        };
        return of(this.calls[index]).pipe(delay(300));
    }

    delete(id: number): Observable<boolean> {
        const index = this.calls.findIndex(c => c.id === id);
        if (index === -1) return of(false).pipe(delay(200));

        this.calls.splice(index, 1);
        return of(true).pipe(delay(300));
    }

    getTypeLabel(type: CallType): string {
        const keys: Record<CallType, string> = {
            incoming: 'CALLS.TYPE.INCOMING',
            outgoing: 'CALLS.TYPE.OUTGOING',
            missed: 'CALLS.TYPE.MISSED'
        };
        return this.translate.instant(keys[type]) || type;
    }

    getTypeSeverity(type: CallType): string {
        const severities: Record<CallType, string> = {
            incoming: 'info',
            outgoing: 'success',
            missed: 'danger'
        };
        return severities[type] || 'info';
    }

    getTypeIcon(type: CallType): string {
        const icons: Record<CallType, string> = {
            incoming: 'pi pi-phone',
            outgoing: 'pi pi-phone',
            missed: 'pi pi-phone'
        };
        return icons[type] || 'pi pi-phone';
    }

    getStatusLabel(status: CallStatus): string {
        const keys: Record<CallStatus, string> = {
            completed: 'CALLS.STATUS.COMPLETED',
            no_answer: 'CALLS.STATUS.NO_ANSWER',
            busy: 'CALLS.STATUS.BUSY',
            cancelled: 'CALLS.STATUS.CANCELLED'
        };
        return this.translate.instant(keys[status]) || status;
    }

    getStatusSeverity(status: CallStatus): string {
        const severities: Record<CallStatus, string> = {
            completed: 'success',
            no_answer: 'warn',
            busy: 'secondary',
            cancelled: 'danger'
        };
        return severities[status] || 'info';
    }

    formatDuration(seconds: number | undefined): string {
        if (!seconds || seconds === 0) return '—';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
