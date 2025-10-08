import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, Observable, switchMap, take, throwError } from 'rxjs';
import { JwtService } from '@/core/services/jwt.service';
import { AuthService } from '@/core/services/auth.service';
import { filter } from 'rxjs/operators';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);


export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const jwtService = inject(JwtService);
    const authService = inject(AuthService)
    const token = jwtService.getToken();

    if (token) {
        req = addToken(req, token);
    }

    return next(req).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                return handle401Error(req, next, authService);
            }
            return throwError(() => error);
        })
    );
};

function addToken(req: HttpRequest<unknown>, token: string) {
    return req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
}

function handle401Error(req: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<any>> {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return authService.refreshToken().pipe(
            switchMap((tokenResponse) => {
                isRefreshing = false;
                refreshTokenSubject.next(tokenResponse.access_token);
                return next(addToken(req, tokenResponse.access_token));
            }),
            catchError((err) => {
                isRefreshing = false;
                authService.logout();
                return throwError(() => err);
            })
        );
    } else {
        return refreshTokenSubject.pipe(
            filter((token) => token != null),
            take(1),
            switchMap((jwt) => {
                return next(addToken(req, jwt!));
            })
        );
    }
}
