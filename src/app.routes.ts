import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/component/app.layout';
import { Dashboard } from '@/pages/dashboard/dashboard';
import { Notfound } from '@/pages/notfound/notfound';

import { adminGuard, authGuard, raisGuard, scGuard } from '@/core/guards/auth.guard';
import { User } from '@/pages/users/user.component';
import { Role } from '@/pages/roles/roles';
import { CategoriesComponent } from '@/pages/categories/categories.component';
import { FilesComponent } from '@/pages/files/files.component';
import { DocumentViewerComponent } from '@/pages/document-viewer/document-viewer.component';
import { DischargeComponent } from '@/pages/situation-center/ges/discharge/discharge.component';
import { ShutdownComponent } from '@/pages/situation-center/ges/shutdown/shutdown.component';
import { PositionComponent } from '@/pages/hrm/position/position.component';
import { DepartmentComponent } from '@/pages/hrm/department/department.component';
import { EmployeeComponent } from '@/pages/hrm/employee/employee.component';
import { EventsComponent } from '@/pages/planning/events/events.component';
import { ConstructionComponent } from '@/pages/situation-center/construction/construction.component';
import { ReceptionComponent } from '@/pages/planning/reception/reception.component';

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
            { path: 'positions', component: PositionComponent, canActivate: [adminGuard] },
            { path: 'departments', component: DepartmentComponent, canActivate: [adminGuard] },
            { path: 'employees', component: EmployeeComponent, canActivate: [adminGuard] },
            { path: 'viewer', component: DocumentViewerComponent, canActivate: [raisGuard] },
            { path: 'discharge', component: DischargeComponent, canActivate: [raisGuard] },
            { path: 'shutdowns', component: ShutdownComponent, canActivate: [raisGuard] },
            { path: 'construction', component: ConstructionComponent, canActivate: [raisGuard] },
            { path: 'planning/events', component: EventsComponent, canActivate: [raisGuard] },
            { path: 'planning/reception', component: ReceptionComponent, canActivate: [raisGuard] },
            { path: 'shutdowns', component: ShutdownComponent, canActivate: [raisGuard] }
        ]
    },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
