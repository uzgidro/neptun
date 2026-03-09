import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-cashflow-widget',
    standalone: true,
    imports: [CommonModule, RouterModule, ChartModule, TranslateModule],
    template: `
        <div class="dash-tile accent-sky">
            <div class="tile-header">
                <span class="tile-label label-blue"><i class="pi pi-chart-line"></i> {{ 'DASHBOARD.CASHFLOW' | translate }}</span>
                <a routerLink="/financial-dashboard" class="tile-link">{{ 'DASHBOARD.VIEW_DETAILS' | translate }} →</a>
            </div>
            <p-chart type="line" [data]="chartData" [options]="chartOptions" [style]="{ width: '100%', height: '250px' }" />
        </div>
    `,
    styles: [`
        :host { display: block; }
        .tile-link {
            font-size: 13px;
            color: var(--dash-blue, #3b82f6);
            text-decoration: none;
            &:hover { text-decoration: underline; }
        }
    `]
})
export class CashflowWidget {
    chartData = {
        labels: ['Окт', 'Ноя', 'Дек', 'Янв', 'Фев', 'Мар'],
        datasets: [
            {
                label: 'Доходы',
                data: [180, 210, 195, 220, 240, 230],
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            },
            {
                label: 'Расходы',
                data: [150, 165, 180, 155, 170, 160],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }
        ]
    };

    chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                position: 'bottom',
                labels: { usePointStyle: true, padding: 16, font: { size: 12 } }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: { font: { size: 11 } },
                grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
                ticks: { font: { size: 11 } },
                grid: { display: false }
            }
        }
    };
}
