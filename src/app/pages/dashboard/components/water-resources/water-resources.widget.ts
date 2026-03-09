import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { DashboardService } from '@/core/services/dashboard.service';
import { Reservoir } from '@/core/interfaces/reservoir';
import { DecimalPipe } from '@angular/common';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

@Component({
    standalone: true,
    selector: 'app-water-resources-widget',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ChartModule, TableModule, DecimalPipe, DatePickerComponent, FormsModule, TranslateModule],
    templateUrl: './water-resources.widget.html'
})
export class WaterResourcesWidget implements OnInit, OnDestroy {
    private dashboardService = inject(DashboardService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    reservoirs: Reservoir[] = [];
    loading = false;
    selectedDate: Date = new Date();

    @Input() expanded: boolean = false;
    @Output() expansionChange = new EventEmitter<boolean>();

    ngOnInit() {
        this.loadReservoirs();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadReservoirs(date?: Date) {
        this.loading = true;
        this.dashboardService.getReservoirs(date).pipe(takeUntil(this.destroy$)).subscribe({
            next: (response) => {
                this.reservoirs = response;
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.loading = false;
                this.cdr.markForCheck();
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

    expandAll() {
        this.expanded = !this.expanded;
        this.expansionChange.emit(this.expanded);
    }
}
