import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { LocationService } from '@/core/services/location.service';
import { WeatherService } from '@/core/services/weather.service';
import { LanguageService } from '@/core/services/language.service';
import { AlarmService } from '@/core/services/alarm.service';
import { AuthService } from '@/core/services/auth.service';

interface WeatherData {
    city: string;
    temperature: number;
    description: string;
    iconClass: string;
}

@Component({
    selector: 'sc-header',
    standalone: true,
    imports: [DatePipe, RouterLink, TranslateModule],
    templateUrl: './sc-header.component.html',
    styleUrl: './sc-header.component.scss'
})
export class ScHeaderComponent implements OnInit, OnDestroy {
    currentDate: Date = new Date();
    private timerSubscription?: Subscription;

    weather: WeatherData | null = null;
    weatherLoading = true;
    weatherError = false;

    private locationService = inject(LocationService);
    private weatherService = inject(WeatherService);
    private languageService = inject(LanguageService);
    alarmService = inject(AlarmService);
    authService = inject(AuthService);

    // Language switcher
    languages = [
        { code: 'ru', label: 'RU' },
        { code: 'en', label: 'EN' },
        { code: 'uz-cyrl', label: 'ЎЗ' },
        { code: 'uz-latn', label: 'UZ' }
    ];

    get currentLang(): string {
        return this.languageService.getCurrentLanguage().code;
    }

    setLanguage(code: string): void {
        this.languageService.setLanguage(code);
    }

    ngOnInit(): void {
        // Update time every second
        this.timerSubscription = interval(1000).subscribe(() => {
            this.currentDate = new Date();
        });

        // Load real weather
        this.loadWeather();
    }

    ngOnDestroy(): void {
        this.timerSubscription?.unsubscribe();
    }

    private loadWeather(): void {
        this.locationService
            .getCurrentPosition()
            .pipe(finalize(() => (this.weatherLoading = false)))
            .subscribe({
                next: (position) => {
                    this.fetchWeather(position.coords.latitude, position.coords.longitude);
                },
                error: () => {
                    // Fallback: default location
                    this.fetchWeather(55.7558, 37.6173);
                }
            });
    }

    private fetchWeather(lat: number, lon: number): void {
        this.weatherService.getWeatherByCoords(lat, lon).subscribe({
            next: (data) => {
                this.weather = {
                    city: data.name,
                    temperature: Math.round(data.main.temp),
                    description: data.weather[0].description,
                    iconClass: this.getWeatherIcon(data.weather[0].icon)
                };
            },
            error: () => {
                this.weatherError = true;
            }
        });
    }

    private getWeatherIcon(iconCode: string): string {
        const iconMap: Record<string, string> = {
            '01d': 'pi-sun',
            '01n': 'pi-moon',
            '02d': 'pi-cloud',
            '02n': 'pi-cloud',
            '03d': 'pi-cloud',
            '03n': 'pi-cloud',
            '04d': 'pi-cloud',
            '04n': 'pi-cloud',
            '09d': 'pi-cloud',
            '09n': 'pi-cloud',
            '10d': 'pi-cloud',
            '10n': 'pi-cloud',
            '11d': 'pi-bolt',
            '11n': 'pi-bolt',
            '13d': 'pi-snowflake',
            '13n': 'pi-snowflake',
            '50d': 'pi-align-justify',
            '50n': 'pi-align-justify'
        };
        return iconMap[iconCode] || 'pi-cloud';
    }
}
