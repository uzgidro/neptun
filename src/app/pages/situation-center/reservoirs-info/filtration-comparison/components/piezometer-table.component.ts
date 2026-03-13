import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslateModule } from '@ngx-translate/core';
import { PiezoReading, PiezometerCounts } from '@/core/interfaces/filtration-comparison';

@Component({
    selector: 'app-piezometer-table',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputNumberModule, TranslateModule],
    templateUrl: './piezometer-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PiezometerTableComponent {
    @Input() currentPiezometers: PiezoReading[] = [];
    @Input() historicalPiezometers: PiezoReading[] | null = null;
    @Input() piezometerCounts!: PiezometerCounts;
    @Input() currentDate = '';
    @Input() historicalDate: string | null = null;
    @Input() currentFormArray!: FormArray;
    @Input() historicalFormArray: FormArray | null = null;

    getDelta(index: number): number | null {
        const curr = this.currentFormArray?.at(index)?.get('level')?.value;
        const hist = this.historicalFormArray?.at(index)?.get('level')?.value;
        if (curr === null || curr === undefined || hist === null || hist === undefined) return null;
        return curr - hist;
    }

    getDeviation(piezo: PiezoReading, formArray: FormArray, index: number): number | null {
        if (piezo.norm === null) return null;
        const val = formArray?.at(index)?.get('level')?.value;
        if (val === null || val === undefined) return null;
        return val - piezo.norm;
    }

    exceedsNorm(piezo: PiezoReading, formArray: FormArray, index: number): boolean {
        if (piezo.norm === null) return false;
        const val = formArray?.at(index)?.get('level')?.value;
        return val !== null && val !== undefined && val > piezo.norm;
    }
}
