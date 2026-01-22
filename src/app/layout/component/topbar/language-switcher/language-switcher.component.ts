import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '@/core/services/language.service';
import { SelectButton } from 'primeng/selectbutton';

@Component({
    selector: 'app-language-switcher',
    standalone: true,
    imports: [CommonModule, FormsModule, SelectButton],
    template: `
        <p-select-button
            [options]="languageOptions"
            [(ngModel)]="selectedLang"
            (onChange)="onLanguageChange($event)"
            optionLabel="label"
            optionValue="value"
            [allowEmpty]="false"
            styleClass="language-switcher"
        />
    `,
    styles: [`
        :host ::ng-deep .language-switcher {
            .p-button {
                padding: 0.5rem 0.75rem;
                font-size: 0.875rem;
            }
        }
    `]
})
export class LanguageSwitcherComponent {
    private languageService = inject(LanguageService);

    languageOptions = [
        { label: 'RU', value: 'ru' },
        { label: 'UZ', value: 'uz-latn' },
        { label: 'ЎЗ', value: 'uz-cyrl' },
        { label: 'EN', value: 'en' }
    ];

    get selectedLang(): string {
        return this.languageService.getCurrentLanguage().code;
    }

    set selectedLang(_: string) {
        // Setter needed for ngModel binding
    }

    onLanguageChange(event: any): void {
        if (event.value) {
            this.languageService.setLanguage(event.value);
        }
    }
}
