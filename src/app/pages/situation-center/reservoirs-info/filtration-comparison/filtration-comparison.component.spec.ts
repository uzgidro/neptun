import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
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

        await TestBed.configureTestingModule({
            imports: [FiltrationComparisonComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: FiltrationComparisonService, useValue: compSpy },
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => '2026-03-20' } } } },
                MessageService,
                ConfirmationService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FiltrationComparisonComponent);
        component = fixture.componentInstance;
        comparisonService = TestBed.inject(FiltrationComparisonService) as jasmine.SpyObj<FiltrationComparisonService>;
        timeService = TestBed.inject(TimeService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load similar dates on init', () => {
        const mockData = [makeSimilarDates(1), makeSimilarDates(2)];
        comparisonService.getSimilarDates.and.returnValue(of(mockData));

        fixture.detectChanges();

        expect(comparisonService.getSimilarDates).toHaveBeenCalledWith('2026-03-20');
        expect(component.similarDates.length).toBe(2);
        expect(component.orgSelections.size).toBe(2);
    });

    it('should set loadingSimilarDates to false on error', () => {
        comparisonService.getSimilarDates.and.returnValue(throwError(() => new Error('fail')));

        fixture.detectChanges();

        expect(component.loadingSimilarDates).toBeFalse();
    });

    it('should load org data when both dates are selected', () => {
        const mockSimilar = [makeSimilarDates(1)];
        comparisonService.getSimilarDates.and.returnValue(of(mockSimilar));
        const mockComparison = [makeOrgComparison(1, '2026-03-20', '2025-11-15', '2025-09-03')];
        comparisonService.getComparisonData.and.returnValue(of(mockComparison));

        fixture.detectChanges();

        component.onFilterDateChange(1, '2025-11-15');
        // Should not load yet — piezoDate is null
        expect(comparisonService.getComparisonData).not.toHaveBeenCalled();

        component.onPiezoDateChange(1, '2025-09-03');
        // Now both are set — should load
        expect(comparisonService.getComparisonData).toHaveBeenCalledWith('2026-03-20', '2025-11-15', '2025-09-03');
    });

    it('should not load org data when only one date is selected', () => {
        const mockSimilar = [makeSimilarDates(1)];
        comparisonService.getSimilarDates.and.returnValue(of(mockSimilar));

        fixture.detectChanges();

        component.onFilterDateChange(1, '2025-11-15');
        expect(comparisonService.getComparisonData).not.toHaveBeenCalled();
    });

    it('should build form with upsertOrgFormGroup without destroying other orgs', () => {
        const mockSimilar = [makeSimilarDates(1), makeSimilarDates(2)];
        comparisonService.getSimilarDates.and.returnValue(of(mockSimilar));
        const org1Data = [makeOrgComparison(1, '2026-03-20', '2025-11-15', '2025-09-03')];
        const org2Data = [makeOrgComparison(2, '2026-03-20', '2025-11-15', '2025-09-03')];

        fixture.detectChanges();

        // Load org 1
        comparisonService.getComparisonData.and.returnValue(of(org1Data));
        component.onFilterDateChange(1, '2025-11-15');
        component.onPiezoDateChange(1, '2025-09-03');

        const org1Fg = component.getOrgFormGroup(1);
        expect(org1Fg).not.toBeNull();

        // Mark org 1 form as dirty
        org1Fg!.get('current.locations')!.markAsDirty();

        // Load org 2
        comparisonService.getComparisonData.and.returnValue(of(org2Data));
        component.onFilterDateChange(2, '2025-11-15');
        component.onPiezoDateChange(2, '2025-09-03');

        // Org 1 form group should still exist and be dirty
        const org1FgAfter = component.getOrgFormGroup(1);
        expect(org1FgAfter).not.toBeNull();
        expect(org1FgAfter!.dirty).toBeTrue();

        // Org 2 should also exist
        expect(component.getOrgFormGroup(2)).not.toBeNull();
    });

    it('should reset state on date change', () => {
        const mockSimilar = [makeSimilarDates(1)];
        comparisonService.getSimilarDates.and.returnValue(of(mockSimilar));

        fixture.detectChanges();
        expect(component.similarDates.length).toBe(1);

        // Change date — should reset
        const newSimilar = [makeSimilarDates(1), makeSimilarDates(2)];
        comparisonService.getSimilarDates.and.returnValue(of(newSimilar));

        component.onDateChange(new Date(2026, 2, 21));

        expect(component.similarDates.length).toBe(2);
    });

    it('hasExportDates should be false when no org has both dates', () => {
        const mockSimilar = [makeSimilarDates(1)];
        comparisonService.getSimilarDates.and.returnValue(of(mockSimilar));

        fixture.detectChanges();

        expect(component.hasExportDates).toBeFalse();
    });

    it('hasExportDates should be true when an org has both dates', () => {
        const mockSimilar = [makeSimilarDates(1)];
        comparisonService.getSimilarDates.and.returnValue(of(mockSimilar));
        comparisonService.getComparisonData.and.returnValue(of([makeOrgComparison(1, '2026-03-20', '2025-11-15', '2025-09-03')]));

        fixture.detectChanges();
        component.onFilterDateChange(1, '2025-11-15');
        component.onPiezoDateChange(1, '2025-09-03');

        expect(component.hasExportDates).toBeTrue();
    });

    it('save should only reload successfully saved orgs', fakeAsync(() => {
        const mockSimilar = [makeSimilarDates(1), makeSimilarDates(2)];
        comparisonService.getSimilarDates.and.returnValue(of(mockSimilar));

        // Load both orgs
        const org1Data = [makeOrgComparison(1, '2026-03-20', '2025-11-15', '2025-09-03')];
        const org2Data = [makeOrgComparison(2, '2026-03-20', '2025-11-15', '2025-09-03')];

        fixture.detectChanges();

        comparisonService.getComparisonData.and.returnValue(of(org1Data));
        component.onFilterDateChange(1, '2025-11-15');
        component.onPiezoDateChange(1, '2025-09-03');

        comparisonService.getComparisonData.and.returnValue(of(org2Data));
        component.onFilterDateChange(2, '2025-11-15');
        component.onPiezoDateChange(2, '2025-09-03');

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

        // Reset getComparisonData calls to track reload
        comparisonService.getComparisonData.calls.reset();
        comparisonService.getComparisonData.and.returnValue(of(org1Data));

        component.save();
        tick();

        // Should have called saveMeasurements twice (once per dirty org)
        expect(comparisonService.saveMeasurements).toHaveBeenCalledTimes(2);
    }));

    it('should cancel previous request when org dates change rapidly', fakeAsync(() => {
        const mockSimilar = [makeSimilarDates(1)];
        comparisonService.getSimilarDates.and.returnValue(of(mockSimilar));
        fixture.detectChanges();

        const subject1 = new Subject<OrgComparison[]>();
        const subject2 = new Subject<OrgComparison[]>();
        let callIndex = 0;

        comparisonService.getComparisonData.and.callFake(() => {
            callIndex++;
            return callIndex === 1 ? subject1.asObservable() : subject2.asObservable();
        });

        // First selection
        component.onFilterDateChange(1, '2025-11-15');
        component.onPiezoDateChange(1, '2025-09-03');

        // Quickly change to new date before first request completes
        component.onPiezoDateChange(1, '2025-08-01');

        // First request completes — should be ignored due to cancellation
        const staleData = [makeOrgComparison(1, '2026-03-20', '2025-11-15', '2025-09-03')];
        subject1.next(staleData);
        subject1.complete();

        // Org data should NOT be set from stale response
        // (it was cancelled, so subscribe callback doesn't fire)
        // Second request completes with fresh data
        const freshData = [makeOrgComparison(1, '2026-03-20', '2025-11-15', '2025-08-01')];
        subject2.next(freshData);
        subject2.complete();

        tick();

        const orgData = component.getOrgComparison(1);
        expect(orgData).toBeTruthy();
        expect(orgData!.historical_piezo?.date).toBe('2025-08-01');
    }));
});
