import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiService } from '@/core/services/api.service';

const MOCK_WEATHER = {
    name: 'Demo City',
    main: { temp: 22, humidity: 65, pressure: 1015 },
    weather: [{ description: 'clear sky', icon: '01d' }],
    wind: { speed: 3.5 }
};

@Injectable({
    providedIn: 'root'
})
export class WeatherService extends ApiService {
    getWeatherByCoords(lat: number, lon: number): Observable<any> {
        return of(MOCK_WEATHER).pipe(delay(200));
    }
}
