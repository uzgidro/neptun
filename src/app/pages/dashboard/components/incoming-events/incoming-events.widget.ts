import { Component, OnInit } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

interface RecentEvent {
    name: string;
    date: Date;
    type: 'info' | 'warning' | 'success' | 'error';
}

@Component({
    standalone: true,
    selector: 'app-incoming-events-widget',
    imports: [CommonModule, TableModule, ButtonModule, RippleModule],
    templateUrl: './incoming-events.widget.html'
})
export class IncomingEventsWidget implements OnInit {
    events: RecentEvent[] = [];

    constructor() {}

    ngOnInit() {
        this.events = [
            { name: 'Аппаратное совещание', date: new Date(Date.now() + 1000 * 3600 * 2), type: 'info' },
            { name: 'Выездной селектор в Джизаке', date: new Date(Date.now() + 1000 * 3600 * 8), type: 'info' },
            { name: 'Открытие Нижнего Чаткала', date: new Date(Date.now() + 1000 * 3600 * 24), type: 'success' },
            { name: 'Встреча с президентом', date: new Date(Date.now() + 1000 * 3600 * 48), type: 'success' },
            { name: 'Собрание с индусами', date: new Date(Date.now() + 1000 * 3600 * 24 * 7), type: 'info' },
            { name: 'Выезд на объект', date: new Date(Date.now() + 1000 * 3600 * 24 * 10), type: 'info' },
        ];
    }

    getIconClass(type: RecentEvent['type']): object {
        return {
            'pi-info-circle text-blue-500': type === 'info',
            'pi-exclamation-triangle text-orange-500': type === 'warning',
            'pi-check-circle text-green-500': type === 'success',
            'pi-times-circle text-red-500': type === 'error'
        };
    }
}
