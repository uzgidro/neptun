import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-ges-kpi-card',
    standalone: true,
    imports: [CommonModule, DecimalPipe],
    templateUrl: './ges-kpi-card.component.html',
    styleUrl: './ges-kpi-card.component.scss'
})
export class GesKpiCardComponent {
    @Input() title: string = '';
    @Input() value: number = 0;
    @Input() secondaryValue?: number;
    @Input() unit?: string;
    @Input() icon: string = 'pi-chart-bar';
    @Input() severity: 'primary' | 'success' | 'info' | 'warning' | 'danger' = 'primary';
    @Input() trend?: 'up' | 'down' | 'neutral';
    @Input() trendValue?: number;

    get severityClass(): string {
        const classes: Record<string, string> = {
            primary: 'bg-primary-100 text-primary-600',
            success: 'bg-green-100 text-green-600',
            info: 'bg-blue-100 text-blue-600',
            warning: 'bg-yellow-100 text-yellow-600',
            danger: 'bg-red-100 text-red-600'
        };
        return classes[this.severity] || classes['primary'];
    }

    get iconSeverityClass(): string {
        const classes: Record<string, string> = {
            primary: 'bg-primary-500 text-white',
            success: 'bg-green-500 text-white',
            info: 'bg-blue-500 text-white',
            warning: 'bg-yellow-500 text-white',
            danger: 'bg-red-500 text-white'
        };
        return classes[this.severity] || classes['primary'];
    }
}
