import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeService } from '@/core/services/time.service';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-date',
    imports: [DatePicker, FormsModule, TranslateModule],
    templateUrl: './date.widget.html',
    styleUrl: './date.widget.scss'
})
export class DateWidget implements OnInit, OnDestroy {
    @Input() date: Date | null = null;
    @Input() syncQueryParams: boolean = true;
    @Output() dateChange = new EventEmitter<Date>();

    selectedDate: Date | null = null;

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private timeService = inject(TimeService);
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        if (this.syncQueryParams) {
            this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
                if (params['date']) {
                    this.selectedDate = new Date(params['date']);
                } else {
                    this.selectedDate = this.date || new Date();
                    this.updateQueryParams();
                }
                this.dateChange.emit(this.selectedDate!);
            });
        } else {
            this.selectedDate = this.date || new Date();
            this.dateChange.emit(this.selectedDate!);
        }
    }

    onDateChange(): void {
        if (this.selectedDate) {
            this.dateChange.emit(this.selectedDate);
            if (this.syncQueryParams) {
                this.updateQueryParams();
            }
        }
    }

    private updateQueryParams(): void {
        if (this.selectedDate) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { date: this.timeService.dateToYMD(this.selectedDate) },
                queryParamsHandling: 'merge'
            });
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
