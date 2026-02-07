import { ErrorHandler, inject, Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/**
 * Error details for logging and display
 */
interface ErrorDetails {
    message: string;
    status?: number;
    url?: string;
    stack?: string;
    timestamp: Date;
}

/**
 * Global error handler for the application.
 * Catches all unhandled errors and provides:
 * - User-friendly error messages via Toast
 * - Centralized error logging
 * - HTTP error handling with specific messages
 * - Navigation to error pages for critical failures
 */
@Injectable({
    providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
    private messageService = inject(MessageService);
    private router = inject(Router);
    private ngZone = inject(NgZone);
    private translate = inject(TranslateService);

    // Prevent duplicate error messages within short time
    private lastError: string = '';
    private lastErrorTime: number = 0;
    private readonly ERROR_DEBOUNCE_MS = 1000;

    handleError(error: Error | HttpErrorResponse): void {
        const errorDetails = this.extractErrorDetails(error);

        // Debounce duplicate errors
        if (this.isDuplicateError(errorDetails.message)) {
            return;
        }

        // Log error for debugging
        this.logError(errorDetails);

        // Show user-friendly message
        this.ngZone.run(() => {
            this.showErrorToast(error, errorDetails);
        });
    }

    /**
     * Extract details from different error types
     */
    private extractErrorDetails(error: Error | HttpErrorResponse): ErrorDetails {
        if (error instanceof HttpErrorResponse) {
            return {
                message: this.getHttpErrorMessage(error),
                status: error.status,
                url: error.url || undefined,
                timestamp: new Date()
            };
        }

        return {
            message: error.message || this.translate.instant('COMMON.ERROR'),
            stack: error.stack,
            timestamp: new Date()
        };
    }

    /**
     * Get user-friendly message for HTTP errors
     */
    private getHttpErrorMessage(error: HttpErrorResponse): string {
        // Don't show message for 401 (handled by interceptor)
        if (error.status === 401) {
            return '';
        }

        switch (error.status) {
            case 0:
                return this.translate.instant('ERRORS.CHECK_INTERNET');
            case 400:
                return error.error?.message || this.translate.instant('ERRORS.BAD_REQUEST');
            case 403:
                return this.translate.instant('ERRORS.FORBIDDEN');
            case 404:
                return this.translate.instant('ERRORS.NOT_FOUND');
            case 408:
                return this.translate.instant('ERRORS.REQUEST_TIMEOUT');
            case 422:
                return error.error?.message || this.translate.instant('ERRORS.VALIDATION_ERROR');
            case 429:
                return this.translate.instant('ERRORS.TOO_MANY_REQUESTS');
            case 500:
                return this.translate.instant('ERRORS.INTERNAL_SERVER_ERROR');
            case 502:
                return this.translate.instant('ERRORS.BAD_GATEWAY');
            case 503:
                return this.translate.instant('ERRORS.SERVICE_UNAVAILABLE');
            case 504:
                return this.translate.instant('ERRORS.GATEWAY_TIMEOUT');
            default:
                return this.translate.instant('ERRORS.DEFAULT_ERROR', { status: error.status });
        }
    }

    /**
     * Check if this is a duplicate of recent error
     */
    private isDuplicateError(message: string): boolean {
        const now = Date.now();
        if (message === this.lastError && (now - this.lastErrorTime) < this.ERROR_DEBOUNCE_MS) {
            return true;
        }
        this.lastError = message;
        this.lastErrorTime = now;
        return false;
    }

    /**
     * Log error for debugging/monitoring
     */
    private logError(details: ErrorDetails): void {
        console.group('Global Error Handler');
        console.error('Message:', details.message);
        if (details.status) console.error('Status:', details.status);
        if (details.url) console.error('URL:', details.url);
        if (details.stack) console.error('Stack:', details.stack);
        console.error('Timestamp:', details.timestamp.toISOString());
        console.groupEnd();

        // TODO: Send to external logging service (Sentry, LogRocket, etc.)
        // this.sendToLoggingService(details);
    }

    /**
     * Show toast notification for error
     */
    private showErrorToast(error: Error | HttpErrorResponse, details: ErrorDetails): void {
        // Skip 401 errors (handled by auth interceptor)
        if (error instanceof HttpErrorResponse && error.status === 401) {
            return;
        }

        // Skip empty messages
        if (!details.message) {
            return;
        }

        this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('COMMON.ERROR'),
            detail: details.message,
            life: 5000
        });
    }

    /**
     * Navigate to error page for critical failures
     * Can be called manually for specific scenarios
     */
    navigateToErrorPage(status: number = 500): void {
        this.ngZone.run(() => {
            this.router.navigate(['/error'], {
                queryParams: { status }
            });
        });
    }
}
