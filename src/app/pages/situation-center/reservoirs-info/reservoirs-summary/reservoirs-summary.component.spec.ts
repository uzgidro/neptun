import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ReservoirsSummaryComponent } from './reservoirs-summary.component';
import { ReservoirSummaryService } from '@/core/services/reservoir-summary.service';
import { LevelVolumeService } from '@/core/services/level-volume.service';
import { AuthService } from '@/core/services/auth.service';
import { ReservoirSummaryResponse } from '@/core/interfaces/reservoir-summary';
import { LevelVolume } from '@/core/interfaces/level-volume';

function makeReservoir(orgId: number, name: string): ReservoirSummaryResponse {
    return {
        organization_id: orgId,
        organization_name: name,
        income: { current: 0, prev: 0, year_ago: 0, two_years_ago: 0, is_edited: false },
        volume: { current: 0, prev: 0, year_ago: 0, two_years_ago: 0, is_edited: false },
        level: { current: 0, prev: 0, year_ago: 0, two_years_ago: 0, is_edited: false },
        release: { current: 0, prev: 0, year_ago: 0, two_years_ago: 0, is_edited: false },
        modsnow: { current: 0, prev: 0, year_ago: 0, two_years_ago: 0, is_edited: false },
        incoming_volume: 100,
        incoming_volume_prev_year: 200,
        incoming_volume_is_calculated: false,
        incoming_volume_prev_year_is_calculated: false,
        incoming_volume_is_reset: false,
        incoming_volume_prev_year_is_reset: false
    };
}

describe('ReservoirsSummaryComponent', () => {
    let component: ReservoirsSummaryComponent;
    let fixture: ComponentFixture<ReservoirsSummaryComponent>;
    let reservoirService: jasmine.SpyObj<ReservoirSummaryService>;
    let levelVolumeService: jasmine.SpyObj<LevelVolumeService>;

    beforeEach(async () => {
        const reservoirSpy = jasmine.createSpyObj('ReservoirSummaryService', [
            'getReservoirSummary', 'upsetReservoirData', 'downloadSummary'
        ]);
        const levelVolumeSpy = jasmine.createSpyObj('LevelVolumeService', ['getVolume']);
        const authSpy = jasmine.createSpyObj('AuthService', ['isSc', 'isAdmin', 'isAuthenticated']);
        authSpy.isSc.and.returnValue(true);
        authSpy.isAdmin.and.returnValue(true);
        authSpy.isAuthenticated.and.returnValue(true);

        reservoirSpy.getReservoirSummary.and.returnValue(of([]));
        reservoirSpy.upsetReservoirData.and.returnValue(of({}));

        await TestBed.configureTestingModule({
            imports: [ReservoirsSummaryComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                provideRouter([]),
                { provide: ReservoirSummaryService, useValue: reservoirSpy },
                { provide: LevelVolumeService, useValue: levelVolumeSpy },
                { provide: AuthService, useValue: authSpy },
                MessageService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ReservoirsSummaryComponent);
        component = fixture.componentInstance;
        reservoirService = TestBed.inject(ReservoirSummaryService) as jasmine.SpyObj<ReservoirSummaryService>;
        levelVolumeService = TestBed.inject(LevelVolumeService) as jasmine.SpyObj<LevelVolumeService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('onAccept: no POST when nothing edited', fakeAsync(() => {
        reservoirService.getReservoirSummary.and.returnValue(of([
            makeReservoir(1, 'A'),
            makeReservoir(2, 'B')
        ]));
        component.onDateChange(new Date('2026-04-13'));
        tick();
        component.onAccept();
        tick();
        expect(reservoirService.upsetReservoirData).not.toHaveBeenCalled();
    }));

    it('onAccept: income edit only — body contains only income', fakeAsync(() => {
        reservoirService.getReservoirSummary.and.returnValue(of([makeReservoir(1, 'A')]));
        component.onDateChange(new Date('2026-04-13'));
        tick();
        component.data[0].income.current = 99;
        component.onIncomeChange(component.data[0]);
        component.onAccept();
        tick();
        expect(reservoirService.upsetReservoirData).toHaveBeenCalledTimes(1);
        const body = reservoirService.upsetReservoirData.calls.mostRecent().args[0];
        expect(Array.isArray(body)).toBeTrue();
        expect(body.length).toBe(1);
        const item = body[0] as any;
        expect(Object.keys(item).sort()).toEqual(['date', 'income', 'organization_id'].sort());
        expect(item.income).toBe(99);
    }));

    it('onAccept: level edit triggers volume fetch, both sent', fakeAsync(() => {
        reservoirService.getReservoirSummary.and.returnValue(of([makeReservoir(1, 'A')]));
        levelVolumeService.getVolume.and.returnValue(of({ organization_id: 1, level: 10, volume: 12.3 } as LevelVolume));
        component.onDateChange(new Date('2026-04-13'));
        tick();
        component.data[0].level.current = 10;
        component.onLevelChange(component.data[0]);
        tick();
        component.onAccept();
        tick();
        expect(reservoirService.upsetReservoirData).toHaveBeenCalledTimes(1);
        const body = reservoirService.upsetReservoirData.calls.mostRecent().args[0];
        const item = body[0] as any;
        expect(item.level).toBe(10);
        expect(item.volume).toBe(12.3);
    }));

    it('onAccept: is_edited flags reset after successful save', fakeAsync(() => {
        const reservoir = makeReservoir(1, 'A');
        reservoirService.getReservoirSummary.and.returnValue(of([reservoir]));
        reservoirService.upsetReservoirData.and.returnValue(of({}));
        component.onDateChange(new Date('2026-04-13'));
        tick();
        component.data[0].income.current = 5;
        component.onIncomeChange(component.data[0]);
        expect(component.data[0].income.is_edited).toBeTrue();
        component.onAccept();
        tick();
        expect(component.data[0].income.is_edited).toBeFalse();
        expect(component.data[0].level.is_edited).toBeFalse();
        expect(component.data[0].volume.is_edited).toBeFalse();
        expect(component.data[0].release.is_edited).toBeFalse();
        expect(component.data[0].modsnow.is_edited).toBeFalse();
    }));

    it('onAccept: total_income_volume diff works without is_edited', fakeAsync(() => {
        reservoirService.getReservoirSummary.and.returnValue(of([makeReservoir(1, 'A')]));
        component.onDateChange(new Date('2026-04-13'));
        tick();
        component.data[0].incoming_volume = 200;
        component.onAccept();
        tick();
        expect(reservoirService.upsetReservoirData).toHaveBeenCalledTimes(1);
        const body = reservoirService.upsetReservoirData.calls.mostRecent().args[0];
        const item = body[0] as any;
        expect(item.total_income_volume).toBe(200);
        expect(item.income).toBeUndefined();
        expect(item.level).toBeUndefined();
        expect(item.volume).toBeUndefined();
        expect(item.release).toBeUndefined();
    }));
});
