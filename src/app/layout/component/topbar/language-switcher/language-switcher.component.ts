import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '@/core/services/language.service';
import { Select } from 'primeng/select';

@Component({
    selector: 'app-language-switcher',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, Select],
    template: `
        <p-select
            [options]="languageOptions"
            [(ngModel)]="selectedLang"
            (onChange)="onLanguageChange($event)"
            optionLabel="label"
            optionValue="value"
            styleClass="language-select"
            [style]="{ minWidth: '80px' }"
        />
    `,
    styles: [`
        :host {
            display: flex;
            align-items: center;
        }
        :host ::ng-deep .language-select {
            .p-select-label {
                padding: 0.375rem 0.5rem;
                font-size: 0.875rem;
            }
        }
    `]
})
export class LanguageSwitcherComponent implements OnInit {
    private languageService = inject(LanguageService);

    languageOptions = [
        { label: 'RU', value: 'ru' },
        { label: 'UZ', value: 'uz-latn' },
        { label: 'ЎЗ', value: 'uz-cyrl' },
        { label: 'EN', value: 'en' }
    ];

    selectedLang = '';

    ngOnInit(): void {
        this.selectedLang = this.languageService.getCurrentLanguage().code;
    }

    onLanguageChange(event: any): void {
        if (event.value) {
            this.languageService.setLanguage(event.value);
            this.selectedLang = event.value;
        }
    }
}
