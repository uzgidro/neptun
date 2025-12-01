import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

export interface ExistingFile {
    id: number;
    file_name: string;
    size_bytes: number;
    file_path?: string;
}

@Component({
    selector: 'app-file-list',
    standalone: true,
    imports: [CommonModule, Button, TooltipModule],
    templateUrl: './file-list.component.html',
    styleUrl: './file-list.component.scss'
})
export class FileListComponent {
    @Input() label: string = 'Существующие файлы';
    @Input() files: ExistingFile[] = [];
    @Input() showRemoveButton: boolean = true;

    @Output() removeFile = new EventEmitter<number>();

    onRemoveFile(fileId: number) {
        this.removeFile.emit(fileId);
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
