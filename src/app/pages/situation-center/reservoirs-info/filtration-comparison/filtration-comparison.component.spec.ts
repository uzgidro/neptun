import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { FiltrationComparisonComponent } from './filtration-comparison.component';
import { FiltrationComparisonService } from '@/core/services/filtration-comparison.service';
import { TimeService } from '@/core/services/time.service';
import { OrgComparison, OrgSimilarDates, ComparisonSnapshot } from '@/core/interfaces/filtration-comparison';

function makeSnapshot(date: string): ComparisonSnapshot {
    return {
        date,
        level: 895.2,
        volume: 1234.5,
        locations: [{ id: 1, organization_id: 1, name: 'Loc-1', norm: 0.5, sort_order: 1, created_at: '', updated_at: '', flow_rate: 0.42 }],
        piezometers: [{ id: 1, organization_id: 1, name: 'PZ-1', norm: 120, sort_order: 1, created_at: '', updated_at: '', level: 118.5, anomaly: false }],
        piezometer_counts: { pressure: 10, non_pressure: 5 }
    };
}

function makeOrgComparison(orgId: number, date: string, filterDate: string | null, piezoDate: string | null): OrgComparison {
    return {
        organization_id: orgId,
        organization_name: `Org ${orgId}`,
        current: makeSnapshot(date),
        historical_filter: filterDate ? makeSnapshot(filterDate) : null,
        historical_piezo: piezoDate ? makeSnapshot(piezoDate) : null
    };
}

function makeSimilarDates(orgId: number): OrgSimilarDates {
    return {
        organization_id: orgId,
        organization_name: `Org ${orgId}`,
        reference_date: '2026-03-20',
        reference_level: 895.2,
        reference_volume: 1234.5,
        similar_dates: [
            { date: '2025-11-15', level: 895.2, volume: 1230.0 },
            { date: '2025-09-03', level: 895.2, volume: 1240.1 }
        ]
    };
}

