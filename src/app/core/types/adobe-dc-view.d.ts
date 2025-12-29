// TypeScript declarations for Adobe PDF Embed API

declare namespace AdobeDC {
    interface ViewConfig {
        clientId: string;
        divId: string;
        locale: string;
    }

    interface PreviewFileConfig {
        content: {
            location?: {
                url: string;
                headers?: { key: string; value: string }[];
            };
            promise?: Promise<ArrayBuffer>;
        };
        metaData: {
            fileName: string;
            id?: string;
        };
    }

    interface ViewerConfig {
        defaultViewMode?: string;
        embedMode?: string;
        showDownloadPDF?: boolean;
        showPrintPDF?: boolean;
        showLeftHandPanel?: boolean;
        showAnnotationTools?: boolean;
        dockPageControls?: boolean;
        enableFormFilling?: boolean;
        enableTextSelection?: boolean;
        showThumbnails?: boolean;
        showBookmarks?: boolean;
    }

    interface ViewInstance {
        previewFile(config: PreviewFileConfig, viewerConfig?: ViewerConfig): Promise<void>;
        registerCallback(type: string, handler: Function, options?: any): void;
    }

    class View {
        constructor(config: ViewConfig);
        previewFile(config: PreviewFileConfig, viewerConfig?: ViewerConfig): Promise<void>;
        registerCallback(type: string, handler: Function, options?: any): void;
    }
}

interface Window {
    AdobeDC?: typeof AdobeDC;
    __APP_CONFIG__?: any;
}
