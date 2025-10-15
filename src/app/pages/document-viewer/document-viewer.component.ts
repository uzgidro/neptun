import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, shareReplay, Subject, takeUntil } from 'rxjs';
import { ApiService } from '@/core/services/api.service';
import { LatestFiles } from '@/core/interfaces/latest-files';

@Component({
    selector: 'app-document-viewer',
    standalone: true,
    imports: [Tab, TabList, Tabs, PdfViewerModule],
    templateUrl: './document-viewer.component.html',
    styleUrl: './document-viewer.component.scss'
})
export class DocumentViewerComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private apiService = inject(ApiService);
    private destroy$ = new Subject<void>();

    showTabs = false;
    activeIndex = 0;

    files: LatestFiles[] = [];

    fileUrl = '';

    ngOnInit() {
        const files$ = this.apiService.getLatestFiles().pipe(shareReplay(1));

        const params$ = this.route.queryParams;

        combineLatest([files$, params$])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([files, params]) => {
                this.files = files;
                const isConstruction = params['type'] === 'construction';
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
                    this.fileUrl = foundFile ? foundFile.url : '';
                }

                if (params['type'] === 'production' || params['type'] === 'shutdown') {
                    const foundFile = files.find((file) => file.category_name.includes(params['type']));
                    this.fileUrl = foundFile ? foundFile.url : '';
                }
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
