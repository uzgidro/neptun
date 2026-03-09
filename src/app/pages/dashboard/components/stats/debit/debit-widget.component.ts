import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { DatePipe, DecimalPipe } from '@angular/common';
import { DCInfo } from '@/core/interfaces/debit-credit';
import { CurrencyService } from '@/core/services/currency.service';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { Ripple } from 'primeng/ripple';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { FinancialDashboardService } from '@/pages/financial-block/dashboard/services/financial-dashboard.service';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-debit',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonDirective, DecimalPipe, DialogModule, TableModule, Ripple, DatePipe, DialogComponent, TranslateModule],
    templateUrl: './debit-widget.component.html'
})
export class DebitWidget implements OnInit, OnDestroy {
    @Input() dc?: DCInfo;

    showInUSD: boolean = false;
    showDialog: boolean = false;
    dialogShowInUSD: boolean = false;
    totalIncome: number = 0;
    private currency: number = 0;
    private currencyService: CurrencyService = inject(CurrencyService);
    private financialService: FinancialDashboardService = inject(FinancialDashboardService);
    private cdr = inject(ChangeDetectorRef);
    private subscription = new Subscription();

    get debit(): number {
        // Используем данные из финансового сервиса если есть, иначе из dc
        if (this.totalIncome !== 0) {
            return this.totalIncome; // Значение уже в нужном формате
        }
        return (this.dc?.debit.currentValue ?? 0) * 1000000; // dc в млн, конвертируем в UZS
    }

    get displayValue(): number {
        if (this.showInUSD && this.currency > 0) {
            return this.debit / this.currency;
        }
        return this.debit;
    }

    ngOnInit() {
        this.subscription.add(
            this.currencyService.getCurrency().subscribe({
                next: ({ rate }: { rate: number }) => {
                    this.currency = rate;
                    this.cdr.markForCheck();
                }
            })
        );

        this.subscription.add(
            this.financialService.dashboardData$.subscribe(() => {
                this.totalIncome = this.financialService.getTotalIncome();
                this.cdr.markForCheck();
            })
        );
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    toggleCurrency() {
        this.showInUSD = !this.showInUSD;
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
