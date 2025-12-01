import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-file-viewer',
    standalone: true,
    imports: [CommonModule, DialogModule, ButtonModule],
    templateUrl: './file-viewer.component.html',
    styles: [
        `
            .file-list {
                padding: 0.5rem 0;
            }
            .file-item-link {
                text-decoration: none;
                color: inherit;
                display: block;
            }
            .file-item-link:hover {
                text-decoration: none;
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
        // Use url if available, otherwise construct from object_key or id
        if (file.url) return file.url;
        if (file.object_key) return `${window.location.origin}/api/files/${file.object_key}`;
        return `/api/files/${file.id}`;
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    isImageFile(fileName: string): boolean {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
        const lowerFileName = fileName.toLowerCase();
        return imageExtensions.some((ext) => lowerFileName.endsWith(ext));
    }

    isVideoFile(fileName: string): boolean {
        const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.mpeg', '.mpg'];
        const lowerFileName = fileName.toLowerCase();
        return videoExtensions.some((ext) => lowerFileName.endsWith(ext));
    }

    getFileIcon(fileName: string): string {
        const lowerFileName = fileName.toLowerCase();

        // Word documents
        if (lowerFileName.endsWith('.doc') || lowerFileName.endsWith('.docx')) {
            return 'pi pi-file-word text-blue-500';
        }

        // Excel spreadsheets
        if (lowerFileName.endsWith('.xls') || lowerFileName.endsWith('.xlsx')) {
            return 'pi pi-file-excel text-green-500';
        }

        // PDF files
        if (lowerFileName.endsWith('.pdf')) {
            return 'pi pi-file-pdf text-red-500';
        }

        // Video files
        if (lowerFileName.match(/\.(mp4|avi|mov|wmv|flv|mkv)$/)) {
            return 'pi pi-video text-purple-500';
        }

        // Audio files
        if (lowerFileName.match(/\.(mp3|wav|ogg|flac|aac)$/)) {
            return 'pi pi-volume-up text-orange-500';
        }

        // Archive files
        if (lowerFileName.match(/\.(zip|rar|7z|tar|gz)$/)) {
            return 'pi pi-box text-yellow-600';
        }

        // Text files
        if (lowerFileName.endsWith('.txt')) {
            return 'pi pi-align-left text-gray-500';
        }

        // Default file icon
        return 'pi pi-file text-gray-400';
    }
}
