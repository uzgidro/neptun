import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUpload } from 'primeng/fileupload';
import { Button } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-file-upload',
    standalone: true,
    imports: [CommonModule, FileUpload, Button, TooltipModule],
    templateUrl: './file-upload.component.html',
    styleUrl: './file-upload.component.scss'
})
export class FileUploadComponent {
    @Input() label: string = 'Файлы';
    @Input() multiple: boolean = true;
    @Input() maxFileSize: number = 1073741824; // 1GB default
    @Input() accept: string = ''; // e.g., "image/*,.pdf"
    @Input() showUploadButton: boolean = false;
    @Input() selectedFiles: File[] = [];
    @Input() files: File[] = [];
    @Input() enableClipboard: boolean = true; // Enable clipboard paste functionality

    @Output() filesSelected = new EventEmitter<File[]>();
    @Output() filesChange = new EventEmitter<File[]>();
    @Output() fileRemoved = new EventEmitter<number>();
    @Output() removeFile = new EventEmitter<number>();

    constructor(private messageService: MessageService) {}

    onFileSelect(event: any) {
        const newFiles = Array.from(event.files || event.currentFiles || []) as File[];
        const updatedFiles = [...this.files, ...newFiles];
        this.filesSelected.emit(updatedFiles);
        this.filesChange.emit(updatedFiles);
    }

    onRemoveFile(index: number) {
        this.fileRemoved.emit(index);
        this.removeFile.emit(index);
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    @HostListener('window:paste', ['$event'])
    onPaste(event: ClipboardEvent) {
        if (!this.enableClipboard) return;

        this.handleClipboardData(event.clipboardData);
    }

    async pasteFromClipboard() {
        if (!this.enableClipboard) return;

        try {
            const clipboardItems = await navigator.clipboard.read();
            let hasFiles = false;

            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    // Handle any file type
                    const blob = await clipboardItem.getType(type);
                    const extension = this.getExtensionFromMimeType(type);
                    const fileName = `clipboard-${Date.now()}${extension}`;
                    const file = new File([blob], fileName, { type });
                    this.addClipboardFile(file);
                    hasFiles = true;
                }
            }

            if (!hasFiles) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Буфер обмена пуст',
                    detail: 'В буфере обмена нет файлов'
                });
            }
        } catch (err) {
            this.messageService.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: 'Не удалось получить файл из буфера обмена'
            });
        }
    }

    private handleClipboardData(clipboardData: DataTransfer | null) {
        if (!clipboardData) return;

        const items = clipboardData.items;
        const files = clipboardData.files;

        // Try to get files from DataTransferItemList first
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    this.addClipboardFile(file);
                }
            }
        }

        // Fallback to FileList if no files found
        if (items.length === 0 && files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                this.addClipboardFile(files[i]);
            }
        }
    }

    private addClipboardFile(file: File) {
        // Check file size
        if (file.size > this.maxFileSize) {
            this.messageService.add({
                severity: 'error',
                summary: 'Файл слишком большой',
                detail: `Максимальный размер файла: ${this.formatFileSize(this.maxFileSize)}`
            });
            return;
        }

        const updatedFiles = [...this.files, file];
        this.filesSelected.emit(updatedFiles);
        this.filesChange.emit(updatedFiles);
    }

    private getExtensionFromMimeType(mimeType: string): string {
        const mimeToExt: { [key: string]: string } = {
            'image/png': '.png',
            'image/jpeg': '.jpg',
            'image/jpg': '.jpg',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'image/svg+xml': '.svg',
            'application/pdf': '.pdf',
            'application/msword': '.doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'application/vnd.ms-excel': '.xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
            'application/vnd.ms-powerpoint': '.ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
            'text/plain': '.txt',
            'text/csv': '.csv',
            'application/zip': '.zip',
            'application/x-rar-compressed': '.rar',
            'application/x-7z-compressed': '.7z',
            'video/mp4': '.mp4',
            'video/mpeg': '.mpeg',
            'audio/mpeg': '.mp3',
            'audio/wav': '.wav'
        };

        return mimeToExt[mimeType] || '.bin';
    }
}
