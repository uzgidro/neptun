import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiService } from '@/core/services/api.service';

// Мок-данные погоды
const MOCK_WEATHER = {
    temperature: 22,
    humidity: 65,
    description: 'Ясно',
    icon: 'sunny',
    wind_speed: 3.5,
    pressure: 1015
};

@Injectable({
    providedIn: 'root'
})
export class WeatherService extends ApiService {
    getWeatherByCoords(lat: number, lon: number): Observable<any> {
        return of(MOCK_WEATHER).pipe(delay(200));
    }
}
