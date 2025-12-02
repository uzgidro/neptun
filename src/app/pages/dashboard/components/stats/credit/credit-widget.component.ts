import { Component, inject, Input, OnInit } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { DatePipe, DecimalPipe } from '@angular/common';
import { DCInfo } from '@/core/interfaces/debit-credit';
import { CurrencyService } from '@/core/services/currency.service';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Ripple } from 'primeng/ripple';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';

@Component({
    selector: 'app-credit',
    imports: [ButtonDirective, DecimalPipe, DialogModule, TableModule, Ripple, DatePipe, DialogComponent],
    templateUrl: './credit-widget.component.html',
    styleUrl: './credit-widget.component.scss'
})
export class CreditWidget implements OnInit {
    @Input({ required: true }) dc?: DCInfo;

    showInUSD: boolean = false;
    convertedValue: number = 0;
    showDialog: boolean = false;
    dialogShowInUSD: boolean = false;
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

    openDialog() {
        this.showDialog = true;
    }

    toggleDialogCurrency() {
        this.dialogShowInUSD = !this.dialogShowInUSD;
    }

    get convertButtonLabel(): string {
        return this.dialogShowInUSD ? 'Конвертировать в UZS' : 'Конвертировать в USD';
    }

    convertValue(value: number): number {
        if (this.dialogShowInUSD && this.currency > 0) {
            return value / this.currency;
        }
        return value;
    }
}
