import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthResponse } from '@/core/interfaces/auth';
import { Observable } from 'rxjs';
import { Roles } from '@/core/interfaces/roles';
import { Users } from '@/core/interfaces/users';

const BASE_URL = 'https://prime.speedwagon.uz';
const AUTH = '/auth';
const SIGN_IN = '/sign-in';
const SIGN_OUT = '/sign-out';
const REFRESH = '/refresh'
const ROLES = '/roles'
const USERS = '/users'

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

    getRoles(): Observable<Roles[]> {
        return this.http.get<Roles[]>(BASE_URL + ROLES);
    }

    getUsers(): Observable<Users[]> {
        return this.http.get<Users[]>(BASE_URL + USERS);
    }

    createRole(name: string, description: string): Observable<any> {
        return this.http.post(BASE_URL + ROLES, { name, description });
    }
}
