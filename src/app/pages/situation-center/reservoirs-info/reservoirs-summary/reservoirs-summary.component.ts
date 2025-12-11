import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, registerLocaleData } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { ReservoirSummaryService } from '@/core/services/reservoir-summary.service';
import { ReservoirSummaryResponse } from '@/core/interfaces/reservoir-summary';
import localeRu from '@angular/common/locales/ru';
import { ButtonModule } from 'primeng/button';
import { ExportService } from '@/core/services/export.service';

registerLocaleData(localeRu);

@Component({
    selector: 'app-reservoirs-summary',
    imports: [CommonModule, ReactiveFormsModule, TableModule, DatePickerComponent, ButtonModule],
    templateUrl: './reservoirs-summary.component.html',
    styleUrl: './reservoirs-summary.component.scss'
})
export class ReservoirsSummaryComponent implements OnInit {
    private fb = inject(FormBuilder);
    private reservoirService = inject(ReservoirSummaryService);
    private exportService = inject(ExportService);

    form: FormGroup = this.fb.group({
        date: [new Date()]
    });

    data: ReservoirSummaryResponse[] = [];
    submitted: boolean = false;

    ngOnInit() {
        this.loadData(this.form.get('date')?.value);

        this.form.get('date')?.valueChanges.subscribe((date) => {
            this.loadData(date);
        });
    }

    private loadData(date: Date) {
        if (date) {
            this.reservoirService.getReservoirSummary(date).subscribe({
                next: (response) => {
                    console.log(response);
                    this.data = response;
                },
                error: (error) => {
                    console.error('Error loading reservoir summary:', error);
                }
            });
        }
    }

    getPreviousYear(yearsAgo: number): number {
        const currentDate = this.form.get('date')?.value;
        if (currentDate) {
            return currentDate.getFullYear() - yearsAgo;
        }
        return new Date().getFullYear() - yearsAgo;
    }

    exportExcel() {
        const dataToExport = this.data.map(item => ({
            'Водохранилище': item.reservoir_name,
            'Объем на сегодня': item.volume_today,
            'Объем на вчера': item.volume_yesterday,
            'Разница объемов': item.volume_difference,
            [`Объем на ${this.getPreviousYear(1)} год`]: item.volume_1_year_ago,
            [`Объем на ${this.getPreviousYear(2)} год`]: item.volume_2_years_ago,
            'Уровень на сегодня': item.level_today,
            'Уровень на вчера': item.level_yesterday,
            'Разница уровней': item.level_difference,
            [`Уровень на ${this.getPreviousYear(1)} год`]: item.level_1_year_ago,
            [`Уровень на ${this.getPreviousYear(2)} год`]: item.level_2_years_ago,
            'Приток': item.inflow,
            'Сброс': item.outflow
        }));
        this.exportService.exportToExcel(dataToExport, 'Сводка по водохранилищам');
    }
}
