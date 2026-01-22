import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Contact } from '@/core/interfaces/contact';

// Мок-данные контактов
const MOCK_CONTACTS: Contact[] = [
    { id: 1, name: 'Иванов Иван', phone: '+998901234567', email: 'ivanov@molokoprom.uz', position: 'Директор', organization_id: 1 },
    { id: 2, name: 'Петрова Мария', phone: '+998901234568', email: 'petrova@molokoprom.uz', position: 'Главный технолог', organization_id: 1 },
    { id: 3, name: 'Сидоров Алексей', phone: '+998901234569', email: 'sidorov@molokoprom.uz', position: 'Начальник производства', organization_id: 2 }
] as Contact[];

@Injectable({
    providedIn: 'root'
})
export class ContactService extends ApiService {
    getContacts(): Observable<Contact[]> {
        return of(MOCK_CONTACTS).pipe(delay(200));
    }

    getContact(id: number): Observable<Contact> {
        const contact = MOCK_CONTACTS.find(c => c.id === id) || MOCK_CONTACTS[0];
        return of(contact).pipe(delay(200));
    }

    createContact(formData: FormData): Observable<Contact> {
        const newContact: Contact = { id: Date.now(), name: 'Новый контакт' } as Contact;
        return of(newContact).pipe(delay(300));
    }

    updateContact(id: number, formData: FormData): Observable<Contact> {
        const contact = MOCK_CONTACTS.find(c => c.id === id) || MOCK_CONTACTS[0];
        return of(contact).pipe(delay(300));
    }

    deleteContact(id: number): Observable<any> {
        return of({ success: true }).pipe(delay(200));
    }
}
