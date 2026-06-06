import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { ReservoirDutyEntryComponent } from './reservoir-duty-entry.component';
import { ReservoirSummaryService } from '@/core/services/reservoir-summary.service';
import { LevelVolumeService } from '@/core/services/level-volume.service';
import { ReservoirSummaryResponse } from '@/core/interfaces/reservoir-summary';
import { LevelVolume } from '@/core/interfaces/level-volume';

function makeReservoir(orgId: number, name: string, overrides: Partial<{
    level: number; volume: number; income: number; release: number; modsnow: number;
}> = {}): ReservoirSummaryResponse {
    return {
        organization_id: orgId,
        organization_name: name,
        income: { current: overrides.income ?? 0, prev: 0, year_ago: 0, two_years_ago: 0 },
        volume: { current: overrides.volume ?? 0, prev: 0, year_ago: 0, two_years_ago: 0 },
        level: { current: overrides.level ?? 0, prev: 0, year_ago: 0, two_years_ago: 0 },
        release: { current: overrides.release ?? 0, prev: 0, year_ago: 0, two_years_ago: 0 },
        modsnow: { current: overrides.modsnow ?? 0, prev: 0, year_ago: 0, two_years_ago: 0 },
        incoming_volume: 100,
        incoming_volume_prev_year: 200,
        incoming_volume_is_calculated: false,
        incoming_volume_prev_year_is_calculated: false
    };
}

