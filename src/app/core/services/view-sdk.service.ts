import { Injectable, inject } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
    providedIn: 'root'
})
export class ViewSDKService {
    private configService = inject(ConfigService);
    private readonly readyPromise: Promise<void>;
    private adobeDCView: AdobeDC.ViewInstance | null = null;

    constructor() {
        this.readyPromise = new Promise<void>((resolve) => {
            if (window.AdobeDC) {
                resolve();
            } else {
                document.addEventListener('adobe_dc_view_sdk.ready', () => {
                    resolve();
                });
            }
        });
    }

    ready(): Promise<void> {
        return this.readyPromise;
    }

    previewFile(divId: string, viewerConfig: Partial<AdobeDC.ViewerConfig> = {}): Promise<void> {
        const clientId = this.configService.adobeClientId;

        if (!clientId || clientId === '<YOUR_CLIENT_ID>') {
            return Promise.reject('Adobe Client ID not configured');
        }

        this.adobeDCView = new window.AdobeDC!.View({
            clientId: clientId,
            divId: divId
        });

        return Promise.resolve();
    }

    previewFileFromURL(url: string, fileName: string, viewerConfig: Partial<AdobeDC.ViewerConfig> = {}): Promise<void> {
        if (!this.adobeDCView) {
            return Promise.reject('Adobe DC View not initialized. Call previewFile first.');
        }

        const defaultConfig: AdobeDC.ViewerConfig = {
            defaultViewMode: this.configService.adobeDefaultViewMode,
            embedMode: 'FULL_WINDOW',
            showDownloadPDF: true,
            showPrintPDF: true,
            showLeftHandPanel: true,
            dockPageControls: true,
            ...viewerConfig
        };

        const previewConfig: AdobeDC.PreviewFileConfig = {
            content: {
                location: {
                    url: url
                }
            },
            metaData: {
                fileName: fileName || 'document.pdf',
                id: `${Date.now()}-${fileName}`
            }
        };

        return this.adobeDCView.previewFile(previewConfig, defaultConfig);
    }

    registerEventsHandler(eventHandler: (event: any) => void): void {
        if (!this.adobeDCView) {
            return;
        }

        this.adobeDCView.registerCallback('EVENT_LISTENER' as any, eventHandler, { enablePDFAnalytics: true });
    }

    getAdobeDCView(): AdobeDC.ViewInstance | null {
        return this.adobeDCView;
    }
}
