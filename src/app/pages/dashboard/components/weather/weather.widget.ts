import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from '@/core/services/location.service';
import { WeatherService } from '@/core/services/weather.service';
import { finalize } from 'rxjs/operators';

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
    imports: [CommonModule],
    templateUrl: './weather.widget.html'
})
export class WeatherWidget implements OnInit {
    weather: WeatherData | null = null;
    loading: boolean = true;
    errorMessage: string | null = null;

    private locationService = inject(LocationService);
    private weatherService = inject(WeatherService);

    ngOnInit() {
        this.locationService
            .getCurrentPosition()
            .pipe(finalize(() => (this.loading = false)))
            .subscribe({
                next: (position) => {
                    this.loadWeather(position.coords.latitude, position.coords.longitude);
                },
                error: (error) => {
                    console.error('Ошибка получения местоположения:', error);
                    this.errorMessage = 'Не удалось определить ваше местоположение.';
                }
            });
    }

    private loadWeather(lat: number, lon: number) {
        this.weatherService.getWeatherByCoords(lat, lon).subscribe({
            next: (data) => {
                this.weather = {
                    city: data.name,
                    temperature: Math.round(data.main.temp),
                    description: data.weather[0].description,
                    iconClass: this.getWeatherIcon(data.weather[0].icon),
                    humidity: data.main.humidity,
                    wind: Math.round(data.wind.speed)
                };
            },
            error: (error) => {
                console.error('Ошибка получения погоды:', error);
                this.errorMessage = 'Не удалось загрузить прогноз погоды.';
            }
        });
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
