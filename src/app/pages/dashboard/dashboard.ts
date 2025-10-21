import { Component } from '@angular/core';
import { StatsWidget } from './components/statswidget';
import { IncomingEventsWidget } from './components/incoming-events/incoming-events.widget';
import { WaterResourceWidget } from '@/pages/dashboard/components/water-resource.widget';
import { ConstructionWidget } from '@/pages/dashboard/components/construction/construction.widget';
import { NotificationsWidget } from '@/pages/dashboard/components/notifications/notifications.widget';
import { GesWidget } from '@/pages/dashboard/components/ges/ges.widget';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [StatsWidget, IncomingEventsWidget, WaterResourceWidget, ConstructionWidget, NotificationsWidget, GesWidget],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" />
            <div class="col-span-12 xl:col-span-6">
                <app-ges-widget />
                <app-construction-widget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <app-water-resource-widget />
                <app-notifications-widget />
            </div>
            <app-incoming-events-widget class="contents" />
        </div>
    `
})
export class Dashboard {}
