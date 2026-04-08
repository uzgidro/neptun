import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { finalize, Subject, takeUntil } from 'rxjs';
import { Button } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { HttpResponse } from '@angular/common/http';
import { DateWidget } from '@/layout/component/widget/date/date.widget';
import { InfraEventService } from '@/core/services/infra-event.service';
import { ScService } from '@/core/services/sc.service';
import { AuthService } from '@/core/services/auth.service';
import { TimeService } from '@/core/services/time.service';
import { InfraEventCategory } from '@/core/interfaces/infra-event';
import { downloadBlob } from '@/core/utils/download';
import { EventTableComponent } from './event-table/event-table.component';
import { CategoryAdminComponent } from './category-admin/category-admin.component';

@Component({
    selector: 'app-infra-events',
    standalone: true,
    imports: [
        TranslateModule,
        Button,
        DateWidget,
        EventTableComponent,
        CategoryAdminComponent
    ],
    templateUrl: './infra-events.component.html'
})
export class InfraEventsComponent implements OnInit, OnDestroy {
    private infraEventService = inject(InfraEventService);
    private scService = inject(ScService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private timeService = inject(TimeService);
    authService = inject(AuthService);

    categories: InfraEventCategory[] = [];
    categoriesLoading = false;
    selectedDate: Date = new Date();
    collapsedCategories = new Set<number>();
    showCategoryAdmin = false;
    isExcelLoading = false;
    isPdfLoading = false;

    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.loadCategories();
    }

    loadCategories(): void {
        this.categoriesLoading = true;
        this.infraEventService
            .getInfraCategories()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (cats) => {
                    this.categories = cats;
                },
                error: () => (this.categoriesLoading = false),
                complete: () => (this.categoriesLoading = false)
            });
    }

    onDateChanged(date: Date): void {
        this.selectedDate = date;
    }

    toggleCategory(id: number): void {
        if (this.collapsedCategories.has(id)) {
            this.collapsedCategories.delete(id);
        } else {
            this.collapsedCategories.add(id);
        }
    }

    onCategoriesChanged(): void {
        this.loadCategories();
    }

    download(format: 'excel' | 'pdf'): void {
        if (format === 'excel') this.isExcelLoading = true;
        else this.isPdfLoading = true;

        this.scService
            .downloadScReport(this.selectedDate, format)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => {
                    this.isExcelLoading = false;
                    this.isPdfLoading = false;
                })
            )
            .subscribe({
                next: (response: HttpResponse<Blob>) => {
                    const ext = format === 'excel' ? 'xlsx' : 'pdf';
                    const dateStr = this.timeService.dateToYMD(this.selectedDate);
                    downloadBlob(response.body!, `Инфраструктура_${dateStr}.${ext}`);
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR') });
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
