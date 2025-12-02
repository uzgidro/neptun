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
    dc?: DCInfo;

    private dcService: DebitCreditTempService = inject(DebitCreditTempService);

    ngOnInit() {
        this.dcService.getDC().subscribe({
            next: (data: DCInfo) => {
                this.dc = data;
            }
        });
    }
}
