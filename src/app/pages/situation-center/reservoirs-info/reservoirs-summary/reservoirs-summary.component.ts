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
import * as XLSX from 'xlsx-js-style';

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

    exportToExcel() {
        const selectedDate = this.form.get('date')?.value;
        const formattedDate = selectedDate ? selectedDate.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }) : '';
        const year1Ago = this.getPreviousYear(1);
        const year2Ago = this.getPreviousYear(2);
        const currentYear = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();

        // Create header rows (15 columns total: A-O, last 2 are MODSNOW columns)
        const header1 = ['Водохранилище', 'Уровень, м', 'Объем, млн. м³', '', '', 'Приток, м³/с', '', '', 'Попуск, м³/с', '', '', 'Приток до сегодняшнего дня, млн. м³', '', 'MODSNOW, снежный покров %', ''];
        const header2 = ['', formattedDate, formattedDate, 'Прошлые года', '', formattedDate, 'Прошлые года', '', formattedDate, 'Прошлые года', '', '', '', '', ''];
        const header3 = ['', '', '', year1Ago, year2Ago, '', year1Ago, year2Ago, '', year1Ago, year2Ago, currentYear, year1Ago, currentYear, year1Ago];

        // Create data rows
        const dataRows: any[] = [];
        this.data.forEach((reservoir) => {
            // Main row (15 columns)
            const mainRow = [
                reservoir.organization_name || '',
                reservoir.organization_id !== null ? this.formatNumber(reservoir.level.current) : '',
                this.formatNumber(reservoir.volume.current),
                reservoir.volume.year_ago !== null ? this.formatNumber(reservoir.volume.year_ago) : 'N/A',
                reservoir.volume.two_years_ago !== null ? this.formatNumber(reservoir.volume.two_years_ago) : 'N/A',
                this.formatNumber(reservoir.income.current),
                reservoir.income.year_ago !== null ? this.formatNumber(reservoir.income.year_ago) : 'N/A',
                reservoir.income.two_years_ago !== null ? this.formatNumber(reservoir.income.two_years_ago) : 'N/A',
                this.formatNumber(reservoir.release.current),
                reservoir.release.year_ago !== null ? this.formatNumber(reservoir.release.year_ago) : 'N/A',
                reservoir.release.two_years_ago !== null ? this.formatNumber(reservoir.release.two_years_ago) : 'N/A',
                this.formatNumber(reservoir.incoming_volume),
                this.formatNumber(reservoir.incoming_volume_prev_year),
                reservoir.organization_id !== null ? this.formatNumber(reservoir.modsnow.current, '1.0-0') : '',
                reservoir.organization_id !== null ? this.formatNumber(reservoir.modsnow.year_ago, '1.0-0') : ''
            ];
            dataRows.push(mainRow);

            // Difference row (15 columns, but last 2 will be merged)
            const diffRow = [
                '',
                reservoir.organization_id != null ? this.formatNumber(reservoir.level.current - reservoir.level.prev) : '',
                this.formatNumber(reservoir.volume.current - reservoir.volume.prev),
                reservoir.volume.year_ago !== null ? this.formatNumber(reservoir.volume.current - reservoir.volume.year_ago) : 'N/A',
                reservoir.volume.two_years_ago !== null ? this.formatNumber(reservoir.volume.current - reservoir.volume.two_years_ago) : 'N/A',
                this.formatNumber(reservoir.income.current - reservoir.income.prev),
                reservoir.income.year_ago !== null ? this.formatNumber(reservoir.income.current - reservoir.income.year_ago) : 'N/A',
                reservoir.income.two_years_ago !== null ? this.formatNumber(reservoir.income.current - reservoir.income.two_years_ago) : 'N/A',
                this.formatNumber(reservoir.release.current - reservoir.release.prev),
                reservoir.release.year_ago !== null ? this.formatNumber(reservoir.release.current - reservoir.release.year_ago) : 'N/A',
                reservoir.release.two_years_ago !== null ? this.formatNumber(reservoir.release.current - reservoir.release.two_years_ago) : 'N/A',
                this.formatNumber(reservoir.incoming_volume - reservoir.incoming_volume_prev_year),
                this.formatNumber((reservoir.incoming_volume / reservoir.incoming_volume_prev_year) * 100, '1.0-0') + '%',
                reservoir.organization_id !== null ? this.formatNumber(reservoir.modsnow.current - reservoir.modsnow.year_ago, '1.0-0') : '',
                '' // This cell will be hidden by the colspan merge
            ];
            dataRows.push(diffRow);
        });

        // Combine all rows
        const worksheetData = [header1, header2, header3, ...dataRows];

        // Create worksheet and workbook
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Сводка по водохранилищам');

        // Define border style
        const borderStyle = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
        };

        // Apply styles to all cells
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
        for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellAddress]) ws[cellAddress] = { t: 's', v: '' };

                // Initialize cell style with text wrapping and smaller font
                ws[cellAddress].s = {
                    border: borderStyle,
                    alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
                    font: { sz: 10 } // Font size 6 (half of default 11-12)
                };

                // Header rows (0, 1, 2)
                if (R <= 2) {
                    // Other headers - cyan background
                    ws[cellAddress].s.fill = {
                        patternType: 'solid',
                        fgColor: { rgb: 'CBEEF8' }
                    };
                    ws[cellAddress].s.font = {
                        bold: true,
                        sz: 10
                    };
                }
                // Difference rows (even row indices starting from 4) - gray background
                else if (R > 2 && (R - 3) % 2 === 1) {
                    const dataIndex = Math.floor((R - 3) / 2);
                    const reservoir = this.data[dataIndex];

                    ws[cellAddress].s.fill = {
                        patternType: 'solid',
                        fgColor: { rgb: 'C2C2C2' } // gray background
                    };
                    ws[cellAddress].s.font = {
                        italic: true,
                        sz: 10
                    };

                    // Apply red color to specific columns
                    // Columns B(1), C(2), F(5), I(8), L(11), M(12) - always red (current diff values)
                    if (C === 1 || C === 2 || C === 5 || C === 8 || C === 11 || C === 12) {
                        ws[cellAddress].s.font.color = { rgb: 'EF4444' }; // red-500
                    }
                    // Columns D(3), E(4), G(6), H(7), J(9), K(10) - red if organization_id is null
                    else if ((C === 3 || C === 4 || C === 6 || C === 7 || C === 9 || C === 10) && reservoir?.organization_id === null) {
                        ws[cellAddress].s.font.color = { rgb: 'EF4444' }; // red-500
                    }
                    // Last merged cell (N/13) - red for "Н/Д"
                    else if (C === 13 && reservoir?.organization_id !== null) {
                        ws[cellAddress].s.font.color = { rgb: 'EF4444' }; // red-500
                    }
                }
            }
        }

        // Define merges for header cells (matching the table structure)
        const merges: any[] = [
            // Row 1 merges (15 columns total: A-O)
            { s: { r: 0, c: 0 }, e: { r: 2, c: 0 } }, // A1:A3 - "Водохранилище" (rowspan 3)
            { s: { r: 0, c: 2 }, e: { r: 0, c: 4 } }, // C1:E1 - "Объем, млн. м³" (colspan 3)
            { s: { r: 0, c: 5 }, e: { r: 0, c: 7 } }, // F1:H1 - "Приток, м³/с" (colspan 3)
            { s: { r: 0, c: 8 }, e: { r: 0, c: 10 } }, // I1:K1 - "Попуск, м³/с" (colspan 3)
            { s: { r: 0, c: 11 }, e: { r: 1, c: 12 } }, // L1:M2 - "Приток до сегодняшнего дня" (colspan 2, rowspan 2)
            { s: { r: 0, c: 13 }, e: { r: 1, c: 14 } }, // N1:O2 - "MODSNOW" (colspan 2, rowspan 2)

            // Row 2 merges
            { s: { r: 1, c: 1 }, e: { r: 2, c: 1 } }, // B2:B3 - date (rowspan 2)
            { s: { r: 1, c: 2 }, e: { r: 2, c: 2 } }, // C2:C3 - date (rowspan 2)
            { s: { r: 1, c: 3 }, e: { r: 1, c: 4 } }, // D2:E2 - "Прошлые года" (colspan 2)
            { s: { r: 1, c: 5 }, e: { r: 2, c: 5 } }, // F2:F3 - date (rowspan 2)
            { s: { r: 1, c: 6 }, e: { r: 1, c: 7 } }, // G2:H2 - "Прошлые года" (colspan 2)
            { s: { r: 1, c: 8 }, e: { r: 2, c: 8 } }, // I2:I3 - date (rowspan 2)
            { s: { r: 1, c: 9 }, e: { r: 1, c: 10 } } // J2:K2 - "Прошлые года" (colspan 2)
        ];

        // Add merges for organization names (rowspan 2 for each reservoir)
        // and MODSNOW colspan 2 in difference rows
        this.data.forEach((reservoir, index) => {
            const mainRow = 3 + index * 2; // Main data row
            const diffRow = mainRow + 1; // Difference row

            // Organization name rowspan
            merges.push({ s: { r: mainRow, c: 0 }, e: { r: diffRow, c: 0 } });

            // MODSNOW colspan 2 in difference row (N-O merge)
            merges.push({ s: { r: diffRow, c: 13 }, e: { r: diffRow, c: 14 } });
        });

        ws['!merges'] = merges;

        // Set column widths (15 columns total) - reduced by 40%
        ws['!cols'] = [
            { wch: 18 }, // Водохранилище (30 * 0.6)
            { wch: 7.2 }, // Уровень (12 * 0.6)
            { wch: 7.2 }, // Объем current
            { wch: 7.2 }, // Объем year_ago
            { wch: 7.2 }, // Объем two_years_ago
            { wch: 7.2 }, // Приток current
            { wch: 7.2 }, // Приток year_ago
            { wch: 7.2 }, // Приток two_years_ago
            { wch: 7.2 }, // Попуск current
            { wch: 7.2 }, // Попуск year_ago
            { wch: 7.2 }, // Попуск two_years_ago
            { wch: 9 }, // Приток до сегодняшнего дня current (15 * 0.6)
            { wch: 9 }, // Приток до сегодняшнего дня prev
            { wch: 6 }, // MODSNOW column 1 (10 * 0.6)
            { wch: 6 } // MODSNOW column 2
        ];

        // Generate filename with date
        const fileName = `Сводка_водохранилища_${selectedDate ? selectedDate.toISOString().split('T')[0] : 'данные'}.xlsx`;

        // Save file
        XLSX.writeFile(wb, fileName);
    }

    private formatNumber(value: number, format: string = '1.0-2'): string {
        if (value === null || value === undefined) return '';
        return value.toFixed(format === '1.0-0' ? 0 : 2);
    }
}
