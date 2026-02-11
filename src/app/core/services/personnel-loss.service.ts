import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PersonnelLoss, PersonnelLossPayload, PersonnelLossStats, LossType } from '@/core/interfaces/personnel-loss';

@Injectable({
    providedIn: 'root'
})
export class PersonnelLossService {
    private mockData: PersonnelLoss[] = [
        {
            id: 1,
            name: 'Иванов Иван Петрович',
            photo: null,
            position: { id: 1, name: 'Главный инженер' },
            department: { id: 1, name: 'Технический отдел', organization_id: 1 },
            organization: { id: 1, name: 'Молокозавод "Юг"', contacts: [] },
            lossType: 'retirement',
            lossDate: '2024-06-15',
            hireDate: '1989-03-10',
            reason: 'Выход на пенсию по возрасту',
            yearsOfService: 35,
            achievements: 'Заслуженный энергетик Республики. Награжден орденом "За заслуги".',
            notes: null
        },
        {
            id: 2,
            name: 'Петров Сергей Михайлович',
            photo: null,
            position: { id: 2, name: 'Оператор линии' },
            department: { id: 2, name: 'Операционный отдел', organization_id: 1 },
            organization: { id: 1, name: 'Молокозавод "Юг"', contacts: [] },
            lossType: 'death',
            lossDate: '2024-03-22',
            hireDate: '2005-08-01',
            reason: 'Скончался после продолжительной болезни',
            yearsOfService: 19,
            achievements: 'Ветеран труда. Неоднократно награждался почетными грамотами.',
            notes: 'Светлая память'
        },
        {
            id: 3,
            name: 'Сидорова Анна Владимировна',
            photo: null,
            position: { id: 3, name: 'Бухгалтер' },
            department: { id: 3, name: 'Финансовый отдел', organization_id: 2 },
            organization: { id: 2, name: 'Филиал "Восток"', contacts: [] },
            lossType: 'dismissal',
            lossDate: '2024-09-01',
            hireDate: '2018-02-15',
            reason: 'Увольнение по собственному желанию',
            yearsOfService: 6,
            achievements: null,
            notes: 'Переезд в другой город'
        },
        {
            id: 4,
            name: 'Козлов Дмитрий Андреевич',
            photo: null,
            position: { id: 4, name: 'Электрик' },
            department: { id: 1, name: 'Технический отдел', organization_id: 1 },
            organization: { id: 1, name: 'Молокозавод "Юг"', contacts: [] },
            lossType: 'transfer',
            lossDate: '2024-07-10',
            hireDate: '2015-04-20',
            reason: 'Перевод в другую организацию',
            yearsOfService: 9,
            achievements: null,
            notes: 'Переведен в молокозавод "Запад-2"'
        },
        {
            id: 5,
            name: 'Михайлов Алексей Николаевич',
            photo: null,
            position: { id: 5, name: 'Начальник смены' },
            department: { id: 2, name: 'Операционный отдел', organization_id: 3 },
            organization: { id: 3, name: 'Мини-цех "Юг-2"', contacts: [] },
            lossType: 'death',
            lossDate: '2023-11-05',
            hireDate: '1995-06-12',
            reason: 'Погиб при исполнении служебных обязанностей',
            yearsOfService: 28,
            achievements: 'Герой труда. Награжден государственными наградами за мужество.',
            notes: 'Вечная память герою'
        },
        {
            id: 6,
            name: 'Федоров Виктор Сергеевич',
            photo: null,
            position: { id: 6, name: 'Инженер-механик' },
            department: { id: 1, name: 'Технический отдел', organization_id: 2 },
            organization: { id: 2, name: 'Филиал "Восток"', contacts: [] },
            lossType: 'dismissal',
            lossDate: '2024-11-20',
            hireDate: '2020-01-15',
            reason: 'Сокращение штата',
            yearsOfService: 4,
            achievements: null,
            notes: null
        },
        {
            id: 7,
            name: 'Николаев Павел Игоревич',
            photo: null,
            position: { id: 7, name: 'Директор филиала' },
            department: { id: 4, name: 'Руководство', organization_id: 3 },
            organization: { id: 3, name: 'Мини-цех "Юг-2"', contacts: [] },
            lossType: 'retirement',
            lossDate: '2024-01-31',
            hireDate: '1982-09-01',
            reason: 'Выход на заслуженный отдых',
            yearsOfService: 42,
            achievements: 'Почетный работник энергетики. Орден "Дружбы народов".',
            notes: null
        }
    ];

    private nextId = 8;

