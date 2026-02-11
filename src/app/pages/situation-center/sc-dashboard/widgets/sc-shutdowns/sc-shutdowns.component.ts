import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { GesShutdownService } from '@/core/services/ges-shutdown.service';
import { ShutdownDto, GesShutdownDto } from '@/core/interfaces/ges-shutdown';
import { AlarmService } from '@/core/services/alarm.service';
import { FileViewerComponent } from '@/layout/component/dialog/file-viewer/file-viewer.component';
import { UserShortInfo } from '@/core/interfaces/users';
import { FileResponse } from '@/core/interfaces/files';

interface ShutdownItem {
    id: number;
    organizationId: number;
    stationName: string;
    stationType: 'ges' | 'mini' | 'micro';
    reason: string | null;
    startTime: Date;
    endTime: Date | null;
    lostGeneration: number | null;
    isOngoing: boolean;
    viewed: boolean;
    createdBy: UserShortInfo | null;
    idleDischargeVolume: number | null;
    files?: FileResponse[];
}

@Component({
    selector: 'sc-shutdowns',
    standalone: true,
    imports: [DecimalPipe, DatePipe, TranslateModule, DialogModule, ButtonModule, FileViewerComponent],
    templateUrl: './sc-shutdowns.component.html',
    styleUrl: './sc-shutdowns.component.scss'
})
export class ScShutdownsComponent implements OnInit, OnDestroy {
    private shutdownService = inject(GesShutdownService);
    private translateService = inject(TranslateService);
    private router = inject(Router);
    private alarmService = inject(AlarmService);
    private refreshSubscription?: Subscription;

    shutdowns: ShutdownItem[] = [];
    loading = true;
    lastUpdated: Date | null = null;

    showDetailDialog = false;
    selectedShutdown: ShutdownItem | null = null;
    showFilesDialog = false;

    ngOnInit(): void {
        this.loadData();
        this.refreshSubscription = interval(600000).subscribe(() => this.loadData()); // 10 минут
    }

    private loadData(): void {
        this.loading = true;
        this.shutdownService.getShutdowns().subscribe({
            next: (data: GesShutdownDto) => {
                this.processShutdowns(data);
                this.lastUpdated = new Date();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading shutdowns:', err);
                this.loading = false;
            }
        });
    }

    private processShutdowns(data: GesShutdownDto): void {
        const items: ShutdownItem[] = [];

        const addShutdowns = (list: ShutdownDto[], type: 'ges' | 'mini' | 'micro') => {
            list.forEach((shutdown) => {
                items.push({
                    id: shutdown.id,
                    organizationId: shutdown.organization_id,
                    stationName: shutdown.organization_name,
                    stationType: type,
                    reason: shutdown.reason,
                    startTime: shutdown.started_at,
                    endTime: shutdown.ended_at,
                    lostGeneration: shutdown.generation_loss,
                    isOngoing: shutdown.ended_at === null,
                    viewed: shutdown.viewed,
                    createdBy: shutdown.created_by,
                    idleDischargeVolume: shutdown.idle_discharge_volume,
                    files: shutdown.files
                });
            });
        };

        addShutdowns(data.ges, 'ges');
        addShutdowns(data.mini, 'mini');
        addShutdowns(data.micro, 'micro');

        // Sort: ongoing first, then by start time (most recent first)
        items.sort((a, b) => {
            if (a.isOngoing !== b.isOngoing) {
                return a.isOngoing ? -1 : 1;
            }
            return b.startTime.getTime() - a.startTime.getTime();
        });

        this.shutdowns = items;

        // Update selected shutdown if it's still in the list
        if (this.selectedShutdown) {
            const updated = items.find((s) => s.id === this.selectedShutdown!.id);
            if (updated) {
                this.selectedShutdown = updated;
            }
        }

        // Alarm plays only for unviewed active shutdowns
        const hasUnviewedActive = items.some((s) => s.isOngoing && !s.viewed);
        this.alarmService.setHasActiveShutdowns(hasUnviewedActive);
    }

