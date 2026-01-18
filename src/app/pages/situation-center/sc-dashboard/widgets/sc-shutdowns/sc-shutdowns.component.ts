import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

interface ShutdownItem {
    id: number;
    stationName: string;
    stationType: 'ges' | 'mini' | 'micro';
    reason: string;
    startTime: Date;
    lostGeneration: number;
    downtime: number; // hours
}

@Component({
    selector: 'sc-shutdowns',
    standalone: true,
    imports: [DecimalPipe],
    templateUrl: './sc-shutdowns.component.html',
    styleUrl: './sc-shutdowns.component.scss'
})
export class ScShutdownsComponent {
    // Mock shutdown data
    shutdowns: ShutdownItem[] = [
        {
            id: 1,
            stationName: 'Чирчикская ГЭС',
            stationType: 'ges',
            reason: 'Плановое ТО',
            startTime: new Date(Date.now() - 3600000 * 5), // 5 hours ago
            lostGeneration: 125.5,
            downtime: 5
        },
        {
            id: 2,
            stationName: 'Ходжикентская ГЭС',
            stationType: 'ges',
            reason: 'Замена подшипников',
            startTime: new Date(Date.now() - 3600000 * 12), // 12 hours ago
            lostGeneration: 280.3,
            downtime: 12
        },
        {
            id: 3,
            stationName: 'мини ГЭС-7',
            stationType: 'mini',
            reason: 'Аварийная остановка',
            startTime: new Date(Date.now() - 3600000 * 2), // 2 hours ago
            lostGeneration: 18.7,
            downtime: 2
        },
        {
            id: 4,
            stationName: 'микро ГЭС Арнасай',
            stationType: 'micro',
            reason: 'Низкий уровень воды',
            startTime: new Date(Date.now() - 3600000 * 8), // 8 hours ago
            lostGeneration: 5.2,
            downtime: 8
        }
    ];

    // Summary stats
    get totalLostGeneration(): number {
        return this.shutdowns.reduce((sum, s) => sum + s.lostGeneration, 0);
    }

    get activeShutdownsCount(): number {
        return this.shutdowns.length;
    }

    getTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            'ges': 'ГЭС',
            'mini': 'мини',
            'micro': 'микро'
        };
        return labels[type] || type;
    }

    getTypeClass(type: string): string {
        return `type-${type}`;
    }

    formatDowntime(hours: number): string {
        if (hours < 1) {
            return `${Math.round(hours * 60)} мин`;
        }
        return `${hours} ч`;
    }
}
