import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '@/core/interfaces/contact';
import { ContactService } from '@/core/services/contact.service';
import { Subject, takeUntil } from 'rxjs';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface BirthdayContact extends Contact {
    birthdayThisYear: Date;
    daysUntilBirthday: number;
    age: number;
    birthMonth: number;
}

interface MonthOption {
    label: string;
    value: number | null;
}

@Component({
    selector: 'app-birthdays',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        Tag,
        Select,
        ProgressSpinner,
        TranslateModule
    ],
    templateUrl: './birthdays.component.html',
    styleUrl: './birthdays.component.scss'
})
export class BirthdaysComponent implements OnInit, OnDestroy {
    contacts: Contact[] = [];
    birthdayContacts: BirthdayContact[] = [];
    filteredContacts: BirthdayContact[] = [];
    loading: boolean = true;

    selectedMonth: number | null = null;
    selectedPeriod: string = 'all';

    months: MonthOption[] = [];
    periods: { label: string; value: string }[] = [];

    private contactService = inject(ContactService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    private initOptions(): void {
        this.months = [
            { label: this.translate.instant('HRM.BIRTHDAYS.ALL_MONTHS'), value: null },
            { label: this.translate.instant('HRM.BIRTHDAYS.JANUARY'), value: 0 },
            { label: this.translate.instant('HRM.BIRTHDAYS.FEBRUARY'), value: 1 },
            { label: this.translate.instant('HRM.BIRTHDAYS.MARCH'), value: 2 },
            { label: this.translate.instant('HRM.BIRTHDAYS.APRIL'), value: 3 },
            { label: this.translate.instant('HRM.BIRTHDAYS.MAY'), value: 4 },
            { label: this.translate.instant('HRM.BIRTHDAYS.JUNE'), value: 5 },
            { label: this.translate.instant('HRM.BIRTHDAYS.JULY'), value: 6 },
            { label: this.translate.instant('HRM.BIRTHDAYS.AUGUST'), value: 7 },
            { label: this.translate.instant('HRM.BIRTHDAYS.SEPTEMBER'), value: 8 },
            { label: this.translate.instant('HRM.BIRTHDAYS.OCTOBER'), value: 9 },
            { label: this.translate.instant('HRM.BIRTHDAYS.NOVEMBER'), value: 10 },
            { label: this.translate.instant('HRM.BIRTHDAYS.DECEMBER'), value: 11 }
        ];

        this.periods = [
            { label: this.translate.instant('HRM.BIRTHDAYS.ALL'), value: 'all' },
            { label: this.translate.instant('HRM.BIRTHDAYS.TODAY'), value: 'today' },
            { label: this.translate.instant('HRM.BIRTHDAYS.THIS_WEEK'), value: 'week' },
            { label: this.translate.instant('HRM.BIRTHDAYS.THIS_MONTH'), value: 'month' }
        ];
    }

    ngOnInit() {
        this.initOptions();
        this.loadContacts();

        this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.initOptions();
        });
    }

    private loadContacts(): void {
        this.contactService
            .getContacts()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.contacts = data.filter(c => c.dob);
                    this.processBirthdays();
                    this.applyFilters();
                },
                error: (err) => console.error(err),
                complete: () => (this.loading = false)
            });
    }

    private processBirthdays(): void {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentYear = today.getFullYear();

        this.birthdayContacts = this.contacts
            .filter(contact => contact.dob)
            .map(contact => {
                const dob = new Date(contact.dob!);
                const birthdayThisYear = new Date(currentYear, dob.getMonth(), dob.getDate());

                if (birthdayThisYear < today) {
                    birthdayThisYear.setFullYear(currentYear + 1);
                }

                const diffTime = birthdayThisYear.getTime() - today.getTime();
                const daysUntilBirthday = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                const age = birthdayThisYear.getFullYear() - dob.getFullYear();

                return {
                    ...contact,
                    birthdayThisYear,
                    daysUntilBirthday: daysUntilBirthday === 365 || daysUntilBirthday === 366 ? 0 : daysUntilBirthday,
                    age,
                    birthMonth: dob.getMonth()
                } as BirthdayContact;
            })
            .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
    }

    applyFilters(): void {
        let result = [...this.birthdayContacts];

        // Фильтр по месяцу
        if (this.selectedMonth !== null) {
            result = result.filter(c => c.birthMonth === this.selectedMonth);
        }

        // Фильтр по периоду
        if (this.selectedPeriod === 'today') {
            result = result.filter(c => c.daysUntilBirthday === 0);
        } else if (this.selectedPeriod === 'week') {
            result = result.filter(c => c.daysUntilBirthday <= 7);
        } else if (this.selectedPeriod === 'month') {
            result = result.filter(c => c.daysUntilBirthday <= 30);
        }

        this.filteredContacts = result;
    }

    onMonthChange(): void {
        this.applyFilters();
    }

    onPeriodChange(): void {
        this.applyFilters();
    }

    formatBirthDate(dateStr: string | null | undefined): string {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }

    formatFullDate(dateStr: string | null | undefined): string {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    getAvatarLabel(name: string): string {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    getDaysLabel(days: number): string {
        if (days === 0) return this.translate.instant('HRM.BIRTHDAYS.TODAY');
        if (days === 1) return this.translate.instant('HRM.BIRTHDAYS.TOMORROW');

        const lastDigit = days % 10;
        const lastTwoDigits = days % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return this.translate.instant('HRM.BIRTHDAYS.IN_DAYS', { days });
        }
        if (lastDigit === 1) {
            return this.translate.instant('HRM.BIRTHDAYS.IN_DAY', { days });
        }
        if (lastDigit >= 2 && lastDigit <= 4) {
            return this.translate.instant('HRM.BIRTHDAYS.IN_DAYS_2_4', { days });
        }
        return this.translate.instant('HRM.BIRTHDAYS.IN_DAYS', { days });
    }

    getTagSeverity(days: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        if (days === 0) return 'danger';
        if (days <= 3) return 'warn';
        if (days <= 7) return 'info';
        return 'secondary';
    }

    getAgeLabel(age: number): string {
        const lastDigit = age % 10;
        const lastTwoDigits = age % 100;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return `${age} ${this.translate.instant('HRM.BIRTHDAYS.YEARS_OLD')}`;
        }
        if (lastDigit === 1) {
            return `${age} ${this.translate.instant('HRM.BIRTHDAYS.YEAR_OLD')}`;
        }
        if (lastDigit >= 2 && lastDigit <= 4) {
            return `${age} ${this.translate.instant('HRM.BIRTHDAYS.YEARS_OLD_2_4')}`;
        }
        return `${age} ${this.translate.instant('HRM.BIRTHDAYS.YEARS_OLD')}`;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
