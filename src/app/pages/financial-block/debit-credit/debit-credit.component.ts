import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

interface Transaction {
    id: number;
    date: Date;
    description: string;
    debit: number | null;
    credit: number | null;
}

@Component({
    selector: 'app-debit-credit',
    standalone: true,
    imports: [CommonModule, TableModule],
    templateUrl: './debit-credit.component.html',
    styleUrl: './debit-credit.component.scss'
})
export class DebitCreditComponent implements OnInit {
    transactions: Transaction[] = [];

    ngOnInit() {
        this.transactions = [
            { id: 1, date: new Date(), description: 'Поступление от клиента А', debit: 1000, credit: null },
            { id: 2, date: new Date(), description: 'Оплата аренды', debit: null, credit: 500 },
            { id: 3, date: new Date(), description: 'Закупка материалов', debit: null, credit: 250 },
            { id: 4, date: new Date(), description: 'Поступление от клиента Б', debit: 2500, credit: null }
        ];
    }
}
