import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { GesReportService } from '@/core/services/ges-report.service';
import { GesDailyReport } from '@/core/interfaces/ges-report';
import { exportReportToExcel } from './excel-export';

@Component({
    selector: 'app-ges-report-tab',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        DatePicker,
        ButtonModule
    ],
    templateUrl: './report-tab.component.html'
})
export class ReportTabComponent implements OnInit, OnDestroy {
    private gesReportService = inject(GesReportService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    selectedDate: Date = new Date();
    report: GesDailyReport | null = null;
    loading = false;

    ngOnInit(): void {
        this.loadReport();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadReport(): void {
        this.loading = true;
        const dateStr = this.formatDate(this.selectedDate);
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

    downloadExcel(): void {
        if (this.report) {
            exportReportToExcel(this.report);
        }
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

    private formatDate(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
}
