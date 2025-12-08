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
    zoom = 1.0;
    zoomStep = 0.25;
    minZoom = 0.5;
    maxZoom = 3.0;

    // Touch gesture properties
    private initialPinchDistance = 0;
    private initialZoom = 1.0;

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
                    this.fileUrl = foundFile ? foundFile.url : '';
                } else {
                    const foundFile = files.find((file) => file.category_name.includes(params['type']));
                    this.fileUrl = foundFile ? foundFile.url : '';
                }
            });
    }

    onTabChange(index: number | string) {
        this.router.navigate([], { queryParams: { tabIndex: index }, queryParamsHandling: 'merge' });
    }

    zoomIn() {
        if (this.zoom < this.maxZoom) {
            this.zoom += this.zoomStep;
        }
    }

    zoomOut() {
        if (this.zoom > this.minZoom) {
            this.zoom -= this.zoomStep;
        }
    }

    resetZoom() {
        this.zoom = 1.0;
    }

    // Touch gesture handlers
    onTouchStart(event: TouchEvent) {
        if (event.touches.length === 2) {
            event.preventDefault();
            this.initialPinchDistance = this.getPinchDistance(event.touches);
            this.initialZoom = this.zoom;
        }
    }

    onTouchMove(event: TouchEvent) {
        if (event.touches.length === 2 && this.initialPinchDistance > 0) {
            event.preventDefault();
            const currentDistance = this.getPinchDistance(event.touches);
            const scale = currentDistance / this.initialPinchDistance;
            let newZoom = this.initialZoom * scale;

            // Clamp zoom to min/max values
            newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
            this.zoom = newZoom;
        }
    }

    onTouchEnd(event: TouchEvent) {
        if (event.touches.length < 2) {
            this.initialPinchDistance = 0;
        }
    }

    private getPinchDistance(touches: TouchList): number {
        const touch1 = touches[0];
        const touch2 = touches[1];
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
