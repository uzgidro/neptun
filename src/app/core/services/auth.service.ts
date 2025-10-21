import { inject, Injectable } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { ApiService } from '@/core/services/api.service';
import { JwtService } from '@/core/services/jwt.service';
import { AuthResponse } from '@/core/interfaces/auth';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiService = inject(ApiService);
    private jwtService = inject(JwtService);
    private router = inject(Router);

    signIn(name: string, password: string): Observable<AuthResponse> {
        return this.apiService.signIn(name, password).pipe(tap((response) => this.jwtService.saveToken(response.access_token)));
    }

    signOut(): void {
        this.apiService
            .signOut()
            .pipe(
                finalize(() => this.logout())
            )
            .subscribe();
    }

    refreshToken(): Observable<AuthResponse> {
        return this.apiService.refreshToken().pipe(
            tap((response) => {
                this.jwtService.saveToken(response.access_token);
            })
        );
    }

    isAuthenticated(): boolean {
        return this.jwtService.isAuthenticated();
    }

    hasRole(expectedRole: string | string[]): boolean {
        const decodedToken = this.jwtService.getDecodedToken();

        if (!decodedToken || !Array.isArray(decodedToken.roles)) {
            return false;
        }

        const userRoles: string[] = decodedToken.roles;

        if (Array.isArray(expectedRole)) {
            return expectedRole.some((role) => userRoles.includes(role));
        }

        return userRoles.includes(expectedRole);
    }

    logout(): void {
        this.jwtService.destroyToken();
        this.router.navigate(['/auth/login']);
    }
}
