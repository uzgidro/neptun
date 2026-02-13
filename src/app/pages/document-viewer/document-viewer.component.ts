import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { FileService } from '@/core/services/file.service';
import { FileResponse } from '@/core/interfaces/files';
import { ViewSDKService } from '@/core/services/view-sdk.service';
import { DateWidget } from '@/layout/component/widget/date/date.widget';

@Component({
    selector: 'app-document-viewer',
    standalone: true,
    imports: [Tab, TabList, Tabs, ReactiveFormsModule, DateWidget],
    templateUrl: './document-viewer.component.html',
    styleUrl: './document-viewer.component.scss'
})
export class DocumentViewerComponent implements OnInit, AfterViewInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private fileService = inject(FileService);
    private viewSDKService = inject(ViewSDKService);
    private destroy$ = new Subject<void>();

    showTabs = false;
    activeIndex = 0;

    fileUrl = '';
    fileName = '';
    currentCategory = '';

    private isViewerInitialized = false;
    private pendingFileUrl = '';
    private pendingFileName = '';

    ngOnInit() {
        const params$ = this.route.queryParams;

        // Subscribe to query params changes
        params$.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            const isConstruction = params['type'] === 'constructions';
            this.showTabs = isConstruction;

            if (isConstruction) {
                let tabIndex = 0;
                if (params['tabIndex']) {
                    tabIndex = parseInt(params['tabIndex'], 10);
                    if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < 4) {
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
                this.currentCategory = categoryMap[tabIndex];
            } else {
                this.currentCategory = params['type'];
            }
        });
    }

    onDateChange(date: Date): void {
        this.loadFile(date);
    }

    private loadFile(date: Date): void {
        if (!this.currentCategory) {
            return;
        }

        this.fileService
            .getFileByCategory(this.currentCategory, date)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (file) => {
                    this.updateFile(file);
                },
                error: (error) => {
                    console.error('Error loading file:', error);
                }
            });
    }

    ngAfterViewInit() {
        this.viewSDKService.ready().then(() => {
            // Initialize Adobe DC View once
            this.viewSDKService
                .previewFile('adobe-dc-view')
                .then(() => {
                    this.isViewerInitialized = true;

                    // Render pending PDF if available
                    if (this.pendingFileUrl) {
                        this.renderPDF(this.pendingFileUrl, this.pendingFileName);
                        this.pendingFileUrl = '';
                        this.pendingFileName = '';
                    }
                })
                .catch((error) => {
                    console.error('Error initializing Adobe DC View:', error);
                });
        });
    }

    private updateFile(file: FileResponse) {
        const newFileUrl = file.url;
        const newFileName = file.file_name;

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
            .catch(() => {});
    }

    private renderPDF(url: string, fileName: string) {
        if (!url) {
            return;
        }

        this.viewSDKService
            .previewFileFromURL(url, fileName)
            .catch(() => {});
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
