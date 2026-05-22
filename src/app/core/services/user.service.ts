import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Users, UserCreatePayload, UserUpdatePayload, CreatedUserResponse, SetUserOrganizationsRequest } from '@/core/interfaces/users';

const USERS = '/users'

@Injectable({
    providedIn: 'root'
})
export class UserService extends ApiService {
    createUser(payload: UserCreatePayload): Observable<CreatedUserResponse> {
        return this.http.post<CreatedUserResponse>(this.BASE_URL + USERS, payload);
    }

    setUserOrganizations(id: number, organizationIds: number[]): Observable<void> {
        return this.http.put<void>(
            `${this.BASE_URL}${USERS}/${id}/organizations`,
            { organization_ids: organizationIds } as SetUserOrganizationsRequest
        );
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
