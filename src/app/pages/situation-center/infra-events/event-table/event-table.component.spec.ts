import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { EventTableComponent } from './event-table.component';
import { InfraEventService } from '@/core/services/infra-event.service';
import { ApiService } from '@/core/services/api.service';
import { OrganizationService } from '@/core/services/organization.service';
import { AuthService } from '@/core/services/auth.service';
import { ConfigService } from '@/core/services/config.service';
import { InfraEvent, InfraEventCategory } from '@/core/interfaces/infra-event';

const mockCategory: InfraEventCategory = {
    id: 1, slug: 'video', display_name: 'Видеонаблюдение', label: 'label1', sort_order: 1, created_at: '2026-01-01T00:00:00Z'
};

const mockEvent: InfraEvent = {
    id: 1,
    category_id: 1,
    category_slug: 'video',
    category_name: 'Видеонаблюдение',
    organization_id: 42,
    organization_name: 'GES-34',
    occurred_at: '2026-03-28T09:00:00+05:00',
    restored_at: null,
    description: 'Camera down',
    remediation: null,
    notes: null,
    created_at: '2026-03-28T09:15:00+05:00',
    created_by: { id: 5, name: 'Omonov A.' },
    files: []
};

const mockOrganizations = [
    { label: 'Cascade 1', items: [{ id: 42, name: 'GES-34' }] }
];

