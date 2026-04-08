import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Contact, ContactCreatePayload, ContactUpdatePayload } from '@/core/interfaces/contact';
import { CrudService } from '@/core/interfaces/crud-service.interface';

const CONTACTS = '/contacts';

@Injectable({
    providedIn: 'root'
})
export class ContactService extends ApiService implements CrudService<Contact, ContactCreatePayload | ContactUpdatePayload> {
    getAll(): Observable<Contact[]> {
        return this.http.get<Contact[]>(this.BASE_URL + CONTACTS);
    }

    getById(id: number): Observable<Contact> {
        return this.http.get<Contact>(this.BASE_URL + CONTACTS + '/' + id);
    }

    create(payload: ContactCreatePayload): Observable<Contact> {
        return this.http.post<Contact>(this.BASE_URL + CONTACTS, payload);
    }

    update(id: number, payload: ContactUpdatePayload): Observable<Contact> {
        return this.http.patch<Contact>(this.BASE_URL + CONTACTS + '/' + id, payload);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(this.BASE_URL + CONTACTS + '/' + id);
    }
}
