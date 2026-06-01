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

function mkCfg(orgId: number, name: string, sort_order: number, include_in_total = true): ReservoirSummaryConfig {
    return { id: orgId, organization_id: orgId, organization_name: name, sort_order, include_in_total };
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

    it('openNew resets form to defaults and shows dialog', () => {
        fixture.detectChanges();
        component.openNew();
        expect(component.dialogVisible).toBeTrue();
        expect(component.isEditMode).toBeFalse();
        expect(component.form.get('organization')?.value).toBeNull();
        expect(component.form.get('include_in_total')?.value).toBeTrue();
    });

    it('editConfig patches form with cfg values', () => {
        fixture.detectChanges();
        const cfg = mkCfg(101, 'Андижон', 1, false);
        component.editConfig(cfg);
        expect(component.dialogVisible).toBeTrue();
        expect(component.isEditMode).toBeTrue();
        expect(component.form.get('sort_order')?.value).toBe(1);
        expect(component.form.get('include_in_total')?.value).toBeFalse();
    });

    it('saveConfig sends correct payload', fakeAsync(() => {
        src.upsertConfig.and.returnValue(of({ status: 'OK' }));
        src.getConfigs.and.returnValue(of([]));
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 42, name: 'Чарвак', contacts: [] },
            sort_order: 5,
            include_in_total: false
        });
        component.saveConfig();
        tick();
        expect(src.upsertConfig).toHaveBeenCalledWith({
            organization_id: 42, sort_order: 5, include_in_total: false
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

    it('isSlot3HazardousChange: sort_order!=3 → false', () => {
        fixture.detectChanges();
        expect(component.isSlot3HazardousChange({
            organization_id: 1, sort_order: 4, include_in_total: true
        })).toBeFalse();
    });

    it('isSlot3HazardousChange: empty slot 3, placing any org there → true', () => {
        src.getConfigs.and.returnValue(of([mkCfg(1, 'A', 1), mkCfg(2, 'B', 2)]));
        fixture.detectChanges();
        expect(component.isSlot3HazardousChange({
            organization_id: 7, sort_order: 3, include_in_total: true
        })).toBeTrue();
    });

    it('isSlot3HazardousChange: putting different org into slot 3 → true', () => {
        src.getConfigs.and.returnValue(of([mkCfg(5, 'Сардоба', 3)]));
        fixture.detectChanges();
        expect(component.isSlot3HazardousChange({
            organization_id: 99, sort_order: 3, include_in_total: true
        })).toBeTrue();
    });

    it('isSlot3HazardousChange: same org already at slot 3 → false (no-op)', () => {
        src.getConfigs.and.returnValue(of([mkCfg(5, 'Сардоба', 3)]));
        fixture.detectChanges();
        expect(component.isSlot3HazardousChange({
            organization_id: 5, sort_order: 3, include_in_total: true
        })).toBeFalse();
    });

    it('saveConfig blocks upsert when slot-3 warning is rejected', fakeAsync(() => {
        spyOn(window, 'confirm').and.returnValue(false);
        src.getConfigs.and.returnValue(of([mkCfg(5, 'Сардоба', 3)]));
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 99, name: 'X', contacts: [] },
            sort_order: 3,
            include_in_total: true
        });
        component.saveConfig();
        tick();
        expect(src.upsertConfig).not.toHaveBeenCalled();
    }));

    it('saveConfig proceeds when slot-3 warning is accepted', fakeAsync(() => {
        spyOn(window, 'confirm').and.returnValue(true);
        src.upsertConfig.and.returnValue(of({ status: 'OK' }));
        src.getConfigs.and.returnValue(of([mkCfg(5, 'Сардоба', 3)]));
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 99, name: 'X', contacts: [] },
            sort_order: 3,
            include_in_total: true
        });
        component.saveConfig();
        tick();
        expect(src.upsertConfig).toHaveBeenCalled();
    }));

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
});
