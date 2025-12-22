import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FileService } from '@/core/services/file.service';
import { FileResponse } from '@/core/interfaces/files';
import { ViewSDKService } from '@/core/services/view-sdk.service';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';

@Component({
    selector: 'app-document-viewer',
    standalone: true,
    imports: [Tab, TabList, Tabs, ReactiveFormsModule, DatePickerComponent],
    templateUrl: './document-viewer.component.html',
    styleUrl: './document-viewer.component.scss'
})
export class DocumentViewerComponent implements OnInit, AfterViewInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private fb = inject(FormBuilder);
    private fileService = inject(FileService);
    private viewSDKService = inject(ViewSDKService);
    private destroy$ = new Subject<void>();

    form: FormGroup = this.fb.group({
        date: [new Date()]
    });

    showTabs = false;
    activeIndex = 0;

    fileUrl = '';
    fileName = '';
    currentCategory = '';

    private isViewerInitialized = false;
    private pendingFileUrl = '';
    private pendingFileName = '';

    get selectedDate(): Date {
        return this.form.get('date')?.value;
    }

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

            // Get date from query params or use today
            let dateToSet = new Date();
            if (params['date']) {
                const parsedDate = new Date(params['date']);
                if (!isNaN(parsedDate.getTime())) {
                    dateToSet = parsedDate;
                }
            }

            // Set date in form without emitting to avoid triggering loadFile twice
            this.form.patchValue({ date: dateToSet }, { emitEvent: false });

            // Load file for the current category and date
            this.loadFile();
        });

        // Subscribe to date changes to update query params
        this.form
            .get('date')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((date: Date) => {
                if (date) {
                    // Format date as YYYY-MM-DD
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const dateStr = `${year}-${month}-${day}`;

                    // Update query params with new date
                    this.router.navigate([], {
                        queryParams: { date: dateStr },
                        queryParamsHandling: 'merge'
                    });
                }
            });
    }

    private loadFile() {
        if (!this.currentCategory || !this.selectedDate) {
            return;
        }

        this.fileService
            .getFileByCategory(this.currentCategory, this.selectedDate)
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
