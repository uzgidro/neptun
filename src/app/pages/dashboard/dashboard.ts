import { Component } from '@angular/core';
import { StatsWidget } from './components/stats/stats.widget';
// import { IncomingEventsWidget } from './components/incoming-events/incoming-events.widget';
import { WaterResourcesWidget } from '@/pages/dashboard/components/water-resources/water-resources.widget';
import { NotificationsWidget } from '@/pages/dashboard/components/notifications/notifications.widget';
import GesWidget from '@/pages/dashboard/components/ges/ges.widget';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [StatsWidget, WaterResourcesWidget, NotificationsWidget, GesWidget],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents col-span-12 order-first" />

            <app-ges-widget class="col-span-12 h-full" />

            <app-water-resources-widget class="col-span-12 h-full" />

            <!--<app-incoming-events-widget [class]="getWidgetClass('events') + ' h-full'" [expanded]="expandedWidgetId === 'events'" (expansionChange)="onExpansionChange('events', $event)" />-->

            <app-notifications-widget class="col-span-12 h-full" />
        </div>
    `
})
export class Dashboard {
    // expandedWidgetId: string | null = null;

    // onExpansionChange(widgetId: string, expanded: boolean) {
    //     this.expandedWidgetId = expanded ? widgetId : null;
    // }

    // getWidgetClass(widgetId: string): string {
    //     // 1. СЦЕНАРИЙ: Никто не раскрыт - все виджеты занимают полную ширину
    //     if (!this.expandedWidgetId) {
    //         return 'col-span-12';
    //     }

    //     // 2. СЦЕНАРИЙ: Этот виджет - тот самый, который раскрыт
    //     if (this.expandedWidgetId === widgetId) {
    //         // Он занимает всю ширину и встает первым (order-1)
    //         return 'col-span-12 order-1';
    //     }

    //     // 3. СЦЕНАРИЙ: Раскрыт КТО-ТО ДРУГОЙ, а этот виджет должен "потесниться"
    //     // Занимает половину экрана (col-span-6) и встает после главного (order-2)
    //     return 'col-span-12 xl:col-span-6 order-2';
    // }
}
