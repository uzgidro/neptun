import { Component, inject, OnInit } from '@angular/core';
import { DashboardService } from '@/core/services/dashboard.service';
import { DashboardResponse } from '@/core/interfaces/ges-production';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-production',
    imports: [CommonModule],
    templateUrl: './production-widget.component.html',
    styleUrl: './production-widget.component.scss'
})
export class ProductionWidget implements OnInit {
    private dashboardService = inject(DashboardService);

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
            },
            error: (err) => {
                console.error('Failed to load production data', err);
                this.isLoading = false;
            }
        });
    }
}
