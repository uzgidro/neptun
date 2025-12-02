import { Component, inject, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { DashboardService } from '@/core/services/dashboard.service';
import { Reservoir } from '@/core/interfaces/reservoir';
import { DecimalPipe } from '@angular/common';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-water-resources-widget',
    imports: [ChartModule, TableModule, DecimalPipe, DatePickerComponent, FormsModule],
    templateUrl: './water-resources.widget.html'
})
export class WaterResourcesWidget implements OnInit {
    private dashboardService = inject(DashboardService);

    reservoirs: Reservoir[] = [];
    loading = false;
    selectedDate: Date = new Date();

    ngOnInit() {
        this.loadReservoirs();
    }

    loadReservoirs(date?: Date) {
        this.loading = true;
        this.dashboardService.getReservoirs(date).subscribe({
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

    onDateChange(date: Date | null) {
        if (date) {
            this.loadReservoirs(date);
        } else {
            this.loadReservoirs();
        }
    }
}
