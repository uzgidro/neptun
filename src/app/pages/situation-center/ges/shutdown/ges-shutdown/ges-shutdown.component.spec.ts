import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { GesShutdownComponent } from './ges-shutdown.component';
import { GesShutdownService } from '@/core/services/ges-shutdown.service';
import { OrganizationService } from '@/core/services/organization.service';
import { AuthService } from '@/core/services/auth.service';
import { ScService } from '@/core/services/sc.service';

describe('GesShutdownComponent - 409 Conflict handling', () => {
    let component: GesShutdownComponent;
    let fixture: ComponentFixture<GesShutdownComponent>;
    let gesShutdownService: jasmine.SpyObj<GesShutdownService>;
    let messageService: jasmine.SpyObj<MessageService>;

    beforeEach(async () => {
        const shutdownSpy = jasmine.createSpyObj('GesShutdownService', [
            'addShutdown', 'getShutdowns', 'editShutdown', 'deleteShutdown'
        ]);
        shutdownSpy.getShutdowns.and.returnValue(of({ ges: [], mini: [], micro: [] }));

        const orgSpy = jasmine.createSpyObj('OrganizationService', ['getCascades']);
        orgSpy.getCascades.and.returnValue(of([]));

        const authSpy = jasmine.createSpyObj('AuthService', ['hasPermission', 'isSc', 'hasRole']);
        authSpy.hasPermission.and.returnValue(true);
        authSpy.isSc.and.returnValue(true);
        authSpy.hasRole.and.returnValue(true);

        const scSpy = jasmine.createSpyObj('ScService', ['downloadScReport']);

        const msgSpy = jasmine.createSpyObj('MessageService', ['add']);

        await TestBed.configureTestingModule({
            imports: [GesShutdownComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: GesShutdownService, useValue: shutdownSpy },
                { provide: OrganizationService, useValue: orgSpy },
                { provide: AuthService, useValue: authSpy },
                { provide: ScService, useValue: scSpy },
                { provide: MessageService, useValue: msgSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(GesShutdownComponent);
        component = fixture.componentInstance;
        gesShutdownService = TestBed.inject(GesShutdownService) as jasmine.SpyObj<GesShutdownService>;
        messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

        fixture.detectChanges();
    });

    function setupValidForm(): void {
        component.form.patchValue({
            organization: { id: 1, name: 'Test Org' },
            start_time: new Date('2026-04-01')
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

        const conflictMsg = 'Для данной организации уже существует незавершённое аварийное отключение';
        gesShutdownService.addShutdown.and.returnValues(
            throwError(() => make409Error(conflictMsg)),
            of({})
        );

        spyOn(window, 'confirm').and.returnValue(true);

        component.onSubmit();

        expect(window.confirm).toHaveBeenCalled();
        expect(gesShutdownService.addShutdown).toHaveBeenCalledTimes(2);
        const secondCallArgs = gesShutdownService.addShutdown.calls.argsFor(1);
        expect(secondCallArgs[1]).toBeTrue();
        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'success' })
        );
    });

    it('should reset isLoading and keep form open when user cancels on 409', () => {
        setupValidForm();
        component.isEditMode = false;
        component.isFormOpen = true;

        gesShutdownService.addShutdown.and.returnValue(
            throwError(() => make409Error('Conflict'))
        );

        spyOn(window, 'confirm').and.returnValue(false);

        component.onSubmit();

        expect(window.confirm).toHaveBeenCalled();
        expect(gesShutdownService.addShutdown).toHaveBeenCalledTimes(1);
        expect(component.isLoading).toBeFalse();
        expect(component.isFormOpen).toBeTrue();
        expect(component.submitted).toBeFalse();
    });

    it('should show error toast on non-409 error without confirm dialog', () => {
        setupValidForm();
        component.isEditMode = false;
        component.isFormOpen = true;

        gesShutdownService.addShutdown.and.returnValue(
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

        const backendMsg = 'Для данной организации уже существует незавершённое аварийное отключение';
        gesShutdownService.addShutdown.and.returnValue(
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

        gesShutdownService.addShutdown.and.returnValues(
            throwError(() => make409Error('Conflict')),
            throwError(() => make500Error())
        );

        spyOn(window, 'confirm').and.returnValue(true);

        component.onSubmit();

        expect(gesShutdownService.addShutdown).toHaveBeenCalledTimes(2);
        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'error' })
        );
        expect(component.isLoading).toBeFalse();
    });
});

