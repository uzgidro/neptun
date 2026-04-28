import { inject, Injectable } from '@angular/core';
import { finalize, Observable, of, shareReplay, tap } from 'rxjs';
import { ApiService } from '@/core/services/api.service';
import { JwtService } from '@/core/services/jwt.service';
import { ContactService } from '@/core/services/contact.service';
import { AuthResponse } from '@/core/interfaces/auth';
import { Contact } from '@/core/interfaces/contact';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiService = inject(ApiService);
    private jwtService = inject(JwtService);
    private contactService = inject(ContactService);
    private router = inject(Router);
    private currentContact$: Observable<Contact> | null = null;

    signIn(name: string, password: string): Observable<AuthResponse> {
        return this.apiService.signIn(name, password).pipe(tap((response) => this.jwtService.saveToken(response.access_token)));
    }

    signOut(): void {
        this.apiService
            .signOut()
            .pipe(finalize(() => this.logout()))
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

    isSc(): boolean {
        return this.hasRole('sc');
    }

    isCascade(): boolean {
        return this.hasRole('cascade');
    }

    isOnlyCascade(): boolean {
        const decodedToken = this.jwtService.getDecodedToken();
        if (!decodedToken || !Array.isArray(decodedToken.roles)) {
            return false;
        }
        const roles: string[] = decodedToken.roles;
        return roles.length === 1 && roles[0] === 'cascade';
    }

    isOnlyReservoirDuty(): boolean {
        const decodedToken = this.jwtService.getDecodedToken();
        if (!decodedToken || !Array.isArray(decodedToken.roles)) {
            return false;
        }
        const roles: string[] = decodedToken.roles;
        return roles.length === 1 && roles[0] === 'reservoir_duty';
    }

    isScOrRais(): boolean {
        return this.hasRole(['sc', 'rais']);
    }

    isAssistant(): boolean {
        return this.hasRole('assistant');
    }

    isAdmin(): boolean {
        return this.hasRole('admin');
    }

    getCurrentContact(): Observable<Contact> | null {
        const decoded = this.jwtService.getDecodedToken();
        const id = decoded?.['contact_id'];
        if (typeof id !== 'number') return null;
        if (!this.currentContact$) {
            this.currentContact$ = this.contactService.getById(id).pipe(shareReplay(1));
        }
        return this.currentContact$;
    }

    getUserId(): number | null {
        const decoded = this.jwtService.getDecodedToken();
        const id = decoded?.['uid'];
        return typeof id === 'number' ? id : null;
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
        this.currentContact$ = null;
        this.jwtService.destroyToken();
        this.router.navigate(['/auth/login']);
    }
}
