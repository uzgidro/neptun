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
            // Initialize Adobe DC View
            this.viewSDKService.previewFile('adobe-dc-view').then(() => {
                // Render PDF if file URL is already available
                if (this.fileUrl) {
                    this.renderPDF();
                }
            });
        });
    }

    private updateFile(file: LatestFiles | undefined) {
        this.fileUrl = file ? file.url : '';
        this.fileName = file ? file.file_name : '';

        // Render PDF if Adobe DC View is ready
        if (this.fileUrl && this.viewSDKService.getAdobeDCView()) {
            this.renderPDF();
        }
    }

    private renderPDF() {
        if (!this.fileUrl) {
            return;
        }

        this.viewSDKService
            .previewFileFromURL(this.fileUrl, this.fileName)
            .catch((error) => {
                console.error('Error rendering PDF:', error);
            });
    }

    onTabChange(index: number | string) {
        this.router.navigate([], { queryParams: { tabIndex: index }, queryParamsHandling: 'merge' });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
