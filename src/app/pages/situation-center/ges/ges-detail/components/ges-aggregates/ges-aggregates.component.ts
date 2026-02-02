import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TranslateModule } from '@ngx-translate/core';

import { TelemetryEnvelope, GesAggregate } from '@/core/interfaces/ges';

@Component({
    selector: 'app-ges-aggregates',
    standalone: true,
    imports: [CommonModule, TableModule, TagModule, DecimalPipe, TranslateModule],
    templateUrl: './ges-aggregates.component.html',
    styleUrl: './ges-aggregates.component.scss'
})
export class GesAggregatesComponent implements OnChanges {
    @Input() gesId!: number;
    @Input() telemetry: TelemetryEnvelope[] = [];

    aggregates: GesAggregate[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['telemetry']) {
            this.processAggregates();
        }
    }

    processAggregates(): void {
        this.aggregates = this.telemetry.map((envelope) => {
            const powerPoint = envelope.values.find((v) => v.name === 'power' || v.name === 'active_power');
            const tempPoint = envelope.values.find((v) => v.name === 'temperature' || v.name === 'temp');

            let status: GesAggregate['status'] = 'offline';
            if (envelope.values.some((v) => v.quality === 'good')) {
                const hasPower = powerPoint && Number(powerPoint.value) > 0;
                const hasWarning = envelope.values.some((v) => v.severity === 'warning');
                const hasAlarm = envelope.values.some((v) => v.severity === 'alarm' || v.severity === 'critical');

                if (hasAlarm) {
                    status = 'repair';
                } else if (hasWarning) {
                    status = 'pending';
                } else if (hasPower) {
                    status = 'active';
                } else {
                    status = 'pending';
                }
            }

            return {
                id: envelope.device_id,
                name: envelope.device_name || `Агрегат ${envelope.device_id}`,
                power: Number(powerPoint?.value) || 0,
                status,
                temperature: tempPoint ? Number(tempPoint.value) : undefined
            };
        });
    }

    getStatusSeverity(status: GesAggregate['status']): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const severities: Record<GesAggregate['status'], 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
            active: 'success',
            pending: 'info',
            repair: 'warn',
            offline: 'danger'
        };
        return severities[status];
    }

    getStatusLabel(status: GesAggregate['status']): string {
        const labels: Record<GesAggregate['status'], string> = {
            active: 'GES_DETAIL.STATUS.ACTIVE',
            pending: 'GES_DETAIL.STATUS.PENDING',
            repair: 'GES_DETAIL.STATUS.REPAIR',
            offline: 'GES_DETAIL.STATUS.OFFLINE'
        };
        return labels[status];
    }
}
