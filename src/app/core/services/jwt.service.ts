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
}
