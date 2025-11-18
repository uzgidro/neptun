import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { AddUserRequest, EditUserRequest } from '@/core/interfaces/users';
import { Observable } from 'rxjs';

const USERS = '/users'

@Injectable({
    providedIn: 'root'
})
export class UserService extends ApiService {
    createUser(request: AddUserRequest): Observable<any> {
        return this.http.post(BASE_URL + USERS, request);
    }

    editUser(id: number, request: EditUserRequest): Observable<any> {
        return this.http.patch(BASE_URL + USERS + '/' + id, request);
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete(BASE_URL + USERS + '/' + id);
    }
}
