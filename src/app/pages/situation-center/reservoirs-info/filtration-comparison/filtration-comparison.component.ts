import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FiltrationComparisonService } from '@/core/services/filtration-comparison.service';
import { TimeService } from '@/core/services/time.service';
import { OrgComparison, ComparisonSnapshot, OrgSimilarDates, UpsertRequest } from '@/core/interfaces/filtration-comparison';
import { OrgComparisonCardComponent } from './components/org-comparison-card.component';

interface OrgSelection {
    filterDate: string | null;
    piezoDate: string | null;
}

@Component({
    selector: 'app-filtration-comparison',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, DatePickerModule, ButtonModule,
        MessageModule, ConfirmDialogModule, TranslateModule,
        OrgComparisonCardComponent
    ],
    templateUrl: './filtration-comparison.component.html',
    styleUrl: './filtration-comparison.component.scss',
    providers: [ConfirmationService]
})
export class FiltrationComparisonComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
    private orgCancellers = new Map<number, Subject<void>>();

    similarDates: OrgSimilarDates[] = [];
    orgData = new Map<number, OrgComparison>();
    orgSelections = new Map<number, OrgSelection>();
    orgLoading = new Set<number>();

    form: FormGroup<{ organizations: FormArray<FormGroup<any>> }> | undefined;
    selectedDate!: Date;
    loadingSimilarDates = false;
    saving = false;
    downloading: 'excel' | 'pdf' | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private comparisonService: FiltrationComparisonService,
        private timeService: TimeService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        const dateParam = this.route.snapshot.queryParamMap.get('date');
        if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
            const [y, m, d] = dateParam.split('-').map(Number);
            this.selectedDate = new Date(y, m - 1, d);
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            this.selectedDate = yesterday;
        }
        this.loadSimilarDates(this.timeService.dateToYMD(this.selectedDate));
    }

    ngOnDestroy(): void {
        this.cancelAllOrgRequests();
        this.destroy$.next();
        this.destroy$.complete();
    }

    onDateChange(date: Date): void {
        if (this.form?.dirty) {
            this.confirmationService.confirm({
                message: this.translate.instant('FILTRATION.UNSAVED_CHANGES'),
                accept: () => {
                    this.selectedDate = date;
                    this.resetState();
                    this.loadSimilarDates(this.timeService.dateToYMD(date));
                },
                reject: () => {
                    this.selectedDate = new Date(this.selectedDate);
                }
            });
        } else {
            this.selectedDate = date;
            this.resetState();
            this.loadSimilarDates(this.timeService.dateToYMD(date));
        }
    }

    private resetState(): void {
        this.cancelAllOrgRequests();
        this.similarDates = [];
        this.orgData.clear();
        this.orgSelections.clear();
        this.orgLoading.clear();
        this.form = undefined;
    }

    private cancelAllOrgRequests(): void {
        for (const [, canceller] of this.orgCancellers) {
            canceller.next();
            canceller.complete();
        }
        this.orgCancellers.clear();
    }

    private loadSimilarDates(date: string): void {
        this.router.navigate([], { queryParams: { date }, queryParamsHandling: 'merge', replaceUrl: true });
        this.loadingSimilarDates = true;
        this.comparisonService.getSimilarDates(date)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.similarDates = data;
                    for (const org of data) {
                        this.orgSelections.set(org.organization_id, { filterDate: null, piezoDate: null });
                    }
                    this.loadingSimilarDates = false;
                },
                error: () => {
                    this.loadingSimilarDates = false;
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.LOAD_ERROR') });
                }
            });
    }

    onFilterDateChange(orgId: number, date: string): void {
        const sel = this.orgSelections.get(orgId);
        if (sel) {
            sel.filterDate = date;
            this.tryLoadOrgData(orgId);
        }
    }

    onPiezoDateChange(orgId: number, date: string): void {
        const sel = this.orgSelections.get(orgId);
        if (sel) {
            sel.piezoDate = date;
            this.tryLoadOrgData(orgId);
        }
    }

    private tryLoadOrgData(orgId: number): void {
        const sel = this.orgSelections.get(orgId);
        if (!sel?.filterDate || !sel?.piezoDate) return;

        // Cancel previous in-flight request for this org
        this.orgCancellers.get(orgId)?.next();
        const canceller$ = new Subject<void>();
        this.orgCancellers.set(orgId, canceller$);

        this.orgLoading.add(orgId);
        const date = this.timeService.dateToYMD(this.selectedDate);

        this.comparisonService.getComparisonData(date, sel.filterDate, sel.piezoDate)
            .pipe(takeUntil(canceller$), takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    const orgComparison = data.find(d => d.organization_id === orgId);
                    if (orgComparison) {
                        this.orgData.set(orgId, orgComparison);
                        this.upsertOrgFormGroup(orgComparison);
                    }
                    this.orgLoading.delete(orgId);
                },
                error: () => {
                    this.orgLoading.delete(orgId);
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.LOAD_ERROR') });
                }
            });
    }

    isOrgLoading(orgId: number): boolean {
        return this.orgLoading.has(orgId);
    }

    getOrgComparison(orgId: number): OrgComparison | undefined {
        return this.orgData.get(orgId);
    }

    getOrgSelection(orgId: number): OrgSelection {
        return this.orgSelections.get(orgId) ?? { filterDate: null, piezoDate: null };
    }

    private upsertOrgFormGroup(org: OrgComparison): void {
        const newGroup = this.buildOrgFormGroup(org);

        if (!this.form) {
            this.form = new FormGroup({ organizations: new FormArray([newGroup]) });
            return;
        }

        const arr = this.form.get('organizations') as FormArray;
        const idx = arr.controls.findIndex(
            (c: any) => c.get('organization_id')?.value === org.organization_id
        );
        if (idx >= 0) {
            arr.setControl(idx, newGroup);
        } else {
            arr.push(newGroup);
        }
    }

    private buildOrgFormGroup(org: OrgComparison): FormGroup {
        const group: any = {
            organization_id: new FormControl(org.organization_id),
            current: this.buildSnapshotFormGroup(org.current)
        };
        group.historical_filter = org.historical_filter
            ? this.buildSnapshotFormGroup(org.historical_filter)
            : new FormControl(null);
        group.historical_piezo = org.historical_piezo
            ? this.buildSnapshotFormGroup(org.historical_piezo)
            : new FormControl(null);
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
                level: new FormControl(p.level),
                anomaly: new FormControl(p.anomaly ?? false)
            }))
        );
        return new FormGroup({
            date: new FormControl(snapshot.date),
            locations,
            piezometers
        });
    }

    getOrgFormGroup(orgId: number): FormGroup | null {
        if (!this.form) return null;
        const arr = this.form.get('organizations') as FormArray;
        return arr.controls.find(
            (c: any) => c.get('organization_id')?.value === orgId
        ) as FormGroup ?? null;
    }

    private buildUpsertRequest(orgId: number, fg: FormGroup): UpsertRequest {
        return {
            organization_id: orgId,
            date: fg.get('date')!.value,
            filtration_measurements: (fg.get('locations') as FormArray).controls.map((c: any) => ({
                location_id: c.get('location_id').value,
                flow_rate: c.get('flow_rate').value
            })),
            piezometer_measurements: (fg.get('piezometers') as FormArray).controls.map((c: any) => ({
                piezometer_id: c.get('piezometer_id').value,
                level: c.get('level').value,
                anomaly: c.get('anomaly').value
            }))
        };
    }

    save(): void {
        this.saving = true;
        const requests: Observable<any>[] = [];
        const savedOrgIds: number[] = [];

        for (const [orgId, orgComparison] of this.orgData) {
            const orgFg = this.getOrgFormGroup(orgId);
            if (!orgFg?.dirty) continue;

            const orgName = orgComparison.organization_name;
            savedOrgIds.push(orgId);

            const currentFg = orgFg.get('current') as FormGroup;
            if (currentFg?.dirty) {
                requests.push(
                    this.comparisonService.saveMeasurements(this.buildUpsertRequest(orgId, currentFg))
                        .pipe(catchError(() => of({ error: true, org: orgName, orgId })))
                );
            }

            const histFilterFg = orgFg.get('historical_filter');
            if (histFilterFg?.dirty && histFilterFg instanceof FormGroup) {
                requests.push(
                    this.comparisonService.saveMeasurements(this.buildUpsertRequest(orgId, histFilterFg))
                        .pipe(catchError(() => of({ error: true, org: orgName, orgId })))
                );
            }

            const histPiezoFg = orgFg.get('historical_piezo');
            if (histPiezoFg?.dirty && histPiezoFg instanceof FormGroup) {
                requests.push(
                    this.comparisonService.saveMeasurements(this.buildUpsertRequest(orgId, histPiezoFg))
                        .pipe(catchError(() => of({ error: true, org: orgName, orgId })))
                );
            }
        }

        if (requests.length === 0) {
            this.saving = false;
            return;
        }

        forkJoin(requests).pipe(takeUntil(this.destroy$)).subscribe({
            next: (results) => {
                const failedResults = results.filter((r: any) => r?.error);
                const failedOrgIds = new Set(failedResults.map((r: any) => r.orgId));
                const failedNames = [...new Set(failedResults.map((r: any) => r.org))];

                if (failedNames.length > 0) {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('FILTRATION.SAVE_PARTIAL_ERROR', { orgs: failedNames.join(', ') })
                    });
                } else {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('FILTRATION.SAVE_SUCCESS') });
                }
                this.saving = false;

                // Reload only successfully saved orgs
                for (const orgId of savedOrgIds) {
                    if (!failedOrgIds.has(orgId)) {
                        this.tryLoadOrgData(orgId);
                    }
                }
            },
            error: () => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: this.translate.instant('FILTRATION.SAVE_ERROR') });
            }
        });
    }

    private getFirstCompleteDates(): OrgSelection | null {
        for (const [, sel] of this.orgSelections) {
            if (sel.filterDate && sel.piezoDate) return sel;
        }
        return null;
    }

    get hasExportDates(): boolean {
        return this.getFirstCompleteDates() !== null;
    }

    download(format: 'excel' | 'pdf'): void {
        this.downloading = format;
        const nextDay = new Date(this.selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const date = this.timeService.dateToYMD(nextDay);
        const ext = format === 'excel' ? 'xlsx' : 'pdf';

        const dates = this.getFirstCompleteDates();
        const filterDate = dates?.filterDate ?? undefined;
        const piezoDate = dates?.piezoDate ?? undefined;

        this.comparisonService.downloadExport(date, format, filterDate, piezoDate)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.downloading = null)
            )
            .subscribe({
                next: (response) => {
                    saveAs(response.body!, `Filter-${date}.${ext}`);
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('FILTRATION.EXPORT_ERROR') });
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
}
