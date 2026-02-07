import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

/**
 * HTTP Error Interceptor
 * Catches HTTP errors and shows user-friendly toast messages.
 * Works alongside GlobalErrorHandler for comprehensive error handling.
 */
export const errorInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    const messageService = inject(MessageService);
    const translate = inject(TranslateService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Skip 401 errors (handled by auth interceptor)
            if (error.status === 401) {
                return throwError(() => error);
            }

            // Show toast for HTTP errors
            const message = getErrorMessage(error, translate);
            if (message) {
                messageService.add({
                    severity: 'error',
                    summary: translate.instant('COMMON.ERROR'),
                    detail: message,
                    life: 5000
                });
            }

            return throwError(() => error);
        })
    );
};

/**
 * Get user-friendly error message based on HTTP status
 */
function getErrorMessage(error: HttpErrorResponse, translate: TranslateService): string {
    // Try to get message from response body
    if (error.error?.message) {
        return error.error.message;
    }

    switch (error.status) {
        case 0:
            return translate.instant('ERRORS.NO_CONNECTION');
        case 400:
            return translate.instant('ERRORS.BAD_REQUEST');
        case 403:
            return translate.instant('ERRORS.FORBIDDEN');
        case 404:
            return translate.instant('ERRORS.NOT_FOUND');
        case 422:
            return translate.instant('ERRORS.VALIDATION_ERROR');
        case 429:
            return translate.instant('ERRORS.TOO_MANY_REQUESTS');
        case 500:
            return translate.instant('ERRORS.INTERNAL_SERVER_ERROR');
        case 502:
            return translate.instant('ERRORS.BAD_GATEWAY');
        case 503:
            return translate.instant('ERRORS.SERVICE_UNAVAILABLE');
        case 504:
            return translate.instant('ERRORS.GATEWAY_TIMEOUT');
        default:
            return translate.instant('ERRORS.DEFAULT_ERROR', { status: error.status });
    }
}
