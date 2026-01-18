import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';

interface StatusItem {
    label: string;
    value: number;
    color: string;
    cssClass: string;
}

@Component({
    selector: 'sc-station-status',
    standalone: true,
    imports: [ChartModule],
    templateUrl: './sc-station-status.component.html',
    styleUrl: './sc-station-status.component.scss'
})
export class ScStationStatusComponent implements OnInit {
    // Mock status data
    statusData: StatusItem[] = [
        { label: 'В работе', value: 88, color: '#00ff88', cssClass: 'status-active' },
        { label: 'Остановлены', value: 19, color: '#ff4757', cssClass: 'status-stopped' },
        { label: 'В ремонте', value: 16, color: '#ffd32a', cssClass: 'status-repair' }
    ];

    totalUnits = 123;

    // Chart configuration
    chartData: any;
    chartOptions: any;

    ngOnInit(): void {
        this.initChart();
    }

    private initChart(): void {
        this.chartData = {
            labels: this.statusData.map(s => s.label),
            datasets: [
                {
                    data: this.statusData.map(s => s.value),
                    backgroundColor: this.statusData.map(s => s.color),
                    borderWidth: 0,
                    hoverOffset: 8
                }
            ]
        };

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(13, 27, 51, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(0, 212, 255, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: (context: any) => {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return ` ${value} агрегатов (${percentage}%)`;
                        }
                    }
                }
            }
        };
    }

    getPercentage(value: number): number {
        return Math.round((value / this.totalUnits) * 100);
    }
}
