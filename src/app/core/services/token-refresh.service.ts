import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';
import { AuthService } from '@/core/services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class TokenRefreshService {
    private authService = inject(AuthService);

    private isRefreshing = false;
    private refreshTokenSubject = new BehaviorSubject<string | null>(null);

    /**
     * Handles token refresh with proper concurrency control.
     * If a refresh is already in progress, waits for it to complete.
     * Otherwise, initiates a new refresh.
     */
    refreshToken(): Observable<string> {
        if (this.isRefreshing) {
            // Wait for the ongoing refresh to complete
            return this.waitForRefresh();
        }

        // Start new refresh
        return this.startRefresh();
    }

    private startRefresh(): Observable<string> {
        this.isRefreshing = true;
        this.refreshTokenSubject.next(null);

        return this.authService.refreshToken().pipe(
            switchMap((response) => {
                this.refreshTokenSubject.next(response.access_token);
                return [response.access_token];
            }),
            catchError((error) => {
                this.refreshTokenSubject.next(null);
                this.authService.logout();
                return throwError(() => error);
            }),
            finalize(() => {
                this.isRefreshing = false;
            })
        );
    }

    private waitForRefresh(): Observable<string> {
        return this.refreshTokenSubject.pipe(
            filter((token): token is string => token !== null),
            take(1)
        );
    }
}
