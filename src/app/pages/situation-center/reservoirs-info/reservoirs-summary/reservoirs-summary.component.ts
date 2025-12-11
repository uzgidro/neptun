import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, registerLocaleData } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputText } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { ReservoirSummaryService } from '@/core/services/reservoir-summary.service';
import { ReservoirSummaryResponse } from '@/core/interfaces/reservoir-summary';
import localeRu from '@angular/common/locales/ru';

registerLocaleData(localeRu);

@Component({
    selector: 'app-reservoirs-summary',
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TableModule, InputText, ButtonModule, DatePickerComponent],
    templateUrl: './reservoirs-summary.component.html',
    styleUrl: './reservoirs-summary.component.scss'
})
export class ReservoirsSummaryComponent implements OnInit {
    private fb = inject(FormBuilder);
    private reservoirService = inject(ReservoirSummaryService);

    form: FormGroup = this.fb.group({
        date: [new Date()]
    });

    data: ReservoirSummaryResponse[] = [];
    originalData: ReservoirSummaryResponse[] = [];
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
                    // Store a deep copy of the original data
                    this.originalData = JSON.parse(JSON.stringify(response));
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

    onCellEditComplete(event: any, reservoir: ReservoirSummaryResponse, field: string) {
        const { data, newValue } = event;

        if (newValue != null && newValue.toString().trim().length > 0) {
            const numericValue = parseFloat(newValue);

            if (!isNaN(numericValue)) {
                // Update the nested field (e.g., level.current, volume.current, etc.)
                const [mainField, subField] = field.split('.');
                if (subField === 'current') {
                    (reservoir as any)[mainField][subField] = numericValue;
                }
            }
        }
    }

    hasChanges(): boolean {
        return JSON.stringify(this.data) !== JSON.stringify(this.originalData);
    }

    onAccept() {
        console.log('Saving changes:', this.data);
        // TODO: Implement save functionality (e.g., send to backend)
        // Update originalData to reflect the new saved state
        this.originalData = JSON.parse(JSON.stringify(this.data));
        console.log(this.originalData);
    }

    onReset() {
        // Restore data from the original copy
        this.data = JSON.parse(JSON.stringify(this.originalData));
    }
}
