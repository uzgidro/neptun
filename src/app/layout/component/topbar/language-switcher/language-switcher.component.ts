import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from '@/core/services/language.service';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-language-switcher',
    standalone: true,
    imports: [CommonModule, TooltipModule, TranslateModule],
    template: `
        <button
            type="button"
            class="layout-topbar-action"
            (click)="switchToNextLanguage()"
            [pTooltip]="getTooltipText()"
            tooltipPosition="bottom"
            [attr.aria-label]="'LANGUAGE.SELECT' | translate"
        >
            <i class="pi pi-globe"></i>
            <span class="ml-1 text-sm font-medium">{{ getLanguageLabel() }}</span>
        </button>
    `
})
export class LanguageSwitcherComponent {
    private languageService = inject(LanguageService);
    private translateService = inject(TranslateService);
    private languageOrder = ['ru', 'uz-latn', 'uz-cyrl'];

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

    getTooltipText(): string {
        const nextLang = this.getNextLanguageCode();
        return this.translateService.instant(this.getLangKey(nextLang));
    }

    private getLangKey(code: string): string {
        if (code === 'ru') return 'LANGUAGE.RU';
        if (code === 'uz-latn') return 'LANGUAGE.UZ_LATN';
        if (code === 'uz-cyrl') return 'LANGUAGE.UZ_CYRL';
        return 'LANGUAGE.RU';
    }

    private getNextLanguageCode(): string {
        const currentIndex = this.languageOrder.indexOf(this.currentLanguage.code);
        const nextIndex = (currentIndex + 1) % this.languageOrder.length;
        return this.languageOrder[nextIndex];
    }

    switchToNextLanguage(): void {
        const nextLangCode = this.getNextLanguageCode();
        this.languageService.setLanguage(nextLangCode);
    }
}
