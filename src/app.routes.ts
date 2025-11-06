import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/component/app.layout';
import { Dashboard } from '@/pages/dashboard/dashboard';
import { Documentation } from '@/pages/documentation/documentation';
import { Landing } from '@/pages/landing/landing';
import { Notfound } from '@/pages/notfound/notfound';

import { adminGuard, authGuard, raisGuard, scGuard } from '@/core/guards/auth.guard';
import { User } from '@/pages/users/user.component';
import { Role } from '@/pages/roles/roles';
import { CategoriesComponent } from '@/pages/categories/categories.component';
import { FilesComponent } from '@/pages/files/files.component';
import { DocumentViewerComponent } from '@/pages/document-viewer/document-viewer.component';
import { DischargeComponent } from '@/pages/situation-center/ges/discharge/discharge.component';
import { PlanningComponent } from '@/pages/planning/planning.component';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'users', component: User, canActivate: [adminGuard] },
            { path: 'roles', component: Role, canActivate: [adminGuard] },
            { path: 'categories', component: CategoriesComponent, canActivate: [scGuard] },
            { path: 'files', component: FilesComponent, canActivate: [scGuard] },
            { path: 'viewer', component: DocumentViewerComponent, canActivate: [raisGuard] },
            { path: 'discharge', component: DischargeComponent, canActivate: [raisGuard] },
            { path: 'planning', component: PlanningComponent, canActivate: [raisGuard] },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
