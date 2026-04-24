import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    exp?: number;
    roles?: string[];
    contact_id?: number;
    uid?: number;
    org_id?: number;
    name?: string;
    [key: string]: any;
}

@Injectable({
    providedIn: 'root'
})
export class JwtService {
    private static readonly TOKEN_KEY = 'access_token';
    private token: string | null = null;

    constructor() {
        this.token = sessionStorage.getItem(JwtService.TOKEN_KEY);
    }

    getToken(): string | null {
        return this.token;
    }

    saveToken(token: string): void {
        this.token = token;
        sessionStorage.setItem(JwtService.TOKEN_KEY, token);
    }

    destroyToken(): void {
        this.token = null;
        sessionStorage.removeItem(JwtService.TOKEN_KEY);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    isTokenExpired(): boolean {
        if (!this.token) return true;
        try {
            const decoded = jwtDecode<JwtPayload>(this.token);
            if (!decoded.exp) return false;
            // Expire 30s early to prevent sending already-expired tokens
            return decoded.exp * 1000 < Date.now() + 30000;
        } catch {
            return true;
        }
    }

    getDecodedToken(): JwtPayload | null {
        const token = this.getToken();
        if (token) {
            try {
                return jwtDecode<JwtPayload>(token);
            } catch (e) {
                console.error('Error decoding token:', e);
                return null;
            }
        }
        return null;
    }
}
