import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, Observable, forkJoin, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FiltrationComparisonService } from '@/core/services/filtration-comparison.service';
import { OrgComparison, ComparisonSnapshot, UpsertRequest } from '@/core/interfaces/filtration-comparison';
import { OrgComparisonCardComponent } from './components/org-comparison-card.component';

@Component({
    selector: 'app-filtration-comparison',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, DatePickerModule, ButtonModule,
        MessageModule, TooltipModule, ConfirmDialogModule, TranslateModule,
        OrgComparisonCardComponent
    ],
    templateUrl: './filtration-comparison.component.html',
    styleUrl: './filtration-comparison.component.scss'
})
export class FiltrationComparisonComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    data: OrgComparison[] = [];
    form!: FormGroup;
    selectedDate!: Date;
    loading = false;
    saving = false;

    constructor(
        private comparisonService: FiltrationComparisonService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        this.selectedDate = yesterday;
        this.loadComparison(this.dateToYMD(yesterday));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onDateChange(date: Date): void {
        if (this.form?.dirty) {
            this.confirmationService.confirm({
                message: this.translate.instant('FILTRATION.UNSAVED_CHANGES'),
                accept: () => {
                    this.selectedDate = date;
                    this.loadComparison(this.dateToYMD(date));
                },
                reject: () => {
                    this.selectedDate = new Date(this.selectedDate);
                }
            });
        } else {
            this.selectedDate = date;
            this.loadComparison(this.dateToYMD(date));
        }
    }

    private loadComparison(date: string): void {
        this.loading = true;
        this.comparisonService.getComparison(date)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.data = data;
                    this.buildForm(data);
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('FILTRATION.SAVE_ERROR') });
                }
            });
    }

    private buildForm(data: OrgComparison[]): void {
        const orgs = new FormArray(data.map(org => this.buildOrgFormGroup(org)));
        this.form = new FormGroup({ organizations: orgs });
    }

    private buildOrgFormGroup(org: OrgComparison): FormGroup {
        const group: any = {
            organization_id: new FormControl(org.organization_id),
            current: this.buildSnapshotFormGroup(org.current)
        };
        group.historical = org.historical ? this.buildSnapshotFormGroup(org.historical) : new FormControl(null);
        return new FormGroup(group);
    }

    private buildSnapshotFormGroup(snapshot: ComparisonSnapshot): FormGroup {
        const locations = new FormArray(
            snapshot.locations.map(loc => new FormGroup({
                location_id: new FormControl(loc.id),
                flow_rate: new FormControl(loc.flow_rate)
            }))
        );
        const piezometers = new FormArray(
            snapshot.piezometers.map(p => new FormGroup({
                piezometer_id: new FormControl(p.id),
                level: new FormControl(p.level)
            }))
        );
        return new FormGroup({
            date: new FormControl(snapshot.date),
            locations,
            piezometers
        });
    }

    get orgFormArray(): FormArray {
        return this.form?.get('organizations') as FormArray;
    }

    getOrgFormGroup(index: number): FormGroup {
        return this.orgFormArray.at(index) as FormGroup;
    }

    save(): void {
        this.saving = true;
        const requests: Observable<any>[] = [];
        const orgNames: string[] = [];

        for (let i = 0; i < this.data.length; i++) {
            const orgFg = this.getOrgFormGroup(i);
            if (!orgFg.dirty) continue;

            const orgId = this.data[i].organization_id;
            const orgName = this.data[i].organization_name;
            orgNames.push(orgName);

            // Current
            const currentFg = orgFg.get('current') as FormGroup;
            const currentReq: UpsertRequest = {
                organization_id: orgId,
                date: currentFg.get('date')!.value,
                filtration_measurements: (currentFg.get('locations') as FormArray).controls.map((c: any) => ({
                    location_id: c.get('location_id').value,
                    flow_rate: c.get('flow_rate').value
                })),
                piezometer_measurements: (currentFg.get('piezometers') as FormArray).controls.map((c: any) => ({
                    piezometer_id: c.get('piezometer_id').value,
                    level: c.get('level').value
                }))
            };
            requests.push(
                this.comparisonService.saveMeasurements(currentReq).pipe(catchError(() => of({ error: true, org: orgName })))
            );

            // Historical (if exists)
            const histFg = orgFg.get('historical');
            if (histFg?.value && histFg instanceof FormGroup) {
                const histReq: UpsertRequest = {
                    organization_id: orgId,
                    date: histFg.get('date')!.value,
                    filtration_measurements: (histFg.get('locations') as FormArray).controls.map((c: any) => ({
                        location_id: c.get('location_id').value,
                        flow_rate: c.get('flow_rate').value
                    })),
                    piezometer_measurements: (histFg.get('piezometers') as FormArray).controls.map((c: any) => ({
                        piezometer_id: c.get('piezometer_id').value,
                        level: c.get('level').value
                    }))
                };
                requests.push(
                    this.comparisonService.saveMeasurements(histReq).pipe(catchError(() => of({ error: true, org: orgName })))
                );
            }
        }

        if (requests.length === 0) {
            this.saving = false;
            return;
        }

        forkJoin(requests).pipe(takeUntil(this.destroy$)).subscribe({
            next: (results) => {
                const failed = results.filter((r: any) => r?.error).map((r: any) => r.org);
                if (failed.length > 0) {
                    const uniqueFailed = [...new Set(failed)];
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('FILTRATION.SAVE_PARTIAL_ERROR', { orgs: uniqueFailed.join(', ') })
                    });
                } else {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('FILTRATION.SAVE_SUCCESS') });
                }
                this.saving = false;
                this.loadComparison(this.dateToYMD(this.selectedDate));
            }
        });
    }

    canDeactivate(): boolean | Observable<boolean> {
        if (!this.form?.dirty) return true;
        return new Observable<boolean>(observer => {
            this.confirmationService.confirm({
                message: this.translate.instant('FILTRATION.UNSAVED_CHANGES'),
                accept: () => { observer.next(true); observer.complete(); },
                reject: () => { observer.next(false); observer.complete(); }
            });
        });
    }

    private dateToYMD(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
