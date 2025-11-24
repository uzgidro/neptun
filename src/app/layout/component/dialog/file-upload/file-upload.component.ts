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

    @Output() filesSelected = new EventEmitter<File[]>();
    @Output() fileRemoved = new EventEmitter<number>();

    onFileSelect(event: any) {
        const files = Array.from(event.files || event.currentFiles || []) as File[];
        this.filesSelected.emit(files);
    }

    removeFile(index: number) {
        this.fileRemoved.emit(index);
    }

    formatFileSize(bytes: number): string {
        return (bytes / 1024 / 1024).toFixed(2);
    }
}
