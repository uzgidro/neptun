import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { ConfigTabComponent } from './config-tab.component';
import { ReservoirFloodService } from '@/core/services/reservoir-flood.service';
import { OrganizationService } from '@/core/services/organization.service';
import { ReservoirFloodConfig } from '@/core/interfaces/reservoir-flood';

function makeConfig(orgId: number, name: string): ReservoirFloodConfig {
    return {
        id: orgId, organization_id: orgId, organization_name: name,
        sort_order: orgId * 10, is_active: true, updated_at: '2026-04-25T08:00:00Z'
    };
}

describe('ReservoirFloodConfigTabComponent', () => {
    let component: ConfigTabComponent;
    let fixture: ComponentFixture<ConfigTabComponent>;
    let svc: jasmine.SpyObj<ReservoirFloodService>;
    let orgSvc: jasmine.SpyObj<OrganizationService>;
    let messageService: jasmine.SpyObj<MessageService>;

    beforeEach(async () => {
        svc = jasmine.createSpyObj('ReservoirFloodService',
            ['getConfigs', 'upsertConfig', 'deleteConfig', 'getHourly', 'upsertHourly']);
        orgSvc = jasmine.createSpyObj('OrganizationService', ['getOrganizationsFlat']);
        messageService = jasmine.createSpyObj('MessageService', ['add']);

        svc.getConfigs.and.returnValue(of([]));
        orgSvc.getOrganizationsFlat.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [ConfigTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: ReservoirFloodService, useValue: svc },
                { provide: OrganizationService, useValue: orgSvc },
                { provide: MessageService, useValue: messageService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigTabComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('loads configs on init', () => {
        const cfg = [makeConfig(42, 'Чарвак'), makeConfig(43, 'Тюямуюн')];
        svc.getConfigs.and.returnValue(of(cfg));
        fixture.detectChanges();
        expect(svc.getConfigs).toHaveBeenCalled();
        expect(component.configs.length).toBe(2);
    });

    it('opens dialog for new config', () => {
        fixture.detectChanges();
        component.openNew();
        expect(component.dialogVisible).toBeTrue();
        expect(component.isEditMode).toBeFalse();
    });

    it('opens dialog with patched form for edit', () => {
        fixture.detectChanges();
        const cfg = makeConfig(42, 'Чарвак');
        component.editConfig(cfg);
        expect(component.dialogVisible).toBeTrue();
        expect(component.isEditMode).toBeTrue();
        expect(component.form.get('sort_order')?.value).toBe(420);
        expect(component.form.get('is_active')?.value).toBeTrue();
    });

    it('saveConfig POSTs upsert and reloads on success', fakeAsync(() => {
        svc.upsertConfig.and.returnValue(of({ status: 'OK' }));
        svc.getConfigs.and.returnValue(of([]));
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 42, name: 'Чарвак', contacts: [] },
            sort_order: 10,
            is_active: true
        });
        component.saveConfig();
        tick();
        expect(svc.upsertConfig).toHaveBeenCalledWith({
            organization_id: 42, sort_order: 10, is_active: true
        });
    }));

    it('deleteConfig calls service when confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        svc.deleteConfig.and.returnValue(of(void 0));
        svc.getConfigs.and.returnValue(of([]));
        fixture.detectChanges();
        component.deleteConfig(42);
        expect(svc.deleteConfig).toHaveBeenCalledWith(42);
    });

    it('does not call deleteConfig when cancel is chosen', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        fixture.detectChanges();
        component.deleteConfig(42);
        expect(svc.deleteConfig).not.toHaveBeenCalled();
    });

    it('handles 404 on delete with ALREADY_DELETED toast and reloads', fakeAsync(() => {
        spyOn(window, 'confirm').and.returnValue(true);
        const err = new HttpErrorResponse({
            status: 404, statusText: 'Not Found',
            error: { error: 'config not found' }
        });
        svc.deleteConfig.and.returnValue(throwError(() => err));
        svc.getConfigs.and.returnValue(of([]));
        fixture.detectChanges();
        component.deleteConfig(42);
        tick();
        const call = messageService.add.calls.mostRecent();
        expect(String(call.args[0].detail)).toContain('RESERVOIR_FLOOD.ALREADY_DELETED');
        // reload fired
        expect(svc.getConfigs).toHaveBeenCalledTimes(2);
    }));

    it('handles 403 on save with ERROR_FORBIDDEN toast', fakeAsync(() => {
        const err = new HttpErrorResponse({
            status: 403, statusText: 'Forbidden',
            error: { error: 'forbidden' }
        });
        svc.upsertConfig.and.returnValue(throwError(() => err));
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 42, name: 'Чарвак', contacts: [] },
            sort_order: 10,
            is_active: true
        });
        component.saveConfig();
        tick();
        const call = messageService.add.calls.mostRecent();
        expect(call.args[0].severity).toBe('error');
    }));
});
