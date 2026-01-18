import { Component } from '@angular/core';

interface MonitoringMetric {
    label: string;
    value: number;
    icon: string;
    color: string;
}

@Component({
    selector: 'sc-monitoring',
    standalone: true,
    imports: [],
    templateUrl: './sc-monitoring.component.html',
    styleUrl: './sc-monitoring.component.scss'
})
export class ScMonitoringComponent {
    // Mock data for monitoring metrics
    metrics: MonitoringMetric[] = [
        { label: 'ГЭС', value: 10, icon: 'pi-bolt', color: 'cyan' },
        { label: 'мини ГЭС', value: 4, icon: 'pi-cog', color: 'blue' },
        { label: 'микро ГЭС', value: 2, icon: 'pi-circle', color: 'purple' }
    ];

    // ASKUE connection status
    askueMetrics = {
        connected: 14,
        total: 16,
        percentage: 87.5
    };

    // Additional infrastructure
    infrastructure = [
        { label: 'Плотины', value: 18, icon: 'pi-building' },
        { label: 'Водохранилища', value: 12, icon: 'pi-database' }
    ];
}
