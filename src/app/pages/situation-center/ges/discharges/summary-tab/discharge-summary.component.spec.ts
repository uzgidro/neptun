import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DischargeSummaryComponent } from './discharge-summary.component';
import { DischargeService } from '@/core/services/discharge.service';
import { DischargeSummaryResponse, SummaryBucket, SummaryMetrics } from '@/core/interfaces/discharge';

function metrics(volume: number, avg = 0, loss = 0): SummaryMetrics {
    return { volume_mln_m3: volume, avg_flow_rate_m3_s: avg, generation_loss_mwh: loss };
}

function bucket(period: string, volume: number, avg = 0, loss = 0): SummaryBucket {
    return { period, ...metrics(volume, avg, loss) };
}

function makeResponse(): DischargeSummaryResponse {
    return {
        from: '2026-01-01',
        to: '2026-02-28',
        granularity: 'month',
        cascades: [
            {
                id: 3,
                name: 'Каскад Чирчикских ГЭС',
                buckets: [bucket('2026-01', 12.442, 4.645, 861.4), bucket('2026-02', 4.032, 1.667, 279.2)],
                total: metrics(16.474, 3.204, 1140.6),
                hpps: [
                    {
                        id: 16,
                        name: 'Чарвакская ГЭС',
                        buckets: [bucket('2026-01', 8.64, 3.226, 598.1), bucket('2026-02', 4.032, 1.667, 279.2)],
                        total: metrics(12.672, 2.464, 877.3)
                    },
                    {
                        id: 17,
                        name: 'Ходжикентская ГЭС',
                        buckets: [bucket('2026-01', 3.802, 1.42, 263.3), bucket('2026-02', 0)],
                        total: metrics(3.802, 0.739, 263.3)
                    }
                ]
            },
            {
                id: 0,
                name: '',
                buckets: [bucket('2026-01', 0.518, 0.193, 36), bucket('2026-02', 0)],
                total: metrics(0.518, 0.101, 36),
                hpps: [
                    {
                        id: 42,
                        name: 'Отдельная ГЭС',
                        buckets: [bucket('2026-01', 0.518, 0.193, 36), bucket('2026-02', 0)],
                        total: metrics(0.518, 0.101, 36)
                    }
                ]
            }
        ],
        grand_total: {
            buckets: [bucket('2026-01', 12.96, 4.839, 897.4), bucket('2026-02', 4.032, 1.667, 279.2)],
            total: metrics(16.992, 3.305, 1176.6)
        }
    };
}

function emptyResponse(): DischargeSummaryResponse {
    return {
        from: '2026-01-01',
        to: '2026-02-28',
        granularity: 'month',
        cascades: [],
        grand_total: {
            buckets: [bucket('2026-01', 0), bucket('2026-02', 0)],
            total: metrics(0)
        }
    };
}

