import { Component, inject, Input, OnInit } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { DecimalPipe } from '@angular/common';
import { DCInfo } from '@/core/interfaces/debit-credit';
import { CurrencyService } from '@/core/services/currency.service';

@Component({
    selector: 'app-credit',
    imports: [ButtonDirective, DecimalPipe],
    templateUrl: './credit.component.html',
    styleUrl: './credit.component.scss'
})
export class CreditComponent implements OnInit {
    @Input({ required: true }) dc?: DCInfo;

    showInUSD: boolean = false;
    convertedValue: number = 0;
    private currency: number = 0;
    private currencyService: CurrencyService = inject(CurrencyService);

    get credit(): number {
        return this.dc?.credit.currentValue ?? 0;
    }

    get displayValue(): number {
        if (this.showInUSD) {
            return this.convertedValue;
        }
        return this.credit;
    }

    ngOnInit() {
        this.currencyService.getCurrency().subscribe({
            next: ({ rate }: { rate: number }) => {
                console.log(rate);
                this.currency = rate;
            }
        });
    }

    toggleCurrency() {
        this.showInUSD = !this.showInUSD;
        if (this.showInUSD && this.credit > 0) {
            this.convertedValue = this.credit / this.currency;
        }
    }
}
