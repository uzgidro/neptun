import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { OrgComparison, SimilarDate } from '@/core/interfaces/filtration-comparison';
import { FiltrationTableComponent } from './filtration-table.component';
import { PiezometerTableComponent } from './piezometer-table.component';

@Component({
    selector: 'app-org-comparison-card',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, SelectModule, TranslateModule, FiltrationTableComponent, PiezometerTableComponent, ButtonModule],
    templateUrl: './org-comparison-card.component.html'
})
export class OrgComparisonCardComponent {
    @Input() org: OrgComparison | null = null;
    @Input() similarDates: SimilarDate[] = [];
    @Input() orgName = '';
    @Input() referenceLevel: number | null = null;
    @Input() referenceVolume: number | null = null;
    @Input() selectedFilterDate: string | null = null;
    @Input() selectedPiezoDate: string | null = null;
    @Input() loadingData = false;
    @Input() orgFormGroup: FormGroup | null = null;

    @Output() filterDateChange = new EventEmitter<string>();
    @Output() piezoDateChange = new EventEmitter<string>();
    @Output() filterDateClear = new EventEmitter<void>();
    @Output() piezoDateClear = new EventEmitter<void>();

    get dateOptions(): { label: string; value: string }[] {
        return this.similarDates.map(sd => ({
            label: sd.date,
            value: sd.date
        }));
    }

    onFilterDateSelect(date: string): void {
        this.filterDateChange.emit(date);
    }

    onPiezoDateSelect(date: string): void {
        this.piezoDateChange.emit(date);
    }
}
