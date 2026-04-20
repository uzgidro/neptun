import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { GesReportService } from '@/core/services/ges-report.service';
import { TimeService } from '@/core/services/time.service';
import { AuthService } from '@/core/services/auth.service';
import { GesDailyReport } from '@/core/interfaces/ges-report';
import { downloadBlob } from '@/core/utils/download';
import { CascadeWeatherComponent } from '../shared/cascade-weather.component';

@Component({
    selector: 'app-ges-report-tab',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        DatePicker,
        ButtonModule,
        CascadeWeatherComponent
    ],
    templateUrl: './report-tab.component.html'
})
export class ReportTabComponent implements OnInit, OnDestroy {
    private gesReportService = inject(GesReportService);
    private timeService = inject(TimeService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private authService = inject(AuthService);
    private destroy$ = new Subject<void>();

    selectedDate: Date = new Date();
    report: GesDailyReport | null = null;
    loading = false;
    canExport = this.authService.isScOrRais();

    downloading: 'excel' | 'pdf' | null = null;

    ngOnInit(): void {
        this.loadReport();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadReport(): void {
        this.loading = true;
        const dateStr = this.timeService.dateToYMD(this.selectedDate);
        this.gesReportService.getReport(dateStr)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading = false)
            )
            .subscribe({
                next: (data) => {
                    this.report = data;
                },
                error: (err) => {
                    console.error(err);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('COMMON.LOAD_ERROR')
                    });
                }
            });
    }

    onDateChange(date: Date): void {
        this.selectedDate = date;
        this.loadReport();
    }

    download(format: 'excel' | 'pdf'): void {
        if (!this.report || this.downloading) return;
        const date = this.timeService.dateToYMD(this.selectedDate);
        this.downloading = format;
        this.gesReportService.exportReport({
            date, format
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
                const ext = format === 'pdf' ? 'pdf' : 'xlsx';
                const filename = this.parseFilename(response) ?? `GES-${date}.${ext}`;
                downloadBlob(response.body!, filename);
                this.downloading = null;
            },
            error: (err) => { this.downloading = null; this.handleExportError(err); }
        });
    }

    private async handleExportError(err: HttpErrorResponse): Promise<void> {
        let detail = this.translate.instant('ERRORS.BAD_REQUEST');
        if (err.status === 400 && err.error instanceof Blob) {
            try {
                const body = JSON.parse(await err.error.text()) as { message?: string };
                if (body.message) detail = body.message;
            } catch {
                /* keep fallback */
            }
        }
        this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('COMMON.ERROR'),
            detail
        });
    }

    private parseFilename(response: HttpResponse<Blob>): string | null {
        const cd = response.headers.get('Content-Disposition');
        const m = cd?.match(/filename="([^"]+)"/);
        return m ? m[1] : null;
    }

    formatPct(value: number | null | undefined): string {
        if (value == null) return '—';
        return (value * 100).toFixed(2);
    }

    formatNum(value: number | null | undefined, digits = 2): string {
        if (value == null) return '—';
        return value.toFixed(digits);
    }

    isNegative(value: number | null | undefined): boolean {
        if (value == null) return false;
        return value < 0;
    }
}
