import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/component/app.layout';
import { Dashboard } from '@/pages/dashboard/dashboard';
import { Notfound } from '@/pages/notfound/notfound';

import { adminGuard, authGuard, raisGuard, scGuard } from '@/core/guards/auth.guard';
import { User } from '@/pages/hrm/users/user.component';
import { Role } from '@/pages/hrm/roles/roles';
import { CategoriesComponent } from '@/pages/categories/categories.component';
import { FilesComponent } from '@/pages/files/files.component';
import { DocumentViewerComponent } from '@/pages/document-viewer/document-viewer.component';
import { DischargeComponent } from '@/pages/situation-center/ges/discharge/discharge.component';
import { ShutdownComponent } from '@/pages/situation-center/ges/shutdown/shutdown.component';
import { PositionComponent } from '@/pages/hrm/position/position.component';
import { DepartmentComponent } from '@/pages/hrm/department/department.component';
import { EmployeeComponent } from '@/pages/hrm/employee/employee.component';
import { OrganizationComponent } from '@/pages/hrm/organization/organization.component';
import { BirthdaysComponent } from '@/pages/hrm/birthdays/birthdays.component';
import { PersonnelLossComponent } from '@/pages/hrm/personnel-loss/personnel-loss.component';
import { EventsComponent } from '@/pages/planning/events/events.component';
import { ConstructionComponent } from '@/pages/situation-center/construction/construction.component';
import { ReceptionComponent } from '@/pages/planning/reception/reception.component';
import { ReservoirsSummaryComponent } from '@/pages/situation-center/reservoirs-info/reservoirs-summary/reservoirs-summary.component';
import { InvestmentComponent } from '@/pages/financial-block/investment/investment.component';
import { DebitCreditComponent } from '@/pages/financial-block/debit-credit/debit-credit.component';
import { RepairCostsComponent } from '@/pages/financial-block/repair-costs/repair-costs.component';
import { ProcurementComponent } from '@/pages/financial-block/procurement/procurement.component';
import { KpiComponent } from '@/pages/financial-block/kpi/kpi.component';
import { SalaryComponent } from '@/pages/financial-block/salary/salary.component';
import { FinancialDashboardComponent } from '@/pages/financial-block/dashboard/financial-dashboard.component';


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
            { path: 'organizations', component: OrganizationComponent, canActivate: [raisGuard] },
            { path: 'birthdays', component: BirthdaysComponent, canActivate: [raisGuard] },
            { path: 'personnel-loss', component: PersonnelLossComponent, canActivate: [raisGuard] },
            { path: 'viewer', component: DocumentViewerComponent, canActivate: [raisGuard] },
            { path: 'discharge', component: DischargeComponent, canActivate: [raisGuard] },
            { path: 'shutdowns', component: ShutdownComponent, canActivate: [raisGuard] },
            { path: 'construction', component: ConstructionComponent, canActivate: [raisGuard] },
            { path: 'planning/events', component: EventsComponent, canActivate: [raisGuard] },
            { path: 'planning/reception', component: ReceptionComponent, canActivate: [raisGuard] },
            { path: 'reservoir-summary', component: ReservoirsSummaryComponent, canActivate: [raisGuard] },
            { path: 'shutdowns', component: ShutdownComponent, canActivate: [raisGuard] },
            { path: 'financial-dashboard', component: FinancialDashboardComponent, canActivate: [raisGuard] },
            { path: 'investment', component: InvestmentComponent, canActivate: [raisGuard] },
            { path: 'debit-credit', component: DebitCreditComponent, canActivate: [raisGuard] },
            { path: 'repair-costs', component: RepairCostsComponent, canActivate: [raisGuard] },
            { path: 'procurement', component: ProcurementComponent, canActivate: [raisGuard] },
            { path: 'kpi', component: KpiComponent, canActivate: [raisGuard] },
            { path: 'salary', component: SalaryComponent, canActivate: [raisGuard] },
        ]
    },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' },
];
