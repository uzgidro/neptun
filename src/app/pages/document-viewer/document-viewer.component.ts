import { Component } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { FileUpload, FileUploadEvent } from 'primeng/fileupload';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
    selector: 'app-document-viewer',
    standalone: true,
    imports: [Tab, TabList, Tabs, FileUpload, PdfViewerModule],
    templateUrl: './document-viewer.component.html',
    styleUrls: ['./document-viewer.component.scss']
})
class DocumentViewerComponent {
    pdfSrc = 'assets/example.pdf';
    onUpload($event: FileUploadEvent) {
        // обработка загрузки
    }
}

export default DocumentViewerComponent;
