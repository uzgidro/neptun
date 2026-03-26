import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { downloadBlob } from '@/core/utils/download';
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
    clearFilterDate?: boolean;
    clearPiezoDate?: boolean;
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
                    this.loadAllCurrentData();
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
            sel.clearFilterDate = false;
            this.tryLoadOrgData(orgId);
        }
    }

    onPiezoDateChange(orgId: number, date: string): void {
        const sel = this.orgSelections.get(orgId);
        if (sel) {
            sel.piezoDate = date;
            sel.clearPiezoDate = false;
            this.tryLoadOrgData(orgId);
        }
    }

    onFilterDateClear(orgId: number): void {
        const sel = this.orgSelections.get(orgId);
        if (sel) {
            sel.filterDate = null;
            sel.clearFilterDate = true;
            // Remove historical_filter from form
            const orgFg = this.getOrgFormGroup(orgId);
            if (orgFg) {
                orgFg.setControl('historical_filter', new FormControl(null));
                orgFg.markAsDirty();
            }
            // Remove historical_filter from orgData
            const orgData = this.orgData.get(orgId);
            if (orgData) {
                orgData.historical_filter = null;
            }
        }
    }

    onPiezoDateClear(orgId: number): void {
        const sel = this.orgSelections.get(orgId);
        if (sel) {
            sel.piezoDate = null;
            sel.clearPiezoDate = true;
            // Remove historical_piezo from form
            const orgFg = this.getOrgFormGroup(orgId);
            if (orgFg) {
                orgFg.setControl('historical_piezo', new FormControl(null));
                orgFg.markAsDirty();
            }
            // Remove historical_piezo from orgData
            const orgData = this.orgData.get(orgId);
            if (orgData) {
                orgData.historical_piezo = null;
            }
        }
    }

    private loadAllCurrentData(): void {
        const date = this.timeService.dateToYMD(this.selectedDate);
        for (const org of this.similarDates) {
            this.orgLoading.add(org.organization_id);
        }
        this.comparisonService.getComparisonData(date)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    for (const orgComparison of data) {
                        this.orgData.set(orgComparison.organization_id, orgComparison);
                        this.upsertOrgFormGroup(orgComparison);

                        const sel = this.orgSelections.get(orgComparison.organization_id);
                        if (sel) {
                            if (orgComparison.filter_comparison_date) {
                                sel.filterDate = orgComparison.filter_comparison_date;
                            }
                            if (orgComparison.piezo_comparison_date) {
                                sel.piezoDate = orgComparison.piezo_comparison_date;
                            }
                        }
                        this.orgLoading.delete(orgComparison.organization_id);
                    }
                    // Clear loading for orgs not in response
                    for (const org of this.similarDates) {
                        this.orgLoading.delete(org.organization_id);
                    }
                },
                error: () => {
                    for (const org of this.similarDates) {
                        this.orgLoading.delete(org.organization_id);
                    }
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.LOAD_ERROR') });
                }
            });
    }

    private tryLoadOrgData(orgId: number): void {
        const sel = this.orgSelections.get(orgId);

        // Cancel previous in-flight request for this org
        this.orgCancellers.get(orgId)?.next();
        const canceller$ = new Subject<void>();
        this.orgCancellers.set(orgId, canceller$);

        this.orgLoading.add(orgId);
        const date = this.timeService.dateToYMD(this.selectedDate);

        this.comparisonService.getComparisonData(date, sel?.filterDate ?? undefined, sel?.piezoDate ?? undefined)
            .pipe(takeUntil(canceller$), takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    const orgComparison = data.find(d => d.organization_id === orgId);
                    if (orgComparison) {
                        this.orgData.set(orgId, orgComparison);
                        this.upsertOrgFormGroup(orgComparison);

                        // Restore per-org dates from backend
                        if (sel) {
                            if (orgComparison.filter_comparison_date) {
                                sel.filterDate = orgComparison.filter_comparison_date;
                            }
                            if (orgComparison.piezo_comparison_date) {
                                sel.piezoDate = orgComparison.piezo_comparison_date;
                            }
                        }
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

    getDateOptions(orgId: number): { label: string; value: string }[] {
        const orgSimilar = this.similarDates.find(s => s.organization_id === orgId);
        return orgSimilar?.similar_dates.map(sd => ({ label: sd.date, value: sd.date })) ?? [];
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

    private extractLocations(fg: FormGroup): { location_id: number; flow_rate: number | null }[] {
        return (fg.get('locations') as FormArray).controls.map((c: any) => ({
            location_id: c.get('location_id').value,
            flow_rate: c.get('flow_rate').value
        }));
    }

    private extractPiezometers(fg: FormGroup): { piezometer_id: number; level: number | null; anomaly?: boolean }[] {
        return (fg.get('piezometers') as FormArray).controls.map((c: any) => ({
            piezometer_id: c.get('piezometer_id').value,
            level: c.get('level').value,
            anomaly: c.get('anomaly').value
        }));
    }

    private buildFullUpsertRequest(orgId: number): UpsertRequest {
        const orgFg = this.getOrgFormGroup(orgId)!;
        const sel = this.orgSelections.get(orgId);
        const currentFg = orgFg.get('current') as FormGroup;

        const payload: UpsertRequest = {
            organization_id: orgId,
            date: currentFg.get('date')!.value
        };

        // Historical filtration
        const histFilterFg = orgFg.get('historical_filter');
        const histFilterDirty = histFilterFg?.dirty && histFilterFg instanceof FormGroup;
        if (histFilterDirty) {
            payload.filter_comparison_date = sel?.filterDate ?? null;
            payload.historical_filtration_measurements = this.extractLocations(histFilterFg as FormGroup);
        }

        // Historical piezometers
        const histPiezoFg = orgFg.get('historical_piezo');
        const histPiezoDirty = histPiezoFg?.dirty && histPiezoFg instanceof FormGroup;
        if (histPiezoDirty) {
            payload.piezo_comparison_date = sel?.piezoDate ?? null;
            payload.historical_piezometer_measurements = this.extractPiezometers(histPiezoFg as FormGroup);
        }

        // Clear flags
        if (sel?.clearFilterDate) {
            payload.clear_filter_comparison_date = true;
        }
        if (sel?.clearPiezoDate) {
            payload.clear_piezo_comparison_date = true;
        }

        // Always include current measurements — API requires at least one array non-empty,
        // and clear flags require their respective current measurements
        const needCurrent = currentFg.dirty || histFilterDirty || histPiezoDirty
            || sel?.clearFilterDate || sel?.clearPiezoDate;
        if (needCurrent) {
            payload.filtration_measurements = this.extractLocations(currentFg);
            payload.piezometer_measurements = this.extractPiezometers(currentFg);
        }

        return payload;
    }

    save(): void {
        this.saving = true;
        const requests: Observable<any>[] = [];
        const savedOrgIds: number[] = [];

        for (const [orgId, orgComparison] of this.orgData) {
            const orgFg = this.getOrgFormGroup(orgId);
            const sel = this.orgSelections.get(orgId);
            const hasClear = sel?.clearFilterDate || sel?.clearPiezoDate;

            if (!orgFg?.dirty && !hasClear) continue;

            const orgName = orgComparison.organization_name;
            savedOrgIds.push(orgId);

            requests.push(
                this.comparisonService.saveMeasurements(this.buildFullUpsertRequest(orgId))
                    .pipe(catchError(() => of({ error: true, org: orgName, orgId })))
            );
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

                // Reset clear flags and reload successfully saved orgs
                for (const orgId of savedOrgIds) {
                    if (!failedOrgIds.has(orgId)) {
                        const sel = this.orgSelections.get(orgId);
                        if (sel) {
                            sel.clearFilterDate = false;
                            sel.clearPiezoDate = false;
                        }
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

    private getFirstAvailableDates(): { filterDate?: string; piezoDate?: string } {
        for (const [, sel] of this.orgSelections) {
            if (sel.filterDate || sel.piezoDate) {
                return {
                    filterDate: sel.filterDate ?? undefined,
                    piezoDate: sel.piezoDate ?? undefined
                };
            }
        }
        return {};
    }

    get hasExportDates(): boolean {
        return this.orgData.size > 0;
    }

    get hasPendingClears(): boolean {
        for (const [, sel] of this.orgSelections) {
            if (sel.clearFilterDate || sel.clearPiezoDate) return true;
        }
        return false;
    }

    download(format: 'excel' | 'pdf'): void {
        this.downloading = format;
        const nextDay = new Date(this.selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const date = this.timeService.dateToYMD(nextDay);
        const ext = format === 'excel' ? 'xlsx' : 'pdf';

        const dates = this.getFirstAvailableDates();
        const filterDate = dates.filterDate;
        const piezoDate = dates.piezoDate;

        this.comparisonService.downloadExport(date, format, filterDate, piezoDate)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.downloading = null)
            )
            .subscribe({
                next: (response) => {
                    downloadBlob(response.body!, `Filter-${date}.${ext}`);
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
