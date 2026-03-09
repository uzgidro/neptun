import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/component/app.layout';
import { Dashboard } from '@/pages/dashboard/dashboard';
import { authGuard, adminGuard, positionsGuard, raisGuard, scGuard } from '@/core/guards/auth.guard';

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
            // Dashboard — eagerly loaded (entry point)
            { path: 'dashboard', component: Dashboard },

            // HRM
            { path: 'hrm', loadChildren: () => import('./app/pages/hrm/hrm.routes'), canActivate: [adminGuard] },
            { path: 'users', loadComponent: () => import('@/pages/hrm/users/user.component').then(m => m.User), canActivate: [adminGuard] },
            { path: 'roles', loadComponent: () => import('@/pages/hrm/roles/roles').then(m => m.Role), canActivate: [adminGuard] },
            { path: 'positions', loadComponent: () => import('@/pages/hrm/position/position.component').then(m => m.PositionComponent), canActivate: [positionsGuard] },
            { path: 'departments', loadComponent: () => import('@/pages/hrm/department/department.component').then(m => m.DepartmentComponent), canActivate: [adminGuard] },
            { path: 'employees', loadComponent: () => import('@/pages/hrm/employee/employee.component').then(m => m.EmployeeComponent), canActivate: [adminGuard] },

            // Situation center
            { path: 'categories', loadComponent: () => import('@/pages/categories/categories.component').then(m => m.CategoriesComponent), canActivate: [scGuard] },
            { path: 'files', loadComponent: () => import('@/pages/files/files.component').then(m => m.FilesComponent), canActivate: [scGuard] },
            { path: 'viewer', loadComponent: () => import('@/pages/document-viewer/document-viewer.component').then(m => m.DocumentViewerComponent), canActivate: [raisGuard] },
            { path: 'discharges', loadComponent: () => import('@/pages/situation-center/ges/discharges/discharges.component').then(m => m.DischargesComponent), canActivate: [raisGuard] },
            { path: 'shutdowns', loadComponent: () => import('@/pages/situation-center/ges/shutdown/shutdown.component').then(m => m.ShutdownComponent), canActivate: [raisGuard] },
            { path: 'construction', loadComponent: () => import('@/pages/situation-center/construction/construction.component').then(m => m.ConstructionComponent), canActivate: [raisGuard] },
            { path: 'reservoir-summary', loadComponent: () => import('@/pages/situation-center/reservoirs-info/reservoirs-summary/reservoirs-summary.component').then(m => m.ReservoirsSummaryComponent), canActivate: [raisGuard] },
            { path: 'reservoir-summary/pdf', loadComponent: () => import('@/pages/situation-center/reservoirs-info/reservoir-summaty-pdf/reservoir-summary-pdf.component').then(m => m.ReservoirSummaryPdfComponent), canActivate: [raisGuard] },
            { path: 'reservoir-summary-hourly', loadComponent: () => import('@/pages/situation-center/reservoirs-info/reservoir-summary-hourly/reservoir-summary-hourly.component').then(m => m.ReservoirSummaryHourlyComponent), canActivate: [raisGuard] },
            { path: 'reservoir-device', loadComponent: () => import('@/pages/situation-center/reservoirs-info/reservoirs-device/reservoirs-device.component').then(m => m.ReservoirsDeviceComponent), canActivate: [raisGuard] },
            { path: 'snow-cover', loadComponent: () => import('@/pages/situation-center/reservoirs-info/snow-cover/snow-cover.component').then(m => m.SnowCoverComponent), canActivate: [raisGuard] },
            { path: 'visits', loadComponent: () => import('@/pages/situation-center/other/visits/visits.component').then(m => m.VisitsComponent), canActivate: [raisGuard] },
            { path: 'incidents', loadComponent: () => import('@/pages/situation-center/other/incidents/incidents.component').then(m => m.IncidentsComponent), canActivate: [raisGuard] },
            { path: 'ges/:id', loadComponent: () => import('@/pages/situation-center/ges/ges-detail/ges-detail.component').then(m => m.GesDetailComponent), canActivate: [raisGuard] },

            // Planning
            { path: 'planning/events', loadComponent: () => import('@/pages/planning/events/events.component').then(m => m.EventsComponent), canActivate: [raisGuard] },
            { path: 'planning/reception', loadComponent: () => import('@/pages/planning/reception/reception.component').then(m => m.ReceptionComponent), canActivate: [raisGuard] },

            // Financial block
            { path: 'financial-dashboard', loadComponent: () => import('@/pages/financial-block/dashboard/financial-dashboard.component').then(m => m.FinancialDashboardComponent), canActivate: [raisGuard] },
            { path: 'debit-credit', loadComponent: () => import('@/pages/financial-block/debit-credit/debit-credit.component').then(m => m.DebitCreditComponent), canActivate: [raisGuard] },
            { path: 'repair-costs', loadComponent: () => import('@/pages/financial-block/repair-costs/repair-costs.component').then(m => m.RepairCostsComponent), canActivate: [raisGuard] },
            { path: 'procurement', loadComponent: () => import('@/pages/financial-block/procurement/procurement.component').then(m => m.ProcurementComponent), canActivate: [raisGuard] },
            { path: 'kpi', loadComponent: () => import('@/pages/financial-block/kpi/kpi.component').then(m => m.KpiComponent), canActivate: [raisGuard] },
            { path: 'salary', loadComponent: () => import('@/pages/financial-block/salary/salary.component').then(m => m.SalaryComponent), canActivate: [raisGuard] },

            // Invest
            { path: 'invest-perspective', loadComponent: () => import('@/pages/invest/invest-perspective-projects/invest-perspective-projects.component').then(m => m.InvestPerspectiveProjectsComponent), canActivate: [raisGuard] },
            { path: 'invest-active', loadComponent: () => import('@/pages/invest/invest-active-projects/invest-active-projects.component').then(m => m.InvestActiveProjectsComponent), canActivate: [raisGuard] },

            // Chancellery
            { path: 'chancellery/pending-signatures', loadComponent: () => import('@/pages/chancellery/pending-signatures/pending-signatures.component').then(m => m.PendingSignaturesComponent), canActivate: [raisGuard] },
            { path: 'chancellery/orders', loadComponent: () => import('@/pages/chancellery/orders/orders.component').then(m => m.OrdersComponent), canActivate: [raisGuard] },
            { path: 'chancellery/reports', loadComponent: () => import('@/pages/chancellery/reports/reports.component').then(m => m.ReportsComponent), canActivate: [raisGuard] },
            { path: 'chancellery/letters', loadComponent: () => import('@/pages/chancellery/letters/letters.component').then(m => m.LettersComponent), canActivate: [raisGuard] },
            { path: 'chancellery/instructions', loadComponent: () => import('@/pages/chancellery/instructions/instructions.component').then(m => m.InstructionsComponent), canActivate: [raisGuard] },

            // Legal
            { path: 'legal-documents', loadComponent: () => import('@/pages/legal-documents/legal-documents.component').then(m => m.LegalDocumentsComponent), canActivate: [raisGuard] },
            { path: 'lex-search', loadComponent: () => import('@/pages/lex-search/lex-search.component').then(m => m.LexSearchComponent), canActivate: [raisGuard] },

            // Other
            { path: 'calls', loadComponent: () => import('@/pages/calls/calls.component').then(m => m.CallsComponent), canActivate: [raisGuard] },
            { path: 'media/news', loadComponent: () => import('@/pages/media/news/news.component').then(m => m.NewsComponent), canActivate: [raisGuard] },
            { path: 'company-news', loadComponent: () => import('@/pages/company-news/company-news.component').then(m => m.CompanyNewsComponent), canActivate: [raisGuard] },
        ]
    },
    { path: 'notfound', loadComponent: () => import('./app/pages/notfound/notfound').then(m => m.Notfound) },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
