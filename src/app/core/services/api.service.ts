import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthResponse } from '@/core/interfaces/auth';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { Roles } from '@/core/interfaces/roles';
import { Users } from '@/core/interfaces/users';
import { Categories } from '@/core/interfaces/categories';
import { LatestFiles } from '@/core/interfaces/latest-files';
import { ConfigService } from '@/core/services/config.service';

export const FLAT = '/flat';
export const API_V3 = '/api/v3';
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

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    protected http = inject(HttpClient);
    protected configService = inject(ConfigService);

    private roles$: Observable<Roles[]> | null = null;
    private categories$: Observable<Categories[]> | null = null;

    protected get BASE_URL(): string {
        return this.configService.apiBaseUrl;
    }

    protected dateToYMD(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    signIn(name: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(
            this.BASE_URL + AUTH + SIGN_IN,
            { name, password },
            {
                withCredentials: true
            }
        );
    }

    signOut(): Observable<any> {
        return this.http.post(this.BASE_URL + AUTH + SIGN_OUT, null, { withCredentials: true });
    }

    refreshToken(): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(this.BASE_URL + AUTH + REFRESH, null, { withCredentials: true });
    }

    getRoles(): Observable<Roles[]> {
        if (!this.roles$) {
            this.roles$ = this.http.get<Roles[]>(this.BASE_URL + ROLES).pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
        }
        return this.roles$;
    }

    invalidateRolesCache(): void {
        this.roles$ = null;
    }

    getUsers(): Observable<Users[]> {
        return this.http.get<Users[]>(this.BASE_URL + USERS);
    }

    createRole(name: string, description: string): Observable<any> {
        return this.http.post(this.BASE_URL + ROLES, { name, description }).pipe(
            tap(() => this.invalidateRolesCache())
        );
    }

    getCategories(): Observable<Categories[]> {
        if (!this.categories$) {
            this.categories$ = this.http.get<Categories[]>(this.BASE_URL + FILES + CATEGORIES).pipe(
                shareReplay({ bufferSize: 1, refCount: true })
            );
        }
        return this.categories$;
    }

    invalidateCategoriesCache(): void {
        this.categories$ = null;
    }

    createCategory(category: { name: string; description: string; parent_id: number }): Observable<any> {
        return this.http.post(this.BASE_URL + FILES + CATEGORIES, category).pipe(
            tap(() => this.invalidateCategoriesCache())
        );
    }

    uploadFile(file: File, categoryId: number, date: string): Observable<any> {
        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('category_id', categoryId.toString());
        formData.append('date', date);

        return this.http.post(this.BASE_URL + UPLOAD + FILES, formData);
    }

    uploadFiles(files: File[], categoryId: number, date?: string): Observable<{ ids: number[] }> {
        const formData = new FormData();
        for (const file of files) {
            formData.append('files', file, file.name);
        }
        formData.append('category_id', categoryId.toString());
        if (date) {
            formData.append('date', date);
        }
        return this.http.post<any>(this.BASE_URL + UPLOAD + FILES, formData).pipe(
            map((res) => ({ ids: res.ids ?? [res.id] }))
        );
    }

    getLatestFiles(): Observable<LatestFiles[]> {
        return this.http.get<LatestFiles[]>(this.BASE_URL + FILES + LATEST);
    }

    deleteFile(id: number): Observable<any> {
        return this.http.delete(this.BASE_URL + FILES + '/' + id.toString());
    }
}
