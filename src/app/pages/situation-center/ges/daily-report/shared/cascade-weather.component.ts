import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ReportWeather } from '@/core/interfaces/ges-report';

@Component({
    selector: 'app-cascade-weather',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    template: `
        @if (weather) {
            <div class="flex items-center gap-4 whitespace-nowrap">
                <div class="flex items-center gap-1" [title]="'GES_REPORT.CURRENT' | translate">
                    @if (weather.weather_condition) {
                        <img
                            [src]="iconUrl(weather.weather_condition)"
                            [alt]="weather.weather_condition"
                            width="40"
                            height="40" />
                    }
                    @if (weather.temperature != null) {
                        <span class="font-semibold">{{ weather.temperature | number: '1.0-1' }}°C</span>
                    }
                </div>
                <div class="flex items-center gap-1 opacity-60" [title]="'GES_REPORT.PREV_YEAR' | translate">
                    @if (weather.prev_year_condition) {
                        <img
                            [src]="iconUrl(weather.prev_year_condition)"
                            [alt]="weather.prev_year_condition"
                            width="32"
                            height="32" />
                    }
                    @if (weather.prev_year_temperature != null) {
                        <span class="text-xs">{{ weather.prev_year_temperature | number: '1.0-1' }}°C</span>
                    }
                </div>
            </div>
        }
    `
})
export class CascadeWeatherComponent {
    @Input() weather: ReportWeather | null = null;

    iconUrl(condition: string): string {
        return `https://openweathermap.org/img/wn/${condition}@2x.png`;
    }
}
