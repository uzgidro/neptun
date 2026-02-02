import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { TelemetryEnvelope } from '@/core/interfaces/ges';

interface MnemonicNode {
    id: string;
    name: string;
    x: number;
    y: number;
    status: 'active' | 'inactive' | 'warning' | 'alarm';
    value?: number;
}

@Component({
    selector: 'app-ges-mnemonic',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './ges-mnemonic.component.html',
    styleUrl: './ges-mnemonic.component.scss'
})
export class GesMnemonicComponent implements OnChanges {
    @Input() gesId!: number;
    @Input() telemetry: TelemetryEnvelope[] = [];

    nodes: MnemonicNode[] = [];
    selectedNode: MnemonicNode | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['telemetry']) {
            this.buildMnemonicNodes();
        }
    }

    buildMnemonicNodes(): void {
        // Build nodes from telemetry data
        // Position nodes in a grid layout for the mnemonic scheme
        const spacing = 100;
        const startX = 50;
        const startY = 50;

        this.nodes = this.telemetry.map((envelope, index) => {
            const row = Math.floor(index / 4);
            const col = index % 4;

            const powerPoint = envelope.values.find((v) => v.name === 'power' || v.name === 'active_power');
            const hasAlarm = envelope.values.some((v) => v.severity === 'alarm' || v.severity === 'critical');
            const hasWarning = envelope.values.some((v) => v.severity === 'warning');
            const isActive = envelope.values.some((v) => v.quality === 'good') && Number(powerPoint?.value) > 0;

            let status: MnemonicNode['status'] = 'inactive';
            if (hasAlarm) {
                status = 'alarm';
            } else if (hasWarning) {
                status = 'warning';
            } else if (isActive) {
                status = 'active';
            }

            return {
                id: envelope.device_id,
                name: envelope.device_name || `Агрегат ${envelope.device_id}`,
                x: startX + col * spacing,
                y: startY + row * spacing,
                status,
                value: Number(powerPoint?.value) || 0
            };
        });
    }

    onNodeClick(node: MnemonicNode): void {
        this.selectedNode = this.selectedNode?.id === node.id ? null : node;
    }

    getNodeColor(status: MnemonicNode['status']): string {
        const colors: Record<MnemonicNode['status'], string> = {
            active: '#22c55e',
            inactive: '#6b7280',
            warning: '#f59e0b',
            alarm: '#ef4444'
        };
        return colors[status];
    }
}
