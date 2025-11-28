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
            for (const clipboardItem of clipboardItems) {
                for (const type of clipboardItem.types) {
                    if (type.startsWith('image/')) {
                        const blob = await clipboardItem.getType(type);
                        const file = new File([blob], `clipboard-${Date.now()}.png`, { type });
                        this.addClipboardFile(file);
                    }
                }
            }
        } catch (err) {
            this.messageService.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: 'Не удалось получить изображение из буфера обмена'
            });
        }
    }

    private handleClipboardData(clipboardData: DataTransfer | null) {
        if (!clipboardData) return;

        const items = clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    this.addClipboardFile(file);
                }
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

        this.messageService.add({
            severity: 'success',
            summary: 'Изображение добавлено',
            detail: `${file.name} (${this.formatFileSize(file.size)})`
        });
    }
}