    getAll(): Observable<PersonnelLoss[]> {
        return of([...this.mockData]).pipe(delay(300));
    }

    getById(id: number): Observable<PersonnelLoss | undefined> {
        return of(this.mockData.find(item => item.id === id)).pipe(delay(200));
    }

    getStats(): Observable<PersonnelLossStats> {
        const currentYear = new Date().getFullYear();
        const thisYearData = this.mockData.filter(item =>
            new Date(item.lossDate).getFullYear() === currentYear
        );

        const stats: PersonnelLossStats = {
            total: this.mockData.length,
            thisYear: thisYearData.length,
            dismissals: this.mockData.filter(item => item.lossType === 'dismissal').length,
            deaths: this.mockData.filter(item => item.lossType === 'death').length,
            retirements: this.mockData.filter(item => item.lossType === 'retirement').length,
            transfers: this.mockData.filter(item => item.lossType === 'transfer').length,
            other: this.mockData.filter(item => item.lossType === 'other').length,
            byMonth: this.getByMonthStats()
        };

        return of(stats).pipe(delay(200));
    }

    private getByMonthStats(): { month: string; count: number }[] {
        const months = [
            'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
            'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
        ];

        const currentYear = new Date().getFullYear();
        const result = months.map((month, index) => ({
            month,
            count: this.mockData.filter(item => {
                const date = new Date(item.lossDate);
                return date.getFullYear() === currentYear && date.getMonth() === index;
            }).length
        }));

        return result;
    }

    getDeceased(): Observable<PersonnelLoss[]> {
        return of(this.mockData.filter(item => item.lossType === 'death')).pipe(delay(200));
    }

    create(payload: PersonnelLossPayload): Observable<PersonnelLoss> {
        const newItem: PersonnelLoss = {
            id: this.nextId++,
            name: payload.name,
            photo: payload.photo,
            position: payload.position_id ? { id: payload.position_id, name: 'Должность' } : null,
            department: payload.department_id ? { id: payload.department_id, name: 'Отдел', organization_id: 1 } : null,
            organization: payload.organization_id ? { id: payload.organization_id, name: 'Организация', contacts: [] } : null,
            lossType: payload.lossType,
            lossDate: payload.lossDate,
            hireDate: payload.hireDate,
            reason: payload.reason,
            yearsOfService: this.calculateYearsOfService(payload.hireDate, payload.lossDate),
            achievements: payload.achievements,
            notes: payload.notes
        };

        this.mockData.push(newItem);
        return of(newItem).pipe(delay(300));
    }

    update(id: number, payload: PersonnelLossPayload): Observable<PersonnelLoss> {
        const index = this.mockData.findIndex(item => item.id === id);
        if (index !== -1) {
            this.mockData[index] = {
                ...this.mockData[index],
                name: payload.name,
                photo: payload.photo,
                lossType: payload.lossType,
                lossDate: payload.lossDate,
                hireDate: payload.hireDate,
                reason: payload.reason,
                yearsOfService: this.calculateYearsOfService(payload.hireDate, payload.lossDate),
                achievements: payload.achievements,
                notes: payload.notes
            };
        }
        return of(this.mockData[index]).pipe(delay(300));
    }

    delete(id: number): Observable<void> {
        const index = this.mockData.findIndex(item => item.id === id);
        if (index !== -1) {
            this.mockData.splice(index, 1);
        }
        return of(void 0).pipe(delay(300));
    }

    private calculateYearsOfService(hireDate: string | null | undefined, lossDate: string): number | null {
        if (!hireDate) return null;
        const hire = new Date(hireDate);
        const loss = new Date(lossDate);
        const years = Math.floor((loss.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24 * 365));
        return years;
    }

    getLossTypeLabel(type: LossType): string {
        const labels: Record<LossType, string> = {
            dismissal: 'Увольнение',
            death: 'Смерть',
            retirement: 'Пенсия',
            transfer: 'Перевод',
            other: 'Другое'
        };
        return labels[type];
    }

    getLossTypeIcon(type: LossType): string {
        const icons: Record<LossType, string> = {
            dismissal: 'pi pi-sign-out',
            death: 'pi pi-heart',
            retirement: 'pi pi-home',
            transfer: 'pi pi-arrow-right-arrow-left',
            other: 'pi pi-question-circle'
        };
        return icons[type];
    }

    getLossTypeSeverity(type: LossType): string {
        const severities: Record<LossType, string> = {
            dismissal: 'warn',
            death: 'danger',
            retirement: 'info',
            transfer: 'secondary',
            other: 'secondary'
        };
        return severities[type];
    }
}
