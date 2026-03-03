import { Injectable } from '@angular/core';
import { ApiService, BASE_URL } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Contact } from '@/core/interfaces/contact';
import { CrudService } from '@/core/interfaces/crud-service.interface';

const CONTACTS = '/contacts';

@Injectable({
    providedIn: 'root'
})
export class ContactService extends ApiService implements CrudService<Contact, FormData> {
    // Legacy methods (keep for backward compatibility)
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

    deleteContact(id: number): Observable<void> {
        return this.http.delete<void>(BASE_URL + CONTACTS + '/' + id);
    }

    // CrudService interface implementation
    getAll(): Observable<Contact[]> {
        return this.getContacts();
    }

    getById(id: number): Observable<Contact> {
        return this.getContact(id);
    }

    create(formData: FormData): Observable<Contact> {
        return this.createContact(formData);
    }

    update(id: number, formData: FormData): Observable<Contact> {
        return this.updateContact(id, formData);
    }

    delete(id: number): Observable<void> {
        return this.deleteContact(id);
    }
}
