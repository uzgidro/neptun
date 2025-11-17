import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { AddUserRequest } from '@/core/interfaces/users';
import { Observable } from 'rxjs';

const USERS = '/users'

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService{

  createUser(request: AddUserRequest): Observable<any> {
    return this.http.post(BASE_URL + USERS, request);
  }
}
