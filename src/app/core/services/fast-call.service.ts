import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { FastCall } from '@/core/interfaces/fast-call';

// Мок-данные быстрых звонков
const MOCK_FAST_CALLS: FastCall[] = [
    { id: 1, contact_id: 1, position: 1, contact: { id: 1, name: 'Диспетчерская', phone: '1001' } },
    { id: 2, contact_id: 2, position: 2, contact: { id: 2, name: 'Охрана', phone: '1002' } },
    { id: 3, contact_id: 3, position: 3, contact: { id: 3, name: 'Техподдержка', phone: '1003' } },
    { id: 4, contact_id: 4, position: 4, contact: { id: 4, name: 'Отдел кадров', phone: '1004' } }
];

@Injectable({
    providedIn: 'root'
})
export class FastCallService extends ApiService {
    getFastCalls(): Observable<FastCall[]> {
        return of(MOCK_FAST_CALLS).pipe(delay(200));
    }
}
