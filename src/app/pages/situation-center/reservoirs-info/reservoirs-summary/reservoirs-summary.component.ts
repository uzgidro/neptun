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
import { AuthService } from '@/core/services/auth.service';
import { finalize } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { saveAs } from 'file-saver';

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
    authService = inject(AuthService);

    form: FormGroup = this.fb.group({
        date: [new Date()]
    });

    data: ReservoirSummaryResponse[] = [];
    originalData: ReservoirSummaryResponse[] = [];
    submitted: boolean = false;

    isExcelLoading = false;
    isPdfLoading = false;

    get selectedDate(): Date {
        return this.form.get('date')?.value;
    }

    get dateYMD(): string {
        return this.selectedDate ? `${this.selectedDate.getFullYear()}-${String(this.selectedDate.getMonth() + 1).padStart(2, '0')}-${String(this.selectedDate.getDate()).padStart(2, '0')}` : '';
    }

    ngOnInit() {
        this.loadData(this.selectedDate);

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
        if (this.selectedDate) {
            return this.selectedDate.getFullYear() - yearsAgo;
        }
        return new Date().getFullYear() - yearsAgo;
    }

    hasChanges(): boolean {
        return JSON.stringify(this.data) !== JSON.stringify(this.originalData);
    }

    onAccept() {
        // Extract only the required fields for saving
        const dataToSave: ReservoirSummaryRequest[] = this.data
            .filter((value) => value.organization_id !== null)
            .map((reservoir) => {
                return {
                    organization_id: reservoir.organization_id!,
                    date: this.dateYMD,
                    income: reservoir.income.current,
                    level: reservoir.level.current,
                    volume: reservoir.volume.current,
                    release: reservoir.release.current,
                    modsnow_current: reservoir.modsnow.current,
                    modsnow_year_ago: reservoir.modsnow.year_ago
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

    calculateIncome(reservoir: ReservoirSummaryResponse) {
        // Calculate volume diff (current - previous)
        const volDiff = reservoir.volume.current - reservoir.volume.prev;

        // Calculate income using the formula: income = (vol_diff / 0.0864) + release
        reservoir.income.current = volDiff / 0.0864 + reservoir.release.current;
    }

    onVolumeChange(reservoir: ReservoirSummaryResponse) {
        this.calculateIncome(reservoir);
    }

    onReleaseChange(reservoir: ReservoirSummaryResponse) {
        this.calculateIncome(reservoir);
    }

    download(format: 'excel' | 'pdf') {
        // Устанавливаем статус загрузки
        if (format === 'excel') this.isExcelLoading = true;
        else this.isPdfLoading = true;

        this.reservoirService
            .downloadSummary(this.selectedDate, format)
            .pipe(
                finalize(() => {
                    // Снимаем спиннер в любом случае (успех или ошибка)
                    this.isExcelLoading = false;
                    this.isPdfLoading = false;
                })
            )
            .subscribe({
                next: (response: HttpResponse<Blob>) => {
                    // 1. Пытаемся достать имя файла из заголовка Content-Disposition
                    const extension = format === 'excel' ? 'xlsx' : 'pdf';
                    const filename = `СВОД_${this.dateYMD}.${extension}`;

                    // 2. Сохраняем файл с помощью file-saver
                    // response.body! - это сам Blob (файл)
                    saveAs(response.body!, filename);
                },
                error: (err: any) => {
                    console.error('Ошибка при скачивании:', err);
                    alert('Не удалось скачать файл. Проверьте консоль.');
                }
            });
    }
}
