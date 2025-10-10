import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

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
    private destroy$ = new Subject<void>();

    showTabs = false;
    activeIndex = 0;

    pdfSources: string[] = [
        'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf', // 0: Норин
        'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf', // 1: Чаткал (замените на другой)
        'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf', // 2: ЮФК (замените на другой)
        'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf' // 3: Оксув (замените на другой)
    ];

    ngOnInit() {
        this.route.queryParams.pipe(
            takeUntil(this.destroy$)
        ).subscribe((params) => {
            const isConstruction = params['type'] === 'construction';
            this.showTabs = isConstruction;

            if (isConstruction) {
                if (params['tabIndex']) {
                    const tabIndex = parseInt(params['tabIndex'], 10);
                    if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < this.pdfSources.length) {
                        this.activeIndex = tabIndex;
                    }
                } else {
                    this.router.navigate([], {
                        queryParams: { tabIndex: 0 },
                        queryParamsHandling: 'merge',
                        replaceUrl: true
                    });
                }
            }
        });
    }

    get currentPdfSrc(): string {
        return this.pdfSources[this.activeIndex];
    }

    onTabChange(index: number) {
        this.router.navigate([], { queryParams: { tabIndex: index }, queryParamsHandling: 'merge' });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
