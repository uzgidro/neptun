import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { LevelVolume } from '@/core/interfaces/level-volume';

const LEVEL_VOLUME = '/level-volume';

@Injectable({
    providedIn: 'root'
})
export class LevelVolumeService extends ApiService {
    getVolume(id: number, level: number): Observable<LevelVolume> {
        return this.http.get<LevelVolume>(BASE_URL + LEVEL_VOLUME, {
            params: {
                id: id,
                level: level
            }
        });
    }
}
