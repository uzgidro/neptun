import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { PlansTabComponent } from './plans-tab.component';
import { GesReportService } from '@/core/services/ges-report.service';
import { GesConfigResponse } from '@/core/interfaces/ges-report';

function makeConfig(orgId: number, name: string): GesConfigResponse {
    return {
        id: orgId, organization_id: orgId, organization_name: name,
        cascade_id: 1, cascade_name: 'Каскад',
        installed_capacity_mwt: 50, total_aggregates: 4,
        has_reservoir: true, sort_order: orgId
    };
}

describe('PlansTabComponent', () => {
    let component: PlansTabComponent;
    let fixture: ComponentFixture<PlansTabComponent>;
    let gesReportService: jasmine.SpyObj<GesReportService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('GesReportService', [
            'getConfigs', 'getPlans', 'bulkUpsertPlans'
        ]);
        spy.getConfigs.and.returnValue(of([]));
        spy.getPlans.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [PlansTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: GesReportService, useValue: spy },
                MessageService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PlansTabComponent);
        component = fixture.componentInstance;
        gesReportService = TestBed.inject(GesReportService) as jasmine.SpyObj<GesReportService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load configs and plans on init', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getPlans.and.returnValue(of([
            { id: 1, organization_id: 10, year: 2026, month: 1, plan_mln_kwh: 100 },
            { id: 2, organization_id: 10, year: 2026, month: 3, plan_mln_kwh: 120 }
        ]));
        fixture.detectChanges();
        tick();
        expect(component.planRows.length).toBe(1);
        expect(component.planRows[0].months[0]).toBe(100);
        expect(component.planRows[0].months[2]).toBe(120);
    }));

    it('should save only modified plans', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getPlans.and.returnValue(of([]));
        gesReportService.bulkUpsertPlans.and.returnValue(of({ status: 'OK' }));
        fixture.detectChanges();
        tick();
        component.planRows[0].months[0] = 100;
        component.planRows[0].dirty[0] = true;
        component.savePlans();
        tick();
        expect(gesReportService.bulkUpsertPlans).toHaveBeenCalledWith([
            { organization_id: 10, year: component.selectedYear, month: 1, plan_mln_kwh: 100 }
        ]);
    }));
});
