import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-file-viewer',
    standalone: true,
    imports: [CommonModule, DialogModule, ButtonModule],
    template: `
        <p-dialog [(visible)]="visible" [header]="header" [modal]="true" [style]="{ width: '40vw' }" [breakpoints]="{ '960px': '75vw' }" (onHide)="visibleChange.emit(false)">
            <div class="file-list">
                @if (files && files.length > 0) {
                    <ul>
                        @for (file of files; track file.id) {
                            <li class="file-item">
                                <i class="pi pi-file"></i>
                                <a [href]="getFileUrl(file)" target="_blank" rel="noopener noreferrer">
                                    {{ file.filename }}
                                </a>
                                <span class="file-size">({{ formatFileSize(file.size) }})</span>
                            </li>
                        }
                    </ul>
                }
                @if (!files || files.length === 0) {
                    <p class="no-files">Нет прикрепленных файлов</p>
                }
            </div>
        </p-dialog>
    `,
    styles: [
        `
            .file-list {
                padding: 1rem 0;
            }
            .file-list ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            .file-item {
                padding: 0.5rem;
                margin-bottom: 0.5rem;
                border-radius: 4px;
                background: var(--surface-50);
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .file-item i {
                color: var(--primary-color);
                font-size: 1.2rem;
            }
            .file-item a {
                flex: 1;
                color: var(--primary-color);
                text-decoration: none;
                word-break: break-all;
            }
            .file-item a:hover {
                text-decoration: underline;
            }
            .file-size {
                color: var(--text-color-secondary);
                font-size: 0.875rem;
                white-space: nowrap;
            }
            .no-files {
                text-align: center;
                color: var(--text-color-secondary);
                padding: 2rem;
            }
        `
    ]
})
export class FileViewerComponent {
    @Input() visible: boolean = false;
    @Input() header: string = 'Файлы';
    @Input() files: any[] = [];
    @Output() visibleChange = new EventEmitter<boolean>();

    getFileUrl(file: any): string {
        // Use url if available, otherwise construct from id
        return file.url || `/api/files/${file.id}`;
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
}
