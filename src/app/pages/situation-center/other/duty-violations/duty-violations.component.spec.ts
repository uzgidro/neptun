import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { DutyViolationsComponent } from './duty-violations.component';
import { DutyViolationService } from '@/core/services/duty-violation.service';
import { OrganizationService } from '@/core/services/organization.service';
import { ApiService } from '@/core/services/api.service';
import { AuthService } from '@/core/services/auth.service';
import { DutyViolationDto } from '@/core/interfaces/duty-violations';

function makeViolation(id: number): DutyViolationDto {
    return {
        id,
        organization_id: 103,
        organization_name: 'Пском',
        start_time: new Date('2026-06-08T08:00:00+05:00'),
        end_time: new Date('2026-06-08T20:00:00+05:00'),
        duty_officer_name: 'Иванов И.И.',
        reason: 'Не вышел на смену',
        files: [],
        created_at: new Date('2026-06-09T10:00:00Z')
    };
}

describe('DutyViolationsComponent', () => {
    let component: DutyViolationsComponent;
    let fixture: ComponentFixture<DutyViolationsComponent>;
    let svc: jasmine.SpyObj<DutyViolationService>;
    let orgSvc: jasmine.SpyObj<OrganizationService>;
    let apiService: jasmine.SpyObj<ApiService>;

    beforeEach(async () => {
        svc = jasmine.createSpyObj('DutyViolationService', ['getViolations', 'addViolation', 'editViolation', 'deleteViolation']);
        orgSvc = jasmine.createSpyObj('OrganizationService', ['getCascades']);
        apiService = jasmine.createSpyObj('ApiService', ['uploadFiles']);
        const authSpy = jasmine.createSpyObj('AuthService', ['isSc', 'isAuthenticated']);
        authSpy.isSc.and.returnValue(true);
        authSpy.isAuthenticated.and.returnValue(true);

        svc.getViolations.and.returnValue(of([]));
        svc.addViolation.and.returnValue(of({}));
        svc.editViolation.and.returnValue(of({}));
        svc.deleteViolation.and.returnValue(of({}));
        // Cascade structure: each cascade is a group with `items` (organizations).
        orgSvc.getCascades.and.returnValue(of([
            { id: 1, name: 'Каскад А', items: [{ id: 103, name: 'Пском' }] }
        ] as any));

        await TestBed.configureTestingModule({
            imports: [DutyViolationsComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                provideRouter([]),
                { provide: DutyViolationService, useValue: svc },
                { provide: OrganizationService, useValue: orgSvc },
                { provide: ApiService, useValue: apiService },
                { provide: AuthService, useValue: authSpy },
                MessageService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DutyViolationsComponent);
        component = fixture.componentInstance;
    });

    it('loads violations on init', () => {
        svc.getViolations.and.returnValue(of([makeViolation(7), makeViolation(3)]));
        fixture.detectChanges();
        expect(svc.getViolations).toHaveBeenCalled();
        expect(component.violations.length).toBe(2);
    });

    it('getOrganizationIndex returns 1-based org position', () => {
        const a = makeViolation(7); a.organization_name = 'Андижон';
        const b = makeViolation(3); b.organization_name = 'Пском';
        svc.getViolations.and.returnValue(of([a, b]));
        fixture.detectChanges();
        expect(component.getOrganizationIndex('Андижон')).toBe(1);
        expect(component.getOrganizationIndex('Пском')).toBe(2);
    });

    it('getRowIndex returns "orgIndex.indexInOrg"', () => {
        const a1 = makeViolation(7); a1.organization_name = 'Андижон';
        const a2 = makeViolation(8); a2.organization_name = 'Андижон';
        const b1 = makeViolation(3); b1.organization_name = 'Пском';
        svc.getViolations.and.returnValue(of([a1, a2, b1]));
        fixture.detectChanges();
        expect(component.getRowIndex(a1)).toBe('1.1');
        expect(component.getRowIndex(a2)).toBe('1.2');
        expect(component.getRowIndex(b1)).toBe('2.1');
    });

    it('form is invalid when end_time <= start_time', () => {
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 103, name: 'Пском' },
            start_time: new Date('2026-06-08T20:00:00'),
            end_time: new Date('2026-06-08T08:00:00'),
            duty_officer_name: 'И.И.',
            reason: 'причина'
        });
        expect(component.form.invalid).toBeTrue();
        expect(component.form.errors?.['endBeforeStart']).toBeTrue();
    });

    it('form is valid when end_time is empty (optional)', () => {
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 103, name: 'Пском' },
            start_time: new Date('2026-06-08T08:00:00'),
            end_time: null,
            duty_officer_name: 'И.И.',
            reason: 'причина'
        });
        expect(component.form.valid).toBeTrue();
    });

    it('onSubmit (create) omits end_time when not provided', fakeAsync(() => {
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 103, name: 'Пском' },
            start_time: new Date('2026-06-08T08:00:00'),
            end_time: null,
            duty_officer_name: 'И.И.', reason: 'причина'
        });
        component.onSubmit();
        tick();
        const body = svc.addViolation.calls.mostRecent().args[0] as any;
        expect('end_time' in body).toBeFalse();
        expect(body.start_time).toBeTruthy();
    }));

    it('onSubmit (edit) sends end_time:null when a previously-set end is cleared', fakeAsync(() => {
        fixture.detectChanges();
        const v = makeViolation(7);
        v.end_time = new Date('2026-06-08T20:00:00'); // closed shift
        component.editViolation(v);
        component.form.patchValue({ end_time: null }); // user clears it
        component.onSubmit();
        tick();
        const body = svc.editViolation.calls.mostRecent().args[1] as any;
        expect('end_time' in body).toBeTrue();
        expect(body.end_time).toBeNull();
    }));

    it('onSubmit (edit) sends ISO end_time when end is filled', fakeAsync(() => {
        fixture.detectChanges();
        const v = makeViolation(7);
        component.editViolation(v);
        const end = new Date('2026-06-08T21:00:00');
        component.form.patchValue({ end_time: end });
        component.onSubmit();
        tick();
        const body = svc.editViolation.calls.mostRecent().args[1] as any;
        expect(body.end_time).toBe(end.toISOString());
    }));

    it('form is valid when end_time > start_time and all fields filled', () => {
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 103, name: 'Пском' },
            start_time: new Date('2026-06-08T08:00:00'),
            end_time: new Date('2026-06-08T20:00:00'),
            duty_officer_name: 'И.И.',
            reason: 'причина'
        });
        expect(component.form.valid).toBeTrue();
    });

    it('onSubmit (create) posts ISO start_time/end_time and fields', fakeAsync(() => {
        fixture.detectChanges();
        component.openNew();
        const start = new Date('2026-06-08T08:00:00');
        const end = new Date('2026-06-08T20:00:00');
        component.form.patchValue({
            organization: { id: 103, name: 'Пском' },
            start_time: start, end_time: end,
            duty_officer_name: 'Иванов И.И.', reason: 'Не вышел'
        });
        component.onSubmit();
        tick();
        expect(svc.addViolation).toHaveBeenCalledTimes(1);
        const body = svc.addViolation.calls.mostRecent().args[0];
        expect(body.organization_id).toBe(103);
        expect(body.start_time).toBe(start.toISOString());
        expect(body.end_time).toBe(end.toISOString());
        expect(body.duty_officer_name).toBe('Иванов И.И.');
        expect(body.reason).toBe('Не вышел');
    }));

    it('editViolation resolves organization from the cascade structure', () => {
        fixture.detectChanges();
        const v = makeViolation(7);
        v.organization_id = 103;
        component.editViolation(v);
        const org = component.form.get('organization')?.value as any;
        expect(org?.id).toBe(103);
        expect(org?.name).toBe('Пском');
    });

    it('onSubmit (edit) calls editViolation with id', fakeAsync(() => {
        fixture.detectChanges();
        component.editViolation(makeViolation(7));
        component.form.patchValue({ reason: 'обновлено' });
        component.onSubmit();
        tick();
        expect(svc.editViolation).toHaveBeenCalledTimes(1);
        expect(svc.editViolation.calls.mostRecent().args[0]).toBe(7);
    }));

    it('onSubmit (edit) omits file_ids when files untouched (no accidental wipe)', fakeAsync(() => {
        fixture.detectChanges();
        const v = makeViolation(7);
        v.files = [{ id: 42 } as any];
        component.editViolation(v);
        component.onSubmit();
        tick();
        const body = svc.editViolation.calls.mostRecent().args[1] as any;
        expect('file_ids' in body).toBeFalse();
    }));

    it('onSubmit (edit) sends file_ids:[] after removing all existing files', fakeAsync(() => {
        fixture.detectChanges();
        const v = makeViolation(7);
        v.files = [{ id: 42 } as any];
        component.editViolation(v);
        component.removeExistingFile(42);
        component.onSubmit();
        tick();
        const body = svc.editViolation.calls.mostRecent().args[1] as any;
        expect(body.file_ids).toEqual([]);
    }));

    it('onSubmit uploads files then includes returned ids in file_ids', fakeAsync(() => {
        apiService.uploadFiles.and.returnValue(of({ ids: [99] }));
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 103, name: 'Пском' },
            start_time: new Date('2026-06-08T08:00:00'),
            end_time: new Date('2026-06-08T20:00:00'),
            duty_officer_name: 'И.И.', reason: 'причина'
        });
        component.onFileSelect([new File(['x'], 'a.pdf')]);
        component.onSubmit();
        tick();
        expect(apiService.uploadFiles).toHaveBeenCalled();
        const body = svc.addViolation.calls.mostRecent().args[0];
        expect(body.file_ids).toEqual([99]);
    }));

    it('removeExistingFile drops id from existingFilesToKeep and marks dirty', () => {
        fixture.detectChanges();
        const v = makeViolation(7);
        v.files = [{ id: 42 } as any, { id: 43 } as any];
        component.editViolation(v);
        component.removeExistingFile(42);
        expect(component.existingFilesToKeep).toEqual([43]);
        expect(component.filesDirty).toBeTrue();
    });

    it('deleteViolation calls service when confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        fixture.detectChanges();
        component.deleteViolation(7);
        expect(svc.deleteViolation).toHaveBeenCalledWith(7);
    });

    it('deleteViolation does nothing when cancelled', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        fixture.detectChanges();
        component.deleteViolation(7);
        expect(svc.deleteViolation).not.toHaveBeenCalled();
    });

    it('onSubmit does nothing when form invalid (end before start)', fakeAsync(() => {
        fixture.detectChanges();
        component.openNew();
        component.form.patchValue({
            organization: { id: 103, name: 'Пschool' },
            start_time: new Date('2026-06-08T20:00:00'),
            end_time: new Date('2026-06-08T08:00:00'),
            duty_officer_name: 'И.И.', reason: 'причина'
        });
        component.onSubmit();
        tick();
        expect(svc.addViolation).not.toHaveBeenCalled();
    }));
});
