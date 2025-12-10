import { Component, inject, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, shareReplay, Subject, takeUntil } from 'rxjs';
import { ApiService } from '@/core/services/api.service';
import { ViewSDKService } from '@/core/services/view-sdk.service';
import { LatestFiles } from '@/core/interfaces/latest-files';

@Component({
    selector: 'app-document-viewer',
    standalone: true,
    imports: [Tab, TabList, Tabs],
    templateUrl: './document-viewer.component.html',
    styleUrl: './document-viewer.component.scss'
})
export class DocumentViewerComponent implements OnInit, AfterViewInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private apiService = inject(ApiService);
    private viewSDKService = inject(ViewSDKService);
    private destroy$ = new Subject<void>();

    showTabs = false;
    activeIndex = 0;

    files: LatestFiles[] = [];
    fileUrl = '';
    fileName = '';

    private isViewerInitialized = false;
    private pendingFileUrl = '';
    private pendingFileName = '';

    ngOnInit() {
        const files$ = this.apiService.getLatestFiles().pipe(shareReplay(1));
        const params$ = this.route.queryParams;

        combineLatest([files$, params$])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([files, params]) => {
                this.files = files;
                const isConstruction = params['type'] === 'constructions';
                this.showTabs = isConstruction;

                if (isConstruction) {
                    let tabIndex = 0;
                    if (params['tabIndex']) {
                        tabIndex = parseInt(params['tabIndex'], 10);
                        if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < files.length) {
                            this.activeIndex = tabIndex;
                        }
                    } else {
                        this.router.navigate([], {
                            queryParams: { tabIndex: 0 },
                            queryParamsHandling: 'merge',
                            replaceUrl: true
                        });
                        return; // Skip rendering until query param is set
                    }

                    const categoryMap: { [key: number]: string } = {
                        0: 'norin',
                        1: 'chotqol',
                        2: 'ufk',
                        3: 'oqsuv'
                    };
                    const categoryName = categoryMap[tabIndex];
                    const foundFile = files.find((file) => file.category_name.includes(categoryName));
                    this.updateFile(foundFile);
                } else {
                    const foundFile = files.find((file) => file.category_name.includes(params['type']));
                    this.updateFile(foundFile);
                }
            });
    }

    ngAfterViewInit() {
        this.viewSDKService.ready().then(() => {
            // Initialize Adobe DC View once
            this.viewSDKService.previewFile('adobe-dc-view').then(() => {
                this.isViewerInitialized = true;

                // Render pending PDF if available
                if (this.pendingFileUrl) {
                    this.renderPDF(this.pendingFileUrl, this.pendingFileName);
                    this.pendingFileUrl = '';
                    this.pendingFileName = '';
                }
            }).catch((error) => {
                console.error('Error initializing Adobe DC View:', error);
            });
        });
    }

    private updateFile(file: LatestFiles | undefined) {
        console.log(file);
        const newFileUrl = file ? file.url : '';
        const newFileName = file ? file.file_name : '';

        // Only render if the URL has actually changed
        if (newFileUrl !== this.fileUrl) {
            this.fileUrl = newFileUrl;
            this.fileName = newFileName;

            if (this.isViewerInitialized && this.fileUrl) {
                // Reinitialize viewer for new PDF to avoid MobX errors
                this.reinitializeAndRender(this.fileUrl, this.fileName);
            } else if (this.fileUrl) {
                // Store for later rendering when viewer is ready
                this.pendingFileUrl = this.fileUrl;
                this.pendingFileName = this.fileName;
            }
        }
    }

    private reinitializeAndRender(url: string, fileName: string) {
        if (!url) {
            return;
        }

        // Reinitialize the viewer to avoid MobX state issues
        this.viewSDKService
            .reinitializeViewer('adobe-dc-view')
            .then(() => {
                return this.viewSDKService.previewFileFromURL(url, fileName);
            })
            .then(() => {
                console.log('PDF rendered successfully:', fileName);
            })
            .catch((error) => {
                console.error('Error rendering PDF:', error);
            });
    }

    private renderPDF(url: string, fileName: string) {
        if (!url) {
            return;
        }

        this.viewSDKService
            .previewFileFromURL(url, fileName)
            .then(() => {
                console.log('PDF rendered successfully:', fileName);
            })
            .catch((error) => {
                console.error('Error rendering PDF:', error);
            });
    }

    onTabChange(index: number | string | undefined) {
        if (index !== undefined) {
            this.router.navigate([], { queryParams: { tabIndex: index }, queryParamsHandling: 'merge' });
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
