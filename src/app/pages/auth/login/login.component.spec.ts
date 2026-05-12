import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { LoginComponent } from './login.component';
import { AuthService } from '@/core/services/auth.service';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        authService = jasmine.createSpyObj('AuthService', ['signIn']);
        router = jasmine.createSpyObj('Router', ['navigate']);
        router.navigate.and.resolveTo(true);

        await TestBed.configureTestingModule({
            imports: [LoginComponent, TranslateModule.forRoot()],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideNoopAnimations(),
                { provide: AuthService, useValue: authService },
                { provide: Router, useValue: router }
            ]
        })
            // Skip the template — we test signIn() logic only. The real template
            // renders AppFloatingConfigurator which reads global theme state
            // unavailable in unit tests.
            .overrideComponent(LoginComponent, { set: { template: '' } })
            .compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => TestBed.resetTestingModule());

    it('trims leading/trailing whitespace from username and password before signIn', () => {
        component.username = '  user  ';
        component.password = '  secret  ';
        authService.signIn.and.returnValue(of({ access_token: 'tok' } as any));

        component.signIn();

        expect(authService.signIn).toHaveBeenCalledWith('user', 'secret');
        // Model is normalized so the bound form input reflects the trimmed value
        // even when the request fails afterwards.
        expect(component.username).toBe('user');
        expect(component.password).toBe('secret');
    });

    it('passes already-trimmed credentials unchanged', () => {
        component.username = 'admin';
        component.password = 'pa$$w0rd';
        authService.signIn.and.returnValue(of({ access_token: 'tok' } as any));

        component.signIn();

        expect(authService.signIn).toHaveBeenCalledWith('admin', 'pa$$w0rd');
    });

    it('keeps trimmed values in form when signIn errors out (so user sees what was sent)', () => {
        component.username = '  user  ';
        component.password = '  secret  ';
        authService.signIn.and.returnValue(throwError(() => ({ status: 401 })));

        component.signIn();

        expect(component.username).toBe('user');
        expect(component.password).toBe('secret');
        expect(component.errorMessage).toBe('AUTH.LOGIN_ERROR');
    });
});
