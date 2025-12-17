import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';

type Status = 'Новый' | 'В разработке' | 'Выполнено';
type OperationFilter = 'Все' | 'Кредит' | 'Дебит';

interface InvestmentData {
    id: number;
    col1: string;
    col2: string;
    col3: number;
    col4: string;
    col5: Date;
    col6: string;
    status: Status;
    operationType: 'Кредит' | 'Дебит';
}

@Component({
    selector: 'app-investment',
    standalone: true,
    imports: [CommonModule, TableModule, FormsModule, ChartModule, SelectComponent],
    templateUrl: './investment.component.html',
    styleUrl: './investment.component.scss'
})
export class InvestmentComponent implements OnInit {
    investments: InvestmentData[] = [];
    filteredInvestments: InvestmentData[] = [];
    selectedOperation:
        | { name: string; value: string }
        | { name: string; value: string }
        | {
              name: string;
              value: string;
          }
        | undefined;

    chartData: any;
    chartOptions: any;
    lineChartData: any;
    lineChartOptions: any;

    operationOptions = [
        { name: 'Все', value: 'Все' },
        { name: 'Кредит', value: 'Кредит' },
        { name: 'Дебит', value: 'Дебит' }
    ];

    statusOptions = [
        { name: 'Новый', value: 'Новый' },
        { name: 'В разработке', value: 'В разработке' },
        { name: 'Выполнено', value: 'Выполнено' }
    ];

    ngOnInit(): void {
        const savedFilter = localStorage.getItem('investment-operation-filter');
        this.selectedOperation = this.operationOptions.find((opt) => opt.value === savedFilter) || this.operationOptions[0];

        this.investments = [
            { id: 1, col1: 'Проект А', col2: 'В работе', col3: 150000, col4: 'Высокий', col5: new Date('2024-12-01'), col6: 'Комментарий 1', status: 'В разработке', operationType: 'Дебит' },
            { id: 2, col1: 'Проект Б', col2: 'Завершен', col3: 75000, col4: 'Средний', col5: new Date('2024-11-15'), col6: 'Комментарий 2', status: 'Выполнено', operationType: 'Кредит' },
            { id: 3, col1: 'Проект В', col2: 'Планируется', col3: 300000, col4: 'Высокий', col5: new Date('2024-12-05'), col6: 'Комментарий 3', status: 'Новый', operationType: 'Дебит' }
        ];

        this.chartOptions = { plugins: { legend: { position: 'bottom' } } };
        this.lineChartOptions = {
            responsive: true,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true } }
        };

        this.applyFilter();
    }

    applyFilter(): void {
        if (!this.selectedOperation) this.selectedOperation = this.operationOptions[0];
        const filterValue = this.selectedOperation.value;
        localStorage.setItem('investment-operation-filter', filterValue);

        this.filteredInvestments = filterValue === 'Все' ? [...this.investments] : this.investments.filter((i) => i.operationType === filterValue);

        this.updateChart();
        this.updateLineChart();
    }

    updateChart(): void {
        const debitTotal = this.filteredInvestments.filter((i) => i.operationType === 'Дебит').reduce((sum, i) => sum + i.col3, 0);
        const creditTotal = this.filteredInvestments.filter((i) => i.operationType === 'Кредит').reduce((sum, i) => sum + i.col3, 0);
        const filterValue = this.selectedOperation?.value || 'Все';

        if (filterValue === 'Все') {
            this.chartData = { labels: ['Дебит', 'Кредит'], datasets: [{ data: [debitTotal, creditTotal], backgroundColor: ['#2e7d32', '#d32f2f'] }] };
        } else if (filterValue === 'Дебит') {
            this.chartData = { labels: ['Дебит'], datasets: [{ data: [debitTotal], backgroundColor: ['#2e7d32'] }] };
        } else {
            this.chartData = { labels: ['Кредит'], datasets: [{ data: [creditTotal], backgroundColor: ['#d32f2f'] }] };
        }
    }

    updateLineChart(): void {
        const map = new Map<string, { debit: number; credit: number }>();
        this.filteredInvestments.forEach((item) => {
            const dateKey = item.col5.toISOString().split('T')[0];
            if (!map.has(dateKey)) map.set(dateKey, { debit: 0, credit: 0 });
            const entry = map.get(dateKey)!;
            if (item.operationType === 'Дебит') entry.debit += item.col3;
            else entry.credit += item.col3;
        });

        const labels = Array.from(map.keys()).sort();
        this.lineChartData = {
            labels,
            datasets: [
                { label: 'Дебит', data: labels.map((d) => map.get(d)!.debit), borderColor: '#2e7d32', backgroundColor: 'rgba(46,125,50,0.2)', tension: 0.4 },
                { label: 'Кредит', data: labels.map((d) => map.get(d)!.credit), borderColor: '#d32f2f', backgroundColor: 'rgba(211,47,47,0.2)', tension: 0.4 }
            ]
        };
    }

    get totalDebit(): number {
        return this.filteredInvestments.filter((i) => i.operationType === 'Дебит').reduce((sum, i) => sum + i.col3, 0);
    }
    get totalCredit(): number {
        return this.filteredInvestments.filter((i) => i.operationType === 'Кредит').reduce((sum, i) => sum + i.col3, 0);
    }
    get balance(): number {
        return this.totalDebit - this.totalCredit;
    }
}
