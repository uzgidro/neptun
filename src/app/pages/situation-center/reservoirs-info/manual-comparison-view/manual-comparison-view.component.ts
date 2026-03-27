import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { downloadBlob } from '@/core/utils/download';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ManualComparisonService } from '@/core/services/manual-comparison.service';
import { TimeService } from '@/core/services/time.service';
import { OrgComparison, LocationReading, PiezoReading } from '@/core/interfaces/filtration-comparison';

@Component({
    selector: 'app-manual-comparison-view',
    standalone: true,
    imports: [
        CommonModule, FormsModule, DatePickerModule, ButtonModule,
        MessageModule, TranslateModule
    ],
    templateUrl: './manual-comparison-view.component.html',
    styleUrl: './manual-comparison-view.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManualComparisonViewComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    orgData: OrgComparison[] = [];
    selectedDate!: Date;
    loading = false;
    downloading: 'excel' | 'pdf' | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private manualComparisonService: ManualComparisonService,
        private timeService: TimeService,
        private messageService: MessageService,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        const dateParam = this.route.snapshot.queryParamMap.get('date');
        if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
            const [y, m, d] = dateParam.split('-').map(Number);
            this.selectedDate = new Date(y, m - 1, d);
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            this.selectedDate = yesterday;
        }
        this.loadData(this.selectedDate);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onDateChange(date: Date): void {
        this.selectedDate = date;
        this.loadData(date);
    }

    private loadData(date: Date): void {
        const dateStr = this.timeService.dateToYMD(date);
        this.router.navigate([], { queryParams: { date: dateStr }, queryParamsHandling: 'merge', replaceUrl: true });
        this.loading = true;
        this.orgData = [];
        this.manualComparisonService.getData(dateStr)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => { this.loading = false; this.cdr.markForCheck(); })
            )
            .subscribe({
                next: (data) => {
                    this.orgData = data;
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.LOAD_ERROR') });
                }
            });
    }

    download(format: 'excel' | 'pdf'): void {
        this.downloading = format;
        const nextDay = new Date(this.selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const date = this.timeService.dateToYMD(nextDay);
        const ext = format === 'excel' ? 'xlsx' : 'pdf';

        this.manualComparisonService.downloadExport(date, format)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => { this.downloading = null; this.cdr.markForCheck(); })
            )
            .subscribe({
                next: (response) => {
                    downloadBlob(response.body!, `ManualComparison-${this.timeService.dateToYMD(this.selectedDate)}.${ext}`);
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('FILTRATION.EXPORT_ERROR') });
                }
            });
    }

    getHistoricalFlowRate(org: OrgComparison, locationId: number): number | null {
        return org.historical_filter?.locations.find(l => l.id === locationId)?.flow_rate ?? null;
    }

    getHistoricalLevel(org: OrgComparison, piezometerId: number): number | null {
        return org.historical_piezo?.piezometers.find(p => p.id === piezometerId)?.level ?? null;
    }

    getFiltrationDelta(org: OrgComparison, loc: LocationReading): number | null {
        const current = loc.flow_rate;
        const historical = this.getHistoricalFlowRate(org, loc.id);
        if (current == null || historical == null) return null;
        return current - historical;
    }

    filtrationExceedsNorm(loc: LocationReading): boolean {
        return loc.flow_rate != null && loc.norm != null && loc.flow_rate > loc.norm;
    }

    getFiltrationDeviation(loc: LocationReading): number | null {
        if (loc.flow_rate == null || loc.norm == null) return null;
        return loc.flow_rate - loc.norm;
    }

    getPiezoDelta(org: OrgComparison, piezo: PiezoReading): number | null {
        const current = piezo.level;
        const historical = this.getHistoricalLevel(org, piezo.id);
        if (current == null || historical == null) return null;
        return current - historical;
    }

    piezoExceedsNorm(piezo: PiezoReading): boolean {
        return piezo.level != null && piezo.norm != null && piezo.level > piezo.norm;
    }

    getPiezoDeviation(piezo: PiezoReading): number | null {
        if (piezo.level == null || piezo.norm == null) return null;
        return piezo.level - piezo.norm;
    }

    hasAnyAnomaly(org: OrgComparison): boolean {
        return org.current.piezometers.some(p => p.anomaly);
    }

    private sumValues(arr: (number | null)[]): number | null {
        const values = arr.filter((v): v is number => v != null);
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) : null;
    }

    getFiltrationTotalCurrent(org: OrgComparison): number | null {
        return this.sumValues(org.current.locations.map(l => l.flow_rate));
    }

    getFiltrationTotalHistorical(org: OrgComparison): number | null {
        if (!org.historical_filter) return null;
        return this.sumValues(org.historical_filter.locations.map(l => l.flow_rate));
    }

    getFiltrationTotalDelta(org: OrgComparison): number | null {
        const c = this.getFiltrationTotalCurrent(org);
        const h = this.getFiltrationTotalHistorical(org);
        if (c == null || h == null) return null;
        return c - h;
    }

    getFiltrationTotalNorm(org: OrgComparison): number | null {
        return this.sumValues(org.current.locations.map(l => l.norm));
    }

    getFiltrationTotalDeviation(org: OrgComparison): number | null {
        const c = this.getFiltrationTotalCurrent(org);
        const n = this.getFiltrationTotalNorm(org);
        if (c == null || n == null) return null;
        return c - n;
    }
}
