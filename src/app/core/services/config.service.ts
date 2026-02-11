import { Injectable } from '@angular/core';
import { AppConfig } from '@/core/interfaces/app-config';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private config: AppConfig;

    constructor() {
        this.config = this.loadConfig();
    }

    private loadConfig(): AppConfig {
        // Load config from window object (injected by Docker/nginx at runtime)
        const runtimeConfig = (window as any).__APP_CONFIG__;

        // Default configuration (fallback) - Mock mode
        const defaultConfig: AppConfig = {
            app: {
                name: 'Neptun',
                version: '1.0.0',
                environment: 'development'
            },
            api: {
                baseUrl: '', // Mock mode - no backend
                timeout: 30000,
                retryAttempts: 3
            },
            auth: {
                tokenExpiryTime: 3600,
                refreshTokenExpiryTime: 86400
            },
            features: {
                enableFileUpload: true,
                enableCategories: true,
                maxFileSize: 10485760
            },
            logging: {
                level: 'info',
                enableConsole: true
            },
            adobe: {
                clientId: '09dae9aa8b8749738990ffe012751ebc',
                defaultViewMode: 'FIT_WIDTH'
            }
        };

        // Merge runtime config with defaults
        return this.deepMerge(defaultConfig, runtimeConfig || {});
    }

    private deepMerge(target: any, source: any): any {
        const result = { ...target };

        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(target[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }

        return result;
    }

    getConfig(): AppConfig {
        return this.config;
    }

    get apiBaseUrl(): string {
        return this.config.api.baseUrl;
    }

    get apiTimeout(): number {
        return this.config.api.timeout;
    }

    get apiRetryAttempts(): number {
        return this.config.api.retryAttempts;
    }

    get tokenExpiryTime(): number {
        return this.config.auth.tokenExpiryTime;
    }

    get refreshTokenExpiryTime(): number {
        return this.config.auth.refreshTokenExpiryTime;
    }

    get maxFileSize(): number {
        return this.config.features.maxFileSize;
    }

    get loggingLevel(): string {
        return this.config.logging.level;
    }

    get enableConsoleLogging(): boolean {
        return this.config.logging.enableConsole;
    }

    get adobeClientId(): string {
        return this.config.adobe.clientId;
    }

    get adobeDefaultViewMode(): string {
        return this.config.adobe.defaultViewMode;
    }

    isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
        return this.config.features[feature] as boolean;
    }

    log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
        if (!this.enableConsoleLogging) {
            return;
        }

        const levels = ['debug', 'info', 'warn', 'error'];
        const currentLevelIndex = levels.indexOf(this.loggingLevel);
        const messageLevelIndex = levels.indexOf(level);

        if (messageLevelIndex >= currentLevelIndex) {
            console[level](message, ...args);
        }
    }
}
