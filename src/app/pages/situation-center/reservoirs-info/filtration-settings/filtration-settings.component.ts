import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { FiltrationService } from '@/core/services/filtration.service';
import { OrganizationService } from '@/core/services/organization.service';
import { Location, Piezometer, PiezometerCountsRecord } from '@/core/interfaces/filtration';
import { LocationDialogComponent } from './components/location-dialog.component';
import { PiezometerDialogComponent } from './components/piezometer-dialog.component';

@Component({
    selector: 'app-filtration-settings',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, TableModule, ButtonModule, SelectModule,
        MessageModule, InputNumberModule, TranslateModule, LocationDialogComponent,
        PiezometerDialogComponent
    ],
    templateUrl: './filtration-settings.component.html',
    styleUrl: './filtration-settings.component.scss'
})
export class FiltrationSettingsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    organizations: any[] = [];
    selectedOrganizationId: number | null = null;

    locations: Location[] = [];
    piezometers: Piezometer[] = [];
    loading = false;

    // Piezometer counts
    piezometerCounts: PiezometerCountsRecord | null = null;
    piezometerCountsForm!: FormGroup;
    savingCounts = false;

    // Location dialog
    locationDialogVisible = false;
    editingLocation: Location | null = null;
    locationSubmitting = false;

    // Piezometer dialog
    piezometerDialogVisible = false;
    editingPiezometer: Piezometer | null = null;
    piezometerSubmitting = false;

    constructor(
        private fb: FormBuilder,
        private filtrationService: FiltrationService,
        private organizationService: OrganizationService,
        private messageService: MessageService,
        private translate: TranslateService
    ) {
        this.initCountsForm();
    }

    ngOnInit(): void {
        this.organizationService.getOrganizationsFlat()
            .pipe(takeUntil(this.destroy$))
            .subscribe(orgs => {
                this.organizations = orgs
                    .filter((o: any) => o.types?.includes('reservoir'))
                    .map((o: any) => ({ label: o.name, value: o.id }));
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onOrganizationChange(): void {
        if (!this.selectedOrganizationId) return;
        this.loadData();
    }

    private initCountsForm(): void {
        this.piezometerCountsForm = this.fb.group({
            pressure_count: [0],
            non_pressure_count: [0]
        });
    }

    private loadData(): void {
        if (!this.selectedOrganizationId) return;
        this.loading = true;
        forkJoin({
            locations: this.filtrationService.getLocations(this.selectedOrganizationId),
            piezometers: this.filtrationService.getPiezometers(this.selectedOrganizationId),
            counts: this.filtrationService.getPiezometerCounts(this.selectedOrganizationId).pipe(
                catchError(() => of(null))
            )
        }).pipe(takeUntil(this.destroy$))
          .subscribe({
            next: ({ locations, piezometers, counts }) => {
                this.locations = locations;
                this.piezometers = piezometers;
                this.piezometerCounts = counts;
                this.piezometerCountsForm.patchValue({
                    pressure_count: counts?.pressure_count ?? 0,
                    non_pressure_count: counts?.non_pressure_count ?? 0
                });
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: this.translate.instant('FILTRATION.SAVE_ERROR') });
            }
        });
    }

    // Piezometer counts
    onSavePiezometerCounts(): void {
        if (!this.selectedOrganizationId) return;
        this.savingCounts = true;
        this.filtrationService.upsertPiezometerCounts({
            organization_id: this.selectedOrganizationId,
            ...this.piezometerCountsForm.value
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.savingCounts = false;
                this.messageService.add({ severity: 'success', summary: this.translate.instant('FILTRATION.SAVE_SUCCESS') });
                this.loadData();
            },
            error: () => {
                this.savingCounts = false;
                this.messageService.add({ severity: 'error', summary: this.translate.instant('FILTRATION.SAVE_ERROR') });
            }
        });
    }

    // Location CRUD
    openNewLocation(): void {
        this.editingLocation = null;
        this.locationDialogVisible = true;
    }

    editLocation(loc: Location): void {
        this.editingLocation = loc;
        this.locationDialogVisible = true;
    }

    onSaveLocation(formValue: any): void {
        this.locationSubmitting = true;
        const obs = this.editingLocation
            ? this.filtrationService.updateLocation(this.editingLocation.id, formValue)
            : this.filtrationService.createLocation({ ...formValue, organization_id: this.selectedOrganizationId });

        obs.pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.locationDialogVisible = false;
                this.locationSubmitting = false;
                this.messageService.add({ severity: 'success', summary: this.translate.instant('FILTRATION.SAVE_SUCCESS') });
                this.loadData();
            },
            error: (err) => {
                this.locationSubmitting = false;
                this.showSaveError(err);
            }
        });
    }

    confirmDeleteLocation(loc: Location): void {
        if (confirm(this.translate.instant('FILTRATION.DELETE_LOCATION_CONFIRM'))) {
            this.performDelete(() => this.filtrationService.deleteLocation(loc.id));
        }
    }

    // Piezometer CRUD
    openNewPiezometer(): void {
        this.editingPiezometer = null;
        this.piezometerDialogVisible = true;
    }

    editPiezometer(p: Piezometer): void {
        this.editingPiezometer = p;
        this.piezometerDialogVisible = true;
    }

    onSavePiezometer(formValue: any): void {
        this.piezometerSubmitting = true;
        const obs = this.editingPiezometer
            ? this.filtrationService.updatePiezometer(this.editingPiezometer.id, formValue)
            : this.filtrationService.createPiezometer({ ...formValue, organization_id: this.selectedOrganizationId });

        obs.pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.piezometerDialogVisible = false;
                this.piezometerSubmitting = false;
                this.messageService.add({ severity: 'success', summary: this.translate.instant('FILTRATION.SAVE_SUCCESS') });
                this.loadData();
            },
            error: (err) => {
                this.piezometerSubmitting = false;
                this.showSaveError(err);
            }
        });
    }

    confirmDeletePiezometer(p: Piezometer): void {
        if (confirm(this.translate.instant('FILTRATION.DELETE_PIEZOMETER_CONFIRM'))) {
            this.performDelete(() => this.filtrationService.deletePiezometer(p.id));
        }
    }

    private showSaveError(err: any): void {
        const msg = err.status === 409
            ? this.translate.instant('FILTRATION.NAME_EXISTS')
            : this.translate.instant('FILTRATION.SAVE_ERROR');
        this.messageService.add({ severity: 'error', summary: msg });
    }

    private performDelete(deleteFn: () => Observable<any>): void {
        deleteFn().pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.DELETE') });
                this.loadData();
            },
            error: () => this.messageService.add({ severity: 'error', summary: this.translate.instant('FILTRATION.SAVE_ERROR') })
        });
    }
}
