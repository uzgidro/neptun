import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Users } from '@/core/interfaces/users';

// Мок-данные пользователей
const MOCK_USER: Users = {
    id: 1,
    login: 'admin',
    name: 'Администратор Системы',
    roles: ['admin'],
    role_ids: [1]
};

@Injectable({
    providedIn: 'root'
})
export class UserService extends ApiService {
    createUser(formData: FormData): Observable<any> {
        return of({ ...MOCK_USER, id: Date.now() }).pipe(delay(300));
    }

    getUserById(id: number): Observable<Users> {
        return of({ ...MOCK_USER, id }).pipe(delay(200));
    }

    editUser(id: number, formData: FormData): Observable<any> {
        return of({ ...MOCK_USER, id }).pipe(delay(300));
    }

    deleteUser(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }
}
