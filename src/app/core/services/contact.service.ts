import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Contact } from '@/core/interfaces/contact';

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

    createContact(formData: FormData): Observable<Contact> {
        return this.http.post<Contact>(BASE_URL + CONTACTS, formData);
    }

    updateContact(id: number, formData: FormData): Observable<Contact> {
        return this.http.patch<Contact>(BASE_URL + CONTACTS + '/' + id, formData);
    }

    deleteContact(id: number): Observable<any> {
        return this.http.delete(BASE_URL + CONTACTS + '/' + id);
    }
}
