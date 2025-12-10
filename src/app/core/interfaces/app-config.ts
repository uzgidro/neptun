export interface AppConfig {
    app: {
        name: string;
        version: string;
        environment: string;
    };
    api: {
        baseUrl: string;
        timeout: number;
        retryAttempts: number;
    };
    auth: {
        tokenExpiryTime: number;
        refreshTokenExpiryTime: number;
    };
    features: {
        enableFileUpload: boolean;
        enableCategories: boolean;
        maxFileSize: number;
    };
    logging: {
        level: string;
        enableConsole: boolean;
    };
    adobe: {
        clientId: string;
        defaultViewMode: string;
    };
}
