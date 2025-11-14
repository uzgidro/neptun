import { Component } from '@angular/core';
import { StatsWidget } from './components/statswidget';
import { IncomingEventsWidget } from './components/incoming-events/incoming-events.widget';
import { WaterResourcesWidget } from '@/pages/dashboard/components/water-resources/water-resources.widget';
import { ConstructionsWidget } from '@/pages/dashboard/components/constructions/constructions.widget';
import GesWidget from '@/pages/dashboard/components/ges/ges.widget';
import { NotificationsWidget } from '@/pages/dashboard/components/notifications/notifications.widget';
import { WeatherWidget } from '@/pages/dashboard/components/weather/weather.widget';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [StatsWidget, IncomingEventsWidget, WaterResourcesWidget, ConstructionsWidget, GesWidget, NotificationsWidget, WeatherWidget],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" />
            <div class="col-span-12 xl:col-span-6">
                <app-ges-widget />
                <app-constructions-widget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <app-water-resources-widget />
                <app-notifications-widget />
            </div>
            <app-incoming-events-widget class="contents" />
            <app-weather-widget />
        </div>
    `
})
export class Dashboard {}
