import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, ErrorHandler, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { authInterceptor } from '@/core/interceptor/auth.interceptor';
import { errorInterceptor } from '@/core/interceptor/error.interceptor';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { GlobalErrorHandler } from '@/core/services/global-error-handler.service';
import { RESERVOIR_SUMMARY_CONFIG_SOURCE } from '@/core/services/reservoir-summary-config.source';
import { MockReservoirSummaryConfigService } from '@/core/services/reservoir-summary-config.mock';
registerLocaleData(localeRu);

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } },
            translation: { dateFormat: 'yy-mm-dd', firstDayOfWeek: 1 }
        }),
        importProvidersFrom(ReactiveFormsModule),
        provideTranslateService({
            defaultLanguage: 'ru',
            loader: provideTranslateHttpLoader({
                prefix: './assets/i18n/',
                suffix: '.json'
            })
        }),
        MessageService,
        { provide: LOCALE_ID, useValue: 'ru' },
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
        // Phase A: mock data source for reservoir-summary config admin UI.
        // Phase B: swap useClass to ReservoirSummaryConfigApiService once visual is approved.
        { provide: RESERVOIR_SUMMARY_CONFIG_SOURCE, useClass: MockReservoirSummaryConfigService }
    ]
};
