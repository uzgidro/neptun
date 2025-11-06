import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { ExcelComponent } from './excel/excel.component';
import { PlanningComponent } from './planning/planning.component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'excel', component: ExcelComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
