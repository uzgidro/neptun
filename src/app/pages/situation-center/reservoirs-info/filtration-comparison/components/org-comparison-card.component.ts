import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OrgComparison } from '@/core/interfaces/filtration-comparison';
import { FiltrationTableComponent } from './filtration-table.component';
import { PiezometerTableComponent } from './piezometer-table.component';

@Component({
    selector: 'app-org-comparison-card',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, FiltrationTableComponent, PiezometerTableComponent],
    templateUrl: './org-comparison-card.component.html'
})
export class OrgComparisonCardComponent {
    @Input() org!: OrgComparison;
    @Input() formGroup!: FormGroup;
}
