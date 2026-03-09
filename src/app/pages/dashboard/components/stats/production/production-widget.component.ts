import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DashboardService } from '@/core/services/dashboard.service';
import { DashboardResponse } from '@/core/interfaces/ges-production';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-production',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DecimalPipe, TranslatePipe, TranslateModule],
    templateUrl: './production-widget.component.html'
})
export class ProductionWidget implements OnInit {
    private dashboardService = inject(DashboardService);
    private cdr = inject(ChangeDetectorRef);

    data: DashboardResponse | null = null;
    isLoading = false;

    ngOnInit() {
        this.loadData();
    }

    private loadData() {
        this.isLoading = true;
        this.dashboardService.getGESProduction().subscribe({
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