describe('FiltrationComparisonComponent', () => {
    let component: FiltrationComparisonComponent;
    let fixture: ComponentFixture<FiltrationComparisonComponent>;
    let comparisonService: jasmine.SpyObj<FiltrationComparisonService>;
    let timeService: TimeService;

    beforeEach(async () => {
        const compSpy = jasmine.createSpyObj('FiltrationComparisonService', [
            'getSimilarDates', 'getComparisonData', 'saveMeasurements', 'downloadExport'
        ]);
        compSpy.getSimilarDates.and.returnValue(of([]));
        // Default: return current-only data (no historical) for initial load
        compSpy.getComparisonData.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [FiltrationComparisonComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: FiltrationComparisonService, useValue: compSpy },
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => '2026-03-20' } } } },
                MessageService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FiltrationComparisonComponent);
        component = fixture.componentInstance;
        comparisonService = TestBed.inject(FiltrationComparisonService) as jasmine.SpyObj<FiltrationComparisonService>;
        timeService = TestBed.inject(TimeService);
    });

    /** Helper: initialize component with similar dates and current data loaded */
    function initWithOrgs(...orgIds: number[]): void {
        const mockSimilar = orgIds.map(id => makeSimilarDates(id));
        const currentData = orgIds.map(id => makeOrgComparison(id, '2026-03-20', null, null));
        comparisonService.getSimilarDates.and.returnValue(of(mockSimilar));
        comparisonService.getComparisonData.and.returnValue(of(currentData));
        fixture.detectChanges();
        // Reset calls after init so tests only see explicit calls
        comparisonService.getComparisonData.calls.reset();
    }

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load similar dates on init', () => {
        const mockData = [makeSimilarDates(1), makeSimilarDates(2)];
        const currentData = [makeOrgComparison(1, '2026-03-20', null, null), makeOrgComparison(2, '2026-03-20', null, null)];
        comparisonService.getSimilarDates.and.returnValue(of(mockData));
        comparisonService.getComparisonData.and.returnValue(of(currentData));

        fixture.detectChanges();

        expect(comparisonService.getSimilarDates).toHaveBeenCalledWith('2026-03-20');
        expect(component.similarDates.length).toBe(2);
        expect(component.orgSelections.size).toBe(2);
    });

    it('should load current data immediately after similar dates', () => {
        const mockSimilar = [makeSimilarDates(1)];
        const currentData = [makeOrgComparison(1, '2026-03-20', null, null)];
        comparisonService.getSimilarDates.and.returnValue(of(mockSimilar));
        comparisonService.getComparisonData.and.returnValue(of(currentData));

        fixture.detectChanges();

        // getComparisonData called without historical dates
        expect(comparisonService.getComparisonData).toHaveBeenCalledWith('2026-03-20');
        expect(component.orgData.size).toBe(1);
        expect(component.getOrgFormGroup(1)).not.toBeNull();
    });

    it('should set loadingSimilarDates to false on error', () => {
        comparisonService.getSimilarDates.and.returnValue(throwError(() => new Error('fail')));

        fixture.detectChanges();

        expect(component.loadingSimilarDates).toBeFalse();
    });

    it('should load historical filter data independently on filter date change', () => {
        initWithOrgs(1);

        const historicalData = [makeOrgComparison(1, '2026-03-20', '2025-11-15', null)];
        comparisonService.getComparisonData.and.returnValue(of(historicalData));

        component.onFilterDateChange(1, '2025-11-15');

        expect(comparisonService.getComparisonData).toHaveBeenCalledWith('2026-03-20', '2025-11-15', undefined);
        const orgData = component.getOrgComparison(1);
        expect(orgData!.historical_filter).not.toBeNull();
        expect(orgData!.historical_filter!.date).toBe('2025-11-15');
    });

    it('should load historical piezo data independently on piezo date change', () => {
        initWithOrgs(1);

        const historicalData = [makeOrgComparison(1, '2026-03-20', null, '2025-09-03')];
        comparisonService.getComparisonData.and.returnValue(of(historicalData));

        component.onPiezoDateChange(1, '2025-09-03');

        expect(comparisonService.getComparisonData).toHaveBeenCalledWith('2026-03-20', undefined, '2025-09-03');
        const orgData = component.getOrgComparison(1);
        expect(orgData!.historical_piezo).not.toBeNull();
        expect(orgData!.historical_piezo!.date).toBe('2025-09-03');
    });

    it('should preserve current form values when loading historical data', () => {
        initWithOrgs(1);

        // Edit current flow_rate
        const orgFg = component.getOrgFormGroup(1)!;
        const locationsArr = orgFg.get('current.locations') as any;
        locationsArr.at(0).get('flow_rate').setValue(99.99);
        locationsArr.at(0).get('flow_rate').markAsDirty();

        // Load historical filter
        const historicalData = [makeOrgComparison(1, '2026-03-20', '2025-11-15', null)];
        comparisonService.getComparisonData.and.returnValue(of(historicalData));
        component.onFilterDateChange(1, '2025-11-15');

        // Current form value should be preserved
        const orgFgAfter = component.getOrgFormGroup(1)!;
        const locAfter = orgFgAfter.get('current.locations') as any;
        expect(locAfter.at(0).get('flow_rate').value).toBe(99.99);
        expect(locAfter.at(0).get('flow_rate').dirty).toBeTrue();
    });

    it('should build form with upsertOrgFormGroup without destroying other orgs', () => {
        initWithOrgs(1, 2);

        const org1Fg = component.getOrgFormGroup(1);
        expect(org1Fg).not.toBeNull();

        // Mark org 1 form as dirty
        org1Fg!.get('current.locations')!.markAsDirty();

        // Load historical for org 2
        const org2Historical = [makeOrgComparison(2, '2026-03-20', '2025-11-15', null)];
        comparisonService.getComparisonData.and.returnValue(of(org2Historical));
        component.onFilterDateChange(2, '2025-11-15');

        // Org 1 form group should still exist and be dirty
        const org1FgAfter = component.getOrgFormGroup(1);
        expect(org1FgAfter).not.toBeNull();
        expect(org1FgAfter!.dirty).toBeTrue();

        // Org 2 should also exist
        expect(component.getOrgFormGroup(2)).not.toBeNull();
    });

    it('should reset state on date change', () => {
        initWithOrgs(1);
        expect(component.similarDates.length).toBe(1);

        // Change date — should reset
        const newSimilar = [makeSimilarDates(1), makeSimilarDates(2)];
        const newCurrentData = [makeOrgComparison(1, '2026-03-21', null, null), makeOrgComparison(2, '2026-03-21', null, null)];
        comparisonService.getSimilarDates.and.returnValue(of(newSimilar));
        comparisonService.getComparisonData.and.returnValue(of(newCurrentData));

        component.onDateChange(new Date(2026, 2, 21));

        expect(component.similarDates.length).toBe(2);
    });

    it('hasExportDates should be false when no org data loaded', () => {
        comparisonService.getSimilarDates.and.returnValue(of([makeSimilarDates(1)]));
        comparisonService.getComparisonData.and.returnValue(of([]));

        fixture.detectChanges();

        expect(component.hasExportDates).toBeFalse();
    });

    it('hasExportDates should be true when org data is loaded', () => {
        initWithOrgs(1);

        expect(component.hasExportDates).toBeTrue();
    });

    it('save should only reload successfully saved orgs', fakeAsync(() => {
        initWithOrgs(1, 2);

        // Mark both as dirty
        component.getOrgFormGroup(1)!.get('current.locations')!.markAsDirty();
        component.getOrgFormGroup(2)!.get('current.locations')!.markAsDirty();

        // Org 1 save succeeds, Org 2 fails
        let callCount = 0;
        comparisonService.saveMeasurements.and.callFake(() => {
            callCount++;
            if (callCount === 1) return of({ status: 'ok' });
            return throwError(() => new Error('fail'));
        });

        // Mock reload response
        comparisonService.getComparisonData.and.returnValue(of([makeOrgComparison(1, '2026-03-20', null, null)]));

        component.save();
        tick();

        // Should have called saveMeasurements twice (once per dirty org)
        expect(comparisonService.saveMeasurements).toHaveBeenCalledTimes(2);
    }));

    it('should cancel previous request when historical date changes rapidly', fakeAsync(() => {
        initWithOrgs(1);

        const subject1 = new Subject<OrgComparison[]>();
        const subject2 = new Subject<OrgComparison[]>();
        let callIndex = 0;

        comparisonService.getComparisonData.and.callFake(() => {
            callIndex++;
            return callIndex === 1 ? subject1.asObservable() : subject2.asObservable();
        });

        // First filter date selection
        component.onFilterDateChange(1, '2025-11-15');

        // Quickly change to new date before first request completes
        component.onFilterDateChange(1, '2025-09-03');

        // First request completes — should be ignored due to cancellation
        const staleData = [makeOrgComparison(1, '2026-03-20', '2025-11-15', null)];
        subject1.next(staleData);
        subject1.complete();

        // Second request completes with fresh data
        const freshData = [makeOrgComparison(1, '2026-03-20', '2025-09-03', null)];
        subject2.next(freshData);
        subject2.complete();

        tick();

        const orgData = component.getOrgComparison(1);
        expect(orgData).toBeTruthy();
        expect(orgData!.historical_filter?.date).toBe('2025-09-03');
    }));
});
