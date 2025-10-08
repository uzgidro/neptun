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
