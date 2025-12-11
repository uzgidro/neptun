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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
        // Get the selected date and format it as YYYY-MM-DD
        const selectedDate = this.form.get('date')?.value;
        const dateYMD = selectedDate ?
            `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
            : null;

        // Extract only the required fields for saving
        const dataToSave = this.data.map(reservoir => ({
            organization_id: reservoir.organization_id,
            date: dateYMD,
            level: reservoir.level.current,
            volume: reservoir.volume.current,
            income: reservoir.income.current,
            release: reservoir.release.current
        }));

        console.log('Saving changes:', dataToSave);
        // TODO: Implement save functionality (e.g., send to backend)
        // this.reservoirService.updateReservoirSummary(dataToSave).subscribe({
        //     next: (response) => {
        //         console.log('Save successful:', response);
        //         this.originalData = JSON.parse(JSON.stringify(this.data));
        //     },
        //     error: (error) => {
        //         console.error('Error saving:', error);
        //     }
        // });

        // Update originalData to reflect the new saved state
        this.originalData = JSON.parse(JSON.stringify(this.data));
    }

    onReset() {
        // Restore data from the original copy
        this.data = JSON.parse(JSON.stringify(this.originalData));
    }

    exportToPDF() {
        const doc = new jsPDF('landscape', 'mm', 'a4');
        const selectedDate = this.form.get('date')?.value;
        const dateStr = selectedDate ? selectedDate.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

        // Add title
        doc.setFontSize(16);
        doc.text('Сводка по водохранилищам', 14, 15);

        // Add date
        doc.setFontSize(12);
        doc.text(`Дата: ${dateStr}`, 14, 22);

        // Get previous years for column headers
        const prevYear1 = this.getPreviousYear(1);
        const prevYear2 = this.getPreviousYear(2);
        const currentYear = selectedDate ? selectedDate.getFullYear() : new Date().getFullYear();

        // Prepare table data
        const tableData: any[] = [];
        this.data.forEach(reservoir => {
            // First row for each reservoir (current values)
            tableData.push([
                { content: reservoir.organization_name || '', rowSpan: 2 },
                reservoir.level.current.toFixed(2),
                reservoir.volume.current.toFixed(2),
                reservoir.volume.year_ago !== null ? reservoir.volume.year_ago.toFixed(2) : 'N/A',
                reservoir.volume.two_years_ago !== null ? reservoir.volume.two_years_ago.toFixed(2) : 'N/A',
                reservoir.income.current.toFixed(2),
                reservoir.income.year_ago !== null ? reservoir.income.year_ago.toFixed(2) : 'N/A',
                reservoir.income.two_years_ago !== null ? reservoir.income.two_years_ago.toFixed(2) : 'N/A',
                reservoir.release.current.toFixed(2),
                reservoir.release.year_ago !== null ? reservoir.release.year_ago.toFixed(2) : 'N/A',
                reservoir.release.two_years_ago !== null ? reservoir.release.two_years_ago.toFixed(2) : 'N/A',
                reservoir.incoming_volume.toFixed(2),
                reservoir.incoming_volume_prev_year.toFixed(2),
                'N/A',
                'N/A'
            ]);

            // Second row (differences - italic)
            tableData.push([
                (reservoir.level.current - reservoir.level.prev).toFixed(2),
                (reservoir.volume.current - reservoir.volume.prev).toFixed(2),
                reservoir.volume.year_ago !== null ? (reservoir.volume.current - reservoir.volume.year_ago).toFixed(2) : 'N/A',
                reservoir.volume.two_years_ago !== null ? (reservoir.volume.current - reservoir.volume.two_years_ago).toFixed(2) : 'N/A',
                (reservoir.income.current - reservoir.income.prev).toFixed(2),
                reservoir.income.year_ago !== null ? (reservoir.income.current - reservoir.income.year_ago).toFixed(2) : 'N/A',
                reservoir.income.two_years_ago !== null ? (reservoir.income.current - reservoir.income.two_years_ago).toFixed(2) : 'N/A',
                (reservoir.release.current - reservoir.release.prev).toFixed(2),
                reservoir.release.year_ago !== null ? (reservoir.release.current - reservoir.release.year_ago).toFixed(2) : 'N/A',
                reservoir.release.two_years_ago !== null ? (reservoir.release.current - reservoir.release.two_years_ago).toFixed(2) : 'N/A',
                (reservoir.incoming_volume - reservoir.incoming_volume_prev_year).toFixed(2),
                `${((reservoir.incoming_volume / reservoir.incoming_volume_prev_year) * 100).toFixed(0)}%`,
                'N/A',
                'N/A'
            ]);
        });

        // Generate table
        autoTable(doc, {
            startY: 28,
            head: [
                [
                    { content: 'Водохранилище', rowSpan: 3 },
                    { content: 'Уровень, м', rowSpan: 2 },
                    { content: 'Объем, млн. м³', colSpan: 3 },
                    { content: 'Приток, м³/с', colSpan: 3 },
                    { content: 'Попуск, м³/с', colSpan: 3 },
                    { content: 'Приток до сегодняшнего дня, млн. м³', colSpan: 2 },
                    { content: 'MODSNOW, снежный покров %', colSpan: 2 }
                ],
                [
                    dateStr,
                    { content: 'Прошлые года', colSpan: 2 },
                    dateStr,
                    { content: 'Прошлые года', colSpan: 2 },
                    dateStr,
                    { content: 'Прошлые года', colSpan: 2 },
                    '',
                    ''
                ],
                [
                    dateStr,
                    `${prevYear1}`,
                    `${prevYear2}`,
                    `${prevYear1}`,
                    `${prevYear2}`,
                    `${prevYear1}`,
                    `${prevYear2}`,
                    `${currentYear}`,
                    `${prevYear1}`,
                    `${currentYear}`,
                    `${prevYear1}`
                ]
            ],
            body: tableData,
            styles: {
                fontSize: 7,
                cellPadding: 1.5
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'center'
            },
            didParseCell: (data) => {
                // Make difference rows italic
                if (data.section === 'body' && data.row.index % 2 === 1) {
                    data.cell.styles.fontStyle = 'italic';
                }
            },
            columnStyles: {
                0: { cellWidth: 35 },
                1: { halign: 'center' },
                2: { halign: 'center' },
                3: { halign: 'center' },
                4: { halign: 'center' },
                5: { halign: 'center' },
                6: { halign: 'center' },
                7: { halign: 'center' },
                8: { halign: 'center' },
                9: { halign: 'center' },
                10: { halign: 'center' },
                11: { halign: 'center' },
                12: { halign: 'center' },
                13: { halign: 'center' },
                14: { halign: 'center' }
            }
        });

        // Save the PDF
        doc.save(`reservoir-summary-${selectedDate ? selectedDate.toISOString().split('T')[0] : 'export'}.pdf`);
    }
}
