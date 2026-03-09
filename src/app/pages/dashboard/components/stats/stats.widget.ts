import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DCInfo } from '@/core/interfaces/debit-credit';
import { DebitCreditTempService } from '@/core/services/temp/debit-credit-temp.service';
import { DebitWidget } from '@/pages/dashboard/components/stats/debit/debit-widget.component';
import { CreditWidget } from '@/pages/dashboard/components/stats/credit/credit-widget.component';
import { ProductionWidget } from '@/pages/dashboard/components/stats/production/production-widget.component';
import { EmployeesWidget } from '@/pages/dashboard/components/stats/employees/employees-widget.component';
import { FinancialDashboardService } from '@/pages/financial-block/dashboard/services/financial-dashboard.service';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonModule, DebitWidget, CreditWidget, ProductionWidget, EmployeesWidget],
    templateUrl: './stats.widget.html'
})
export class StatsWidget implements OnInit, OnDestroy {
    dc?: DCInfo;

    private dcService: DebitCreditTempService = inject(DebitCreditTempService);
    private financialService: FinancialDashboardService = inject(FinancialDashboardService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.financialService.loadInitialData();

        this.dcService.getDC().pipe(takeUntil(this.destroy$)).subscribe({
            next: (data: DCInfo) => {
                this.dc = data;
                this.cdr.markForCheck();
            }
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
