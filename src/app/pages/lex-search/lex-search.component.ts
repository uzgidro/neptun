import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { TranslateModule } from '@ngx-translate/core';

import { LexSearchDocument } from '@/core/interfaces/chancellery';
import { LegalDocumentService } from '@/core/services/legal-document.service';

const LEX_UZ_BASE = 'https://lex.uz';

@Component({
    selector: 'app-lex-search',
    standalone: true,
    imports: [CommonModule, FormsModule, InputText, IconField, InputIcon, ButtonDirective, Tag, Paginator, TranslateModule],
    templateUrl: './lex-search.component.html',
    styleUrl: './lex-search.component.scss'
})
export class LexSearchComponent implements OnInit, OnDestroy {
    // Lex Search
    lexSearchQuery = '';
    lexSearchResults: LexSearchDocument[] = [];
    lexCurrentPage = 1;
    lexTotalPages = 0;
    lexLoading = false;
    private lexSearchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    // Services
    private legalDocumentService = inject(LegalDocumentService);

    ngOnInit(): void {
        // Lex Search debounce (1.2s delay to prevent server overload)
        this.lexSearchSubject.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe((query) => {
            if (query.length >= 2) {
                this.performLexSearch(query, 1);
            } else {
                this.lexSearchResults = [];
                this.lexTotalPages = 0;
            }
        });
    }

    onLexSearchInput(event: Event): void {
        const query = (event.target as HTMLInputElement).value;
        this.lexSearchSubject.next(query);
    }

    performLexSearch(query: string, page: number): void {
        this.lexLoading = true;
        this.lexCurrentPage = page;

        this.legalDocumentService
            .searchLex(query, page)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.lexSearchResults = response.documents;
                    this.lexTotalPages = response.total_pages;
                    this.lexCurrentPage = response.current_page;
                },
                error: (err) => {
                    console.error('Lex search error:', err);
                    this.lexSearchResults = [];
                    this.lexTotalPages = 0;
                },
                complete: () => (this.lexLoading = false)
            });
    }

    onLexPageChange(event: PaginatorState): void {
        const newPage = (event.page ?? 0) + 1;
        if (this.lexSearchQuery.length >= 2) {
            this.performLexSearch(this.lexSearchQuery, newPage);
        }
    }

    clearLexSearch(): void {
        this.lexSearchQuery = '';
        this.lexSearchResults = [];
        this.lexTotalPages = 0;
        this.lexCurrentPage = 1;
    }

    getLexDocumentUrl(doc: LexSearchDocument): string {
        return LEX_UZ_BASE + doc.url;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
