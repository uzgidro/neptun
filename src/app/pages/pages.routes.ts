import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import DocumentViewerComponent from '@/pages/document-viewer/document-viewer.component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'production', component: DocumentViewerComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
