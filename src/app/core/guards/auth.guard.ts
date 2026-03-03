import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '@/core/services/auth.service';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
};

export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.hasRole("admin") ? true : router.createUrlTree(['/notfound']);
}

export const scGuard: CanActivateFn = (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.hasRole("sc") ? true : router.createUrlTree(['/notfound']);
}

export const raisGuard: CanActivateFn = (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.hasRole(['sc', 'assistant', 'rais', 'investment', 'chancellery']) ? true : router.createUrlTree(['/notfound']);
}

export const hrmGuard: CanActivateFn = (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.hasRole(['hrm_admin', 'hrm_manager', 'hrm_employee', 'rais']) ? true : router.createUrlTree(['/notfound']);
}

export const positionsGuard: CanActivateFn = (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.hasRole(['admin', 'hrm_admin', 'hrm_manager', 'hrm_employee', 'rais']) ? true : router.createUrlTree(['/notfound']);
}

