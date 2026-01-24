import { Component, inject, OnInit } from '@angular/core';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator, NgOptimizedImage, TranslateModule],
    templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {
    username: string = '';

    password: string = '';

    checked: boolean = false;

    loading: boolean = false;

    errorMessage: string | null = null;

    private authService: AuthService = inject(AuthService);
    private router: Router = inject(Router);
    private translate: TranslateService = inject(TranslateService);

    ngOnInit(): void {
        const savedLang = localStorage.getItem('lang') || 'ru';
        this.translate.use(savedLang);
    }

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
                    this.errorMessage = 'AUTH.LOGIN_ERROR';
                }
            });
    }
}
