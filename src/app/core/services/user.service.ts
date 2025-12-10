import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Users } from '@/core/interfaces/users';

const USERS = '/users'

@Injectable({
    providedIn: 'root'
})
export class UserService extends ApiService {
    createUser(formData: FormData): Observable<any> {
        return this.http.post(BASE_URL + USERS, formData);
    }

    getUserById(id: number): Observable<Users> {
        return this.http.get<Users>(BASE_URL + USERS + '/' + id);
    }

    editUser(id: number, formData: FormData): Observable<any> {
        return this.http.patch(BASE_URL + USERS + '/' + id, formData);
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete(BASE_URL + USERS + '/' + id);
    }
}
