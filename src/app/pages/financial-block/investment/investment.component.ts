import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';

type Status = 'Новый' | 'В разработке' | 'Выполнено';

interface InvestmentData {
    id: number;
    col1: string;
    col2: string;
    col3: number;
    col4: string;
    col5: Date;
    col6: string;
    status: Status;
}

@Component({
    selector: 'app-investment',
    standalone: true,
    imports: [CommonModule, TableModule, TagModule, FormsModule, SelectComponent],
    templateUrl: './investment.component.html',
    styleUrl: './investment.component.scss'
})
export class InvestmentComponent implements OnInit {
    investments: InvestmentData[] = [];
    statusOptions: { name: Status, value: Status }[];

    constructor() {
        const statuses: Status[] = ['Новый', 'В разработке', 'Выполнено'];
        this.statusOptions = statuses.map(status => ({ name: status, value: status }));
    }

    ngOnInit() {
        this.investments = [
            { id: 1, col1: 'Проект А', col2: 'В работе', col3: 150000, col4: 'Высокий', col5: new Date(), col6: 'Комментарий 1', status: 'В разработке' },
            { id: 2, col1: 'Проект Б', col2: 'Завершен', col3: 75000, col4: 'Средний', col5: new Date(), col6: 'Комментарий 2', status: 'Выполнено' },
            { id: 3, col1: 'Проект В', col2: 'Планируется', col3: 300000, col4: 'Высокий', col5: new Date(), col6: 'Комментарий 3', status: 'Новый' }
        ];
    }

    getStatusSeverity(status: Status): string {
        switch (status) {
            case 'Новый':
                return 'info'; // Синий
            case 'В разработке':
                return 'warning'; // Желтый
            case 'Выполнено':
                return 'success'; // Зеленый
            default:
                return 'secondary';
        }
    }
}
