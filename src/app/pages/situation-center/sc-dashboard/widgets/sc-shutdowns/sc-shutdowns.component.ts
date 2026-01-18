import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { GesShutdownService } from '@/core/services/ges-shutdown.service';
import { ShutdownDto, GesShutdownDto } from '@/core/interfaces/ges-shutdown';

interface ShutdownItem {
    id: number;
    stationName: string;
    stationType: 'ges' | 'mini' | 'micro';
    reason: string | null;
    startTime: Date;
    endTime: Date | null;
    lostGeneration: number | null;
    isOngoing: boolean;
}

@Component({
    selector: 'sc-shutdowns',
    standalone: true,
    imports: [DecimalPipe],
    templateUrl: './sc-shutdowns.component.html',
    styleUrl: './sc-shutdowns.component.scss'
})
export class ScShutdownsComponent implements OnInit, OnDestroy {
    private shutdownService = inject(GesShutdownService);
    private refreshSubscription?: Subscription;

    shutdowns: ShutdownItem[] = [];
    loading = true;
    lastUpdated: Date | null = null;

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
            list.forEach(shutdown => {
                items.push({
                    id: shutdown.id,
                    stationName: shutdown.organization_name,
                    stationType: type,
                    reason: shutdown.reason,
                    startTime: shutdown.started_at,
                    endTime: shutdown.ended_at,
                    lostGeneration: shutdown.generation_loss,
                    isOngoing: shutdown.ended_at === null
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
    }

    refresh(): void {
        this.loadData();
    }

    getTimeAgo(): string {
        if (!this.lastUpdated) return '';
        const seconds = Math.floor((new Date().getTime() - this.lastUpdated.getTime()) / 1000);
        if (seconds < 60) return 'только что';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} мин. назад`;
        const hours = Math.floor(minutes / 60);
        return `${hours} ч. назад`;
    }

    get totalLostGeneration(): number {
        return this.shutdowns.reduce((sum, s) => sum + (s.lostGeneration || 0), 0);
    }

    get activeShutdownsCount(): number {
        return this.shutdowns.filter(s => s.isOngoing).length;
    }

    get totalShutdownsCount(): number {
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

    getDowntime(shutdown: ShutdownItem): string {
        const endTime = shutdown.endTime || new Date();
        const diffMs = endTime.getTime() - shutdown.startTime.getTime();
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours < 1) {
            return `${minutes} мин`;
        }
        if (hours < 24) {
            return `${hours} ч`;
        }
        const days = Math.floor(hours / 24);
        return `${days} дн`;
    }

    ngOnDestroy(): void {
        this.refreshSubscription?.unsubscribe();
    }
}
