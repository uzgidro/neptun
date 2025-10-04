import { Component } from '@angular/core';
import { Tab, TabList, Tabs } from 'primeng/tabs';

@Component({
  selector: 'app-document-viewer',
  imports: [
      Tab,
      TabList,
      Tabs
  ],
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.scss'
})
export class DocumentViewerComponent {

}
