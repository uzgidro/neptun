import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Contact } from '@/core/interfaces/contact';
import { CrudService } from '@/core/interfaces/crud-service.interface';

// Мок-данные контактов (12 сотрудников)
const MOCK_CONTACTS: Contact[] = [
    {
        id: 1,
        name: 'Каримов Рустам Шарипович',
        email: 'karimov.r@company.uz',
        phone: '+998 90 100 00 01',
        ip_phone: '1001',
        dob: '1978-05-20',
        department: { id: 1, name: 'Руководство', organization_id: 1 },
        position: { id: 1, name: 'Генеральный директор' }
    },
    {
        id: 2,
        name: 'Ахмедова Нилуфар Бахтиёровна',
        email: 'akhmedova.n@company.uz',
        phone: '+998 90 123 45 67',
        ip_phone: '1002',
        dob: '1990-08-15',
        department: { id: 7, name: 'Отдел кадров', organization_id: 1 },
        position: { id: 2, name: 'Начальник отдела кадров' }
    },
    {
        id: 3,
        name: 'Юлдашев Ботир Камолович',
        email: 'yuldashev.b@company.uz',
        phone: '+998 91 200 30 03',
        ip_phone: '1003',
        dob: '1985-11-30',
        department: { id: 2, name: 'Производственный отдел', organization_id: 1 },
        position: { id: 3, name: 'Начальник производства' }
    },
    {
        id: 4,
        name: 'Рахимова Дилноза Алишеровна',
        email: 'rakhimova.d@company.uz',
        phone: '+998 93 300 40 04',
        ip_phone: '1004',
        dob: '1987-03-22',
        department: { id: 5, name: 'Финансовый отдел', organization_id: 1 },
        position: { id: 4, name: 'Главный бухгалтер' }
    },
    {
        id: 5,
        name: 'Назаров Фаррух Бахромович',
        email: 'nazarov.f@company.uz',
        phone: '+998 94 400 50 05',
        ip_phone: '1005',
        dob: '1992-02-20',
        department: { id: 6, name: 'IT-отдел', organization_id: 1 },
        position: { id: 5, name: 'Системный администратор' }
    },
    {
        id: 6,
        name: 'Абдуллаева Гулнора Тахировна',
        email: 'abdullaeva.g@company.uz',
        phone: '+998 95 500 60 06',
        ip_phone: '1006',
        dob: '1991-07-10',
        department: { id: 8, name: 'Юридический отдел', organization_id: 1 },
        position: { id: 6, name: 'Юрист' }
    },
    {
        id: 7,
        name: 'Мирзаев Жасур Хамидович',
        email: 'mirzaev.j@company.uz',
        phone: '+998 90 600 70 07',
        ip_phone: '1007',
        dob: '1993-04-18',
        department: { id: 2, name: 'Производственный отдел', organization_id: 1 },
        position: { id: 7, name: 'Технолог' }
    },
    {
        id: 8,
        name: 'Исмоилова Шахло Равшановна',
        email: 'ismoilova.sh@company.uz',
        phone: '+998 91 700 80 08',
        ip_phone: '1008',
        dob: '1994-12-05',
        department: { id: 3, name: 'Отдел контроля качества', organization_id: 1 },
        position: { id: 8, name: 'Инженер по качеству' }
    },
    {
        id: 9,
        name: 'Турсунов Ильхом Адхамович',
        email: 'tursunov.i@company.uz',
        phone: '+998 93 800 90 09',
        ip_phone: '1009',
        dob: '1988-03-05',
        department: { id: 4, name: 'Отдел логистики', organization_id: 1 },
        position: { id: 9, name: 'Менеджер по логистике' }
    },
    {
        id: 10,
        name: 'Хасанова Малика Обидовна',
        email: 'khasanova.m@company.uz',
        phone: '+998 94 900 10 10',
        ip_phone: '1010',
        dob: '1996-06-25',
        department: { id: 7, name: 'Отдел кадров', organization_id: 1 },
        position: { id: 10, name: 'Специалист по кадрам' }
    },
    {
        id: 11,
        name: 'Сафаров Улугбек Шухратович',
        email: 'safarov.u@company.uz',
        phone: '+998 95 010 11 11',
        ip_phone: '1011',
        dob: '1997-09-14',
        department: { id: 2, name: 'Производственный отдел', organization_id: 1 },
        position: { id: 11, name: 'Оператор' }
    },
    {
        id: 12,
        name: 'Каримова Зилола Бахтияровна',
        email: 'karimova.z@company.uz',
        phone: '+998 90 120 12 12',
        ip_phone: '1012',
        dob: '1998-01-30',
        department: { id: 5, name: 'Финансовый отдел', organization_id: 1 },
        position: { id: 12, name: 'Бухгалтер' }
    }
];

@Injectable({
    providedIn: 'root'
})
export class ContactService extends ApiService implements CrudService<Contact, FormData> {
    getAll(): Observable<Contact[]> {
        return of(MOCK_CONTACTS).pipe(delay(300));
    }

    getById(id: number): Observable<Contact> {
        const contact = MOCK_CONTACTS.find(c => c.id === id);
        return of(contact as Contact).pipe(delay(300));
    }

    create(formData: FormData): Observable<Contact> {
        return of({ id: Date.now(), name: '' } as Contact).pipe(delay(200));
    }

    update(id: number, formData: FormData): Observable<Contact> {
        return of({ id, name: '' } as Contact).pipe(delay(200));
    }

    delete(id: number): Observable<void> {
        return of(undefined as void).pipe(delay(200));
    }

    // Legacy aliases
    getContacts = this.getAll.bind(this);
    getContact = this.getById.bind(this);
    createContact = this.create.bind(this);
    updateContact = this.update.bind(this);
    deleteContact = this.delete.bind(this);
}
