import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { InfraEventsComponent } from './infra-events.component';
import { MessageService } from 'primeng/api';
import { InfraEventService } from '@/core/services/infra-event.service';
import { ApiService } from '@/core/services/api.service';
import { OrganizationService } from '@/core/services/organization.service';
import { AuthService } from '@/core/services/auth.service';
import { ConfigService } from '@/core/services/config.service';
import { InfraEventCategory } from '@/core/interfaces/infra-event';

const mockCategories: InfraEventCategory[] = [
    { id: 1, slug: 'video', display_name: 'Видеонаблюдение', label: 'label1', sort_order: 1, created_at: '2026-01-01T00:00:00Z' },
    { id: 2, slug: 'comms', display_name: 'Связь', label: 'label2', sort_order: 2, created_at: '2026-01-01T00:00:00Z' }
];

describe('InfraEventsComponent', () => {
    let component: InfraEventsComponent;
    let fixture: ComponentFixture<InfraEventsComponent>;
    let infraEventService: jasmine.SpyObj<InfraEventService>;
    let authService: jasmine.SpyObj<AuthService>;

    beforeEach(async () => {
        infraEventService = jasmine.createSpyObj('InfraEventService', ['getInfraCategories', 'getEvents']);
        infraEventService.getInfraCategories.and.returnValue(of(mockCategories));
        infraEventService.getEvents.and.returnValue(of([]));

        authService = jasmine.createSpyObj('AuthService', ['isSc']);
        authService.isSc.and.returnValue(true);

        const orgSpy = jasmine.createSpyObj('OrganizationService', ['getOrganizationsFlat']);
        orgSpy.getOrganizationsFlat.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [InfraEventsComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: InfraEventService, useValue: infraEventService },
                { provide: ApiService, useValue: jasmine.createSpyObj('ApiService', ['uploadFile']) },
                { provide: OrganizationService, useValue: orgSpy },
                { provide: AuthService, useValue: authService },
                { provide: MessageService, useValue: jasmine.createSpyObj('MessageService', ['add']) },
                { provide: ConfigService, useValue: { apiBaseUrl: 'https://test-api.example.com' } },
                { provide: ActivatedRoute, useValue: { queryParams: of({}), snapshot: { queryParamMap: { get: () => null } } } },
                { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(InfraEventsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load categories on init', () => {
        fixture.detectChanges();
        expect(infraEventService.getInfraCategories).toHaveBeenCalled();
        expect(component.categories.length).toBe(2);
        expect(component.categories[0].slug).toBe('video');
    });

    it('should start with all categories expanded', () => {
        fixture.detectChanges();
        expect(component.collapsedCategories.size).toBe(0);
    });

    it('should toggle category collapse state', () => {
        fixture.detectChanges();
        component.toggleCategory(1);
        expect(component.collapsedCategories.has(1)).toBeTrue();
        component.toggleCategory(1);
        expect(component.collapsedCategories.has(1)).toBeFalse();
    });

    it('should update selectedDate on date change', () => {
        const newDate = new Date(2026, 2, 28);
        component.onDateChanged(newDate);
        expect(component.selectedDate).toEqual(newDate);
    });

    it('should reload categories when categoriesChanged is called', () => {
        fixture.detectChanges();
        infraEventService.getInfraCategories.calls.reset();

        component.onCategoriesChanged();
        expect(infraEventService.getInfraCategories).toHaveBeenCalled();
    });

    it('should show category admin button only for SC users', () => {
        authService.isSc.and.returnValue(true);
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.pi-cog')).toBeTruthy();
    });

    it('should hide category admin button for non-SC users', () => {
        authService.isSc.and.returnValue(false);
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.pi-cog')).toBeFalsy();
    });

    it('should handle empty categories and show empty state', () => {
        infraEventService.getInfraCategories.and.returnValue(of([]));
        fixture.detectChanges();
        expect(component.categories.length).toBe(0);
        expect(component.categoriesLoading).toBeFalse();
    });

    it('should clear loading state on error', () => {
        infraEventService.getInfraCategories.and.returnValue(throwError(() => new Error('Network error')));
        fixture.detectChanges();
        expect(component.categoriesLoading).toBeFalse();
        expect(component.categories.length).toBe(0);
    });
});
