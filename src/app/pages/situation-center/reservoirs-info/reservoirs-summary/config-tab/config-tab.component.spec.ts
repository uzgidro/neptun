import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { ReservoirSummaryConfigTabComponent } from './config-tab.component';
import { RESERVOIR_SUMMARY_CONFIG_SOURCE, ReservoirSummaryConfigSource } from '@/core/services/reservoir-summary-config.source';
import { OrganizationService } from '@/core/services/organization.service';
import { ReservoirSummaryConfig } from '@/core/interfaces/reservoir-summary-config';

function mkCfg(orgId: number, name: string, sort_order: number, include_in_total = true): ReservoirSummaryConfig & { saving?: boolean } {
    return {
        id: orgId, organization_id: orgId, organization_name: name, sort_order, include_in_total,
        modsnow_enabled: true, volume_source: 'static'
    };
}

describe('ReservoirSummaryConfigTabComponent', () => {
    let component: ReservoirSummaryConfigTabComponent;
    let fixture: ComponentFixture<ReservoirSummaryConfigTabComponent>;
    let src: jasmine.SpyObj<ReservoirSummaryConfigSource>;
    let orgSvc: jasmine.SpyObj<OrganizationService>;
    let messageService: jasmine.SpyObj<MessageService>;

    beforeEach(async () => {
        src = jasmine.createSpyObj('ReservoirSummaryConfigSource',
            ['getConfigs', 'upsertConfig', 'deleteConfig']);
        orgSvc = jasmine.createSpyObj('OrganizationService', ['getOrganizationsFlat']);
        messageService = jasmine.createSpyObj('MessageService', ['add']);

        src.getConfigs.and.returnValue(of([]));
        orgSvc.getOrganizationsFlat.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [ReservoirSummaryConfigTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: RESERVOIR_SUMMARY_CONFIG_SOURCE, useValue: src },
                { provide: OrganizationService, useValue: orgSvc },
                { provide: MessageService, useValue: messageService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ReservoirSummaryConfigTabComponent);
        component = fixture.componentInstance;
    });

    it('loadConfigs sorts by sort_order ascending', () => {
        src.getConfigs.and.returnValue(of([
            mkCfg(3, 'C', 3),
            mkCfg(1, 'A', 1),
            mkCfg(2, 'B', 2)
        ]));
        fixture.detectChanges();
        expect(component.configs.map(c => c.sort_order)).toEqual([1, 2, 3]);
    });

    it('openNew resets form to defaults and shows the add dialog', () => {
        fixture.detectChanges();
        component.openNew();
        expect(component.dialogVisible).toBeTrue();
        expect(component.form.get('organization')?.value).toBeNull();
        expect(component.form.get('include_in_total')?.value).toBeTrue();
        expect(component.form.get('modsnow_enabled')?.value).toBeTrue();
        expect(component.form.get('volume_source')?.value).toBe('static');
    });

    it('saveRow upserts the row with its current values (inline edit)', fakeAsync(() => {
        src.upsertConfig.and.returnValue(of({ status: 'OK' }));
        src.getConfigs.and.returnValue(of([]));
        fixture.detectChanges();
        const row = mkCfg(101, 'Андижон', 1, true);
        row.modsnow_enabled = false;
        row.volume_source = 'level_volume';
        component.saveRow(row);
        tick();
        expect(src.upsertConfig).toHaveBeenCalledWith({
            organization_id: 101, sort_order: 1, include_in_total: true,
            modsnow_enabled: false, volume_source: 'level_volume'
        });
    }));

    it('saveRow sets and clears the per-row saving flag', fakeAsync(() => {
        src.upsertConfig.and.returnValue(of({ status: 'OK' }));
        src.getConfigs.and.returnValue(of([]));
        fixture.detectChanges();
        const row = mkCfg(101, 'Андижон', 1, true);
        component.saveRow(row);
        // synchronously set before the async response resolves is hard to assert with `of`;
        // assert it is cleared after completion
        tick();
        expect(row.saving).toBeFalse();
    }));

    it('saveRow does not upsert when already saving (guard)', fakeAsync(() => {
        src.upsertConfig.and.returnValue(of({ status: 'OK' }));
        fixture.detectChanges();
        const row = mkCfg(101, 'Андижон', 1, true);
        row.saving = true;
        component.saveRow(row);
        tick();
        expect(src.upsertConfig).not.toHaveBeenCalled();
    }));

    it('saveRow shows an error toast and reloads on failure (reverts optimistic edit)', fakeAsync(() => {
        src.upsertConfig.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
        src.getConfigs.and.returnValue(of([mkCfg(101, 'Андижон', 1, true)]));
        fixture.detectChanges();
        const row = mkCfg(101, 'Андижон', 1, true);
        component.saveRow(row);
        tick();
        const call = messageService.add.calls.mostRecent();
        expect(call.args[0].severity).toBe('error');
        // reload re-fetches authoritative state
        expect(src.getConfigs).toHaveBeenCalled();
    }));

    it('saveConfig sends correct payload (incl. modsnow_enabled + volume_source)', fakeAsync(() => {
        src.upsertConfig.and.returnValue(of({ status: 'OK' }));
        src.getConfigs.and.returnValue(of([]));
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 42, name: 'Чарвак', contacts: [] },
            sort_order: 5,
            include_in_total: false,
            modsnow_enabled: false,
            volume_source: 'level_volume'
        });
        component.saveConfig();
        tick();
        expect(src.upsertConfig).toHaveBeenCalledWith({
            organization_id: 42, sort_order: 5, include_in_total: false,
            modsnow_enabled: false, volume_source: 'level_volume'
        });
    }));

    it('isAddDisabled is true when configs reach MAX_CONFIGS (8)', () => {
        const eight = [
            mkCfg(1, 'A', 1), mkCfg(2, 'B', 2), mkCfg(3, 'C', 3), mkCfg(4, 'D', 4),
            mkCfg(5, 'E', 5), mkCfg(6, 'F', 6), mkCfg(7, 'G', 7), mkCfg(8, 'H', 8)
        ];
        src.getConfigs.and.returnValue(of(eight));
        fixture.detectChanges();
        expect(component.isAddDisabled).toBeTrue();
    });

    it('isAddDisabled is false when configs count < MAX_CONFIGS', () => {
        src.getConfigs.and.returnValue(of([mkCfg(1, 'A', 1)]));
        fixture.detectChanges();
        expect(component.isAddDisabled).toBeFalse();
    });

    it('deleteConfig invokes source.deleteConfig with organization_id when confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        src.deleteConfig.and.returnValue(of(void 0));
        src.getConfigs.and.returnValue(of([]));
        fixture.detectChanges();
        component.deleteConfig(42);
        expect(src.deleteConfig).toHaveBeenCalledWith(42);
    });

    it('deleteConfig does nothing on cancel', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        fixture.detectChanges();
        component.deleteConfig(42);
        expect(src.deleteConfig).not.toHaveBeenCalled();
    });

    it('handles 404 on delete with ALREADY_DELETED toast and reloads', fakeAsync(() => {
        spyOn(window, 'confirm').and.returnValue(true);
        const err = new HttpErrorResponse({ status: 404 });
        src.deleteConfig.and.returnValue(throwError(() => err));
        src.getConfigs.and.returnValue(of([]));
        fixture.detectChanges();
        component.deleteConfig(42);
        tick();
        const call = messageService.add.calls.mostRecent();
        expect(String(call.args[0].detail)).toContain('ALREADY_DELETED');
        expect(src.getConfigs).toHaveBeenCalledTimes(2);
    }));

    it('include_in_total = false is serialized as false (not null/undefined)', fakeAsync(() => {
        src.upsertConfig.and.returnValue(of({ status: 'OK' }));
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 7, name: 'Пском', contacts: [] },
            sort_order: 8,
            include_in_total: false
        });
        component.saveConfig();
        tick();
        const payload = src.upsertConfig.calls.mostRecent().args[0];
        expect(payload.include_in_total).toBe(false);
        expect(payload.include_in_total).not.toBeNull();
    }));

    it('payload always carries modsnow_enabled (default true) and volume_source', fakeAsync(() => {
        src.upsertConfig.and.returnValue(of({ status: 'OK' }));
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 7, name: 'Пском', contacts: [] },
            sort_order: 8
        });
        component.saveConfig();
        tick();
        const payload = src.upsertConfig.calls.mostRecent().args[0];
        expect(payload.modsnow_enabled).toBe(true);
        expect(payload.volume_source).toBe('static');
    }));
});
