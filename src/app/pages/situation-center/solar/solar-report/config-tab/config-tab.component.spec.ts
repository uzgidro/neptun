import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ConfigTabComponent } from './config-tab.component';
import { AuthService } from '@/core/services/auth.service';
import { SolarReportService } from '@/core/services/solar-report.service';
import { OrganizationService } from '@/core/services/organization.service';
import { SolarConfig } from '@/core/interfaces/solar-report';

function makeConfig(id: number, orgId: number, orgName: string): SolarConfig {
    return {
        id,
        organization_id: orgId,
        organization_name: orgName,
        installed_capacity_kw: 150,
        sort_order: id,
        updated_at: '2026-04-29T00:00:00Z'
    };
}

describe('ConfigTabComponent (solar)', () => {
    let component: ConfigTabComponent;
    let fixture: ComponentFixture<ConfigTabComponent>;
    let solarReportService: jasmine.SpyObj<SolarReportService>;
    let authSpy: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        const solarSpy = jasmine.createSpyObj('SolarReportService', [
            'getConfigs', 'upsertConfig', 'deleteConfig'
        ]);
        const orgSpy = jasmine.createSpyObj('OrganizationService', ['getOrganizationsFlat']);
        authSpy = jasmine.createSpyObj('AuthService', ['isScOrRais']);
        authSpy.isScOrRais.and.returnValue(true);

        solarSpy.getConfigs.and.returnValue(of([]));
        orgSpy.getOrganizationsFlat.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [ConfigTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: SolarReportService, useValue: solarSpy },
                { provide: OrganizationService, useValue: orgSpy },
                { provide: AuthService, useValue: authSpy },
                MessageService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigTabComponent);
        component = fixture.componentInstance;
        solarReportService = TestBed.inject(SolarReportService) as jasmine.SpyObj<SolarReportService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load configs on init', () => {
        const configs = [makeConfig(1, 10, 'Solar-1'), makeConfig(2, 20, 'Solar-2')];
        solarReportService.getConfigs.and.returnValue(of(configs));
        fixture.detectChanges();
        expect(solarReportService.getConfigs).toHaveBeenCalled();
        expect(component.configs.length).toBe(2);
    });

    it('should open dialog for new config', () => {
        fixture.detectChanges();
        component.openNew();
        expect(component.dialogVisible).toBeTrue();
        expect(component.isEditMode).toBeFalse();
    });

    it('should open dialog for editing', () => {
        const config = makeConfig(1, 10, 'Solar-1');
        fixture.detectChanges();
        component.editConfig(config);
        expect(component.dialogVisible).toBeTrue();
        expect(component.isEditMode).toBeTrue();
    });

    it('should save config and reload', () => {
        solarReportService.upsertConfig.and.returnValue(of({ status: 'OK' }));
        solarReportService.getConfigs.and.returnValue(of([]));
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 10, name: 'Solar-1', contacts: [] },
            installed_capacity_kw: 150,
            sort_order: 1
        });
        component.saveConfig();
        expect(solarReportService.upsertConfig).toHaveBeenCalledWith({
            organization_id: 10,
            installed_capacity_kw: 150,
            sort_order: 1
        });
    });

    it('should delete config after confirm', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        solarReportService.deleteConfig.and.returnValue(of(void 0));
        solarReportService.getConfigs.and.returnValue(of([]));
        fixture.detectChanges();
        component.deleteConfig(10);
        expect(solarReportService.deleteConfig).toHaveBeenCalledWith(10);
    });

    it('should not delete config if confirm cancelled', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        fixture.detectChanges();
        component.deleteConfig(10);
        expect(solarReportService.deleteConfig).not.toHaveBeenCalled();
    });
});
