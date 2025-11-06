import { Component, inject, OnInit } from '@angular/core';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AuthService } from '@/core/services/auth.service';
import { ApiService } from '@/core/services/api.service';
import { Cascade, DischargeModel } from '@/core/interfaces/discharge';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { Tooltip } from 'primeng/tooltip';
import { DischargeDialogComponent } from '@/pages/situation-center/ges/discharge/discharge-dialog/discharge-dialog.component';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-discharge',
    imports: [Button, ButtonDirective, ButtonIcon, ButtonLabel, ReactiveFormsModule, TableModule, FormsModule, DatePipe, DecimalPipe, Ripple, Tooltip, DischargeDialogComponent],
    templateUrl: './discharge.component.html',
    styleUrl: './discharge.component.scss'
})
export class DischargeComponent implements OnInit {
    expandedRows: expandedRows = {};
    dischargeByCascades: Cascade[] = [];
    loading = false;
    displayDialog = false;

    modelToEdit: DischargeModel | null = null;
    authService = inject(AuthService);
    private apiService = inject(ApiService);

    ngOnInit() {
        this.loading = true;
        this.loadDischarges();
    }

    private loadDischarges() {
        this.apiService.getDischarges().subscribe({
            next: (data: Cascade[]) => {
                this.dischargeByCascades = data;
                const newExpandedRows: { [key: string]: boolean } = {};

                data.forEach((cascade) => {
                    newExpandedRows[cascade.id] = true;
                    cascade.hpps.forEach((hpp) => {
                        newExpandedRows[hpp.id] = true;
                    });
                });

                this.expandedRows = newExpandedRows;
                this.loading = false;
            },
            error: (err) => {
                console.error('Ошибка загрузки данных:', err);
                this.loading = false;
            }
        });
    }

    openDialog(): void {
        this.displayDialog = true;
        this.modelToEdit = null;
    }

    approve(model: DischargeModel): void {}

    edit(model: DischargeModel): void {
        this.modelToEdit = model;
        this.displayDialog = true;
    }

    delete(model: DischargeModel): void {}

    onSaveSuccess(): void {
        this.loadDischarges();
        this.modelToEdit = null;
    }
}
