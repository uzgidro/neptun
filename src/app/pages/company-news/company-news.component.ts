import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompanyNewsService } from '@/core/services/company-news.service';
import { CompanyNewsItem, CompanyNewsMeta } from '@/core/interfaces/company-news';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';

type LangField = 'uz' | 'ru' | 'eng';

@Component({
    selector: 'app-company-news',
    standalone: true,
    imports: [CommonModule, TranslateModule, Tag, ButtonDirective, ButtonIcon, ButtonLabel, Dialog, Divider, Paginator, Skeleton, Tooltip, PrimeTemplate],
    templateUrl: './company-news.component.html',
    styleUrl: './company-news.component.scss'
})
export class CompanyNewsComponent implements OnInit {
    private newsService = inject(CompanyNewsService);
    private messageService = inject(MessageService);
    private translateService = inject(TranslateService);
    private sanitizer = inject(DomSanitizer);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private destroyRef = inject(DestroyRef);

    // Signals
    newsItems = signal<CompanyNewsItem[]>([]);
    meta = signal<CompanyNewsMeta | null>(null);
    loading = signal(true);
    currentPage = signal(1);
    displayDetailDialog = signal(false);
    selectedNews = signal<CompanyNewsItem | null>(null);
    currentLang = signal<string>(this.translateService.currentLang || 'ru');

    // Computed
    langField = computed<LangField>(() => {
        return this.newsService.mapLanguageToField(this.currentLang());
    });

    totalRecords = computed(() => this.meta()?.totalCount ?? 0);
    pageCount = computed(() => this.meta()?.pageCount ?? 0);
    rows = computed(() => this.meta()?.perPage ?? 20);

    // Skeleton items for loading state
    skeletonItems = [0, 1, 2, 3, 4, 5, 6, 7];

    ngOnInit(): void {
        // Subscribe to language changes
        this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
            this.currentLang.set(event.lang);
        });

        // Read page from URL query params
        const pageParam = this.route.snapshot.queryParamMap.get('page');
        const page = pageParam ? parseInt(pageParam, 10) : 1;
        this.currentPage.set(page > 0 ? page : 1);
        this.loadNews();
    }

    private loadNews(): void {
        this.loading.set(true);

        this.newsService.getNews(this.currentPage()).subscribe({
            next: (response) => {
                this.newsItems.set(response.items);
                this.meta.set(response._meta);
                this.loading.set(false);
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translateService.instant('COMMON.ERROR'),
                    detail: this.translateService.instant('COMPANY_NEWS.LOAD_ERROR')
                });
                console.error('Error loading company news:', error);
                this.loading.set(false);
            }
        });
    }

    onPageChange(event: PaginatorState): void {
        const first = event.first ?? 0;
        const rows = event.rows ?? 20;
        const newPage = Math.floor(first / rows) + 1;
        if (newPage !== this.currentPage()) {
            this.goToPage(newPage);
        }
    }

    goToPage(page: number): void {
        this.currentPage.set(page);
        // Update URL with page parameter
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page },
            queryParamsHandling: 'merge'
        });
        this.loadNews();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    openDetailDialog(news: CompanyNewsItem): void {
        this.selectedNews.set(news);
        this.displayDetailDialog.set(true);
    }

    closeDetailDialog(): void {
        this.displayDetailDialog.set(false);
    }

    // Getters for localized content
    getTitle(item: CompanyNewsItem): string {
        const field = this.langField();
        return item[field] || item.ru;
    }

    getSummary(item: CompanyNewsItem): string {
        const field = `${this.langField()}small` as keyof CompanyNewsItem;
        return (item[field] as string) || item.rusmall;
    }

    getFullText(item: CompanyNewsItem): SafeHtml {
        const field = `${this.langField()}text` as keyof CompanyNewsItem;
        const html = (item[field] as string) || item.rutext;
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString(this.getDateLocale(), {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatDateTime(dateStr: string): string {
        return new Date(dateStr).toLocaleString(this.getDateLocale(), {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    private getDateLocale(): string {
        const lang = this.currentLang();
        if (lang.startsWith('uz')) return 'uz-UZ';
        if (lang === 'en') return 'en-US';
        return 'ru-RU';
    }

    formatViews(views: number): string {
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1) + 'M';
        } else if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'K';
        }
        return views.toString();
    }

    truncateText(text: string, maxLength: number = 150): string {
        if (!text) return '';
        const cleanText = text.replace(/\n/g, ' ').trim();
        return cleanText.length > maxLength ? cleanText.substring(0, maxLength) + '...' : cleanText;
    }

    getImageUrl(img: string): string {
        if (!img) return '';
        const uploadIndex = img.indexOf('https://upload');
        if (uploadIndex > 0) {
            return img.substring(uploadIndex);
        }
        return img;
    }

    get first(): number {
        return (this.currentPage() - 1) * this.rows();
    }
}
