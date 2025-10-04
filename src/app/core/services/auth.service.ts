import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // Замените URL на ваш реальный эндпоинт API
    private apiUrl = 'https://prime.speedwagon.uz/auth/sign-in';

    constructor(private http: HttpClient) {}

    login(name: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.apiUrl, { name, password }, {
            withCredentials: true // Нужно для отправки/получения cookie
        });
    }
}
