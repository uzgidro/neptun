import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ShutdownDischargeComponent } from './shutdown-discharge.component';
import { TimeService } from '@/core/services/time.service';
import { DischargeService } from '@/core/services/discharge.service';
import { OrganizationService } from '@/core/services/organization.service';
import { AuthService } from '@/core/services/auth.service';
import { ScService } from '@/core/services/sc.service';
import { GesReportService } from '@/core/services/ges-report.service';

describe('ShutdownDischargeComponent - 409 Conflict handling', () => {
    let component: ShutdownDischargeComponent;
    let fixture: ComponentFixture<ShutdownDischargeComponent>;
    let dischargeService: jasmine.SpyObj<DischargeService>;
    let messageService: jasmine.SpyObj<MessageService>;
    let translateService: TranslateService;

    beforeEach(async () => {
        const dischargeSpy = jasmine.createSpyObj('DischargeService', [
            'addDischarge', 'getFlatDischarges', 'editDischarge', 'deleteDischarge'
        ]);
        dischargeSpy.getFlatDischarges.and.returnValue(of([]));

        const orgSpy = jasmine.createSpyObj('OrganizationService', ['getCascades']);
        orgSpy.getCascades.and.returnValue(of([]));

        const authSpy = jasmine.createSpyObj('AuthService', ['hasPermission', 'isSc']);
        authSpy.hasPermission.and.returnValue(true);
        authSpy.isSc.and.returnValue(true);

        const scSpy = jasmine.createSpyObj('ScService', ['downloadScReport']);

        const gesReportSpy = jasmine.createSpyObj('GesReportService', ['getConfigs']);
        gesReportSpy.getConfigs.and.returnValue(of([]));

        const msgSpy = jasmine.createSpyObj('MessageService', ['add']);

        await TestBed.configureTestingModule({
            imports: [ShutdownDischargeComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: DischargeService, useValue: dischargeSpy },
                { provide: OrganizationService, useValue: orgSpy },
                { provide: AuthService, useValue: authSpy },
                { provide: ScService, useValue: scSpy },
                { provide: GesReportService, useValue: gesReportSpy },
                { provide: MessageService, useValue: msgSpy },
                { provide: ActivatedRoute, useValue: { queryParams: of({}), snapshot: { queryParamMap: { get: () => null } } } },
                { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
                { provide: TimeService, useValue: { getServerDate: () => of(new Date()) } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ShutdownDischargeComponent);
        component = fixture.componentInstance;
        dischargeService = TestBed.inject(DischargeService) as jasmine.SpyObj<DischargeService>;
        messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
        translateService = TestBed.inject(TranslateService);

        fixture.detectChanges();
    });

    function setupValidForm(): void {
        component.form.patchValue({
            organization: { id: 1, name: 'Test Org' },
            started_at: new Date('2026-04-01'),
            flow_rate: 10
        });
    }

    function make409Error(errorMessage: string): HttpErrorResponse {
        return new HttpErrorResponse({
            status: 409,
            statusText: 'Conflict',
            error: { error: errorMessage }
        });
    }

    function make500Error(): HttpErrorResponse {
        return new HttpErrorResponse({
            status: 500,
            statusText: 'Internal Server Error',
            error: { message: 'Server error' }
        });
    }

    it('should show confirm dialog on 409 and retry with force=true when user confirms', () => {
        setupValidForm();
        component.isEditMode = false;

        const conflictMsg = 'Для данной организации уже существует незавершенный холостой сброс';
        dischargeService.addDischarge.and.returnValues(
            throwError(() => make409Error(conflictMsg)),
            of({})
        );

        spyOn(window, 'confirm').and.returnValue(true);

        component.onSubmit();

        expect(window.confirm).toHaveBeenCalled();
        expect(dischargeService.addDischarge).toHaveBeenCalledTimes(2);
        // Second call should have force=true
        const secondCallArgs = dischargeService.addDischarge.calls.argsFor(1);
        expect(secondCallArgs[1]).toBeTrue();
        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'success' })
        );
    });

    it('should reset isLoading and keep form open when user cancels on 409', () => {
        setupValidForm();
        component.isEditMode = false;
        component.isFormOpen = true;

        dischargeService.addDischarge.and.returnValue(
            throwError(() => make409Error('Conflict'))
        );

        spyOn(window, 'confirm').and.returnValue(false);

        component.onSubmit();

        expect(window.confirm).toHaveBeenCalled();
        expect(dischargeService.addDischarge).toHaveBeenCalledTimes(1);
        expect(component.isLoading).toBeFalse();
        expect(component.isFormOpen).toBeTrue();
        expect(component.submitted).toBeFalse();
    });

    it('should show error toast on non-409 error without confirm dialog', () => {
        setupValidForm();
        component.isEditMode = false;
        component.isFormOpen = true;

        dischargeService.addDischarge.and.returnValue(
            throwError(() => make500Error())
        );

        spyOn(window, 'confirm');

        component.onSubmit();

        expect(window.confirm).not.toHaveBeenCalled();
        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'error' })
        );
        expect(component.isLoading).toBeFalse();
    });

    it('should use backend error message in confirm dialog', () => {
        setupValidForm();
        component.isEditMode = false;

        const backendMsg = 'Для данной организации уже существует незавершенный холостой сброс';
        dischargeService.addDischarge.and.returnValue(
            throwError(() => make409Error(backendMsg))
        );

        spyOn(window, 'confirm').and.returnValue(false);

        component.onSubmit();

        const confirmArg = (window.confirm as jasmine.Spy).calls.argsFor(0)[0];
        expect(confirmArg).toContain(backendMsg);
    });

    it('should show error toast if force retry also fails', () => {
        setupValidForm();
        component.isEditMode = false;

        dischargeService.addDischarge.and.returnValues(
            throwError(() => make409Error('Conflict')),
            throwError(() => make500Error())
        );

        spyOn(window, 'confirm').and.returnValue(true);

        component.onSubmit();

        expect(dischargeService.addDischarge).toHaveBeenCalledTimes(2);
        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'error' })
        );
        expect(component.isLoading).toBeFalse();
    });
});

