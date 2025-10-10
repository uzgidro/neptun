import { Component } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
    selector: 'app-document-viewer',
    standalone: true,
    imports: [Tab, TabList, Tabs, PdfViewerModule],
    templateUrl: './document-viewer.component.html',
    styleUrls: ['./document-viewer.component.scss']
})
class DocumentViewerComponent {
    activeIndex = 0;

    // Массив с путями к PDF для каждой вкладки
    // ЗАМЕНИТЕ ЭТИ URL НА ВАШИ РЕАЛЬНЫЕ ССЫЛКИ
    pdfSources: string[] = [
        'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf', // 0: Норин
        'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf', // 1: Чаткал (замените на другой)
        'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf', // 2: ЮФК (замените на другой)
        'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf' // 3: Оксув (замените на другой)
    ];

    // Это свойство будет автоматически возвращать нужный URL
    get currentPdfSrc(): string {
        return this.pdfSources[this.activeIndex];
    }
}

export default DocumentViewerComponent;
