import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ButtonDirective } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { GesService } from '@/core/services/ges.service';
import { TelemetryEnvelope } from '@/core/interfaces/ges';
import { GesMnemonicComponent } from '../../components/ges-mnemonic/ges-mnemonic.component';

@Component({
    selector: 'app-ges-mnemonic-section',
    standalone: true,
    imports: [CommonModule, TranslateModule, ButtonDirective, GesMnemonicComponent],
    templateUrl: './ges-mnemonic-section.component.html',
    styleUrl: './ges-mnemonic-section.component.scss'
})
export class GesMnemonicSectionComponent implements OnInit, OnDestroy {
    @Input() gesId!: number;

    private gesService = inject(GesService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);

    telemetry: TelemetryEnvelope[] = [];
    loading = false;
    lastUpdated: Date | null = null;

    private destroy$ = new Subject<void>();
    private refreshSubscription?: Subscription;

    ngOnInit(): void {
        this.loadData();
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

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.refreshSubscription?.unsubscribe();
    }
}
