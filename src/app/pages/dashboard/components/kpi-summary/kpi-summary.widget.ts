import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KnobModule } from 'primeng/knob';
import { ProgressBarModule } from 'primeng/progressbar';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-kpi-summary-widget',
    standalone: true,
    imports: [CommonModule, RouterModule, KnobModule, ProgressBarModule, FormsModule, TranslateModule],
    template: `
        <div class="dash-tile accent-purple">
            <div class="tile-header">
                <span class="tile-label label-purple"><i class="pi pi-chart-bar"></i> {{ 'DASHBOARD.KPI_OVERVIEW' | translate }}</span>
                <a routerLink="/kpi" class="tile-link">{{ 'DASHBOARD.VIEW_DETAILS' | translate }} →</a>
            </div>
            <div class="kpi-content">
                <div class="kpi-knob">
                    <p-knob [(ngModel)]="overallKpi" [readonly]="true" [size]="120" [strokeWidth]="8"
                            valueColor="#8b5cf6" rangeColor="#e2e8f0" valueTemplate="{value}%" />
                    <span class="kpi-knob-label">Общий KPI</span>
                </div>
                <div class="kpi-bars">
                    @for (kpi of kpis; track kpi.label) {
                        <div class="kpi-bar-item">
                            <div class="kpi-bar-header">
                                <span class="kpi-bar-label">{{ kpi.label }}</span>
                                <span class="kpi-bar-value">{{ kpi.value }}%</span>
                            </div>
                            <p-progressBar [value]="kpi.value" [showValue]="false" [style]="{ height: '6px' }"
                                           [color]="kpi.color" />
                        </div>
                    }
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host { display: block; height: 100%; }
        :host ::ng-deep .dash-tile { height: 100%; }
        .kpi-content {
            display: flex;
            gap: 24px;
            align-items: center;
            flex: 1;
        }
        .kpi-knob {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .kpi-knob-label {
            font-size: 12px;
            color: var(--dash-text-muted, #94a3b8);
            margin-top: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .kpi-bars {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            gap: 16px;
            min-width: 0;
        }
        .kpi-bar-item { }
        .kpi-bar-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }
        .kpi-bar-label {
            font-size: 13px;
            color: var(--dash-text-secondary, #475569);
        }
        .kpi-bar-value {
            font-size: 13px;
            font-weight: 600;
            color: var(--dash-text-primary, #0f172a);
            font-variant-numeric: tabular-nums;
        }
        .tile-link {
            font-size: 13px;
            color: var(--dash-blue, #3b82f6);
            text-decoration: none;
            &:hover { text-decoration: underline; }
        }
    `]
})
export class KpiSummaryWidget {
    overallKpi = 78;

    kpis = [
        { label: 'Производство', value: 85, color: '#22c55e' },
        { label: 'Финансы', value: 72, color: '#3b82f6' },
        { label: 'Персонал', value: 68, color: '#f59e0b' },
        { label: 'Инвестиции', value: 91, color: '#8b5cf6' }
    ];
}
