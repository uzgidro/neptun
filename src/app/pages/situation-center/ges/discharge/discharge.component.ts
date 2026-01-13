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
import { DatePicker } from 'primeng/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-discharge',
    imports: [
        Button,
        ButtonDirective,
        ButtonIcon,
        ButtonLabel,
        ReactiveFormsModule,
        TableModule,
        FormsModule,
        DatePipe,
        DecimalPipe,
        Ripple,
        Tooltip,
        DischargeDialogComponent,
        DeleteConfirmationComponent,
        ApproveConfirmationComponent,
        NgClass,
        DatePicker,
        TranslateModule
    ],
    templateUrl: './discharge.component.html',
    styleUrl: './discharge.component.scss'
})
export class DischargeComponent implements OnInit {
    expandedRows: expandedRows = {};
    dischargeByCascades: Cascade[] = [];
    loading = false;
    displayDialog = false;
    selectedDate: Date | null = null;
    maxDate: Date = new Date();

    showDeleteDialog: boolean = false;
    showApproveDialog: boolean = false;

    selectedId: number | null = null;

    modelToEdit: DischargeModel | null = null;
    authService = inject(AuthService);
    private dischargeService = inject(DischargeService);
    private exportService = inject(ExportService);
    private router: Router = inject(Router);
    private route: ActivatedRoute = inject(ActivatedRoute);
    private translate = inject(TranslateService);

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
                console.error('Error loading data:', err);
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
        this.exportService.exportToExcel(flatData, this.translate.instant('SITUATION_CENTER.DISCHARGE.TITLE'));
    }

    private flattenDataForExport(cascades: Cascade[]): any[] {
        const flatData: any[] = [];
        const t = this.translate;
        cascades.forEach((cascade) => {
            cascade.hpps.forEach((hpp) => {
                hpp.discharges.forEach((discharge) => {
                    flatData.push({
                        [t.instant('SITUATION_CENTER.DISCHARGE.CASCADE_NAME')]: cascade.name,
                        [t.instant('SITUATION_CENTER.DISCHARGE.GES_NAME')]: hpp.name,
                        [t.instant('SITUATION_CENTER.COMMON.START')]: discharge.started_at,
                        [t.instant('SITUATION_CENTER.COMMON.END')]: discharge.ended_at,
                        [t.instant('SITUATION_CENTER.DISCHARGE.FLOW_RATE')]: discharge.flow_rate,
                        [t.instant('SITUATION_CENTER.DISCHARGE.VOLUME')]: discharge.total_volume,
                        [t.instant('SITUATION_CENTER.COMMON.REASON')]: discharge.reason,
                        [t.instant('SITUATION_CENTER.COMMON.CREATED_BY')]: discharge.created_by?.name,
                        [t.instant('SITUATION_CENTER.DISCHARGE.CONFIRMED_BY')]: discharge.approved === true
                            ? t.instant('COMMON.YES')
                            : discharge.approved === false
                                ? t.instant('COMMON.NO')
                                : t.instant('SITUATION_CENTER.COMMON.PENDING'),
                        [t.instant('SITUATION_CENTER.DISCHARGE.CONFIRMED_BY') + ' (' + t.instant('COMMON.NAME') + ')']: discharge.updated_by?.name
                    });
                });
            });
        });
        return flatData;
    }

    openDelete(id: number): void {
        this.selectedId = id;
        this.showDeleteDialog = true;
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
    onDateChange(): void {
        this.updateQueryParams();
    }
    private updateQueryParams(): void {
        if (this.selectedDate) {
            this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { date: this.selectedDate.toISOString() },
                queryParamsHandling: 'merge'
            });
        }
    }
    onSaveSuccess(): void {
        this.loadDischarges();
        this.modelToEdit = null;
    }
}
