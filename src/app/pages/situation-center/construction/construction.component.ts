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
    selector: 'app-construction',
    imports: [TableModule, FormsModule, CommonModule, DatePickerComponent, ReactiveFormsModule, ButtonModule],
    templateUrl: './construction.component.html',
    styleUrl: './construction.component.scss'
})
export class ConstructionComponent implements OnInit {
    private fb = inject(FormBuilder);
    form: FormGroup = this.fb.group({
        // Устанавливаем сегодняшнюю дату по умолчанию
        started_at: [new Date()],
        selectedMonth: ['Сентябрь']
    });

    // Структура пустой таблицы
    private emptyRowsStructure = [
        { id: 2, name: 'ДАМБА', isSection: true, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        { id: 3, name: 'Бетонные работы', unit: 'м3', project: null, fact: null, percent: '0%', left: null, planSept: null, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        { id: 4, name: 'Арматурные работы', unit: 'м3', project: null, fact: null, percent: '0%', left: null, planSept: null, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        // { id: 5, name: 'Итог: (RCC+CVC)', unit: 'м3', project: null, fact: null, percent: '0%', left: null, planSept: null },
        { id: 6, name: 'ТРУБОПРОВОД(3347)', isSection: true, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        { id: 7, name: 'Бетонные работы', unit: 'п.м', project: null, fact: null, percent: '0%', left: null, planSept: null, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        { id: 8, name: 'Монтаж трубопровод', unit: 'п.м', project: null, fact: null, percent: '0%', left: null, planSept: null, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        // { id: 9, name: 'Итог: (ГЦ+УЦ)', unit: 'м3', project: null, fact: null, percent: '0%', left: null, planSept: null },
        { id: 10, name: 'ЗДАНИЕ СТАНЦИИ ГЭС', isSection: true, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        { id: 11, name: 'Бетонные работы', unit: 'м³', project: null, fact: null, percent: '0%', left: null, planSept: null, plan_daily: null, fact_daily: null, percent_daily: '0%' },
        { id: 11, name: 'Монтаж механического оборудования', unit: 'м³', project: null, fact: null, percent: '0%', left: null, planSept: null, plan_daily: null, fact_daily: null, percent_daily: '0%' }
        // { id: 12, name: 'ПОВЕРХНОСТНЫЙ ВОДОСБРОС', isSection: true },
        // { id: 13, name: 'Бетонные работы', unit: 'м³', project: null, fact: null, percent: '0%', left: null, planSept: null }
    ];

    // Здесь мы будем хранить "снимки" данных для каждой даты
    private dataSnapshots: Map<string, any[]> = new Map();

    // Это данные, которые видит таблица в данный момент
    rows: any[] = [];
    isReadOnly: boolean = true; // Инициализируем со значением "только для чтения"
    private authService = inject(AuthService);

    months: string[] = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

    ngOnInit() {
        // При загрузке компонента загружаем данные для текущей даты
        this.loadDataForDate(this.form.get('started_at')?.value);

        // Подписываемся на изменения в календаре
        this.form.get('started_at')?.valueChanges.subscribe((date) => {
            this.loadDataForDate(date);
        });
        // доступ для наших чайников
        this.isReadOnly = !this.authService.hasRole(['admin', 'sc', 'rais']);
    }

    // Преобразует дату в строку 'YYYY-MM-DD' для использования как ключ
    private dateToKey(date: Date): string {
        if (!date) return '';
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Загружает данные для выбранной даты
    private loadDataForDate(date: Date) {
        const dateKey = this.dateToKey(date);
        if (this.dataSnapshots.has(dateKey)) {
            // Если "снимок" для этой даты есть, загружаем его
            this.rows = this.dataSnapshots.get(dateKey)!;
        } else {
            // Если нет, создаем новую пустую таблицу
            this.rows = cloneDeep(this.emptyRowsStructure);
        }
    }

    // Сохраняет текущее состояние таблицы как "снимок" для выбранной даты
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

        // После каждого расчета сохраняем "снимок"
        this.saveDataSnapshot();
    }

    private recalculateTotals() {
        // 1. Расчет промежуточного итога для (RCC+CVC)
        const rccCvcRows = this.rows.filter((r) => r.name.includes('Укатанный бетон') || r.name.includes('Выбрированный бетон'));
        const rccCvcTotalRow = this.rows.find((r) => r.name.includes('Итог: (RCC+CVC)'));

        if (rccCvcTotalRow && rccCvcRows.length > 0) {
            rccCvcTotalRow.project = rccCvcRows.reduce((sum, row) => sum + (Number(row.project) || 0), 0);
            rccCvcTotalRow.fact = rccCvcRows.reduce((sum, row) => sum + (Number(row.fact) || 0), 0);
            rccCvcTotalRow.planSept = rccCvcRows.reduce((sum, row) => sum + (Number(row.planSept) || 0), 0);
            rccCvcTotalRow.plan_daily = rccCvcRows.reduce((sum, row) => sum + (Number(row.plan_daily) || 0), 0);
            rccCvcTotalRow.fact_daily = rccCvcRows.reduce((sum, row) => sum + (Number(row.fact_daily) || 0), 0);
            this.updateCalculations(rccCvcTotalRow);
        }

        // 2. Расчет промежуточного итога для (ГЦ+УЦ)
        const gcUcRows = this.rows.filter((r) => r.name.includes('Глубокая цементация') || r.name.includes('Укрепительная цементация'));
        const gcUcTotalRow = this.rows.find((r) => r.name.includes('Итог: (ГЦ+УЦ)'));

        if (gcUcTotalRow && gcUcRows.length > 0) {
            gcUcTotalRow.project = gcUcRows.reduce((sum, row) => sum + (Number(row.project) || 0), 0);
            gcUcTotalRow.fact = gcUcRows.reduce((sum, row) => sum + (Number(row.fact) || 0), 0);
            gcUcTotalRow.planSept = gcUcRows.reduce((sum, row) => sum + (Number(row.planSept) || 0), 0);
            gcUcTotalRow.plan_daily = gcUcRows.reduce((sum, row) => sum + (Number(row.plan_daily) || 0), 0);
            gcUcTotalRow.fact_daily = gcUcRows.reduce((sum, row) => sum + (Number(row.fact_daily) || 0), 0);
            this.updateCalculations(gcUcTotalRow);
        }
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
        const title = `Отчет по строительству на ${dateString}`;

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
        this.saveAsExcelFile(excelBuffer, `construction_report_${dateString}`);
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        downloadLink.download = `${fileName}.xlsx`;
        downloadLink.click();
    }
}
