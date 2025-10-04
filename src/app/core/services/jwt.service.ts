import { Injectable } from '@angular/core';

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
                return JSON.parse(atob(token.split('.')[1]));
            } catch (e) {
                console.error('Error decoding token:', e);
                return null;
            }
        }
        return null;
    }
}
