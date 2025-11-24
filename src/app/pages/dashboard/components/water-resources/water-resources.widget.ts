import { Component, inject, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { DashboardService } from '@/core/services/dashboard.service';
import { Reservoir } from '@/core/interfaces/reservoir';
import { DecimalPipe } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-water-resources-widget',
    imports: [ChartModule, TableModule, DecimalPipe],
    templateUrl: './water-resources.widget.html'
})
export class WaterResourcesWidget implements OnInit {
    private dashboardService = inject(DashboardService);

    reservoirs: Reservoir[] = [];
    loading = false;

    ngOnInit() {
        this.loadReservoirs();
    }

    loadReservoirs() {
        this.loading = true;
        this.dashboardService.getReservoirs().subscribe({
            next: (response) => {
                this.reservoirs = response;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading reservoirs:', error);
                this.loading = false;
            }
        });
    }
}
