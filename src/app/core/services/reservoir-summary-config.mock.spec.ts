import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { MockReservoirSummaryConfigService } from './reservoir-summary-config.mock';

describe('MockReservoirSummaryConfigService', () => {
    let svc: MockReservoirSummaryConfigService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [MockReservoirSummaryConfigService]
        });
        svc = TestBed.inject(MockReservoirSummaryConfigService);
    });

    it('getConfigs returns 8 seeded configs sorted by sort_order', async () => {
        const list = await firstValueFrom(svc.getConfigs());
        expect(list.length).toBe(8);
        for (let i = 0; i < list.length - 1; i++) {
            expect(list[i].sort_order).toBeLessThan(list[i + 1].sort_order);
        }
    });

    it('getConfigs returns a defensive copy, not the internal array', async () => {
        const a = await firstValueFrom(svc.getConfigs());
        a[0].sort_order = 999;
        const b = await firstValueFrom(svc.getConfigs());
        expect(b[0].sort_order).not.toBe(999);
    });

    it('upsertConfig updates an existing record (matched by organization_id)', async () => {
        const before = await firstValueFrom(svc.getConfigs());
        const target = before[0];
        await firstValueFrom(svc.upsertConfig({
            organization_id: target.organization_id,
            sort_order: target.sort_order,
            include_in_total: !target.include_in_total
        }));
        const after = await firstValueFrom(svc.getConfigs());
        expect(after.length).toBe(before.length);
        const updated = after.find(c => c.organization_id === target.organization_id)!;
        expect(updated.include_in_total).toBe(!target.include_in_total);
    });

    it('upsertConfig inserts a new record with a fresh id', async () => {
        const before = await firstValueFrom(svc.getConfigs());
        const beforeIds = new Set(before.map(c => c.id));
        await firstValueFrom(svc.upsertConfig({
            organization_id: 999,
            sort_order: 99,
            include_in_total: true
        }));
        const after = await firstValueFrom(svc.getConfigs());
        expect(after.length).toBe(before.length + 1);
        const created = after.find(c => c.organization_id === 999)!;
        expect(created).toBeTruthy();
        expect(beforeIds.has(created.id)).toBe(false);
    });

    it('deleteConfig removes a record by organization_id', async () => {
        const before = await firstValueFrom(svc.getConfigs());
        const target = before[0];
        await firstValueFrom(svc.deleteConfig(target.organization_id));
        const after = await firstValueFrom(svc.getConfigs());
        expect(after.length).toBe(before.length - 1);
        expect(after.find(c => c.organization_id === target.organization_id)).toBeUndefined();
    });

    it('deleteConfig with unknown organization_id throws HttpErrorResponse 404', async () => {
        await expectAsync(firstValueFrom(svc.deleteConfig(987654)))
            .toBeRejectedWith(jasmine.any(HttpErrorResponse));
    });

    it('mutations persist across getConfigs calls', async () => {
        await firstValueFrom(svc.upsertConfig({
            organization_id: 555,
            sort_order: 55,
            include_in_total: false
        }));
        const list = await firstValueFrom(svc.getConfigs());
        expect(list.find(c => c.organization_id === 555)?.include_in_total).toBe(false);
    });
});
