import { Component, Input, OnInit, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, inject } from '@angular/core';
import { ViewSDKService } from '@/core/services/view-sdk.service';

@Component({
    selector: 'app-pdf-viewer',
    imports: [],
    templateUrl: './pdf-viewer.component.html',
    styleUrl: './pdf-viewer.component.scss'
})
export class PdfViewerComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
    @Input() url?: string;
    @Input() blob?: Blob;
    @Input() fileName: string = 'document.pdf';
    @Input() viewerId: string = 'pdf-viewer-container';

    private viewSDKService = inject(ViewSDKService);
    private isViewerInitialized = false;
    private pendingRender = false;

    ngOnInit() {
        // Component initialization
    }

    ngAfterViewInit() {
        this.viewSDKService.ready().then(() => {
            this.viewSDKService
                .previewFile(this.viewerId)
                .then(() => {
                    this.isViewerInitialized = true;

                    if (this.pendingRender) {
                        this.renderDocument();
                        this.pendingRender = false;
                    }
                })
                .catch((error) => {
                    console.error('Error initializing Adobe DC View:', error);
                });
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        if ((changes['url'] || changes['blob']) && !changes['url']?.firstChange && !changes['blob']?.firstChange) {
            if (this.isViewerInitialized) {
                this.reinitializeAndRender();
            } else {
                this.pendingRender = true;
            }
        } else if ((changes['url'] || changes['blob']) && (changes['url']?.firstChange || changes['blob']?.firstChange)) {
            if (this.isViewerInitialized) {
                this.renderDocument();
            } else {
                this.pendingRender = true;
            }
        }
    }

    private reinitializeAndRender() {
        this.viewSDKService
            .reinitializeViewer(this.viewerId)
            .then(() => {
                return this.renderDocument();
            })
            .catch((error) => {
                console.error('Error reinitializing viewer:', error);
            });
    }

    private renderDocument(): Promise<void> {
        if (this.blob) {
            return this.viewSDKService.previewFileFromBlob(this.blob, this.fileName);
        } else if (this.url) {
            return this.viewSDKService.previewFileFromURL(this.url, this.fileName);
        }
        return Promise.resolve();
    }

    ngOnDestroy() {
        // Cleanup will be handled by the service
    }
}
