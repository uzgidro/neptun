import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from '@/core/services/language.service';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-language-switcher',
    standalone: true,
    imports: [CommonModule, MenuModule, ButtonModule, TranslateModule],
    template: `
        <button
            type="button"
            class="layout-topbar-action"
            (click)="menu.toggle($event)"
            [attr.aria-label]="'LANGUAGE.SELECT' | translate"
        >
            <i class="pi pi-globe"></i>
            <span class="ml-1 text-sm font-medium">{{ getLanguageLabel() }}</span>
        </button>
        <p-menu #menu [model]="menuItems" [popup]="true" appendTo="body" />
    `
})
export class LanguageSwitcherComponent {
    private languageService = inject(LanguageService);
    private translateService = inject(TranslateService);

    get currentLanguage(): Language {
        return this.languageService.getCurrentLanguage();
    }

    getLanguageLabel(): string {
        const code = this.currentLanguage.code;
        if (code === 'ru') return 'RU';
        if (code === 'uz-latn') return 'UZ';
        if (code === 'uz-cyrl') return 'ЎЗ';
        return code.toUpperCase();
    }

    get menuItems(): MenuItem[] {
        return this.languageService.getLanguages().map(lang => ({
            label: this.translateService.instant(this.getLangKey(lang.code)),
            icon: lang.code === this.currentLanguage.code ? 'pi pi-check' : '',
            command: () => this.selectLanguage(lang.code)
        }));
    }

    private getLangKey(code: string): string {
        if (code === 'ru') return 'LANGUAGE.RU';
        if (code === 'uz-latn') return 'LANGUAGE.UZ_LATN';
        if (code === 'uz-cyrl') return 'LANGUAGE.UZ_CYRL';
        return 'LANGUAGE.RU';
    }

    selectLanguage(langCode: string): void {
        this.languageService.setLanguage(langCode);
    }
}
