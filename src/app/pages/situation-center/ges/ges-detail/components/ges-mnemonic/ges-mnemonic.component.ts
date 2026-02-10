import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ProgressSpinner } from 'primeng/progressspinner';

import { TelemetryEnvelope } from '@/core/interfaces/ges';
import { getSvgAssetUrl, hasSvgSchema } from './ges-svg-registry';

@Component({
    selector: 'app-ges-mnemonic',
    standalone: true,
    imports: [CommonModule, TranslateModule, ProgressSpinner],
    templateUrl: './ges-mnemonic.component.html',
    styleUrl: './ges-mnemonic.component.scss'
})
export class GesMnemonicComponent implements OnChanges {
    @Input() gesId!: number;
    @Input() telemetry: TelemetryEnvelope[] = [];

    @ViewChild('svgContainer', { static: false }) svgContainer!: ElementRef<HTMLDivElement>;

    private http = inject(HttpClient);
    private sanitizer = inject(DomSanitizer);

    svgContent: SafeHtml | null = null;
    svgLoading = false;
    svgError = false;
    hasSvg = false;

    private currentGesId: number | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['gesId']) {
            this.hasSvg = hasSvgSchema(this.gesId);
            if (this.hasSvg && this.gesId !== this.currentGesId) {
                this.loadSvg();
            } else if (!this.hasSvg) {
                this.svgContent = null;
                this.currentGesId = null;
            }
        }

        if (changes['telemetry'] && this.svgContent) {
            this.bindTelemetryToSvg();
        }
    }

    private loadSvg(): void {
        const url = getSvgAssetUrl(this.gesId);
        if (!url) {
            this.hasSvg = false;
            return;
        }

        this.svgLoading = true;
        this.svgError = false;
        this.currentGesId = this.gesId;

        this.http.get(url, { responseType: 'text' }).subscribe({
            next: (svgText) => {
                this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svgText);
                this.svgLoading = false;
                // Bind telemetry after DOM update
                setTimeout(() => this.bindTelemetryToSvg(), 0);
            },
            error: () => {
                this.svgError = true;
                this.svgLoading = false;
                this.svgContent = null;
            }
        });
    }

    private bindTelemetryToSvg(): void {
        if (!this.svgContainer?.nativeElement || !this.telemetry?.length) return;

        const container = this.svgContainer.nativeElement;

        for (const envelope of this.telemetry) {
            const deviceId = envelope.device_id;
            if (!deviceId) continue;

            const power = this.findValue(envelope, 'power', 'active_power');
            const kium = this.findValue(envelope, 'kium');
            const kpd = this.findValue(envelope, 'kpd');
            const na = this.findValue(envelope, 'na', 'level');
            const waterFlow = this.findValue(envelope, 'water_flow', 'flow', 'rashod');

            this.setTextContent(container, `g${deviceId}`, power);
            this.setTextContent(container, `a${deviceId}`, kium);
            this.setTextContent(container, `k${deviceId}`, kpd);
            this.setTextContent(container, `n${deviceId}`, na);
            this.setTextContent(container, `w${deviceId}`, waterFlow);

            // Color coding for status paths
            const isActive = this.isDeviceActive(envelope);
            const hasAlarm = this.hasAlarm(envelope);
            const fillColor = hasAlarm ? '#ef4444' : isActive ? '#22c55e' : '#9ca3af';

            this.setPathFill(container, `c${deviceId}`, fillColor);
            this.setPathFill(container, `c${deviceId}1`, fillColor);
            this.setPathFill(container, `c${deviceId}2`, fillColor);
        }
    }

    private findValue(envelope: TelemetryEnvelope, ...names: string[]): string | null {
        for (const name of names) {
            const point = envelope.values.find((v) => v.name === name);
            if (point?.value != null) {
                const num = Number(point.value);
                return isNaN(num) ? String(point.value) : num.toFixed(2);
            }
        }
        return null;
    }

    private setTextContent(container: HTMLElement, id: string, value: string | null): void {
        if (value === null) return;
        const el = container.querySelector(`#${id}`);
        if (el) {
            el.textContent = value;
        }
    }

    private setPathFill(container: HTMLElement, id: string, color: string): void {
        const el = container.querySelector(`#${id}`);
        if (el) {
            (el as SVGElement).style.fill = color;
        }
    }

    private isDeviceActive(envelope: TelemetryEnvelope): boolean {
        const power = envelope.values.find((v) => v.name === 'power' || v.name === 'active_power');
        return envelope.values.some((v) => v.quality === 'good') && Number(power?.value) > 0;
    }

    private hasAlarm(envelope: TelemetryEnvelope): boolean {
        return envelope.values.some((v) => v.severity === 'alarm' || v.severity === 'critical');
    }
}
