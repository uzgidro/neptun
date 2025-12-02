import { Component, inject, Input, OnInit } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { DCInfo } from '@/core/interfaces/debit-credit';
import { CurrencyService } from '@/core/services/currency.service';

@Component({
    selector: 'app-debit',
    imports: [ButtonDirective, CurrencyPipe, DecimalPipe],
    templateUrl: './debit.component.html',
    styleUrl: './debit.component.scss'
})
export class DebitComponent implements OnInit {
    @Input({ required: true }) dc?: DCInfo;

    showInUSD: boolean = false;
    convertedValue: number = 0;
    private currency: number = 0;
    private currencyService: CurrencyService = inject(CurrencyService);

    get debit(): number {
        return this.dc?.debit.currentValue ?? 0;
    }

    get displayValue(): number {
        if (this.showInUSD) {
            return this.convertedValue;
        }
        return this.debit;
    }

    ngOnInit() {
        this.currencyService.getCurrency().subscribe({
            next: ({ rate }: { rate: number }) => {
                this.currency = rate;
            }
        });
    }

    toggleCurrency() {
        this.showInUSD = !this.showInUSD;
        if (this.showInUSD && this.debit > 0) {
            this.convertedValue = this.debit / this.currency;
        }
    }
}
