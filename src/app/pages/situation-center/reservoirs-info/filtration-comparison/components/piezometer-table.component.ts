import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslateModule } from '@ngx-translate/core';
import { PiezoReading, PiezometerCounts } from '@/core/interfaces/filtration-comparison';

interface PiezoGroup {
    type: 'pressure' | 'non_pressure';
    label: string;
    count: number;
    currentItems: PiezoReading[];
    historicalItems: PiezoReading[] | null;
    currentIndices: number[];
    historicalIndices: number[];
}

@Component({
    selector: 'app-piezometer-table',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputNumberModule, TranslateModule],
    templateUrl: './piezometer-table.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PiezometerTableComponent implements OnChanges {
    @Input() currentPiezometers: PiezoReading[] = [];
    @Input() historicalPiezometers: PiezoReading[] | null = null;
    @Input() piezometerCounts!: PiezometerCounts;
    @Input() currentDate = '';
    @Input() historicalDate: string | null = null;
    @Input() currentFormArray!: FormArray;
    @Input() historicalFormArray: FormArray | null = null;

    groups: PiezoGroup[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['currentPiezometers'] || changes['historicalPiezometers'] || changes['piezometerCounts']) {
            this.buildGroups();
        }
    }

    private buildGroups(): void {
        this.groups = [];
        for (const type of ['pressure', 'non_pressure'] as const) {
            const currentItems = this.currentPiezometers.filter(p => p.type === type);
            const currentIndices = this.currentPiezometers
                .map((p, i) => p.type === type ? i : -1)
                .filter(i => i !== -1);

            const historicalItems = this.historicalPiezometers?.filter(p => p.type === type) ?? null;
            const historicalIndices = this.historicalPiezometers
                ? this.historicalPiezometers.map((p, i) => p.type === type ? i : -1).filter(i => i !== -1)
                : [];

            const count = type === 'pressure' ? this.piezometerCounts.pressure : this.piezometerCounts.non_pressure;

            if (currentItems.length > 0 || count > 0) {
                this.groups.push({
                    type,
                    label: type === 'pressure' ? 'FILTRATION.PRESSURE' : 'FILTRATION.NON_PRESSURE',
                    count,
                    currentItems,
                    historicalItems,
                    currentIndices,
                    historicalIndices
                });
            }
        }
    }

    getDelta(currentIdx: number, historicalIdx: number): number | null {
        const curr = this.currentFormArray?.at(currentIdx)?.get('level')?.value;
        const hist = this.historicalFormArray?.at(historicalIdx)?.get('level')?.value;
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
