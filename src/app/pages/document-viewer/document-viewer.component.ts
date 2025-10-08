import { Component } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { FileUpload, FileUploadEvent } from 'primeng/fileupload';

@Component({
    selector: 'app-document-viewer',
    standalone: true,
    imports: [Tab, TabList, Tabs, FileUpload],
    templateUrl: './document-viewer.component.html',
    styleUrls: ['./document-viewer.component.scss'] // ✅ здесь исправлено
})
class DocumentViewerComponent {
    onUpload($event: FileUploadEvent) {
        // обработка загрузки
    }
}

export default DocumentViewerComponent;
