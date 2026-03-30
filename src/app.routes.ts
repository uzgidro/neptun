import { Routes } from '@angular/router';
import { AppLayout } from '@/layout/component/app.layout';
import { Dashboard } from '@/pages/dashboard/dashboard';
import { Notfound } from '@/pages/notfound/notfound';
import { ScDashboardComponent } from '@/pages/situation-center/sc-dashboard/sc-dashboard.component';

import { adminGuard, authGuard, filtrationGuard, hrmGuard, positionsGuard, raisGuard, scGuard, unsavedChangesGuard } from '@/core/guards/auth.guard';


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
            { path: 'monitoring', component: Dashboard },
            { path: 'users', loadComponent: () => import('./app/pages/hrm/users/user.component').then(m => m.User), canActivate: [adminGuard] },
            { path: 'roles', loadComponent: () => import('./app/pages/hrm/roles/roles').then(m => m.Role), canActivate: [adminGuard] },
            { path: 'categories', loadComponent: () => import('./app/pages/categories/categories.component').then(m => m.CategoriesComponent), canActivate: [scGuard] },
            { path: 'files', loadComponent: () => import('./app/pages/files/files.component').then(m => m.FilesComponent), canActivate: [scGuard] },
            { path: 'positions', loadComponent: () => import('./app/pages/hrm/position/position.component').then(m => m.PositionComponent), canActivate: [positionsGuard] },
            { path: 'departments', loadComponent: () => import('./app/pages/hrm/department/department.component').then(m => m.DepartmentComponent), canActivate: [adminGuard] },
            { path: 'organizations', loadComponent: () => import('./app/pages/hrm/organizations/organization.component').then(m => m.OrganizationComponent), canActivate: [adminGuard] },
            { path: 'organization-types', loadComponent: () => import('./app/pages/hrm/organization-types/organization-type.component').then(m => m.OrganizationTypeComponent), canActivate: [adminGuard] },
            { path: 'employees', loadComponent: () => import('./app/pages/hrm/employee/employee.component').then(m => m.EmployeeComponent), canActivate: [adminGuard] },
            { path: 'hrm/dashboard', loadComponent: () => import('./app/pages/hrm/dashboard/dashboard.component').then(m => m.HRMDashboardComponent), canActivate: [hrmGuard] },
            { path: 'hrm/my-cabinet', loadComponent: () => import('./app/pages/hrm/employee-cabinet/employee-cabinet.component').then(m => m.EmployeeCabinetComponent), canActivate: [authGuard] },
            { path: 'hrm/personnel-records', loadComponent: () => import('./app/pages/hrm/personnel-records/personnel-records.component').then(m => m.PersonnelRecordsComponent), canActivate: [hrmGuard] },
            { path: 'hrm/vacations', loadComponent: () => import('./app/pages/hrm/vacation-management/vacation-management.component').then(m => m.VacationManagementComponent), canActivate: [hrmGuard] },
            { path: 'hrm/salary', loadComponent: () => import('./app/pages/hrm/salary-management/salary-management.component').then(m => m.SalaryManagementComponent), canActivate: [hrmGuard] },
            { path: 'hrm/recruiting', loadComponent: () => import('./app/pages/hrm/recruiting/recruiting.component').then(m => m.RecruitingComponent), canActivate: [hrmGuard] },
            { path: 'hrm/training', loadComponent: () => import('./app/pages/hrm/training/training.component').then(m => m.TrainingComponent), canActivate: [hrmGuard] },
            { path: 'hrm/competency', loadComponent: () => import('./app/pages/hrm/competency-assessment/competency-assessment.component').then(m => m.CompetencyAssessmentComponent), canActivate: [hrmGuard] },
            { path: 'hrm/performance', loadComponent: () => import('./app/pages/hrm/performance-management/performance-management.component').then(m => m.PerformanceManagementComponent), canActivate: [hrmGuard] },
            { path: 'hrm/analytics', loadComponent: () => import('./app/pages/hrm/analytics/analytics.component').then(m => m.AnalyticsComponent), canActivate: [hrmGuard] },
            { path: 'hrm/timesheet', loadComponent: () => import('./app/pages/hrm/timesheet/timesheet.component').then(m => m.TimesheetComponent), canActivate: [hrmGuard] },
            { path: 'hrm/documents', loadComponent: () => import('./app/pages/hrm/hr-documents/hr-documents.component').then(m => m.HRDocumentsComponent), canActivate: [hrmGuard] },
            { path: 'hrm/access-control', loadComponent: () => import('./app/pages/hrm/access-control/access-control.component').then(m => m.AccessControlComponent), canActivate: [hrmGuard] },
            { path: 'hrm/org-structure', loadComponent: () => import('./app/pages/hrm/org-structure/org-structure.component').then(m => m.OrgStructureComponent), canActivate: [hrmGuard] },
            { path: 'viewer', loadComponent: () => import('./app/pages/document-viewer/document-viewer.component').then(m => m.DocumentViewerComponent), canActivate: [raisGuard] },
            { path: 'discharges', loadComponent: () => import('./app/pages/situation-center/ges/discharges/discharges.component').then(m => m.DischargesComponent), canActivate: [raisGuard] },
            { path: 'shutdowns', loadComponent: () => import('./app/pages/situation-center/ges/shutdown/shutdown.component').then(m => m.ShutdownComponent), canActivate: [raisGuard] },
            { path: 'ges-daily-report', loadComponent: () => import('./app/pages/situation-center/ges/daily-report/daily-report.component').then(m => m.DailyReportComponent), canActivate: [raisGuard], canDeactivate: [unsavedChangesGuard] },
            { path: 'construction', loadComponent: () => import('./app/pages/situation-center/construction/construction.component').then(m => m.ConstructionComponent), canActivate: [raisGuard] },
            { path: 'planning/events', loadComponent: () => import('./app/pages/planning/events/events.component').then(m => m.EventsComponent), canActivate: [raisGuard] },
            { path: 'planning/reception', loadComponent: () => import('./app/pages/planning/reception/reception.component').then(m => m.ReceptionComponent), canActivate: [raisGuard] },
            { path: 'reservoir-summary', loadComponent: () => import('./app/pages/situation-center/reservoirs-info/reservoirs-summary/reservoirs-summary.component').then(m => m.ReservoirsSummaryComponent), canActivate: [raisGuard] },
            { path: 'financial-dashboard', loadComponent: () => import('./app/pages/financial-block/dashboard/financial-dashboard.component').then(m => m.FinancialDashboardComponent), canActivate: [raisGuard] },
            { path: 'invest-perspective', loadComponent: () => import('./app/pages/invest/invest-perspective-projects/invest-perspective-projects.component').then(m => m.InvestPerspectiveProjectsComponent), canActivate: [raisGuard] },
            { path: 'invest-active', loadComponent: () => import('./app/pages/invest/invest-active-projects/invest-active-projects.component').then(m => m.InvestActiveProjectsComponent), canActivate: [raisGuard] },
            { path: 'debit-credit', loadComponent: () => import('./app/pages/financial-block/debit-credit/debit-credit.component').then(m => m.DebitCreditComponent), canActivate: [raisGuard] },
            { path: 'repair-costs', loadComponent: () => import('./app/pages/financial-block/repair-costs/repair-costs.component').then(m => m.RepairCostsComponent), canActivate: [raisGuard] },
            { path: 'procurement', loadComponent: () => import('./app/pages/financial-block/procurement/procurement.component').then(m => m.ProcurementComponent), canActivate: [raisGuard] },
            { path: 'kpi', loadComponent: () => import('./app/pages/financial-block/kpi/kpi.component').then(m => m.KpiComponent), canActivate: [raisGuard] },
            { path: 'salary', loadComponent: () => import('./app/pages/financial-block/salary/salary.component').then(m => m.SalaryComponent), canActivate: [raisGuard] },
            { path: 'reservoir-summary/pdf', loadComponent: () => import('./app/pages/situation-center/reservoirs-info/reservoir-summaty-pdf/reservoir-summary-pdf.component').then(m => m.ReservoirSummaryPdfComponent), canActivate: [raisGuard] },
            { path: 'reservoir-summary-hourly', loadComponent: () => import('./app/pages/situation-center/reservoirs-info/reservoir-summary-hourly/reservoir-summary-hourly.component').then(m => m.ReservoirSummaryHourlyComponent), canActivate: [raisGuard] },
            { path: 'visits', loadComponent: () => import('./app/pages/situation-center/other/visits/visits.component').then(m => m.VisitsComponent), canActivate: [raisGuard] },
            { path: 'incidents', loadComponent: () => import('./app/pages/situation-center/other/incidents/incidents.component').then(m => m.IncidentsComponent), canActivate: [raisGuard] },
            { path: 'reservoir-device', loadComponent: () => import('./app/pages/situation-center/reservoirs-info/reservoirs-device/reservoirs-device.component').then(m => m.ReservoirsDeviceComponent), canActivate: [raisGuard] },
            { path: 'snow-cover', loadComponent: () => import('./app/pages/situation-center/reservoirs-info/snow-cover/snow-cover.component').then(m => m.SnowCoverComponent), canActivate: [raisGuard] },
            { path: 'filtration-settings', loadComponent: () => import('./app/pages/situation-center/reservoirs-info/filtration-settings/filtration-settings.component').then(m => m.FiltrationSettingsComponent), canActivate: [scGuard] },
            { path: 'filtration-comparison', loadComponent: () => import('./app/pages/situation-center/reservoirs-info/filtration-comparison/filtration-comparison.component').then(m => m.FiltrationComparisonComponent), canActivate: [filtrationGuard], canDeactivate: [unsavedChangesGuard] },
            { path: 'manual-comparison-entry', loadComponent: () => import('./app/pages/situation-center/reservoirs-info/manual-comparison-entry/manual-comparison-entry.component').then(m => m.ManualComparisonEntryComponent), canActivate: [filtrationGuard], canDeactivate: [unsavedChangesGuard] },
            { path: 'chancellery/pending-signatures', loadComponent: () => import('./app/pages/chancellery/pending-signatures/pending-signatures.component').then(m => m.PendingSignaturesComponent), canActivate: [raisGuard] },
            { path: 'chancellery/orders', loadComponent: () => import('./app/pages/chancellery/orders/orders.component').then(m => m.OrdersComponent), canActivate: [raisGuard] },
            { path: 'chancellery/reports', loadComponent: () => import('./app/pages/chancellery/reports/reports.component').then(m => m.ReportsComponent), canActivate: [raisGuard] },
            { path: 'chancellery/letters', loadComponent: () => import('./app/pages/chancellery/letters/letters.component').then(m => m.LettersComponent), canActivate: [raisGuard] },
            { path: 'chancellery/instructions', loadComponent: () => import('./app/pages/chancellery/instructions/instructions.component').then(m => m.InstructionsComponent), canActivate: [raisGuard] },
            { path: 'legal-documents', loadComponent: () => import('./app/pages/legal-documents/legal-documents.component').then(m => m.LegalDocumentsComponent), canActivate: [raisGuard] },
            { path: 'lex-search', loadComponent: () => import('./app/pages/lex-search/lex-search.component').then(m => m.LexSearchComponent), canActivate: [raisGuard] },
            { path: 'calls', loadComponent: () => import('./app/pages/calls/calls.component').then(m => m.CallsComponent), canActivate: [raisGuard] },
            { path: 'media/news', loadComponent: () => import('./app/pages/media/news/news.component').then(m => m.NewsComponent), canActivate: [raisGuard] },
            { path: 'uzgidro-news', loadComponent: () => import('./app/pages/uzgidro-news/uzgidro-news.component').then(m => m.UzgidroNewsComponent), canActivate: [raisGuard] },
            { path: 'ges/:id', loadComponent: () => import('./app/pages/situation-center/ges/ges-detail/ges-detail.component').then(m => m.GesDetailComponent), canActivate: [raisGuard] }
        ]
    },
    { path: 'dashboard', component: ScDashboardComponent, canActivate: [authGuard] },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
