import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@/core/services/auth.service';

export interface HasUnsavedChanges {
    canDeactivate(): boolean | Observable<boolean>;
}

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
};

export const cascadeOnlyGuard: CanActivateFn = (_route, state): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isCascade()) {
        return true;
    }

    const allowedPaths = ['/ges-daily-report', '/shutdowns'];
    const fallbackPath = '/ges-daily-report';
    const targetPath = state.url.split('?')[0];

    return allowedPaths.includes(targetPath) ? true : router.createUrlTree([fallbackPath]);
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

    return authService.hasRole(['sc', 'assistant', 'rais', 'investment', 'chancellery', 'cascade']) ? true : router.createUrlTree(['/notfound']);
}

export const gesReportGuard: CanActivateFn = (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.hasRole(['sc', 'rais', 'cascade']) ? true : router.createUrlTree(['/notfound']);
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

export const filtrationGuard: CanActivateFn = (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.hasRole(['sc', 'rais', 'reservoir']) ? true : router.createUrlTree(['/notfound']);
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
    return component.canDeactivate ? component.canDeactivate() : true;
}

