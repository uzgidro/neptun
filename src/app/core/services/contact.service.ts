import { Injectable } from '@angular/core';
import { ApiService, API_V3 } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { Contact } from '@/core/interfaces/contact';

@Injectable({
    providedIn: 'root'
})
export class ContactService extends ApiService {
    private readonly endpoint = `${API_V3}/contacts`;

    getContacts(): Observable<Contact[]> {
        return this.http.get<Contact[]>(this.endpoint);
    }

    getContact(id: number): Observable<Contact> {
        return this.http.get<Contact>(`${this.endpoint}/${id}`);
    }

    createContact(formData: FormData): Observable<Contact> {
        return this.http.post<Contact>(this.endpoint, formData);
    }

    updateContact(id: number, formData: FormData): Observable<Contact> {
        return this.http.put<Contact>(`${this.endpoint}/${id}`, formData);
    }

    deleteContact(id: number): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${id}`);
    }
}
