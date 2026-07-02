import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DischargesComponent } from './discharges.component';
import { AuthService } from '@/core/services/auth.service';
import { DischargeService } from '@/core/services/discharge.service';
import { OrganizationService } from '@/core/services/organization.service';
import { GesReportService } from '@/core/services/ges-report.service';

describe('DischargesComponent', () => {
    let fixture: ComponentFixture<DischargesComponent>;
    let component: DischargesComponent;
    let authService: jasmine.SpyObj<AuthService>;
    let router: Router;

    function setup(isScOrRais: boolean, tabParam: string | null = null): void {
        const authSpy = jasmine.createSpyObj('AuthService', ['isScOrRais', 'isSc']);
        authSpy.isScOrRais.and.returnValue(isScOrRais);
        authSpy.isSc.and.returnValue(isScOrRais);

        const dischargeSpy = jasmine.createSpyObj('DischargeService', ['getSummary', 'getFlatDischarges']);
        dischargeSpy.getSummary.and.returnValue(
            of({ from: '', to: '', granularity: 'month', cascades: [], grand_total: { buckets: [], total: { volume_mln_m3: 0, avg_flow_rate_m3_s: 0, generation_loss_mwh: 0 } } })
        );
        dischargeSpy.getFlatDischarges.and.returnValue(of([]));

        const orgSpy = jasmine.createSpyObj('OrganizationService', ['getCascades']);
        orgSpy.getCascades.and.returnValue(of([]));

        const gesReportSpy = jasmine.createSpyObj('GesReportService', ['getConfigs']);
        gesReportSpy.getConfigs.and.returnValue(of([]));

        TestBed.configureTestingModule({
            imports: [DischargesComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                provideRouter([]),
                MessageService,
                { provide: AuthService, useValue: authSpy },
                { provide: DischargeService, useValue: dischargeSpy },
                { provide: OrganizationService, useValue: orgSpy },
                { provide: GesReportService, useValue: gesReportSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { queryParamMap: convertToParamMap(tabParam ? { tab: tabParam } : {}) },
                        queryParams: of(tabParam ? { tab: tabParam } : {}),
                        params: of({})
                    }
                }
            ]
        });

        fixture = TestBed.createComponent(DischargesComponent);
        component = fixture.componentInstance;
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        router = TestBed.inject(Router);
    }

    it('shows journal and summary tabs for sc/rais', () => {
        setup(true);
        fixture.detectChanges();

        expect(component.tabs.map((t) => t.key)).toEqual(['journal', 'summary']);
    });

    it('shows only the journal tab for non-sc/rais roles', () => {
        setup(false);
        fixture.detectChanges();

        expect(component.tabs.map((t) => t.key)).toEqual(['journal']);
    });

    it('defaults to the journal tab', () => {
        setup(true);
        fixture.detectChanges();

        expect(component.activeTab).toBe('journal');
    });

    it('restores the summary tab from ?tab=summary', () => {
        setup(true, 'summary');
        fixture.detectChanges();

        expect(component.activeTab).toBe('summary');
    });

    it('falls back to the first tab on an invalid ?tab=', () => {
        setup(true, 'bogus');
        fixture.detectChanges();

        expect(component.activeTab).toBe('journal');
    });

    it('non-sc/rais cannot activate the summary tab via ?tab=summary', () => {
        setup(false, 'summary');
        fixture.detectChanges();

        expect(component.activeTab).toBe('journal');
    });

    it('onTabChange navigates merging query params', () => {
        setup(true);
        fixture.detectChanges();
        const navigateSpy = spyOn(router, 'navigate');

        component.onTabChange('summary');

        expect(component.activeTab).toBe('summary');
        expect(navigateSpy).toHaveBeenCalledWith(
            [],
            jasmine.objectContaining({ queryParams: { tab: 'summary' }, queryParamsHandling: 'merge' })
        );
    });
});
