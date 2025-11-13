import { Component, inject, OnInit } from '@angular/core';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { AuthService } from '@/core/services/auth.service';
import { Cascade, DischargeModel } from '@/core/interfaces/discharge';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { Tooltip } from 'primeng/tooltip';
import { DischargeDialogComponent } from '@/pages/situation-center/ges/discharge/discharge-dialog/discharge-dialog.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { ApproveConfirmationComponent } from '@/layout/component/dialog/approve-confirmation/approve-confirmation.component';
import { DischargeService } from '@/core/services/discharge.service';
import { ExportService } from '@/core/services/export.service';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-discharge',
    imports: [Button, ButtonDirective, ButtonIcon, ButtonLabel, ReactiveFormsModule, TableModule, FormsModule, DatePipe, DecimalPipe, Ripple, Tooltip, DischargeDialogComponent, DeleteConfirmationComponent, ApproveConfirmationComponent, NgClass],
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
    private exportService = inject(ExportService);

    isExpanded = false;

    ngOnInit() {
        this.loading = true;
        this.loadDischarges();
    }

    private loadDischarges() {
        this.dischargeService.getDischarges().subscribe({
            next: (data: Cascade[]) => {
                this.dischargeByCascades = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Ошибка загрузки данных:', err);
                this.loading = false;
            }
        });
    }

    expandAll() {
        this.isExpanded = !this.isExpanded;
        if (this.isExpanded) {
            this.expandAllRows();
        } else {
            this.expandedRows = {};
        }
    }

    private expandAllRows() {
        const newExpandedRows: { [key: string]: boolean } = {};
        this.dischargeByCascades.forEach((cascade) => {
            newExpandedRows[cascade.id] = true;
            cascade.hpps.forEach((hpp) => {
                newExpandedRows[hpp.id] = true;
            });
        });
        this.expandedRows = newExpandedRows;
        this.isExpanded = true;
    }

    exportExcel() {
        const flatData = this.flattenDataForExport(this.dischargeByCascades);
        this.exportService.exportToExcel(flatData, 'Холостой водосброс');
    }

    private flattenDataForExport(cascades: Cascade[]): any[] {
        const flatData: any[] = [];
        cascades.forEach(cascade => {
            cascade.hpps.forEach(hpp => {
                hpp.discharges.forEach(discharge => {
                    flatData.push({
                        'Каскад': cascade.name,
                        'ГЭС': hpp.name,
                        'Начало': discharge.started_at,
                        'Конец': discharge.ended_at,
                        'Поток, м³/с': discharge.flow_rate,
                        'Объём, млн. м³': discharge.total_volume,
                        'Причина': discharge.reason,
                        'Создал': discharge.created_by?.fio,
                        'Подтвердил': discharge.approved === true ? 'Да' : (discharge.approved === false ? 'Нет' : 'Ожидает'),
                        'Кто подтвердил': discharge.updated_by?.fio
                    });
                });
            });
        });
        return flatData;
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
