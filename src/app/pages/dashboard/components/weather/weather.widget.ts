import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LocationService } from '@/core/services/location.service';
import { WeatherService } from '@/core/services/weather.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

interface WeatherData {
    city: string;
    temperature: number;
    description: string;
    iconClass: string;
    humidity: number;
    wind: number;
}

@Component({
    selector: 'app-weather-widget',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './weather.widget.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeatherWidget implements OnInit, OnDestroy {
    weather: WeatherData | null = null;
    loading: boolean = true;
    errorMessage: string | null = null;

    private locationService = inject(LocationService);
    private weatherService = inject(WeatherService);
    private cdr = inject(ChangeDetectorRef);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.locationService
            .getCurrentPosition()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => {
                this.loading = false;
                this.cdr.markForCheck();
            }))
            .subscribe({
                next: (position) => {
                    this.loadWeather(position.coords.latitude, position.coords.longitude);
                },
                error: (error) => {
                    console.error('Ошибка получения местоположения:', error);
                    this.errorMessage = this.translate.instant('WEATHER.LOCATION_ERROR');
                    this.cdr.markForCheck();
                }
            });
    }

    private loadWeather(lat: number, lon: number) {
        this.weatherService.getWeatherByCoords(lat, lon).pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
                this.weather = {
                    city: data.name,
                    temperature: Math.round(data.main.temp),
                    description: data.weather[0].description,
                    iconClass: this.getWeatherIcon(data.weather[0].icon),
                    humidity: data.main.humidity,
                    wind: Math.round(data.wind.speed)
                };
                this.cdr.markForCheck();
            },
            error: (error) => {
                console.error('Ошибка получения погоды:', error);
                this.errorMessage = this.translate.instant('WEATHER.LOAD_ERROR');
                this.cdr.markForCheck();
            }
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private getWeatherIcon(iconCode: string): string {
        const iconMap: { [key: string]: string } = {
            '01d': 'pi pi-sun text-yellow-500',
            '01n': 'pi pi-moon text-blue-300',
            '02d': 'pi pi-cloud-sun text-gray-400',
            '02n': 'pi pi-cloud-moon text-gray-400',
            '03d': 'pi pi-cloud text-gray-400',
            '03n': 'pi pi-cloud text-gray-400',
            '04d': 'pi pi-cloud text-gray-400',
            '04n': 'pi pi-cloud text-gray-400',
            '09d': 'pi pi-cloud-rain text-blue-500',
            '09n': 'pi pi-cloud-rain text-blue-500',
            '10d': 'pi pi-cloud-rain text-blue-500',
            '10n': 'pi pi-cloud-rain text-blue-500',
            '11d': 'pi pi-cloud-lightning text-yellow-600',
            '11n': 'pi pi-cloud-lightning text-yellow-600',
            '13d': 'pi pi-cloud-snow text-blue-200',
            '13n': 'pi pi-cloud-snow text-blue-200',
            '50d': 'pi pi-bars text-gray-500', // Туман
            '50n': 'pi pi-bars text-gray-500' // Туман
        };
        return iconMap[iconCode] || 'pi pi-question';
    }
}
