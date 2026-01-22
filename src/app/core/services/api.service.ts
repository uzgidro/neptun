import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthResponse } from '@/core/interfaces/auth';
import { delay, Observable, of } from 'rxjs';
import { Roles } from '@/core/interfaces/roles';
import { Users } from '@/core/interfaces/users';
import { Categories } from '@/core/interfaces/categories';
import { LatestFiles } from '@/core/interfaces/latest-files';

// Mock mode - no backend dependency
export const BASE_URL = '';
export const FLAT = '/flat';
export const API_V3 = '/api/v3';

// Mock JWT token (valid format for demo)
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkFkbWluIiwicm9sZXMiOlsiYWRtaW4iLCJzYyIsImFzc2lzdGFudCJdLCJleHAiOjE5OTk5OTk5OTl9.mock_signature';

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
        // Mock authentication - accept any credentials
        return of({ access_token: MOCK_TOKEN }).pipe(delay(300));
    }

    signOut(): Observable<any> {
        return of({ success: true }).pipe(delay(100));
    }

    refreshToken(): Observable<AuthResponse> {
        return of({ access_token: MOCK_TOKEN }).pipe(delay(100));
    }

    getRoles(): Observable<Roles[]> {
        return of([
            { id: 1, name: 'admin', description: 'Администратор' },
            { id: 2, name: 'sc', description: 'Ситуационный центр' },
            { id: 3, name: 'assistant', description: 'Помощник' },
            { id: 4, name: 'user', description: 'Пользователь' }
        ]).pipe(delay(100));
    }

    getUsers(): Observable<Users[]> {
        return of([
            { id: 1, login: 'admin', name: 'Администратор Системы', roles: ['admin'], role_ids: [1] },
            { id: 2, login: 'operator', name: 'Иванов Иван Петрович', roles: ['user'], role_ids: [4] },
            { id: 3, login: 'manager', name: 'Петров Пётр Сергеевич', roles: ['sc'], role_ids: [2] }
        ]).pipe(delay(100));
    }

    createRole(name: string, description: string): Observable<any> {
        return of({ id: Date.now(), name, description }).pipe(delay(100));
    }

    getCategories(): Observable<Categories[]> {
        return of([
            { id: 1, name: 'reports', display_name: 'Отчеты', description: 'Производственные отчеты' },
            { id: 2, name: 'documents', display_name: 'Документы', description: 'Нормативные документы' },
            { id: 3, name: 'daily', display_name: 'Ежедневные', description: 'Ежедневные отчеты' }
        ]).pipe(delay(100));
    }

    createCategory(category: { name: string; description: string; parent_id: number }): Observable<any> {
        return of({ id: Date.now(), ...category }).pipe(delay(100));
    }

    uploadFile(file: File, categoryId: number, date: string): Observable<any> {
        return of({ id: Date.now(), filename: file.name, category_id: categoryId, date }).pipe(delay(300));
    }

    getLatestFiles(): Observable<LatestFiles[]> {
        return of([
            { id: 1, file_name: 'Отчет_январь_2024.pdf', extension: 'pdf', size_bytes: 245760, created_at: '2024-01-15T10:00:00Z', category_name: 'Отчеты', url: '/files/1' },
            { id: 2, file_name: 'Производство_декабрь.xlsx', extension: 'xlsx', size_bytes: 128512, created_at: '2024-01-10T14:30:00Z', category_name: 'Отчеты', url: '/files/2' }
        ]).pipe(delay(100));
    }

    deleteFile(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(100));
    }
}
