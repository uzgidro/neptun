import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TranslateModule } from '@ngx-translate/core';

import { TelemetryEnvelope, GeneratorView, ASCUEMetrics } from '@/core/interfaces/ges';

@Component({
    selector: 'app-ges-aggregates',
    standalone: true,
    imports: [CommonModule, TableModule, TagModule, TranslateModule],
    templateUrl: './ges-aggregates.component.html',
    styleUrl: './ges-aggregates.component.scss'
})
export class GesAggregatesComponent implements OnChanges {
    @Input() gesId!: number;
    @Input() telemetry: TelemetryEnvelope[] = [];
    @Input() askue: ASCUEMetrics | null = null;

    generators: GeneratorView[] = [];
    private pipe = new DecimalPipe('en-US');

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['telemetry']) {
            this.processGenerators();
        }
    }

    processGenerators(): void {
        this.generators = this.telemetry
            .filter((env) => env.device_group === 'generators')
            .map((env) => {
                const val = (name: string): number | null => {
                    const p = env.values.find((v) => v.name === name);
                    return p != null && p.value != null ? Number(p.value) : null;
                };

                const fmt = (v: number | null, format = '1.2-2'): string => {
                    if (v == null) return '—';
                    return this.pipe.transform(v, format) ?? '—';
                };

                const activePowerKw = val('active_power_kw');
                const reactivePowerKvar = val('reactive_power_kvar');
                const hasGoodQuality = env.values.some((v) => v.quality === 'good');
                const hasAlarm = env.values.some((v) => v.severity === 'alarm' || v.severity === 'critical');

                let status: GeneratorView['status'] = 'offline';
                if (hasGoodQuality) {
                    if (hasAlarm) {
                        status = 'repair';
                    } else if (activePowerKw && activePowerKw > 0) {
                        status = 'active';
                    } else {
                        status = 'pending';
                    }
                }

                const params = [
                    { label: 'GES_DETAIL.AGGREGATE.ACTIVE_POWER', value: fmt(activePowerKw != null ? activePowerKw / 1000 : null), unit: 'GES_DETAIL.UNIT.MW' },
                    { label: 'GES_DETAIL.AGGREGATE.REACTIVE_POWER', value: fmt(reactivePowerKvar != null ? reactivePowerKvar / 1000 : null), unit: 'GES_DETAIL.UNIT.MVAR' },
                    { label: 'GES_DETAIL.AGGREGATE.VOLTAGE_AB', value: fmt(val('voltage_ab')), unit: 'GES_DETAIL.UNIT.KV' },
                    { label: 'GES_DETAIL.AGGREGATE.VOLTAGE_BC', value: fmt(val('voltage_bc')), unit: 'GES_DETAIL.UNIT.KV' },
                    { label: 'GES_DETAIL.AGGREGATE.VOLTAGE_CA', value: fmt(val('voltage_ca')), unit: 'GES_DETAIL.UNIT.KV' },
                    { label: 'GES_DETAIL.AGGREGATE.CURRENT_A', value: fmt(val('current_a'), '1.1-1'), unit: 'GES_DETAIL.UNIT.A' },
                    { label: 'GES_DETAIL.AGGREGATE.CURRENT_B', value: fmt(val('current_b'), '1.1-1'), unit: 'GES_DETAIL.UNIT.A' },
                    { label: 'GES_DETAIL.AGGREGATE.CURRENT_C', value: fmt(val('current_c'), '1.1-1'), unit: 'GES_DETAIL.UNIT.A' },
                    { label: 'GES_DETAIL.AGGREGATE.FREQUENCY', value: fmt(val('frequency')), unit: 'GES_DETAIL.UNIT.HZ' },
                    { label: 'GES_DETAIL.AGGREGATE.POWER_FACTOR', value: fmt(val('power_factor'), '1.3-3'), unit: '' },
                    { label: 'GES_DETAIL.AGGREGATE.ROTOR_VOLTAGE', value: fmt(val('rotor_voltage'), '1.1-1'), unit: 'GES_DETAIL.UNIT.V' },
                    { label: 'GES_DETAIL.AGGREGATE.ROTOR_CURRENT', value: fmt(val('rotor_current'), '1.1-1'), unit: 'GES_DETAIL.UNIT.A' },
                    { label: 'GES_DETAIL.AGGREGATE.GUIDE_VANE_1', value: fmt(val('guide_vane_1'), '1.1-1'), unit: 'GES_DETAIL.UNIT.PERCENT' },
                    { label: 'GES_DETAIL.AGGREGATE.GUIDE_VANE_2', value: fmt(val('guide_vane_2'), '1.1-1'), unit: 'GES_DETAIL.UNIT.PERCENT' },
                ];

                return {
                    id: env.device_id,
                    name: env.device_name || `Производственная линия ${env.device_id}`,
                    status,
                    params
                };
            })
            .sort((a, b) => {
                const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
                const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
                return numA - numB;
            });
    }

    getStatusSeverity(status: GeneratorView['status']): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const map: Record<GeneratorView['status'], 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
            active: 'danger',
            pending: 'success',
            repair: 'warn',
            offline: 'secondary'
        };
        return map[status];
    }

    getStatusLabel(status: GeneratorView['status']): string {
        const map: Record<GeneratorView['status'], string> = {
            active: 'GES_DETAIL.STATUS.ACTIVE',
            pending: 'GES_DETAIL.STATUS.PENDING',
            repair: 'GES_DETAIL.STATUS.REPAIR',
            offline: 'GES_DETAIL.STATUS.OFFLINE'
        };
        return map[status];
    }
}
