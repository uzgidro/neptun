import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { DocumentLink, LinkedDocumentType } from '@/core/interfaces/chancellery/document-base';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { inject } from '@angular/core';

@Component({
    selector: 'app-linked-documents',
    standalone: true,
    imports: [
        CommonModule,
        ButtonDirective,
        Tag,
        Tooltip,
        TranslateModule
    ],
    template: `
        <div class="flex flex-col gap-3">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <h4 class="font-medium m-0">
                    {{ 'CHANCELLERY.LINKED_DOCS.TITLE' | translate }}
                    @if (documents.length > 0) {
                        <span class="text-gray-500">({{ documents.length }})</span>
                    }
                </h4>
                @if (!readonly) {
                    <button
                        pButton
                        type="button"
                        icon="pi pi-plus"
                        [pTooltip]="'CHANCELLERY.LINKED_DOCS.ADD' | translate"
                        severity="secondary"
                        [text]="true"
                        [rounded]="true"
                        (click)="onAdd()">
                    </button>
                }
            </div>

            <!-- Documents List -->
            @if (documents.length === 0) {
                <div class="text-gray-500 text-sm py-2">
                    {{ 'CHANCELLERY.LINKED_DOCS.NO_DOCUMENTS' | translate }}
                </div>
            } @else {
                <div class="flex flex-col gap-2">
                    @for (doc of documents; track doc.id) {
                        <div class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                            <!-- Document Type Badge -->
                            <p-tag
                                [value]="getTypeLabel(doc.document_type)"
                                [severity]="getTypeSeverity(doc.document_type)"
                                [rounded]="true"
                                size="small" />

                            <!-- Document Info -->
                            <div class="flex-1 min-w-0">
                                <div class="font-medium truncate" [pTooltip]="doc.document_name">
                                    {{ doc.document_name }}
                                </div>
                                @if (doc.document_number) {
                                    <div class="text-xs text-gray-500">
                                        № {{ doc.document_number }}
                                    </div>
                                }
                                @if (doc.link_description) {
                                    <div class="text-xs text-gray-400 italic truncate">
                                        {{ doc.link_description }}
                                    </div>
                                }
                            </div>

                            <!-- Actions -->
                            @if (!readonly) {
                                <button
                                    pButton
                                    type="button"
                                    icon="pi pi-times"
                                    [pTooltip]="'COMMON.REMOVE' | translate"
                                    severity="danger"
                                    [text]="true"
                                    [rounded]="true"
                                    size="small"
                                    (click)="onRemove(doc)">
                                </button>
                            }
                        </div>
                    }
                </div>
            }
        </div>
    `
})
export class LinkedDocumentsComponent {
    @Input() documents: DocumentLink[] = [];
    @Input() readonly = false;

    @Output() add = new EventEmitter<void>();
    @Output() remove = new EventEmitter<DocumentLink>();
    @Output() view = new EventEmitter<DocumentLink>();

    private translate = inject(TranslateService);

    onAdd(): void {
        this.add.emit();
    }

    onRemove(doc: DocumentLink): void {
        this.remove.emit(doc);
    }

    onView(doc: DocumentLink): void {
        this.view.emit(doc);
    }

    getTypeLabel(type: LinkedDocumentType): string {
        const labels: Record<LinkedDocumentType, string> = {
            decree: this.translate.instant('CHANCELLERY.TYPES.DECREE'),
            report: this.translate.instant('CHANCELLERY.TYPES.REPORT'),
            letter: this.translate.instant('CHANCELLERY.TYPES.LETTER'),
            instruction: this.translate.instant('CHANCELLERY.TYPES.INSTRUCTION'),
            legal_document: this.translate.instant('CHANCELLERY.TYPES.LEGAL_DOCUMENT')
        };
        return labels[type] || type;
    }

    getTypeSeverity(type: LinkedDocumentType): 'info' | 'success' | 'warn' | 'danger' | 'secondary' {
        const severities: Record<LinkedDocumentType, 'info' | 'success' | 'warn' | 'danger' | 'secondary'> = {
            decree: 'info',
            report: 'success',
            letter: 'warn',
            instruction: 'secondary',
            legal_document: 'danger'
        };
        return severities[type] || 'secondary';
    }
}
