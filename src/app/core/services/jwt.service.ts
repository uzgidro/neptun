import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
    exp?: number;
    roles?: string[];
    [key: string]: any;
}

@Injectable({
    providedIn: 'root'
})
export class JwtService {
    private token: string | null = null;

    getToken(): string | null {
        if (this.token && this.isTokenExpired()) {
            this.token = null;
            return null;
        }
        return this.token;
    }

    saveToken(token: string): void {
        this.token = token;
    }

    destroyToken(): void {
        this.token = null;
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
