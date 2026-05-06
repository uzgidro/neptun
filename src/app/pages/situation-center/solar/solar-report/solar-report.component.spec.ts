import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { SolarReportComponent } from './solar-report.component';
import { AuthService } from '@/core/services/auth.service';
import { SolarReportService } from '@/core/services/solar-report.service';
import { OrganizationService } from '@/core/services/organization.service';

describe('SolarReportComponent', () => {
    let component: SolarReportComponent;
    let fixture: ComponentFixture<SolarReportComponent>;
    let authSpy: jasmine.SpyObj<AuthService>;

    async function createComponent(scOrRais: boolean): Promise<void> {
        authSpy.isScOrRais.and.returnValue(scOrRais);
        fixture = TestBed.createComponent(SolarReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    beforeEach(async () => {
        authSpy = jasmine.createSpyObj('AuthService', ['isScOrRais', 'isAdmin', 'hasRole']);
        authSpy.isAdmin.and.returnValue(false);
        authSpy.hasRole.and.returnValue(false);

        const solarReportSpy = jasmine.createSpyObj('SolarReportService', [
            'getConfigs', 'upsertConfig', 'deleteConfig',
            'getDailyData', 'upsertDailyData',
            'getPlans', 'bulkUpsertPlans'
        ]);
        const orgSpy = jasmine.createSpyObj('OrganizationService', ['getOrganizationsFlat', 'getCascades']);
        solarReportSpy.getConfigs.and.returnValue(of([]));
        solarReportSpy.getDailyData.and.returnValue(of([]));
        solarReportSpy.getPlans.and.returnValue(of([]));
        orgSpy.getOrganizationsFlat.and.returnValue(of([]));
        orgSpy.getCascades.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [SolarReportComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                provideRouter([]),
                { provide: AuthService, useValue: authSpy },
                { provide: SolarReportService, useValue: solarReportSpy },
                { provide: OrganizationService, useValue: orgSpy },
                MessageService
            ]
        }).compileComponents();
    });

    it('hides config and plans tabs for cascade user', async () => {
        await createComponent(false);
        const keys = component.tabs.map(t => t.key);
        expect(keys).not.toContain('config');
        expect(keys).not.toContain('plans');
        expect(keys).toContain('data-entry');
    });

    it('shows all tabs for sc/rais user', async () => {
        await createComponent(true);
        const keys = component.tabs.map(t => t.key);
        expect(keys).toEqual(['data-entry', 'plans', 'config']);
    });
});
