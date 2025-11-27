import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService, BASE_URL } from '@/core/services/api.service';

@Injectable({
    providedIn: 'root'
})
export class WeatherService extends ApiService{
    private readonly apiKey = 'eeab94a7ea024c811edccfd9b509cdba'; // <--- ВСТАВЬТЕ ВАШ КЛЮЧ СЮДА
    private readonly apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

    /**
     * Получает прогноз погоды по заданным координатам.
     * @param lat Широта
     * @param lon Долгота
     * @returns Observable с данными о погоде.
     */
    getWeatherByCoords(lat: number, lon: number): Observable<any> {
        const url = `${BASE_URL}/api/v3/weather/weather?lat=${lat}&lon=${lon}`;
        return this.http.get(url);
    }
}
