import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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

    ngOnInit() {
        // Здесь вы можете подключить реальный API погоды.
        // А пока используем демонстрационные данные.
        this.weather = {
            city: 'Ташкент',
            temperature: 28,
            description: 'Ясно',
            iconClass: 'pi pi-sun text-yellow-500',
            humidity: 45,
            wind: 10
        };
    }
}