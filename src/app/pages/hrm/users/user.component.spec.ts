import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { User } from './user.component';
import { UserService } from '@/core/services/user.service';
import { ApiService } from '@/core/services/api.service';
import { ContactService } from '@/core/services/contact.service';
import { OrganizationService } from '@/core/services/organization.service';
import { DepartmentService } from '@/core/services/department.service';
import { PositionService } from '@/core/services/position.service';
import { Users } from '@/core/interfaces/users';

describe('User component (multi-org access)', () => {
    let component: User;
    let fixture: ComponentFixture<User>;
    let userService: jasmine.SpyObj<UserService>;
    let apiService: jasmine.SpyObj<ApiService>;

    beforeEach(async () => {
        const userServiceSpy = jasmine.createSpyObj('UserService', [
            'createUser', 'editUser', 'deleteUser', 'getUserById', 'setUserOrganizations'
        ]);
        const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getUsers', 'getRoles', 'uploadFiles']);
        const contactServiceSpy = jasmine.createSpyObj('ContactService', ['getAll']);
        const organizationServiceSpy = jasmine.createSpyObj('OrganizationService', ['getOrganizationsFlat']);
        const departmentServiceSpy = jasmine.createSpyObj('DepartmentService', ['getAll']);
        const positionServiceSpy = jasmine.createSpyObj('PositionService', ['getAll']);

        userServiceSpy.createUser.and.returnValue(of({ id: 42 }));
        userServiceSpy.editUser.and.returnValue(of({}));
        userServiceSpy.deleteUser.and.returnValue(of({}));
        userServiceSpy.setUserOrganizations.and.returnValue(of(undefined));
        apiServiceSpy.getUsers.and.returnValue(of([]));
        apiServiceSpy.getRoles.and.returnValue(of([]));
        contactServiceSpy.getAll.and.returnValue(of([]));
        organizationServiceSpy.getOrganizationsFlat.and.returnValue(of([]));
        departmentServiceSpy.getAll.and.returnValue(of([]));
        positionServiceSpy.getAll.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [User, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                provideRouter([]),
                { provide: UserService, useValue: userServiceSpy },
                { provide: ApiService, useValue: apiServiceSpy },
                { provide: ContactService, useValue: contactServiceSpy },
                { provide: OrganizationService, useValue: organizationServiceSpy },
                { provide: DepartmentService, useValue: departmentServiceSpy },
                { provide: PositionService, useValue: positionServiceSpy },
                MessageService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(User);
        component = fixture.componentInstance;
        userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
        apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('createUser with 2 organizations selected calls setUserOrganizations(42, [5,10])', fakeAsync(() => {
        // getUsers is also called once by ngOnInit — count from here to assert the reload.
        const reloadBaseline = apiService.getUsers.calls.count();
        component.openDialog();
        component.userForm.patchValue({
            login: 'newuser',
            password: 'password123',
            roles: [{ id: 1, name: 'admin' }],
            name: 'New User',
            organization_ids: [5, 10]
        });
        component.contactMode = 'new';
        component.onSubmit();
        tick();

        expect(userService.createUser).toHaveBeenCalled();
        expect(userService.setUserOrganizations).toHaveBeenCalledWith(42, [5, 10]);
        // post-success cleanup ran: table reloaded and dialog closed
        expect(component.displayDialog).toBeFalse();
        expect(apiService.getUsers.calls.count()).toBeGreaterThan(reloadBaseline);
    }));

    it('createUser with empty org array does NOT call setUserOrganizations', fakeAsync(() => {
        component.openDialog();
        component.userForm.patchValue({
            login: 'newuser',
            password: 'password123',
            roles: [{ id: 1, name: 'admin' }],
            name: 'New User',
            organization_ids: []
        });
        component.contactMode = 'new';
        component.onSubmit();
        tick();

        expect(userService.createUser).toHaveBeenCalled();
        expect(userService.setUserOrganizations).not.toHaveBeenCalled();
    }));

    it('updateUser ALWAYS calls setUserOrganizations even with empty array', fakeAsync(() => {
        const existing: Users = {
            id: 7, name: 'Existing', login: 'existing', is_active: true,
            roles: [], role_ids: [], organization_ids: []
        };
        const reloadBaseline = apiService.getUsers.calls.count();
        component.openEditDialog(existing);
        component.userForm.patchValue({
            login: 'existing',
            roles: [{ id: 1, name: 'admin' }],
            organization_ids: []
        });
        component.onSubmit();
        tick();

        expect(userService.editUser).toHaveBeenCalled();
        expect(userService.setUserOrganizations).toHaveBeenCalledWith(7, []);
        // post-success cleanup ran: table reloaded and dialog closed
        expect(component.displayDialog).toBeFalse();
        expect(apiService.getUsers.calls.count()).toBeGreaterThan(reloadBaseline);
    }));

    it('partial failure: createUser ok but setUserOrganizations fails shows success + warn toast, no error toast, dialog closed, table reloaded', fakeAsync(() => {
        userService.setUserOrganizations.and.returnValue(
            throwError(() => ({ status: 500 }))
        );
        const messageService = TestBed.inject(MessageService);
        const addSpy = spyOn(messageService, 'add');
        const reloadBaseline = apiService.getUsers.calls.count();

        component.openDialog();
        component.userForm.patchValue({
            login: 'newuser',
            password: 'password123',
            roles: [{ id: 1, name: 'admin' }],
            name: 'New User',
            organization_ids: [5, 10]
        });
        component.contactMode = 'new';
        component.onSubmit();
        tick();

        const calls = addSpy.calls.allArgs().map(a => a[0]);
        // the user account WAS created — success toast confirms it...
        expect(calls.some(c => c.severity === 'success')).toBeTrue();
        // ...and the org-binding failure is surfaced as a warning, not a hard error
        expect(calls.some(c => c.severity === 'warn')).toBeTrue();
        expect(calls.some(c => c.severity === 'error')).toBeFalse();
        expect(component.displayDialog).toBeFalse();
        expect(apiService.getUsers.calls.count()).toBeGreaterThan(reloadBaseline);
    }));

    it('openEditDialog populates organization_ids form control from user', () => {
        const existing: Users = {
            id: 9, name: 'WithOrgs', login: 'withorgs', is_active: true,
            roles: [], role_ids: [], organization_ids: [5, 10]
        };
        component.openEditDialog(existing);
        expect(component.userForm.get('organization_ids')?.value).toEqual([5, 10]);
    });
});
