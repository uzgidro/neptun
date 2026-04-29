import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { PlansTabComponent } from './plans-tab.component';
import { AuthService } from '@/core/services/auth.service';
import { SolarReportService } from '@/core/services/solar-report.service';
import { SolarConfig } from '@/core/interfaces/solar-report';

function makeConfig(orgId: number, name: string): SolarConfig {
    return {
        id: orgId,
        organization_id: orgId,
        organization_name: name,
        installed_capacity_kw: 150,
        sort_order: orgId,
        updated_at: '2026-04-29T00:00:00Z'
    };
}

describe('PlansTabComponent (solar)', () => {
    let component: PlansTabComponent;
    let fixture: ComponentFixture<PlansTabComponent>;
    let solarReportService: jasmine.SpyObj<SolarReportService>;
    let authSpy: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('SolarReportService', [
            'getConfigs', 'getPlans', 'bulkUpsertPlans'
        ]);
        authSpy = jasmine.createSpyObj('AuthService', ['isScOrRais']);
        authSpy.isScOrRais.and.returnValue(true);

        spy.getConfigs.and.returnValue(of([]));
        spy.getPlans.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [PlansTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                provideRouter([]),
                { provide: SolarReportService, useValue: spy },
                { provide: AuthService, useValue: authSpy },
                MessageService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PlansTabComponent);
        component = fixture.componentInstance;
        solarReportService = TestBed.inject(SolarReportService) as jasmine.SpyObj<SolarReportService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load configs and plans on init', fakeAsync(() => {
        const configs = [makeConfig(10, 'Solar-1')];
        solarReportService.getConfigs.and.returnValue(of(configs));
        solarReportService.getPlans.and.returnValue(of([
            { id: 1, organization_id: 10, organization_name: 'Solar-1', year: 2026, month: 1, plan_thousand_kwh: 100 },
            { id: 2, organization_id: 10, organization_name: 'Solar-1', year: 2026, month: 3, plan_thousand_kwh: 120 }
        ]));
        fixture.detectChanges();
        tick();
        expect(component.planRows.length).toBe(1);
        expect(component.planRows[0].months[0]).toBe(100);
        expect(component.planRows[0].months[2]).toBe(120);
    }));

    it('should save only modified plans', fakeAsync(() => {
        const configs = [makeConfig(10, 'Solar-1')];
        solarReportService.getConfigs.and.returnValue(of(configs));
        solarReportService.getPlans.and.returnValue(of([]));
        solarReportService.bulkUpsertPlans.and.returnValue(of({ status: 'OK' }));
        fixture.detectChanges();
        tick();
        component.planRows[0].months[0] = 100;
        component.planRows[0].dirty[0] = true;
        component.savePlans();
        tick();
        expect(solarReportService.bulkUpsertPlans).toHaveBeenCalledWith([
            { organization_id: 10, year: component.selectedYear, month: 1, plan_thousand_kwh: 100 }
        ]);
    }));
});
