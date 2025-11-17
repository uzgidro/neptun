import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthResponse } from '@/core/interfaces/auth';
import { Observable } from 'rxjs';
import { Roles } from '@/core/interfaces/roles';
import { Users } from '@/core/interfaces/users';
import { Categories } from '@/core/interfaces/categories';
import { LatestFiles } from '@/core/interfaces/latest-files';
import { Organization } from '@/core/interfaces/organizations';

export const BASE_URL = 'https://prime.speedwagon.uz';
const AUTH = '/auth';
const SIGN_IN = '/sign-in';
const SIGN_OUT = '/sign-out';
const REFRESH = '/refresh';
const ROLES = '/roles';
const USERS = '/users';
const FILES = '/files';
const UPLOAD = '/upload';
const LATEST = '/latest';
const CATEGORIES = '/categories';
const ORGANIZATIONS = '/organizations';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    protected http = inject(HttpClient);

    protected dateToYMD(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

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

    getCategories(): Observable<Categories[]> {
        return this.http.get<Categories[]>(BASE_URL + FILES + CATEGORIES);
    }

    createCategory(category: { name: string; description: string; parent_id: number }): Observable<any> {
        return this.http.post(BASE_URL + FILES + CATEGORIES, category);
    }

    uploadFile(file: File, categoryId: number): Observable<any> {
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('category_id', categoryId.toString());

        return this.http.post(BASE_URL + UPLOAD + FILES, formData);
    }

    getLatestFiles(): Observable<LatestFiles[]> {
        return this.http.get<LatestFiles[]>(BASE_URL + FILES + LATEST);
    }

    deleteFile(id: number): Observable<any> {
        return this.http.delete(BASE_URL + FILES + '/' + id.toString());
    }

    getCascades(): Observable<Organization[]> {
        const params = new HttpParams().set('type', 'cascade');
        return this.http.get<Organization[]>(BASE_URL + ORGANIZATIONS, { params: params });
    }
}
