import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

export const authGuard: CanActivateFn = (): boolean | UrlTree => {
    const router = inject(Router);
    const token = localStorage.getItem('token');

    if (token) {
        return true; // Пользователь авторизован, разрешаем доступ
    }

    // Пользователь не авторизован, перенаправляем на страницу входа
    return router.createUrlTree(['/auth/login']);
};