describe('EventTableComponent', () => {
    let component: EventTableComponent;
    let fixture: ComponentFixture<EventTableComponent>;
    let infraEventService: jasmine.SpyObj<InfraEventService>;
    let apiService: jasmine.SpyObj<ApiService>;
    let authService: jasmine.SpyObj<AuthService>;
    let messageService: jasmine.SpyObj<MessageService>;

    beforeEach(async () => {
        infraEventService = jasmine.createSpyObj('InfraEventService', [
            'getEvents', 'createEvent', 'updateEvent', 'deleteEvent'
        ]);
        infraEventService.getEvents.and.returnValue(of([mockEvent]));

        apiService = jasmine.createSpyObj('ApiService', ['uploadFile']);

        const orgSpy = jasmine.createSpyObj('OrganizationService', ['getCascades']);
        orgSpy.getCascades.and.returnValue(of(mockOrganizations));

        authService = jasmine.createSpyObj('AuthService', ['isSc']);
        authService.isSc.and.returnValue(true);

        messageService = jasmine.createSpyObj('MessageService', ['add']);

        await TestBed.configureTestingModule({
            imports: [EventTableComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: InfraEventService, useValue: infraEventService },
                { provide: ApiService, useValue: apiService },
                { provide: OrganizationService, useValue: orgSpy },
                { provide: AuthService, useValue: authService },
                { provide: MessageService, useValue: messageService },
                { provide: ConfigService, useValue: { apiBaseUrl: 'https://test-api.example.com' } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(EventTableComponent);
        component = fixture.componentInstance;
        component.category = mockCategory;
        component.date = new Date(2026, 2, 28);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load events on init', () => {
        fixture.detectChanges();
        expect(infraEventService.getEvents).toHaveBeenCalledWith(component.date, mockCategory.id);
        expect(component.events.length).toBe(1);
    });

    it('should reload events when date input changes', () => {
        fixture.detectChanges();
        infraEventService.getEvents.calls.reset();

        component.date = new Date(2026, 2, 29);
        component.ngOnChanges({
            date: { currentValue: component.date, previousValue: new Date(2026, 2, 28), firstChange: false, isFirstChange: () => false }
        });

        expect(infraEventService.getEvents).toHaveBeenCalled();
    });

    it('should open new event dialog with clean form', () => {
        fixture.detectChanges();
        component.openNew();

        expect(component.isFormOpen).toBeTrue();
        expect(component.isEditMode).toBeFalse();
        expect(component.selectedFiles.length).toBe(0);
    });

    it('should populate form when editing event', () => {
        fixture.detectChanges();
        component.editEvent(mockEvent);

        expect(component.isFormOpen).toBeTrue();
        expect(component.isEditMode).toBeTrue();
        expect(component.currentEventId).toBe(1);
        expect(component.form.get('description')?.value).toBe('Camera down');
    });

    it('should create event with JSON payload (no files)', () => {
        fixture.detectChanges();
        infraEventService.createEvent.and.returnValue(of({ id: 2 }));

        component.openNew();
        component.form.patchValue({
            organization: { id: 42, name: 'GES-34' },
            occurred_at: new Date('2026-03-28T09:00:00'),
            description: 'New event'
        });

        component.onSubmit();

        expect(infraEventService.createEvent).toHaveBeenCalledWith(
            jasmine.objectContaining({
                category_id: 1,
                organization_id: 42,
                description: 'New event'
            })
        );
    });

    it('should update event with partial payload', () => {
        fixture.detectChanges();
        infraEventService.updateEvent.and.returnValue(of({}));

        component.editEvent(mockEvent);
        component.form.patchValue({
            description: 'Updated description',
            restored_at: new Date('2026-03-28T13:00:00')
        });

        component.onSubmit();

        expect(infraEventService.updateEvent).toHaveBeenCalledWith(
            1,
            jasmine.objectContaining({ description: 'Updated description' })
        );
    });

    it('should send clear_restored_at when checkbox is checked', () => {
        fixture.detectChanges();
        const eventWithRestored = { ...mockEvent, restored_at: '2026-03-28T13:00:00+05:00' };
        infraEventService.updateEvent.and.returnValue(of({}));

        component.editEvent(eventWithRestored);
        component.form.patchValue({ clear_restored_at: true });
        component.onSubmit();

        expect(infraEventService.updateEvent).toHaveBeenCalledWith(
            1,
            jasmine.objectContaining({ clear_restored_at: true })
        );
    });

    it('should upload files before creating event and pass file_ids', () => {
        fixture.detectChanges();
        const mockFile = new File(['content'], 'test.png', { type: 'image/png' });
        apiService.uploadFile.and.returnValue(of({ id: 10 }));
        infraEventService.createEvent.and.returnValue(of({ id: 2 }));

        component.openNew();
        component.form.patchValue({
            organization: { id: 42, name: 'GES-34' },
            occurred_at: new Date('2026-03-28T09:00:00'),
            description: 'Event with file'
        });
        component.selectedFiles = [mockFile];
        component.onSubmit();

        expect(apiService.uploadFile).toHaveBeenCalled();
        expect(infraEventService.createEvent).toHaveBeenCalledWith(
            jasmine.objectContaining({ file_ids: [10] })
        );
    });

    it('should delete event with confirmation', () => {
        fixture.detectChanges();
        infraEventService.deleteEvent.and.returnValue(of(undefined));
        spyOn(window, 'confirm').and.returnValue(true);

        component.deleteEvent(mockEvent);

        expect(infraEventService.deleteEvent).toHaveBeenCalledWith(1);
        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'success' })
        );
    });

    it('should not delete event when confirmation is cancelled', () => {
        fixture.detectChanges();
        spyOn(window, 'confirm').and.returnValue(false);

        component.deleteEvent(mockEvent);

        expect(infraEventService.deleteEvent).not.toHaveBeenCalled();
    });

    it('should handle file removal in edit mode', () => {
        fixture.detectChanges();
        const eventWithFiles = {
            ...mockEvent,
            files: [{ id: 10, file_name: 'test.png', url: 'http://example.com/test.png', mime_type: 'image/png', size_bytes: 1024 }]
        };
        component.editEvent(eventWithFiles);

        expect(component.existingFilesToKeep).toEqual([10]);

        component.removeExistingFile(10);
        expect(component.existingFilesToKeep).toEqual([]);
    });

    it('should send file_ids in PATCH after removing files in edit mode', () => {
        fixture.detectChanges();
        const eventWithFiles = {
            ...mockEvent,
            files: [
                { id: 10, file_name: 'a.png', url: 'http://example.com/a.png', mime_type: 'image/png', size_bytes: 1024 },
                { id: 11, file_name: 'b.png', url: 'http://example.com/b.png', mime_type: 'image/png', size_bytes: 2048 }
            ]
        };
        infraEventService.updateEvent.and.returnValue(of({}));

        component.editEvent(eventWithFiles);
        component.removeExistingFile(10);
        component.onSubmit();

        expect(infraEventService.updateEvent).toHaveBeenCalledWith(
            1,
            jasmine.objectContaining({ file_ids: [11] })
        );
    });

    it('should not send file_ids in PATCH when no file changes were made', () => {
        fixture.detectChanges();
        const eventWithFiles = {
            ...mockEvent,
            files: [{ id: 10, file_name: 'a.png', url: 'http://example.com/a.png', mime_type: 'image/png', size_bytes: 1024 }]
        };
        infraEventService.updateEvent.and.returnValue(of({}));

        component.editEvent(eventWithFiles);
        component.form.patchValue({ description: 'Just text edit' });
        component.onSubmit();

        const payload = infraEventService.updateEvent.calls.mostRecent().args[1];
        expect(payload.file_ids).toBeUndefined();
    });

    it('should clear loading on events load error', () => {
        infraEventService.getEvents.and.returnValue(throwError(() => new Error('fail')));
        fixture.detectChanges();
        expect(component.loading).toBeFalse();
    });

    it('should show add button only for SC users', () => {
        authService.isSc.and.returnValue(true);
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.pi-plus')).toBeTruthy();
    });

    it('should hide add button for non-SC users', () => {
        authService.isSc.and.returnValue(false);
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.pi-plus')).toBeFalsy();
    });
});
