import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, registerLocaleData } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputText } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { ReservoirSummaryService } from '@/core/services/reservoir-summary.service';
import { ReservoirSummaryRequest, ReservoirSummaryResponse } from '@/core/interfaces/reservoir-summary';
import localeRu from '@angular/common/locales/ru';
import { MessageService } from 'primeng/api';

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
    private messageService = inject(MessageService);

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

    hasChanges(): boolean {
        return JSON.stringify(this.data) !== JSON.stringify(this.originalData);
    }

    onAccept() {
        // Get the selected date and format it as YYYY-MM-DD
        const selectedDate = this.form.get('date')?.value;
        const dateYMD = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : '';

        // Extract only the required fields for saving
        const dataToSave: ReservoirSummaryRequest[] = this.data
            .filter((value) => value.organization_id !== null)
            .map((reservoir) => {
                return {
                    organization_id: reservoir.organization_id!,
                    date: dateYMD,
                    income: reservoir.income.current,
                    level: reservoir.level.current,
                    volume: reservoir.volume.current,
                    release: reservoir.release.current
                };
            });

        this.reservoirService.upsetReservoirData(dataToSave).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Данные обновлены' });
            },
            error: (err) => {
                this.messageService.add({ severity: 'warn', summary: 'Произошла ошибка', detail: err });
            }
        });
        this.originalData = JSON.parse(JSON.stringify(this.data));
    }

    onReset() {
        // Restore data from the original copy
        this.data = JSON.parse(JSON.stringify(this.originalData));
    }

    onInputFocus(event: FocusEvent, obj: any, field: string) {
        // Clear the input if the value is 0
        if (obj[field] === 0) {
            obj[field] = null;
            // Update the input value to empty
            setTimeout(() => {
                const input = event.target as HTMLInputElement;
                if (input) {
                    input.value = '';
                }
            }, 0);
        }
    }
}
