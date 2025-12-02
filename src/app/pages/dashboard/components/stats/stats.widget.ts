import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DCInfo } from '@/core/interfaces/debit-credit';
import { DebitCreditTempService } from '@/core/services/temp/debit-credit-temp.service';
import { DebitComponent } from '@/pages/dashboard/components/stats/debit/debit.component';
import { CreditComponent } from '@/pages/dashboard/components/stats/credit/credit.component';
import { ProductionComponent } from '@/pages/dashboard/components/stats/production/production.component';
import { EmployeesComponent } from '@/pages/dashboard/components/stats/employees/employees.component';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule, ButtonModule, DebitComponent, CreditComponent, ProductionComponent, EmployeesComponent],
    templateUrl: './stats.widget.html'
})
export class StatsWidget implements OnInit {
    // Amounts in UZS
    debitAmountUZS: number = 1580000;
    creditAmountUZS: number = 250000;

    // Amounts in USD
    debitAmountUSD: number = 0;
    creditAmountUSD: number = 0;

    // Flag to toggle currency
    showInUSD: boolean = false;

    dc?: DCInfo;

    private dcService: DebitCreditTempService = inject(DebitCreditTempService);

    // Exchange rate (for example, in a real application it's better to get it from an API)
    private usdExchangeRate: number = 12650;

    ngOnInit() {
        this.dcService.getDC().subscribe({
            next: (data: DCInfo) => {
                this.dc = data;
            }
        });
        this.convertAmountsToUSD();
    }

    convertAmountsToUSD() {
        this.debitAmountUSD = this.debitAmountUZS / this.usdExchangeRate;
        this.creditAmountUSD = this.creditAmountUZS / this.usdExchangeRate;
    }

    toggleCurrency() {
        this.showInUSD = !this.showInUSD;
    }
}