    refresh(): void {
        this.loadData();
    }

    getTimeAgo(): string {
        if (!this.lastUpdated) return '';
        const seconds = Math.floor((new Date().getTime() - this.lastUpdated.getTime()) / 1000);
        if (seconds < 60) return this.translateService.instant('SITUATION_CENTER.DASHBOARD.TIME.JUST_NOW');
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return this.translateService.instant('SITUATION_CENTER.DASHBOARD.TIME.MINUTES_AGO', { count: minutes });
        const hours = Math.floor(minutes / 60);
        return this.translateService.instant('SITUATION_CENTER.DASHBOARD.TIME.HOURS_AGO', { count: hours });
    }

    get totalLostGeneration(): number {
        return this.shutdowns.reduce((sum, s) => sum + (s.lostGeneration || 0), 0);
    }

    get activeShutdownsCount(): number {
        return this.shutdowns.filter((s) => s.isOngoing).length;
    }

    get totalShutdownsCount(): number {
        return this.shutdowns.length;
    }

    getTypeLabel(type: string): string {
        const labelKeys: Record<string, string> = {
            ges: 'SITUATION_CENTER.DASHBOARD.SHUTDOWNS.TYPE_GES',
            mini: 'SITUATION_CENTER.DASHBOARD.SHUTDOWNS.TYPE_MINI',
            micro: 'SITUATION_CENTER.DASHBOARD.SHUTDOWNS.TYPE_MICRO'
        };
        return labelKeys[type] ? this.translateService.instant(labelKeys[type]) : type;
    }

    getTypeClass(type: string): string {
        return `type-${type}`;
    }

    getDowntime(shutdown: ShutdownItem): string {
        const endTime = shutdown.endTime || new Date();
        const diffMs = endTime.getTime() - shutdown.startTime.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours < 1) {
            return `${minutes} ${this.translateService.instant('SITUATION_CENTER.DASHBOARD.TIME.MINUTES_SHORT')}`;
        }
        if (hours < 24) {
            return `${hours} ${this.translateService.instant('SITUATION_CENTER.DASHBOARD.TIME.HOURS_SHORT')}`;
        }
        const days = Math.floor(hours / 24);
        return `${days} ${this.translateService.instant('SITUATION_CENTER.DASHBOARD.TIME.DAYS_SHORT')}`;
    }

    navigateToGes(organizationId: number): void {
        this.router.navigate(['/plant', organizationId]);
    }

    openDetail(shutdown: ShutdownItem): void {
        this.selectedShutdown = shutdown;
        this.showDetailDialog = true;

        if (!shutdown.viewed) {
            this.markAsViewed(shutdown);
        }
    }

    private markAsViewed(shutdown: ShutdownItem): void {
        this.shutdownService.markAsViewed(shutdown.id).subscribe({
            next: () => {
                shutdown.viewed = true;
                // Update alarm state after marking as viewed
                const hasUnviewedActive = this.shutdowns.some((s) => s.isOngoing && !s.viewed);
                this.alarmService.setHasActiveShutdowns(hasUnviewedActive);
            },
            error: (err) => {
                console.error('Error marking shutdown as viewed:', err);
            }
        });
    }

    closeDetailDialog(): void {
        this.showDetailDialog = false;
        this.selectedShutdown = null;
    }

    navigateToGesFromDialog(): void {
        if (this.selectedShutdown) {
            this.router.navigate(['/plant', this.selectedShutdown.organizationId]);
            this.closeDetailDialog();
        }
    }

    openFilesDialog(): void {
        this.showFilesDialog = true;
    }

    ngOnDestroy(): void {
        this.refreshSubscription?.unsubscribe();
        this.alarmService.stopAlarm();
        this.alarmService.setHasActiveShutdowns(false);
    }
}
