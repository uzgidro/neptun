import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class JwtService {
    getToken(): string | null {
        return window.localStorage.getItem('access_token');
    }

    saveToken(token: string): void {
        window.localStorage.setItem('access_token', token);
    }

    destroyToken(): void {
        window.localStorage.removeItem('access_token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    getDecodedToken(): any {
        const token = this.getToken();
        if (token) {
            try {
                // 2. Просто вызываем ее
                return jwtDecode(token);
            } catch (e) {
                console.error('Error decoding token:', e);
                return null;
            }
        }
        return null;
    }
}