describe('ReservoirDutyEntryComponent', () => {
    let component: ReservoirDutyEntryComponent;
    let fixture: ComponentFixture<ReservoirDutyEntryComponent>;
    let svc: jasmine.SpyObj<ReservoirSummaryService>;
    let levelVolumeService: jasmine.SpyObj<LevelVolumeService>;
    let messageService: jasmine.SpyObj<MessageService>;

    beforeEach(async () => {
        svc = jasmine.createSpyObj('ReservoirSummaryService', ['getReservoirSummary', 'upsetReservoirData']);
        levelVolumeService = jasmine.createSpyObj('LevelVolumeService', ['getVolume']);
        messageService = jasmine.createSpyObj('MessageService', ['add']);
        svc.getReservoirSummary.and.returnValue(of([]));
        svc.upsetReservoirData.and.returnValue(of({ status: 'OK', processed_count: 1 }));

        await TestBed.configureTestingModule({
            imports: [ReservoirDutyEntryComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                provideRouter([]),
                { provide: ReservoirSummaryService, useValue: svc },
                { provide: LevelVolumeService, useValue: levelVolumeService },
                { provide: MessageService, useValue: messageService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ReservoirDutyEntryComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('selectedDate defaults to today', () => {
        const today = new Date();
        expect(component.selectedDate.getFullYear()).toBe(today.getFullYear());
        expect(component.selectedDate.getMonth()).toBe(today.getMonth());
        expect(component.selectedDate.getDate()).toBe(today.getDate());
    });

    it('loadData builds one card per organization returned', fakeAsync(() => {
        svc.getReservoirSummary.and.returnValue(of([
            makeReservoir(101, 'Андижон'),
            makeReservoir(103, 'Сардоба')
        ]));
        fixture.detectChanges();
        component.onDateChange(new Date('2026-06-01'));
        tick();
        expect(component.cards.length).toBe(2);
        expect(component.cards[0].organization_id).toBe(101);
        expect(component.cards[1].organization_id).toBe(103);
    }));

    it('card form is prefilled with current values', fakeAsync(() => {
        svc.getReservoirSummary.and.returnValue(of([
            makeReservoir(101, 'Андижон', { level: 880.5, volume: 1900, income: 12, release: 7, modsnow: 33 })
        ]));
        fixture.detectChanges();
        component.onDateChange(new Date('2026-06-01'));
        tick();
        const f = component.cards[0].form;
        expect(f.get('level')?.value).toBe(880.5);
        expect(f.get('volume')?.value).toBe(1900);
        expect(f.get('income')?.value).toBe(12);
        expect(f.get('release')?.value).toBe(7);
        expect(f.get('modsnow_current')?.value).toBe(33);
    }));

    it('onLevelChange fetches volume via level-volume service and patches it', fakeAsync(() => {
        svc.getReservoirSummary.and.returnValue(of([makeReservoir(101, 'Андижон')]));
        levelVolumeService.getVolume.and.returnValue(
            of({ organization_id: 101, level: 882, volume: 1955.7 } as LevelVolume)
        );
        fixture.detectChanges();
        component.onDateChange(new Date('2026-06-01'));
        tick();
        const card = component.cards[0];
        card.form.patchValue({ level: 882 });
        component.onLevelChange(card);
        tick();
        expect(levelVolumeService.getVolume).toHaveBeenCalledWith(101, 882);
        expect(card.form.get('volume')?.value).toBe(1955.7);
    }));

    it('onLevelChange does not fetch volume when level is null', fakeAsync(() => {
        svc.getReservoirSummary.and.returnValue(of([makeReservoir(101, 'Андижон')]));
        fixture.detectChanges();
        component.onDateChange(new Date('2026-06-01'));
        tick();
        const card = component.cards[0];
        card.form.patchValue({ level: null });
        component.onLevelChange(card);
        tick();
        expect(levelVolumeService.getVolume).not.toHaveBeenCalled();
    }));

    it('saveCard posts a single-item payload with the editable fields', fakeAsync(() => {
        svc.getReservoirSummary.and.returnValue(of([makeReservoir(101, 'Андижон')]));
        fixture.detectChanges();
        component.onDateChange(new Date('2026-06-01'));
        tick();
        const card = component.cards[0];
        card.form.patchValue({ level: 881, volume: 1950, income: 15, release: 8, modsnow_current: 40 });
        component.saveCard(card);
        tick();
        expect(svc.upsetReservoirData).toHaveBeenCalledTimes(1);
        const body = svc.upsetReservoirData.calls.mostRecent().args[0];
        expect(body.length).toBe(1);
        const item = body[0] as any;
        expect(item.organization_id).toBe(101);
        expect(item.date).toBe('2026-06-01');
        expect(item.level).toBe(881);
        expect(item.volume).toBe(1950);
        expect(item.income).toBe(15);
        expect(item.release).toBe(8);
        expect(item.modsnow_current).toBe(40);
    }));

    it('saveCard never sends incoming_volume or modsnow_year_ago fields', fakeAsync(() => {
        svc.getReservoirSummary.and.returnValue(of([makeReservoir(101, 'Андижон')]));
        fixture.detectChanges();
        component.onDateChange(new Date('2026-06-01'));
        tick();
        const card = component.cards[0];
        card.form.patchValue({ level: 881 });
        component.saveCard(card);
        tick();
        const item = svc.upsetReservoirData.calls.mostRecent().args[0][0] as any;
        expect(item.total_income_volume).toBeUndefined();
        expect(item.total_income_volume_prev_year).toBeUndefined();
        expect(item.modsnow_year_ago).toBeUndefined();
    }));

    it('empty response sets hasNoOrganization flag and no cards', fakeAsync(() => {
        svc.getReservoirSummary.and.returnValue(of([]));
        fixture.detectChanges();
        component.onDateChange(new Date('2026-06-01'));
        tick();
        expect(component.cards.length).toBe(0);
        expect(component.hasNoOrganization).toBeTrue();
    }));

    it('non-empty response clears hasNoOrganization flag', fakeAsync(() => {
        svc.getReservoirSummary.and.returnValue(of([makeReservoir(101, 'Андижон')]));
        fixture.detectChanges();
        component.onDateChange(new Date('2026-06-01'));
        tick();
        expect(component.hasNoOrganization).toBeFalse();
    }));

    it('saveCard shows ACCESS_DENIED toast on 403', fakeAsync(() => {
        svc.getReservoirSummary.and.returnValue(of([makeReservoir(101, 'Андижон')]));
        fixture.detectChanges();
        component.onDateChange(new Date('2026-06-01'));
        tick();
        svc.upsetReservoirData.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
        const card = component.cards[0];
        card.form.patchValue({ level: 881 });
        component.saveCard(card);
        tick();
        const call = messageService.add.calls.mostRecent();
        expect(call.args[0].severity).toBe('error');
        expect(String(call.args[0].detail)).toContain('ACCESS_DENIED');
    }));

    it('saveCard shows success toast on OK', fakeAsync(() => {
        svc.getReservoirSummary.and.returnValue(of([makeReservoir(101, 'Андижон')]));
        fixture.detectChanges();
        component.onDateChange(new Date('2026-06-01'));
        tick();
        const card = component.cards[0];
        card.form.patchValue({ level: 881 });
        component.saveCard(card);
        tick();
        const call = messageService.add.calls.mostRecent();
        expect(call.args[0].severity).toBe('success');
    }));
});
