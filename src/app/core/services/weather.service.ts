import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, BASE_URL } from '@/core/services/api.service';

@Injectable({
    providedIn: 'root'
})
export class WeatherService extends ApiService {
    getWeatherByCoords(lat: number, lon: number): Observable<any> {
        const url = `${BASE_URL}/api/v3/weather?lat=${lat}&lon=${lon}`;
        return this.http.get(url);
    }
}