describe('DischargeSummaryComponent', () => {
    let component: DischargeSummaryComponent;
    let fixture: ComponentFixture<DischargeSummaryComponent>;
    let dischargeService: jasmine.SpyObj<DischargeService>;
    let messageService: jasmine.SpyObj<MessageService>;

    beforeEach(async () => {
        const dischargeSpy = jasmine.createSpyObj('DischargeService', ['getSummary']);
        dischargeSpy.getSummary.and.returnValue(of(makeResponse()));
        const messageSpy = jasmine.createSpyObj('MessageService', ['add']);

        await TestBed.configureTestingModule({
            imports: [DischargeSummaryComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                provideRouter([]),
                { provide: DischargeService, useValue: dischargeSpy },
                { provide: MessageService, useValue: messageSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DischargeSummaryComponent);
        component = fixture.componentInstance;
        dischargeService = TestBed.inject(DischargeService) as jasmine.SpyObj<DischargeService>;
        messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    });

    it('loads on init with Jan 1 of current year, today and month granularity', () => {
        fixture.detectChanges();

        expect(dischargeService.getSummary).toHaveBeenCalledTimes(1);
        const [from, to, granularity] = dischargeService.getSummary.calls.mostRecent().args;
        const now = new Date();
        expect(from.getFullYear()).toBe(now.getFullYear());
        expect(from.getMonth()).toBe(0);
        expect(from.getDate()).toBe(1);
        expect(to.getFullYear()).toBe(now.getFullYear());
        expect(to.getMonth()).toBe(now.getMonth());
        expect(to.getDate()).toBe(now.getDate());
        expect(granularity).toBe('month');
    });

    it('builds columns from grand_total buckets', () => {
        fixture.detectChanges();

        expect(component.columns).toEqual(['2026-01', '2026-02']);
    });

    it('flattens rows: cascade row precedes its hpps, server order preserved', () => {
        fixture.detectChanges();

        expect(component.rows.map((r) => `${r.type}:${r.id}`)).toEqual(['cascade:3', 'hpp:16', 'hpp:17', 'cascade:0', 'hpp:42']);
        expect(component.rows[0].total.volume_mln_m3).toBe(16.474);
        expect(component.grandTotal?.total.volume_mln_m3).toBe(16.992);
    });

    it('renders pseudo-cascade (id 0) under the NO_CASCADE label', () => {
        fixture.detectChanges();

        const pseudo = component.rows.find((r) => r.type === 'cascade' && r.id === 0);
        expect(pseudo?.name).toBe('SITUATION_CENTER.DISCHARGE.SUMMARY.NO_CASCADE');
    });

    it('metric switch changes view without a second getSummary call', () => {
        fixture.detectChanges();
        dischargeService.getSummary.calls.reset();

        component.metric = 'generation_loss_mwh';
        fixture.detectChanges();

        expect(dischargeService.getSummary).not.toHaveBeenCalled();
    });

    it('blocks load when from is after to', () => {
        fixture.detectChanges();
        dischargeService.getSummary.calls.reset();

        component.from = new Date(2026, 5, 10);
        component.to = new Date(2026, 5, 1);
        component.load();

        expect(component.validationError).toBe('SITUATION_CENTER.DISCHARGE.SUMMARY.ERR_FROM_AFTER_TO');
        expect(dischargeService.getSummary).not.toHaveBeenCalled();
    });

    it('blocks day granularity when the range exceeds 366 inclusive days', () => {
        fixture.detectChanges();
        dischargeService.getSummary.calls.reset();

        component.granularity = 'day';
        component.from = new Date(2025, 0, 1);
        component.to = new Date(2026, 0, 2); // 367 inclusive days
        component.load();

        expect(component.validationError).toBe('SITUATION_CENTER.DISCHARGE.SUMMARY.ERR_RANGE_TOO_LONG');
        expect(dischargeService.getSummary).not.toHaveBeenCalled();
    });

    it('allows day granularity at exactly 366 inclusive days', () => {
        fixture.detectChanges();
        dischargeService.getSummary.calls.reset();

        component.granularity = 'day';
        component.from = new Date(2025, 0, 1);
        component.to = new Date(2026, 0, 1); // 366 inclusive days
        component.load();

        expect(component.validationError).toBeNull();
        expect(dischargeService.getSummary).toHaveBeenCalledTimes(1);
    });

    it('shows error toast and resets loading on API failure', () => {
        dischargeService.getSummary.and.returnValue(throwError(() => new Error('boom')));

        fixture.detectChanges();

        expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
        expect(component.loading).toBeFalse();
    });

    it('keeps grand total and columns when cascades are empty', () => {
        dischargeService.getSummary.and.returnValue(of(emptyResponse()));

        fixture.detectChanges();

        expect(component.rows.length).toBe(0);
        expect(component.columns).toEqual(['2026-01', '2026-02']);
        expect(component.grandTotal?.total.volume_mln_m3).toBe(0);
    });
});
