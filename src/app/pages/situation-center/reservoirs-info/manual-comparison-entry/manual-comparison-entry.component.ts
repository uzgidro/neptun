import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Observable, forkJoin, of } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ManualComparisonService } from '@/core/services/manual-comparison.service';
import { OrganizationService } from '@/core/services/organization.service';
import { TimeService } from '@/core/services/time.service';
import { ManualMeasurementsResponse, ManualMeasurementsRequest, ManualFilterEntry, ManualPiezoEntry } from '@/core/interfaces/manual-comparison';
import { HasUnsavedChanges } from '@/core/guards/auth.guard';
import { downloadBlob } from '@/core/utils/download';

interface OrgState {
    orgId: number;
    orgName: string;
    filterEntries: ManualFilterEntry[];
    piezoEntries: ManualPiezoEntry[];
    form: FormGroup;
    historicalFilterDate: Date | null;
    historicalPiezoDate: Date | null;
    originalHistoricalFilterDate: string;
    originalHistoricalPiezoDate: string;
}

@Component({
    selector: 'app-manual-comparison-entry',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule,
        DatePickerModule, ButtonModule, InputNumberModule,
        CheckboxModule, MessageModule, TranslateModule
    ],
    templateUrl: './manual-comparison-entry.component.html',
    styleUrl: './manual-comparison-entry.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManualComparisonEntryComponent implements OnInit, OnDestroy, HasUnsavedChanges {
    private destroy$ = new Subject<void>();

    orgStates: OrgState[] = [];
    selectedDate!: Date;

    loading = false;
    saving = false;
    downloading: 'excel' | 'pdf' | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private manualComparisonService: ManualComparisonService,
        private organizationService: OrganizationService,
        private timeService: TimeService,
        private messageService: MessageService,
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
        this.loadOrganizations();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadOrganizations(): void {
        this.loading = true;
        this.organizationService.getOrganizationsFlat()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (orgs) => {
                    const reservoirs = orgs.filter(org => org.types?.includes('reservoir'));
                    this.loadAllMeasurements(reservoirs.map(o => ({ id: o.id, name: o.name })));
                },
                error: () => {
                    this.loading = false;
                    this.cdr.markForCheck();
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.LOAD_ERROR') });
                }
            });
    }

    private loadAllMeasurements(orgs: { id: number; name: string }[]): void {
        const date = this.timeService.dateToYMD(this.selectedDate);
        this.router.navigate([], { queryParams: { date }, queryParamsHandling: 'merge', replaceUrl: true });

        const requests = orgs.map(org =>
            this.manualComparisonService.getMeasurements(org.id, date).pipe(
                catchError(() => of(null))
            )
        );

        forkJoin(requests)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => { this.loading = false; this.cdr.markForCheck(); })
            )
            .subscribe({
                next: (responses) => {
                    this.orgStates = responses
                        .map((resp, i) => resp ? this.buildOrgState(orgs[i], resp) : null)
                        .filter((s): s is OrgState => s !== null);
                }
            });
    }

    onDateChange(date: Date): void {
        if (this.isAnyDirty()) {
            if (!confirm(this.translate.instant('FILTRATION.UNSAVED_CHANGES'))) {
                this.selectedDate = new Date(this.selectedDate);
                return;
            }
        }
        this.selectedDate = date;
        this.loading = true;
        this.orgStates = [];
        this.cdr.markForCheck();
        const orgs = this.orgStates.length > 0
            ? this.orgStates.map(s => ({ id: s.orgId, name: s.orgName }))
            : [];
        // Reload organizations to get fresh list
        this.loadOrganizations();
    }

    private buildOrgState(org: { id: number; name: string }, response: ManualMeasurementsResponse): OrgState {
        const form = new FormGroup({
            filters: new FormArray(response.filters.map(f => new FormGroup({
                location_id: new FormControl(f.location_id),
                flow_rate: new FormControl(f.flow_rate),
                historical_flow_rate: new FormControl(f.historical_flow_rate)
            }))),
            piezometers: new FormArray(response.piezometers.map(p => new FormGroup({
                piezometer_id: new FormControl(p.piezometer_id),
                level: new FormControl(p.level),
                anomaly: new FormControl(p.anomaly),
                historical_level: new FormControl(p.historical_level)
            })))
        });

        return {
            orgId: org.id,
            orgName: response.organization_name || org.name,
            filterEntries: response.filters,
            piezoEntries: response.piezometers,
            form,
            historicalFilterDate: this.parseDate(response.historical_filter_date),
            historicalPiezoDate: this.parseDate(response.historical_piezo_date),
            originalHistoricalFilterDate: response.historical_filter_date ?? '',
            originalHistoricalPiezoDate: response.historical_piezo_date ?? ''
        };
    }

    getFiltersFormArray(state: OrgState): FormArray {
        return state.form.get('filters') as FormArray;
    }

    getPiezometersFormArray(state: OrgState): FormArray {
        return state.form.get('piezometers') as FormArray;
    }

    // --- Filtration calculations ---

    getFilterDelta(state: OrgState, index: number): number | null {
        const fa = this.getFiltersFormArray(state);
        const current = fa.at(index)?.get('flow_rate')?.value;
        const historical = fa.at(index)?.get('historical_flow_rate')?.value;
        if (current == null || historical == null) return null;
        return current - historical;
    }

    getFilterDeviation(state: OrgState, index: number): number | null {
        const norm = state.filterEntries[index]?.norm;
        if (norm == null) return null;
        const val = this.getFiltersFormArray(state).at(index)?.get('flow_rate')?.value;
        if (val == null) return null;
        return val - norm;
    }

    filterExceedsNorm(state: OrgState, index: number): boolean {
        const norm = state.filterEntries[index]?.norm;
        if (norm == null) return false;
        const val = this.getFiltersFormArray(state).at(index)?.get('flow_rate')?.value;
        return val != null && val > norm;
    }

    totalCurrentFlow(state: OrgState): number | null {
        return this.sumFormArrayField(this.getFiltersFormArray(state), 'flow_rate');
    }

    totalHistoricalFlow(state: OrgState): number | null {
        return this.sumFormArrayField(this.getFiltersFormArray(state), 'historical_flow_rate');
    }

    totalFilterDelta(state: OrgState): number | null {
        const c = this.totalCurrentFlow(state);
        const h = this.totalHistoricalFlow(state);
        if (c == null || h == null) return null;
        return c - h;
    }

    totalFilterNorm(state: OrgState): number | null {
        const norms = state.filterEntries.map(f => f.norm).filter((n): n is number => n != null);
        return norms.length ? norms.reduce((a, b) => a + b, 0) : null;
    }

    totalFilterDeviation(state: OrgState): number | null {
        const c = this.totalCurrentFlow(state);
        const n = this.totalFilterNorm(state);
        if (c == null || n == null) return null;
        return c - n;
    }

    // --- Piezometer calculations ---

    getPiezoDelta(state: OrgState, index: number): number | null {
        const fa = this.getPiezometersFormArray(state);
        const current = fa.at(index)?.get('level')?.value;
        const historical = fa.at(index)?.get('historical_level')?.value;
        if (current == null || historical == null) return null;
        return current - historical;
    }

    getPiezoDeviation(state: OrgState, index: number): number | null {
        const norm = state.piezoEntries[index]?.norm;
        if (norm == null) return null;
        const val = this.getPiezometersFormArray(state).at(index)?.get('level')?.value;
        if (val == null) return null;
        return val - norm;
    }

    piezoExceedsNorm(state: OrgState, index: number): boolean {
        const norm = state.piezoEntries[index]?.norm;
        if (norm == null) return false;
        const val = this.getPiezometersFormArray(state).at(index)?.get('level')?.value;
        return val != null && val > norm;
    }

    isPiezoAnomaly(state: OrgState, index: number): boolean {
        return this.getPiezometersFormArray(state).at(index)?.get('anomaly')?.value === true;
    }

    hasAnyPiezoAnomaly(state: OrgState): boolean {
        return this.getPiezometersFormArray(state).controls.some(c => c.get('anomaly')?.value === true);
    }

    // --- Save ---

    save(): void {
        this.saving = true;
        const date = this.timeService.dateToYMD(this.selectedDate);
        const dirtyStates = this.orgStates.filter(s => this.isOrgDirty(s));

        const requests = dirtyStates.map(state => {
            const filtersFA = this.getFiltersFormArray(state);
            const piezosFA = this.getPiezometersFormArray(state);

            const filters = filtersFA.controls.map(c => ({
                location_id: c.get('location_id')!.value,
                flow_rate: c.get('flow_rate')!.value,
                historical_flow_rate: c.get('historical_flow_rate')!.value
            }));
            const piezos = piezosFA.controls.map(c => ({
                piezometer_id: c.get('piezometer_id')!.value,
                level: c.get('level')!.value,
                anomaly: c.get('anomaly')!.value,
                historical_level: c.get('historical_level')!.value
            }));

            const payload: ManualMeasurementsRequest = {
                organization_id: state.orgId,
                date,
                historical_filter_date: this.formatDate(state.historicalFilterDate) || undefined,
                historical_piezo_date: this.formatDate(state.historicalPiezoDate) || undefined,
                ...(filters.length > 0 && { filters }),
                ...(piezos.length > 0 && { piezos })
            };

            return this.manualComparisonService.saveMeasurements(payload).pipe(
                catchError(() => of({ error: true, org: state.orgName }))
            );
        });

        if (requests.length === 0) {
            this.saving = false;
            return;
        }

        forkJoin(requests)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => { this.saving = false; this.cdr.markForCheck(); })
            )
            .subscribe({
                next: (results) => {
                    const failed = results.filter((r: any) => r?.error);
                    if (failed.length > 0) {
                        const names = failed.map((r: any) => r.org).join(', ');
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('FILTRATION.SAVE_PARTIAL_ERROR', { orgs: names })
                        });
                    } else {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('FILTRATION.SAVE_SUCCESS') });
                    }
                    // Reload all data
                    this.loadOrganizations();
                }
            });
    }

    // --- Export ---

    download(format: 'excel' | 'pdf'): void {
        this.downloading = format;
        const nextDay = new Date(this.selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const date = this.timeService.dateToYMD(nextDay);
        const ext = format === 'excel' ? 'xlsx' : 'pdf';

        this.manualComparisonService.downloadExport(date, format)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => { this.downloading = null; this.cdr.markForCheck(); })
            )
            .subscribe({
                next: (response) => {
                    downloadBlob(response.body!, `ManualComparison-${this.timeService.dateToYMD(this.selectedDate)}.${ext}`);
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('FILTRATION.EXPORT_ERROR') });
                }
            });
    }

    // --- Dirty tracking ---

    private isOrgDirty(state: OrgState): boolean {
        return state.form.dirty
            || this.formatDate(state.historicalFilterDate) !== state.originalHistoricalFilterDate
            || this.formatDate(state.historicalPiezoDate) !== state.originalHistoricalPiezoDate;
    }

    private isAnyDirty(): boolean {
        return this.orgStates.some(s => this.isOrgDirty(s));
    }

    get isSaveDisabled(): boolean {
        return !this.isAnyDirty() || this.saving;
    }

    canDeactivate(): boolean {
        if (!this.isAnyDirty()) return true;
        return confirm(this.translate.instant('FILTRATION.UNSAVED_CHANGES'));
    }

    get currentDateFormatted(): string {
        return this.timeService.dateToYMD(this.selectedDate);
    }

    private parseDate(value: string | null | undefined): Date | null {
        if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
        const [y, m, d] = value.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    private formatDate(date: Date | null): string {
        if (!date) return '';
        return this.timeService.dateToYMD(date);
    }

    private sumFormArrayField(fa: FormArray, field: string): number | null {
        const values = fa.controls
            .map(c => c.get(field)?.value)
            .filter(v => v != null) as number[];
        return values.length ? values.reduce((a, b) => a + b, 0) : null;
    }
}
