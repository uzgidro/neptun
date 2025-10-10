import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
        this.apiService.getLatestFiles().subscribe({
            next: (data) => {
                this.files = data;
            }
        });
        this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            const isConstruction = params['type'] === 'construction';
            this.showTabs = isConstruction;

            if (isConstruction) {
                let tabIndex = 0;
                if (params['tabIndex']) {
                    tabIndex = parseInt(params['tabIndex'], 10);
                    if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < this.files.length) {
                        this.activeIndex = tabIndex;
                    }
                } else {
                    tabIndex = 0;
                    this.router.navigate([], {
                        queryParams: { tabIndex: 0 },
                        queryParamsHandling: 'merge',
                        replaceUrl: true
                    });
                }

                switch (tabIndex) {
                    case 0:
                        this.fileUrl = this.files.filter((value) => value.category_name.includes('norin'))[0].url;
                        break;
                    case 1:
                        this.fileUrl = this.files.filter((value) => value.category_name.includes('chotqol'))[0].url;
                        break;
                    case 2:
                        this.fileUrl = this.files.filter((value) => value.category_name.includes('ufk'))[0].url;
                        break;
                    case 3:
                        this.fileUrl = this.files.filter((value) => value.category_name.includes('oqsuv'))[0].url;
                        break;
                }
            }

            if (params['type'] === 'production') {
                this.fileUrl = this.files.filter((value) => value.category_name.includes('production'))[0].url;
            } else if (params['type'] === 'shutdown') {
                this.fileUrl = this.files.filter((value) => value.category_name.includes('shutdown'))[0].url;
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
