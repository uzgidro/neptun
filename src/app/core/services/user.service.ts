import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Users, UserCreatePayload, UserUpdatePayload } from '@/core/interfaces/users';

const USERS = '/users'

@Injectable({
    providedIn: 'root'
})
export class UserService extends ApiService {
    createUser(payload: UserCreatePayload): Observable<any> {
        return this.http.post(this.BASE_URL + USERS, payload);
    }

    getUserById(id: number): Observable<Users> {
        return this.http.get<Users>(this.BASE_URL + USERS + '/' + id);
    }

    editUser(id: number, payload: UserUpdatePayload): Observable<any> {
        return this.http.patch(this.BASE_URL + USERS + '/' + id, payload);
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete(this.BASE_URL + USERS + '/' + id);
    }
}
