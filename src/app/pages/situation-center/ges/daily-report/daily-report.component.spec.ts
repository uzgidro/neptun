import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { DailyReportComponent } from './daily-report.component';
import { AuthService } from '@/core/services/auth.service';
import { GesReportService } from '@/core/services/ges-report.service';
import { OrganizationService } from '@/core/services/organization.service';

describe('DailyReportComponent', () => {
    let component: DailyReportComponent;
    let fixture: ComponentFixture<DailyReportComponent>;
    let authSpy: jasmine.SpyObj<AuthService>;

    async function createComponent(scOrRais: boolean): Promise<void> {
        authSpy.isScOrRais.and.returnValue(scOrRais);
        fixture = TestBed.createComponent(DailyReportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    beforeEach(async () => {
        authSpy = jasmine.createSpyObj('AuthService', ['isScOrRais', 'isAdmin']);
        authSpy.isAdmin.and.returnValue(false);

        const gesReportSpy = jasmine.createSpyObj('GesReportService', [
            'getConfigs', 'upsertConfig', 'deleteConfig',
            'getCascadeConfigs', 'upsertCascadeConfig', 'deleteCascadeConfig',
            'getDailyData', 'upsertDailyData', 'getPlans', 'upsertPlan', 'getReport'
        ]);
        const orgSpy = jasmine.createSpyObj('OrganizationService', ['getOrganizationsFlat', 'getCascades']);
        gesReportSpy.getConfigs.and.returnValue(of([]));
        gesReportSpy.getCascadeConfigs.and.returnValue(of([]));
        gesReportSpy.getDailyData.and.returnValue(of(null));
        gesReportSpy.getPlans.and.returnValue(of([]));
        gesReportSpy.getReport.and.returnValue(of({ date: '2026-01-01', cascades: [], grand_total: {} } as unknown as never));
        orgSpy.getOrganizationsFlat.and.returnValue(of([]));
        orgSpy.getCascades.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [DailyReportComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                provideRouter([]),
                { provide: AuthService, useValue: authSpy },
                { provide: GesReportService, useValue: gesReportSpy },
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
        expect(keys).toEqual(['config', 'data-entry', 'plans']);
    });
});
