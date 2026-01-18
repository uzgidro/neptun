import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

interface DischargeItem {
    id: number;
    reservoirName: string;
    flowRate: number; // m³/s
    totalVolume: number; // thousand m³
    isOngoing: boolean;
    startTime: Date;
}

@Component({
    selector: 'sc-discharges',
    standalone: true,
    imports: [DecimalPipe],
    templateUrl: './sc-discharges.component.html',
    styleUrl: './sc-discharges.component.scss'
})
export class ScDischargesComponent {
    // Mock discharge data
    discharges: DischargeItem[] = [
        {
            id: 1,
            reservoirName: 'Чарвакское вдхр.',
            flowRate: 245.5,
            totalVolume: 1250.8,
            isOngoing: true,
            startTime: new Date(Date.now() - 3600000 * 24)
        },
        {
            id: 2,
            reservoirName: 'Андижанское вдхр.',
            flowRate: 180.2,
            totalVolume: 890.5,
            isOngoing: true,
            startTime: new Date(Date.now() - 3600000 * 12)
        },
        {
            id: 3,
            reservoirName: 'Туябугузское вдхр.',
            flowRate: 95.8,
            totalVolume: 420.3,
            isOngoing: true,
            startTime: new Date(Date.now() - 3600000 * 6)
        }
    ];

    // Summary stats
    get totalFlowRate(): number {
        return this.discharges
            .filter(d => d.isOngoing)
            .reduce((sum, d) => sum + d.flowRate, 0);
    }

    get totalVolume(): number {
        return this.discharges.reduce((sum, d) => sum + d.totalVolume, 0);
    }

    get activeDischargesCount(): number {
        return this.discharges.filter(d => d.isOngoing).length;
    }

    getFlowIntensity(flowRate: number): string {
        if (flowRate > 200) return 'high';
        if (flowRate > 100) return 'medium';
        return 'low';
    }
}
