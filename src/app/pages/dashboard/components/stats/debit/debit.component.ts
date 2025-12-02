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
    selector: 'app-debit',
    imports: [ButtonDirective, DecimalPipe, DialogModule, TableModule, Ripple, DatePipe, DialogComponent],
    templateUrl: './debit.component.html',
    styleUrl: './debit.component.scss'
})
export class DebitComponent implements OnInit {
    @Input({ required: true }) dc?: DCInfo;

    showInUSD: boolean = false;
    convertedValue: number = 0;
    showDialog: boolean = false;
    dialogShowInUSD: boolean = false;
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
