import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthResponse } from '@/core/interfaces/auth';
import { Observable } from 'rxjs';

const BASE_URL = 'https://prime.speedwagon.uz';
const AUTH = '/auth';
const SIGN_IN = '/sign-in';
const SIGN_OUT = '/sign-out';
const REFRESH = '/refresh'

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient)

    signIn(name: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(
            BASE_URL + AUTH + SIGN_IN,
            { name, password },
            {
                withCredentials: true
            }
        );
    }

    signOut(): Observable<any> {
        return this.http.post(BASE_URL + AUTH + SIGN_OUT, null, { withCredentials: true });
    }

    refreshToken(): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(BASE_URL + AUTH + REFRESH, null, { withCredentials: true });
    }
}
