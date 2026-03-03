import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { JwtService } from '@/core/services/jwt.service';
import { TokenRefreshService } from '@/core/services/token-refresh.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const jwtService = inject(JwtService);
    const tokenRefreshService = inject(TokenRefreshService);
    const token = jwtService.getToken();

    if (token) {
        req = addToken(req, token);
    }

    return next(req).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('/refresh')) {
                return handle401Error(req, next, tokenRefreshService);
            }
            return throwError(() => error);
        })
    );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
}

function handle401Error(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn,
    tokenRefreshService: TokenRefreshService
): Observable<HttpEvent<unknown>> {
    return tokenRefreshService.refreshToken().pipe(
        switchMap((newToken) => {
            return next(addToken(req, newToken));
        })
    );
}
