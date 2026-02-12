import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Обработка ошибки загрузки chunk-ов после деплоя новой версии
function handleChunkLoadError(): void {
    const reloadKey = 'chunk-reload-attempted';
    if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, 'true');
        window.location.reload();
    }
}

function isChunkLoadError(message: string | undefined): boolean {
    if (!message) return false;
    return message.includes('Loading chunk') || message.includes('dynamically imported module') || message.includes('Failed to fetch dynamically imported module') || message.includes('error loading dynamically imported module');
}

window.addEventListener('error', (event) => {
    if (isChunkLoadError(event.message)) {
        handleChunkLoadError();
    }
});

window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason?.message || reason?.toString() || '';
    if (isChunkLoadError(message)) {
        handleChunkLoadError();
    }
});

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
