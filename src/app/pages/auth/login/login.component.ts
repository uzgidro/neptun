import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '@/layout/component/app.floatingconfigurator';
import { AuthService } from '@/core/services/auth.service';
import { finalize } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, NgOptimizedImage],
    templateUrl: 'login.component.html'
})
export class LoginComponent {
    username: string = '';

    password: string = '';

    checked: boolean = false;

    loading: boolean = false;

    errorMessage: string | null = null;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    signIn() {
        this.loading = true;
        this.errorMessage = null;

        this.authService
            .signIn(this.username, this.password)
            .pipe(finalize(() => (this.loading = false)))
            .subscribe({
                next: () => {
                    this.router.navigate(['/']);
                },
                error: () => {
                    this.errorMessage = 'Логин и/или пароль не верны';
                }
            });
    }
}
