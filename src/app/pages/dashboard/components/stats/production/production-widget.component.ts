import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DashboardService } from '@/core/services/dashboard.service';
import { DashboardResponse } from '@/core/interfaces/ges-production';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-production',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DecimalPipe, TranslateModule],
    templateUrl: './production-widget.component.html'
})
export class ProductionWidget implements OnInit, OnDestroy {
    private dashboardService = inject(DashboardService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    data: DashboardResponse | null = null;
    isLoading = false;

    ngOnInit() {
        this.loadData();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadData() {
        this.isLoading = true;
        this.dashboardService.getGESProduction().pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
                this.data = response;
                this.isLoading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }
}
