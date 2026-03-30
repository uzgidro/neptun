import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ConfigTabComponent } from './config-tab.component';
import { GesReportService } from '@/core/services/ges-report.service';
import { OrganizationService } from '@/core/services/organization.service';
import { GesConfigResponse } from '@/core/interfaces/ges-report';

function makeConfig(id: number, orgId: number, orgName: string): GesConfigResponse {
    return {
        id, organization_id: orgId, organization_name: orgName,
        cascade_id: 1, cascade_name: 'Каскад',
        installed_capacity_mwt: 50, total_aggregates: 4,
        has_reservoir: true, sort_order: id
    };
}

describe('ConfigTabComponent', () => {
    let component: ConfigTabComponent;
    let fixture: ComponentFixture<ConfigTabComponent>;
    let gesReportService: jasmine.SpyObj<GesReportService>;
    let organizationService: jasmine.SpyObj<OrganizationService>;

    beforeEach(async () => {
        const gesReportSpy = jasmine.createSpyObj('GesReportService', [
            'getConfigs', 'upsertConfig', 'deleteConfig'
        ]);
        const orgSpy = jasmine.createSpyObj('OrganizationService', ['getOrganizationsFlat']);

        gesReportSpy.getConfigs.and.returnValue(of([]));
        orgSpy.getOrganizationsFlat.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [ConfigTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: GesReportService, useValue: gesReportSpy },
                { provide: OrganizationService, useValue: orgSpy },
                MessageService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ConfigTabComponent);
        component = fixture.componentInstance;
        gesReportService = TestBed.inject(GesReportService) as jasmine.SpyObj<GesReportService>;
        organizationService = TestBed.inject(OrganizationService) as jasmine.SpyObj<OrganizationService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load configs on init', () => {
        const configs = [makeConfig(1, 10, 'ГЭС-1'), makeConfig(2, 20, 'ГЭС-2')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        fixture.detectChanges();
        expect(gesReportService.getConfigs).toHaveBeenCalled();
        expect(component.configs.length).toBe(2);
    });

    it('should open dialog for new config', () => {
        fixture.detectChanges();
        component.openNew();
        expect(component.dialogVisible).toBeTrue();
        expect(component.isEditMode).toBeFalse();
    });

    it('should open dialog for editing', () => {
        const config = makeConfig(1, 10, 'ГЭС-1');
        fixture.detectChanges();
        component.editConfig(config);
        expect(component.dialogVisible).toBeTrue();
        expect(component.isEditMode).toBeTrue();
        expect(component.form.get('organization_id')?.value).toBe(10);
    });

    it('should save config and reload', () => {
        gesReportService.upsertConfig.and.returnValue(of({ status: 'OK' }));
        gesReportService.getConfigs.and.returnValue(of([]));
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization_id: 10, installed_capacity_mwt: 50,
            total_aggregates: 4, has_reservoir: true, sort_order: 1
        });
        component.saveConfig();
        expect(gesReportService.upsertConfig).toHaveBeenCalledWith({
            organization_id: 10, installed_capacity_mwt: 50,
            total_aggregates: 4, has_reservoir: true, sort_order: 1
        });
    });

    it('should delete config after confirm', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        gesReportService.deleteConfig.and.returnValue(of(void 0));
        gesReportService.getConfigs.and.returnValue(of([]));
        fixture.detectChanges();
        component.deleteConfig(10);
        expect(gesReportService.deleteConfig).toHaveBeenCalledWith(10);
    });

    it('should not delete config if confirm cancelled', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        fixture.detectChanges();
        component.deleteConfig(10);
        expect(gesReportService.deleteConfig).not.toHaveBeenCalled();
    });
});
