import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export interface Language {
    code: string;
    name: string;
    flag: string;
}

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private readonly STORAGE_KEY = 'selectedLanguage';

    readonly languages: Language[] = [
        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
        { code: 'uz-latn', name: "O'zbekcha (Lotin)", flag: '🇺🇿' },
        { code: 'uz-cyrl', name: 'Ўзбекча (Кирилл)', flag: '🇺🇿' },
        { code: 'en', name: 'English', flag: '🇬🇧' }
    ];

    constructor(private translate: TranslateService) {
        this.initLanguage();
    }

    private initLanguage(): void {
        const savedLang = localStorage.getItem(this.STORAGE_KEY);
        const defaultLang = savedLang || 'ru';

        this.translate.setDefaultLang('ru');
        this.translate.use(defaultLang);
    }

    getCurrentLanguage(): Language {
        const currentCode = this.translate.currentLang || 'ru';
        return this.languages.find(lang => lang.code === currentCode) || this.languages[0];
    }

    setLanguage(langCode: string): void {
        this.translate.use(langCode);
        localStorage.setItem(this.STORAGE_KEY, langCode);
    }

    getLanguages(): Language[] {
        return this.languages;
    }
}
