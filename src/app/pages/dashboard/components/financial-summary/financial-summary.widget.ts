import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-financial-summary-widget',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule, ChartModule, TranslateModule],
    template: `
        <div class="dash-tile accent-green">
            <div class="tile-header">
                <span class="tile-label label-green"><i class="pi pi-wallet"></i> {{ 'DASHBOARD.FINANCIAL_SUMMARY' | translate }}</span>
                <a routerLink="/financial-dashboard" class="tile-link">{{ 'DASHBOARD.VIEW_DETAILS' | translate }} →</a>
            </div>
            <div class="financial-stats">
                <div class="fin-stat">
                    <span class="fin-stat-label">{{ 'DASHBOARD.TOTAL_INCOME' | translate }}</span>
                    <span class="fin-stat-value text-green">1 250.4 млрд</span>
                </div>
                <div class="fin-stat">
                    <span class="fin-stat-label">{{ 'DASHBOARD.TOTAL_EXPENSES' | translate }}</span>
                    <span class="fin-stat-value text-red">890.2 млрд</span>
                </div>
                <div class="fin-stat">
                    <span class="fin-stat-label">{{ 'DASHBOARD.NET_BALANCE' | translate }}</span>
                    <span class="fin-stat-value text-blue">360.2 млрд</span>
                </div>
            </div>
            <div class="fin-chart">
                <p-chart type="doughnut" [data]="chartData" [options]="chartOptions" [style]="{ width: '100%', maxWidth: '200px', margin: '0 auto' }" />
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: block;
            height: 100%;
        }
        :host ::ng-deep .dash-tile {
            height: 100%;
        }
        .financial-stats {
            display: flex;
            gap: 16px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }
        .fin-stat {
            flex: 1;
            min-width: 120px;
        }
        .fin-stat-label {
            display: block;
            font-size: 12px;
            color: var(--dash-text-muted, #94a3b8);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .fin-stat-value {
            font-size: 18px;
            font-weight: 700;
            font-variant-numeric: tabular-nums;
        }
        .text-green { color: var(--dash-green, #22c55e); }
        .text-red { color: var(--dash-red, #ef4444); }
        .text-blue { color: var(--dash-blue, #3b82f6); }
        .fin-chart {
            display: flex;
            justify-content: center;
        }
    `]
})
export class FinancialSummaryWidget {
    chartData = {
        labels: ['Доходы', 'Расходы'],
        datasets: [{
            data: [1250.4, 890.2],
            backgroundColor: ['#22c55e', '#ef4444'],
            hoverBackgroundColor: ['#16a34a', '#dc2626'],
            borderWidth: 0
        }]
    };

    chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: { usePointStyle: true, padding: 16, font: { size: 12 } }
            }
        }
    };
}
