import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
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
export class FileUploadComponent implements OnChanges {
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

    @ViewChild(FileUpload) fileUploadComponent?: FileUpload;

    constructor(private messageService: MessageService) {}

    ngOnChanges(changes: SimpleChanges) {
        // Clear PrimeNG file upload component when files array is cleared
        if (changes['files'] && changes['files'].currentValue?.length === 0 && this.fileUploadComponent) {
            this.fileUploadComponent.clear();
        }
    }

    onFileSelect(event: any) {
        const newFiles = Array.from(event.files || event.currentFiles || []) as File[];
        const updatedFiles = [...this.files, ...newFiles];
        this.filesSelected.emit(updatedFiles);
        this.filesChange.emit(updatedFiles);
    }

    onRemoveWidget(event: any) {
        this.onRemoveFile(this.files.findIndex((value) => value == event.file));
    }

    onRemoveFile(index: number) {
        this.fileRemoved.emit(index);
        this.removeFile.emit(index);
    }

    onRemoveTemplatingFile(event: Event, file: any, removeFileCallback: Function, index: number) {
        removeFileCallback(event, index);
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

    isImageFile(file: File): boolean {
        return file.type.startsWith('image/');
    }

    getFileIcon(file: File): string {
        const fileName = file.name.toLowerCase();
        const fileType = file.type.toLowerCase();

        // Word documents
        if (fileType.includes('word') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
            return 'pi pi-file-word text-blue-500';
        }

        // Excel spreadsheets
        if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
            return 'pi pi-file-excel text-green-500';
        }

        // PDF files
        if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
            return 'pi pi-file-pdf text-red-500';
        }

        // Video files
        if (fileType.startsWith('video/') || fileName.match(/\.(mp4|avi|mov|wmv|flv|mkv)$/)) {
            return 'pi pi-video text-purple-500';
        }

        // Audio files
        if (fileType.startsWith('audio/') || fileName.match(/\.(mp3|wav|ogg|flac|aac)$/)) {
            return 'pi pi-volume-up text-orange-500';
        }

        // Archive files
        if (fileName.match(/\.(zip|rar|7z|tar|gz)$/)) {
            return 'pi pi-box text-yellow-600';
        }

        // Text files
        if (fileType.startsWith('text/') || fileName.endsWith('.txt')) {
            return 'pi pi-align-left text-gray-500';
        }

        // Default file icon
        return 'pi pi-file text-gray-400';
    }
}
