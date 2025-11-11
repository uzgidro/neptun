import { Component, inject, OnInit } from '@angular/core';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AuthService } from '@/core/services/auth.service';
import { Cascade, DischargeModel } from '@/core/interfaces/discharge';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { Tooltip } from 'primeng/tooltip';
import { DischargeDialogComponent } from '@/pages/situation-center/ges/discharge/discharge-dialog/discharge-dialog.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { ApproveConfirmationComponent } from '@/layout/component/dialog/approve-confirmation/approve-confirmation.component';
import { DischargeService } from '@/core/services/discharge.service';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-discharge',
    imports: [Button, ButtonDirective, ButtonIcon, ButtonLabel, ReactiveFormsModule, TableModule, FormsModule, DatePipe, DecimalPipe, Ripple, Tooltip, DischargeDialogComponent, DeleteConfirmationComponent, ApproveConfirmationComponent],
    templateUrl: './discharge.component.html',
    styleUrl: './discharge.component.scss'
})
export class DischargeComponent implements OnInit {
    expandedRows: expandedRows = {};
    dischargeByCascades: Cascade[] = [];
    loading = false;
    displayDialog = false;

    showDeleteDialog: boolean = false;
    showApproveDialog: boolean = false;

    selectedId: number | null = null;

    modelToEdit: DischargeModel | null = null;
    authService = inject(AuthService);
    private dischargeService = inject(DischargeService);

    ngOnInit() {
        this.loading = true;
        this.loadDischarges();
    }

    private loadDischarges() {
        this.dischargeService.getDischarges().subscribe({
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

    openDelete(id: number): void {
        this.selectedId = id; // Сохраняем ID
        this.showDeleteDialog = true; // Открываем диалог
    }

    openApprove(id: number): void {
        this.selectedId = id;
        this.showApproveDialog = true;
    }

    openDialog(): void {
        this.displayDialog = true;
        this.modelToEdit = null;
    }

    doDelete(): void {
        this.dischargeService.deleteDischarge(this.selectedId!).subscribe({
            complete: () => {
                this.selectedId = null;
                this.loadDischarges();
            }
        });
    }

    doApprove(): void {
        this.dischargeService.approveDischarge(this.selectedId!).subscribe({
            complete: () => {
                this.selectedId = null;
                this.loadDischarges();
            }
        });
    }

    edit(model: DischargeModel): void {
        this.modelToEdit = model;
        this.displayDialog = true;
    }

    onSaveSuccess(): void {
        this.loadDischarges();
        this.modelToEdit = null;
    }
}
