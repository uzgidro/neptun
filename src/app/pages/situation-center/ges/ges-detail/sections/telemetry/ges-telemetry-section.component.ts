import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { GesService } from '@/core/services/ges.service';
import { TelemetryEnvelope, DataPoint } from '@/core/interfaces/ges';

interface FlatTelemetryRow {
    deviceId: string;
    deviceName: string;
    deviceGroup: string;
    timestamp: string;
    name: string;
    value: any;
    unit?: string;
    quality: string;
    severity?: string;
}

@Component({
    selector: 'app-ges-telemetry-section',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonDirective, ButtonIcon, InputText, IconField, InputIcon, TooltipModule, TagModule, SelectModule, TranslateModule, DatePipe, DecimalPipe],
    templateUrl: './ges-telemetry-section.component.html',
    styleUrl: './ges-telemetry-section.component.scss'
})
export class GesTelemetrySectionComponent implements OnInit, OnDestroy {
    @Input() gesId!: number;

    private gesService = inject(GesService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);

    telemetry: TelemetryEnvelope[] = [];
    flatData: FlatTelemetryRow[] = [];
    loading = false;
    searchValue = '';
    lastUpdated: Date | null = null;

    // Filters
    deviceGroups: { label: string; value: string }[] = [];
    selectedDeviceGroup: string | null = null;
    selectedDevice: string | null = null;
    devices: { label: string; value: string }[] = [];

    private destroy$ = new Subject<void>();
    private refreshSubscription?: Subscription;

    ngOnInit(): void {
        this.loadData();
        // Auto-refresh every 2 minutes
        this.refreshSubscription = interval(120000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.loadData());
    }

    loadData(): void {
        this.loading = true;
        this.gesService
            .getTelemetry(this.gesId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.telemetry = data;
                    this.flattenData();
                    this.buildFilters();
                    this.lastUpdated = new Date();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'GES_DETAIL.ERROR_LOADING',
                        detail: err.message
                    });
                    this.loading = false;
                },
                complete: () => {
                    this.loading = false;
                }
            });
    }

    flattenData(): void {
        this.flatData = [];
        this.telemetry.forEach((envelope) => {
            envelope.values.forEach((point) => {
                this.flatData.push({
                    deviceId: envelope.device_id,
                    deviceName: envelope.device_name,
                    deviceGroup: envelope.device_group,
                    timestamp: envelope.timestamp,
                    name: point.name,
                    value: point.value,
                    unit: point.unit,
                    quality: point.quality,
                    severity: point.severity
                });
            });
        });
    }

    buildFilters(): void {
        const groupsSet = new Set<string>();
        const devicesSet = new Set<string>();

        this.telemetry.forEach((env) => {
            if (env.device_group) {
                groupsSet.add(env.device_group);
            }
            devicesSet.add(env.device_id);
        });

        this.deviceGroups = [{ label: this.translate.instant('GES_DETAIL.TELEMETRY.ALL_GROUPS'), value: '' }, ...Array.from(groupsSet).map((g) => ({ label: g, value: g }))];

        this.devices = [
            { label: this.translate.instant('GES_DETAIL.TELEMETRY.ALL_DEVICES'), value: '' },
            ...Array.from(devicesSet).map((d) => {
                const env = this.telemetry.find((e) => e.device_id === d);
                return { label: env?.device_name || d, value: d };
            })
        ];
    }

    get filteredData(): FlatTelemetryRow[] {
        return this.flatData.filter((row) => {
            if (this.selectedDeviceGroup && row.deviceGroup !== this.selectedDeviceGroup) {
                return false;
            }
            if (this.selectedDevice && row.deviceId !== this.selectedDevice) {
                return false;
            }
            return true;
        });
    }

    refresh(): void {
        this.loadData();
    }

    getTimeAgo(): string {
        if (!this.lastUpdated) return '';
        const seconds = Math.floor((new Date().getTime() - this.lastUpdated.getTime()) / 1000);
        if (seconds < 60) return this.translate.instant('DASHBOARD.JUST_NOW');
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} ${this.translate.instant('DASHBOARD.MINUTES_AGO')}`;
        const hours = Math.floor(minutes / 60);
        return `${hours} ${this.translate.instant('DASHBOARD.HOURS_AGO')}`;
    }

    getQualitySeverity(quality: string): 'success' | 'warn' | 'danger' | 'info' {
        const severities: Record<string, 'success' | 'warn' | 'danger' | 'info'> = {
            good: 'success',
            uncertain: 'warn',
            bad: 'danger'
        };
        return severities[quality] || 'info';
    }

    getSeverityClass(severity?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        if (!severity) return 'secondary';
        const classes: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
            normal: 'success',
            warning: 'warn',
            alarm: 'danger',
            critical: 'danger'
        };
        return classes[severity] || 'secondary';
    }

    clear(table: any): void {
        table.clear();
        this.searchValue = '';
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.refreshSubscription?.unsubscribe();
    }
}
