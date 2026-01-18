import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LocationService } from '@/core/services/location.service';
import { WeatherService } from '@/core/services/weather.service';

interface WeatherData {
    city: string;
    temperature: number;
    description: string;
    iconClass: string;
}

@Component({
    selector: 'sc-header',
    standalone: true,
    imports: [DatePipe],
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
                    // Fallback: Ташкент
                    this.fetchWeather(41.2995, 69.2401);
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
