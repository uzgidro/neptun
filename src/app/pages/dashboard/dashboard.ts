import { Component } from '@angular/core';
import { StatsWidget } from './components/stats/stats.widget';
// import { IncomingEventsWidget } from './components/incoming-events/incoming-events.widget';
import { WaterResourcesWidget } from '@/pages/dashboard/components/water-resources/water-resources.widget';
import { NotificationsWidget } from '@/pages/dashboard/components/notifications/notifications.widget';
import GesWidget from '@/pages/dashboard/components/ges/ges.widget';
import { FinancialSummaryWidget } from './components/financial-summary/financial-summary.widget';
import { KpiSummaryWidget } from './components/kpi-summary/kpi-summary.widget';
import { CashflowWidget } from './components/cashflow/cashflow.widget';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [StatsWidget, WaterResourcesWidget, NotificationsWidget, GesWidget, FinancialSummaryWidget, KpiSummaryWidget, CashflowWidget],
    styleUrl: './dashboard.scss',
    template: `
        <div class="dash-layout">
            <div class="dash-stats-row">
                <app-stats-widget class="contents" />
            </div>
            <div class="dash-financial-row">
                <app-financial-summary-widget />
                <app-kpi-summary-widget />
            </div>
            <div class="dash-cashflow-row">
                <app-cashflow-widget />
            </div>
            <div class="dash-ges-row">
                <app-ges-widget />
            </div>
            <div class="dash-bottom-row">
                <app-water-resources-widget />
                <app-notifications-widget />
            </div>
        </div>
    `
})
export class Dashboard {}
