import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { authInterceptor } from '@/core/interceptor/auth.interceptor';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { firstValueFrom } from 'rxjs';

registerLocaleData(localeRu);

function initializeTranslations(translate: TranslateService) {
    return () => {
        const savedLang = localStorage.getItem('language') || 'ru';
        translate.setDefaultLang('ru');
        return firstValueFrom(translate.use(savedLang));
    };
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        importProvidersFrom(ReactiveFormsModule),
        provideTranslateService({
            defaultLanguage: 'ru',
            loader: provideTranslateHttpLoader({
                prefix: './assets/i18n/',
                suffix: '.json'
            })
        }),
        {
            provide: APP_INITIALIZER,
            useFactory: initializeTranslations,
            deps: [TranslateService],
            multi: true
        },
        MessageService,
        { provide: LOCALE_ID, useValue: 'ru' }
    ]
};
