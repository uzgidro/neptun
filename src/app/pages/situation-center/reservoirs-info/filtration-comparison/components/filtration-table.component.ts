import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslateModule } from '@ngx-translate/core';
import { LocationReading } from '@/core/interfaces/filtration-comparison';

@Component({
    selector: 'app-filtration-table',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputNumberModule, TranslateModule],
    templateUrl: './filtration-table.component.html'
})
export class FiltrationTableComponent {
    @Input() currentLocations: LocationReading[] = [];
    @Input() historicalLocations: LocationReading[] | null = null;
    @Input() currentDate = '';
    @Input() historicalDate: string | null = null;
    @Input() currentFormArray!: FormArray;
    @Input() historicalFormArray: FormArray | null = null;

    get totalCurrent(): number | null {
        const values = this.currentLocations.map(l => l.flow_rate).filter(v => v !== null) as number[];
        return values.length ? values.reduce((a, b) => a + b, 0) : null;
    }

    get totalHistorical(): number | null {
        if (!this.historicalLocations) return null;
        const values = this.historicalLocations.map(l => l.flow_rate).filter(v => v !== null) as number[];
        return values.length ? values.reduce((a, b) => a + b, 0) : null;
    }

    get totalDelta(): number | null {
        const c = this.totalCurrent;
        const h = this.totalHistorical;
        if (c === null || h === null) return null;
        return c - h;
    }

    getDelta(index: number): number | null {
        const curr = this.currentFormArray?.at(index)?.get('flow_rate')?.value;
        const hist = this.historicalFormArray?.at(index)?.get('flow_rate')?.value;
        if (curr === null || curr === undefined || hist === null || hist === undefined) return null;
        return curr - hist;
    }

    getDeviation(location: LocationReading, formArray: FormArray, index: number): number | null {
        if (location.norm === null) return null;
        const val = formArray?.at(index)?.get('flow_rate')?.value;
        if (val === null || val === undefined) return null;
        return val - location.norm;
    }

    exceedsNorm(location: LocationReading, formArray: FormArray, index: number): boolean {
        if (location.norm === null) return false;
        const val = formArray?.at(index)?.get('flow_rate')?.value;
        return val !== null && val !== undefined && val > location.norm;
    }
}
