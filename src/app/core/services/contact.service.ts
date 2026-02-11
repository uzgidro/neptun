import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { Contact } from '@/core/interfaces/contact';

@Injectable({
    providedIn: 'root'
})
export class ContactService extends ApiService {
    getContacts(): Observable<Contact[]> {
        return of([]).pipe(delay(100));
    }

    getContact(id: number): Observable<Contact> {
        return of({ id, name: 'Контакт' } as Contact).pipe(delay(100));
    }

    createContact(formData: FormData): Observable<Contact> {
        return of({ id: Date.now(), name: '' } as Contact).pipe(delay(200));
    }

    updateContact(id: number, formData: FormData): Observable<Contact> {
        return of({ id, name: '' } as Contact).pipe(delay(200));
    }

    deleteContact(id: number): Observable<void> {
        return of(undefined as void).pipe(delay(200));
    }
}
