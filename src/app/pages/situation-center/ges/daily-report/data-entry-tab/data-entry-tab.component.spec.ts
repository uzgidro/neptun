import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DataEntryTabComponent } from './data-entry-tab.component';
import { GesReportService } from '@/core/services/ges-report.service';
import { GesConfigResponse } from '@/core/interfaces/ges-report';

function makeConfig(orgId: number, name: string, hasReservoir = true): GesConfigResponse {
    return {
        id: orgId, organization_id: orgId, organization_name: name,
        cascade_id: 1, cascade_name: 'Каскад',
        installed_capacity_mwt: 50, total_aggregates: 4,
        has_reservoir: hasReservoir, sort_order: orgId
    };
}

describe('DataEntryTabComponent', () => {
    let component: DataEntryTabComponent;
    let fixture: ComponentFixture<DataEntryTabComponent>;
    let gesReportService: jasmine.SpyObj<GesReportService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('GesReportService', [
            'getConfigs', 'getDailyData', 'upsertDailyData', 'getCascadeConfigs', 'getReport'
        ]);
        spy.getConfigs.and.returnValue(of([]));
        spy.getCascadeConfigs.and.returnValue(of([]));
        spy.getReport.and.returnValue(of(null));

        await TestBed.configureTestingModule({
            imports: [DataEntryTabComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: GesReportService, useValue: spy },
                MessageService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DataEntryTabComponent);
        component = fixture.componentInstance;
        gesReportService = TestBed.inject(GesReportService) as jasmine.SpyObj<GesReportService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load configs and daily data on init', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1'), makeConfig(20, 'ГЭС-2')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        fixture.detectChanges();
        tick();
        expect(gesReportService.getConfigs).toHaveBeenCalled();
        expect(component.rows.length).toBe(2);
    }));

    it('should populate row with existing daily data', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(of({
            id: 1, organization_id: 10, date: '2026-03-30',
            daily_production_mln_kwh: 3.5, working_aggregates: 3, water_level_m: 846.05
        }));
        fixture.detectChanges();
        tick();
        expect(component.rows[0].form.get('daily_production_mln_kwh')?.value).toBe(3.5);
        expect(component.rows[0].saved).toBeTrue();
    }));

    it('should track dirty state per row', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        fixture.detectChanges();
        tick();
        expect(component.rows[0].dirty).toBeFalse();
        component.rows[0].form.get('daily_production_mln_kwh')?.setValue(5.0);
        component.rows[0].form.get('daily_production_mln_kwh')?.markAsDirty();
        expect(component.rows[0].dirty).toBeTrue();
    }));

    it('should save all dirty rows', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1'), makeConfig(20, 'ГЭС-2')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        gesReportService.upsertDailyData.and.returnValue(of({ status: 'OK' }));
        fixture.detectChanges();
        tick();
        component.rows[0].form.get('daily_production_mln_kwh')?.setValue(5.0);
        component.rows[0].form.get('daily_production_mln_kwh')?.markAsDirty();
        component.saveAll();
        tick();
        expect(gesReportService.upsertDailyData).toHaveBeenCalledTimes(1);
    }));

    it('should implement canDeactivate', fakeAsync(() => {
        const configs = [makeConfig(10, 'ГЭС-1')];
        gesReportService.getConfigs.and.returnValue(of(configs));
        gesReportService.getDailyData.and.returnValue(throwError(() => ({ status: 404 })));
        fixture.detectChanges();
        tick();
        expect(component.canDeactivate()).toBeTrue();
        component.rows[0].form.get('daily_production_mln_kwh')?.setValue(5.0);
        component.rows[0].form.get('daily_production_mln_kwh')?.markAsDirty();
        spyOn(window, 'confirm').and.returnValue(true);
        expect(component.canDeactivate()).toBeTrue();
    }));
});
