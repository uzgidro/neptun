import { Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { cloneDeep } from 'lodash-es';
import { CommonModule } from '@angular/common';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { AuthService } from '@/core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-reservoir',
    standalone: true,
    imports: [TableModule, FormsModule, CommonModule, DatePickerComponent, ReactiveFormsModule, ButtonModule],
    templateUrl: './reservoir.component.html',
    styleUrl: './reservoir.component.scss'
})
export class ReservoirComponent implements OnInit {
    private fb = inject(FormBuilder);
    form: FormGroup = this.fb.group({
        // Устанавливаем сегодняшнюю дату по умолчанию
        started_at: [new Date()],
        selectedMonth: ['Сентябрь']
    });

    // Структура пустой таблицы (скопирована из construction.component.ts)
    private emptyRowsStructure = [
        { id: 2, name: 'ДАМБА', isSection: true, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        { id: 3, name: 'Бетонные работы', unit: 'м3', project: null, fact: null, percent: '0%', left: null, planSept: null, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        { id: 4, name: 'Арматурные работы', unit: 'м3', project: null, fact: null, percent: '0%', left: null, planSept: null, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        { id: 6, name: 'ТРУБОПРОВОД(3347)', isSection: true, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        { id: 7, name: 'Бетонные работы', unit: 'п.м', project: null, fact: null, percent: '0%', left: null, planSept: null, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        { id: 8, name: 'Монтаж трубопровод', unit: 'п.м', project: null, fact: null, percent: '0%', left: null, planSept: null, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        { id: 10, name: 'ЗДАНИЕ СТАНЦИИ ГЭС', isSection: true, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        { id: 11, name: 'Бетонные работы', unit: 'м³', project: null, fact: null, percent: '0%', left: null, planSept: null, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        { id: 11, name: 'Монтаж механического оборудования', unit: 'м³', project: null, fact: null, percent: '0%', left: null, planSept: null, plan_daily: null, fact_daily: null, percent_daily: '0%' }
    ];

    private dataSnapshots: Map<string, any[]> = new Map();
    rows: any[] = [];
    isReadOnly: boolean = true;
    private authService = inject(AuthService);

    months: string[] = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    ngOnInit() {
        this.loadDataForDate(this.form.get('started_at')?.value);
        this.form.get('started_at')?.valueChanges.subscribe((date) => {
            this.loadDataForDate(date);
        });
        this.isReadOnly = !this.authService.hasRole(['admin', 'sc', 'rais']);
    }

    private dateToKey(date: Date): string {
        if (!date) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private loadDataForDate(date: Date) {
        const dateKey = this.dateToKey(date);
        if (this.dataSnapshots.has(dateKey)) {
            this.rows = this.dataSnapshots.get(dateKey)!;
        } else {
            this.rows = cloneDeep(this.emptyRowsStructure);
        }
    }

    protected submitted: boolean = false;
    private saveDataSnapshot() {
        const dateKey = this.dateToKey(this.form.get('started_at')?.value);
        if (dateKey) {
            this.dataSnapshots.set(dateKey, cloneDeep(this.rows));
        }
    }

    updateCalculations(row: any) {
        const project = Number(row.project);
        const fact = Number(row.fact);

        if (!isNaN(project) && !isNaN(fact) && project > 0) {
            row.percent = ((fact / project) * 100).toFixed(0) + '%';
            row.left = parseFloat((project - fact).toFixed(1));
        } else {
            row.percent = '0%';
            row.left = project || null;
        }

        const planDaily = Number(row.plan_daily);
        const factDaily = Number(row.fact_daily);

        if (!isNaN(planDaily) && !isNaN(factDaily) && planDaily > 0) {
            row.percent_daily = ((factDaily / planDaily) * 100).toFixed(0) + '%';
        } else {
            row.percent_daily = '0%';
        }
        this.saveDataSnapshot();
    }

    private recalculateTotals() {
        // Логика пересчета итогов (если она понадобится, она здесь)
    }
    onCalculationChange(row: any) {
        this.updateCalculations(row);
        this.recalculateTotals();
    }

    getPercentColorClass(percent: string): string {
        if (!percent) {
            return '';
        }
        const value = parseInt(percent.replace('%', ''), 10);

        if (isNaN(value)) {
            return '';
        }

        if (value <= 30) return 'text-red-500';
        if (value <= 79) return 'text-orange-500';
        return 'text-green-500';
    }

    exportToExcel() {
        const date = this.form.get('started_at')?.value;
        if (!date) return;

        const dateString = this.dateToKey(date);
        const title = `Отчет по водохранилищам на ${dateString}`;

        const dataToExport = this.rows.map((row) => ({
            'Наименование работ': row.name,
            'Ед. изм': row.isSection ? '' : row.unit,
            'По проекту': row.isSection ? '' : row.project,
            Факт: row.isSection ? '' : row.fact,
            '%': row.isSection ? '' : row.percent,
            Остаток: row.isSection ? '' : row.left,
            'План на сентябрь': row.isSection ? '' : row.planSept,
            'План (день)': row.isSection ? '' : row.plan_daily,
            'Факт (день)': row.isSection ? '' : row.fact_daily,
            '% (день)': row.isSection ? '' : row.percent_daily
        }));

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.saveAsExcelFile(excelBuffer, `reservoir_report_${dateString}`);
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        downloadLink.download = `${fileName}.xlsx`;
        downloadLink.click();
    }
}
