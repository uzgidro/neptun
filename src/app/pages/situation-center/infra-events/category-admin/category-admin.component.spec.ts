import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { CategoryAdminComponent } from './category-admin.component';
import { InfraEventService } from '@/core/services/infra-event.service';
import { ConfigService } from '@/core/services/config.service';
import { InfraEventCategory } from '@/core/interfaces/infra-event';

const mockCategories: InfraEventCategory[] = [
    { id: 1, slug: 'video', display_name: 'Видеонаблюдение', label: 'label1', sort_order: 1, created_at: '2026-01-01T00:00:00Z' },
    { id: 2, slug: 'comms', display_name: 'Связь', label: 'label2', sort_order: 2, created_at: '2026-01-01T00:00:00Z' }
];

describe('CategoryAdminComponent', () => {
    let component: CategoryAdminComponent;
    let fixture: ComponentFixture<CategoryAdminComponent>;
    let infraEventService: jasmine.SpyObj<InfraEventService>;
    let messageService: jasmine.SpyObj<MessageService>;

    beforeEach(async () => {
        infraEventService = jasmine.createSpyObj('InfraEventService', [
            'createInfraCategory', 'updateInfraCategory', 'deleteInfraCategory'
        ]);
        messageService = jasmine.createSpyObj('MessageService', ['add']);

        await TestBed.configureTestingModule({
            imports: [CategoryAdminComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: InfraEventService, useValue: infraEventService },
                { provide: MessageService, useValue: messageService },
                { provide: ConfigService, useValue: { apiBaseUrl: 'https://test-api.example.com' } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(CategoryAdminComponent);
        component = fixture.componentInstance;
        component.visible = true;
        component.categories = [...mockCategories];
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should open new category form', () => {
        fixture.detectChanges();
        component.openNew();

        expect(component.isFormOpen).toBeTrue();
        expect(component.isEditMode).toBeFalse();
        expect(component.form.get('slug')?.value).toBeFalsy();
    });

    it('should populate form when editing category', () => {
        fixture.detectChanges();
        component.editCategory(mockCategories[0]);

        expect(component.isFormOpen).toBeTrue();
        expect(component.isEditMode).toBeTrue();
        expect(component.currentCategoryId).toBe(1);
        expect(component.form.get('slug')?.value).toBe('video');
        expect(component.form.get('display_name')?.value).toBe('Видеонаблюдение');
    });

    it('should create category with payload', () => {
        fixture.detectChanges();
        infraEventService.createInfraCategory.and.returnValue(of({ id: 3 }));
        spyOn(component.categoriesChanged, 'emit');

        component.openNew();
        component.form.patchValue({
            slug: 'scada',
            display_name: 'SCADA',
            label: 'SCADA label',
            sort_order: 6
        });
        component.onSubmit();

        expect(infraEventService.createInfraCategory).toHaveBeenCalledWith({
            slug: 'scada',
            display_name: 'SCADA',
            label: 'SCADA label',
            sort_order: 6
        });
        expect(component.categoriesChanged.emit).toHaveBeenCalled();
        expect(component.isLoading).toBeFalse();
    });

    it('should update category with payload', () => {
        fixture.detectChanges();
        infraEventService.updateInfraCategory.and.returnValue(of({}));
        spyOn(component.categoriesChanged, 'emit');

        component.editCategory(mockCategories[0]);
        component.form.patchValue({ display_name: 'Updated Video' });
        component.onSubmit();

        expect(infraEventService.updateInfraCategory).toHaveBeenCalledWith(1, jasmine.objectContaining({
            slug: 'video',
            display_name: 'Updated Video'
        }));
        expect(component.categoriesChanged.emit).toHaveBeenCalled();
        expect(component.isLoading).toBeFalse();
    });

    it('should handle 409 on create (duplicate slug)', () => {
        fixture.detectChanges();
        const error = new HttpErrorResponse({ status: 409, error: { error: 'Duplicate slug' } });
        infraEventService.createInfraCategory.and.returnValue(throwError(() => error));

        component.openNew();
        component.form.patchValue({
            slug: 'video',
            display_name: 'Dup',
            label: 'Dup label'
        });
        component.onSubmit();

        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'error' })
        );
        expect(component.isLoading).toBeFalse();
    });

    it('should delete category with confirmation', () => {
        fixture.detectChanges();
        infraEventService.deleteInfraCategory.and.returnValue(of(undefined));
        spyOn(window, 'confirm').and.returnValue(true);
        spyOn(component.categoriesChanged, 'emit');

        component.deleteCategory(mockCategories[0]);

        expect(infraEventService.deleteInfraCategory).toHaveBeenCalledWith(1);
        expect(component.categoriesChanged.emit).toHaveBeenCalled();
    });

    it('should show 409 error when deleting category with events', () => {
        fixture.detectChanges();
        const error = new HttpErrorResponse({ status: 409, error: { error: 'Category has events' } });
        infraEventService.deleteInfraCategory.and.returnValue(throwError(() => error));
        spyOn(window, 'confirm').and.returnValue(true);

        component.deleteCategory(mockCategories[0]);

        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'error' })
        );
    });

    it('should not delete category when confirmation is cancelled', () => {
        fixture.detectChanges();
        spyOn(window, 'confirm').and.returnValue(false);

        component.deleteCategory(mockCategories[0]);

        expect(infraEventService.deleteInfraCategory).not.toHaveBeenCalled();
    });

    it('should not submit when form is invalid', () => {
        fixture.detectChanges();
        component.openNew();
        component.onSubmit();

        expect(component.submitted).toBeTrue();
        expect(infraEventService.createInfraCategory).not.toHaveBeenCalled();
    });

    it('should emit visibleChange false on dialog hide', () => {
        fixture.detectChanges();
        spyOn(component.visibleChange, 'emit');
        component.onDialogHide();
        expect(component.visibleChange.emit).toHaveBeenCalledWith(false);
    });
});
