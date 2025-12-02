import { Component } from '@angular/core';
import { StatsWidget } from './components/stats/stats.widget';
import { IncomingEventsWidget } from './components/incoming-events/incoming-events.widget';
import { WaterResourcesWidget } from '@/pages/dashboard/components/water-resources/water-resources.widget';
import { ConstructionsWidget } from '@/pages/dashboard/components/constructions/constructions.widget';
import GesWidget from '@/pages/dashboard/components/ges/ges.widget';
import { NotificationsWidget } from '@/pages/dashboard/components/notifications/notifications.widget';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [StatsWidget, IncomingEventsWidget, WaterResourcesWidget, ConstructionsWidget, GesWidget, NotificationsWidget],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" />
            @if (gesExpanded) {
                <app-ges-widget class="col-span-12" (expansionChange)="onGesExpansionChange($event)" [expanded]="gesExpanded" />
                <div class="col-span-12 xl:col-span-4">
                    <app-constructions-widget />
                </div>
                <div class="col-span-12 xl:col-span-4">
                    <app-water-resources-widget />
                </div>
                <div class="col-span-12 xl:col-span-4">
                    <app-notifications-widget />
                </div>
            } @else {
                <div class="col-span-12 xl:col-span-6">
                    <app-ges-widget (expansionChange)="onGesExpansionChange($event)" />
                    <app-constructions-widget />
                </div>
                <div class="col-span-12 xl:col-span-6">
                    <app-water-resources-widget />
                    <app-notifications-widget />
                </div>
            }
            <app-incoming-events-widget class="contents" />
        </div>
    `
})
export class Dashboard {
    gesExpanded = false;

    onGesExpansionChange(expanded: boolean) {
        this.gesExpanded = expanded;
    }
}
