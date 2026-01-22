import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LevelVolume } from '@/core/interfaces/level-volume';

@Injectable({
    providedIn: 'root'
})
export class LevelVolumeService extends ApiService {
    getVolume(id: number, level: number): Observable<LevelVolume> {
        // Мок расчёта объёма резервуара по уровню
        const mockVolume: LevelVolume = {
            organization_id: id,
            level: level,
            volume: level * 1000 // простая формула для мока
        };
        return of(mockVolume).pipe(delay(200));
    }
}