describe('GesShutdownComponent - canEditShutdown (ownership gate)', () => {
    let component: GesShutdownComponent;
    let fixture: ComponentFixture<GesShutdownComponent>;
    let authSpy: jasmine.SpyObj<AuthService>;

    function makeShutdown(createdById: number | null): any {
        return {
            id: 1,
            organization_id: 10,
            organization_name: 'ГЭС-1',
            started_at: '2026-04-01T00:00:00Z',
            ended_at: null,
            reason: null,
            created_by: createdById === null ? null : { id: createdById, name: 'u' },
            generation_loss: null,
            created_at: '2026-04-01T00:00:00Z',
            idle_discharge_volume: null,
            viewed: false
        };
    }

    async function setupWith(authOverrides: Partial<Record<keyof AuthService, any>>): Promise<void> {
        const shutdownSpy = jasmine.createSpyObj('GesShutdownService', [
            'addShutdown', 'getShutdowns', 'editShutdown', 'deleteShutdown'
        ]);
        shutdownSpy.getShutdowns.and.returnValue(of({ ges: [], mini: [], micro: [] }));

        const orgSpy = jasmine.createSpyObj('OrganizationService', ['getCascades']);
        orgSpy.getCascades.and.returnValue(of([]));

        authSpy = jasmine.createSpyObj('AuthService', ['hasRole', 'isOnlyCascade', 'getUserId']);
        authSpy.hasRole.and.returnValue(authOverrides['hasRole'] ?? true);
        authSpy.isOnlyCascade.and.returnValue(authOverrides['isOnlyCascade'] ?? false);
        authSpy.getUserId.and.returnValue(authOverrides['getUserId'] ?? null);

        const scSpy = jasmine.createSpyObj('ScService', ['downloadScReport']);
        const msgSpy = jasmine.createSpyObj('MessageService', ['add']);

        await TestBed.configureTestingModule({
            imports: [GesShutdownComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: GesShutdownService, useValue: shutdownSpy },
                { provide: OrganizationService, useValue: orgSpy },
                { provide: AuthService, useValue: authSpy },
                { provide: ScService, useValue: scSpy },
                { provide: MessageService, useValue: msgSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(GesShutdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('returns false when canWriteShutdown is false (viewer)', async () => {
        await setupWith({ hasRole: false });
        expect(component.canEditShutdown(makeShutdown(10))).toBeFalse();
    });

    it('returns true for sc/rais (multi-role) regardless of ownership', async () => {
        await setupWith({ hasRole: true, isOnlyCascade: false, getUserId: 99 });
        expect(component.canEditShutdown(makeShutdown(10))).toBeTrue();
        expect(component.canEditShutdown(makeShutdown(20))).toBeTrue();
    });

    it('returns true for only-cascade when uid matches created_by.id', async () => {
        await setupWith({ hasRole: true, isOnlyCascade: true, getUserId: 10 });
        expect(component.canEditShutdown(makeShutdown(10))).toBeTrue();
    });

    it('returns false for only-cascade when uid differs from created_by.id', async () => {
        await setupWith({ hasRole: true, isOnlyCascade: true, getUserId: 10 });
        expect(component.canEditShutdown(makeShutdown(20))).toBeFalse();
    });

    it('returns false for only-cascade when getUserId returns null (fail-closed)', async () => {
        await setupWith({ hasRole: true, isOnlyCascade: true, getUserId: null });
        expect(component.canEditShutdown(makeShutdown(10))).toBeFalse();
    });

    it('returns false for only-cascade when created_by is missing', async () => {
        await setupWith({ hasRole: true, isOnlyCascade: true, getUserId: 10 });
        expect(component.canEditShutdown(makeShutdown(null))).toBeFalse();
    });
});
