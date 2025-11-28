import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUpload } from 'primeng/fileupload';
import { Button } from 'primeng/button';

@Component({
    selector: 'app-file-upload',
    standalone: true,
    imports: [CommonModule, FileUpload, Button],
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

    @Output() filesSelected = new EventEmitter<File[]>();
    @Output() filesChange = new EventEmitter<File[]>();
    @Output() fileRemoved = new EventEmitter<number>();
    @Output() removeFile = new EventEmitter<number>();

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
}
