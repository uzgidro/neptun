import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Contact, AddContactRequest, EditContactRequest } from '@/core/interfaces/contact';

const CONTACTS = '/contacts';

@Injectable({
    providedIn: 'root'
})
export class ContactService extends ApiService {
    getContacts(): Observable<Contact[]> {
        return this.http.get<Contact[]>(BASE_URL + CONTACTS);
    }

    getContact(id: number): Observable<Contact> {
        return this.http.get<Contact>(BASE_URL + CONTACTS + '/' + id);
    }

    createContact(payload: AddContactRequest): Observable<Contact> {
        return this.http.post<Contact>(BASE_URL + CONTACTS, payload);
    }

    updateContact(id: number, payload: EditContactRequest): Observable<Contact> {
        return this.http.patch<Contact>(BASE_URL + CONTACTS + '/' + id, payload);
    }

    deleteContact(id: number): Observable<any> {
        return this.http.delete(BASE_URL + CONTACTS + '/' + id);
    }
}
