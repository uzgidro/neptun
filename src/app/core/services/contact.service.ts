import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of, delay } from 'rxjs';
import { Contact } from '@/core/interfaces/contact';
import { CrudService } from '@/core/interfaces/crud-service.interface';

const MOCK_CONTACTS: Contact[] = [
    { id: 1, name: 'Иванов Иван Петрович', phone: '+998901234567', email: 'ivanov@molokoprom.uz', position: { id: 1, name: 'director', description: 'Директор' }, organization: { id: 5, name: 'Молокозавод №1', parent_organization_id: 2, contacts: [], types: ['plant'] } },
    { id: 2, name: 'Петров Пётр Сергеевич', phone: '+998901234568', email: 'petrov@molokoprom.uz', position: { id: 2, name: 'chief_engineer', description: 'Главный инженер' }, organization: { id: 6, name: 'Молокозавод №2', parent_organization_id: 2, contacts: [], types: ['plant'] } },
    { id: 3, name: 'Сидоров Сергей Иванович', phone: '+998901234569', email: 'sidorov@molokoprom.uz', position: { id: 3, name: 'technologist', description: 'Технолог' }, organization: { id: 7, name: 'Молокозавод №3', parent_organization_id: 3, contacts: [], types: ['plant'] } },
    { id: 4, name: 'Алиев Алишер Каримович', phone: '+998901234570', email: 'aliev@molokoprom.uz', position: { id: 4, name: 'head_of_department', description: 'Начальник отдела' }, organization: { id: 8, name: 'Молокозавод №4', parent_organization_id: 3, contacts: [], types: ['plant'] } },
    { id: 5, name: 'Каримов Камол Рустамович', phone: '+998901234571', email: 'karimov@molokoprom.uz', position: { id: 5, name: 'deputy_director', description: 'Заместитель директора' }, organization: { id: 9, name: 'Молокозавод №5', parent_organization_id: 4, contacts: [], types: ['plant'] } }
];

@Injectable({
    providedIn: 'root'
})
export class ContactService extends ApiService implements CrudService<Contact, FormData> {
    getContacts(): Observable<Contact[]> {
        return of(MOCK_CONTACTS).pipe(delay(200));
    }

    getContact(id: number): Observable<Contact> {
        const contact = MOCK_CONTACTS.find(c => c.id === id);
        return of(contact!).pipe(delay(100));
    }

    createContact(formData: FormData): Observable<Contact> {
        return of({ id: Date.now(), name: formData.get('name') as string } as Contact).pipe(delay(200));
    }

    updateContact(id: number, formData: FormData): Observable<Contact> {
        const contact = MOCK_CONTACTS.find(c => c.id === id);
        return of({ ...contact, name: formData.get('name') as string } as Contact).pipe(delay(200));
    }

    deleteContact(id: number): Observable<void> {
        return of(undefined).pipe(delay(200));
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
