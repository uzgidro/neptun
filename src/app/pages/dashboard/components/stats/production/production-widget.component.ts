import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DashboardService } from '@/core/services/dashboard.service';
import { DashboardResponse } from '@/core/interfaces/ges-production';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-production',
    imports: [CommonModule, TranslatePipe, TranslateModule],
    templateUrl: './production-widget.component.html',
    styleUrl: './production-widget.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
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
            error: (err) => {
                console.error('Failed to load production data', err);
                this.isLoading = false;
                this.cdr.markForCheck();
            }
        });
    }
}
