import { Routes } from '@angular/router';

const routes: Routes = [
    { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.HRMDashboardComponent) },
    { path: 'my-cabinet', loadComponent: () => import('./employee-cabinet/employee-cabinet.component').then(m => m.EmployeeCabinetComponent) },
    { path: 'personnel-records', loadComponent: () => import('./personnel-records/personnel-records.component').then(m => m.PersonnelRecordsComponent) },
    { path: 'vacations', loadComponent: () => import('./vacation-management/vacation-management.component').then(m => m.VacationManagementComponent) },
    { path: 'salary', loadComponent: () => import('./salary-management/salary-management.component').then(m => m.SalaryManagementComponent) },
    { path: 'recruiting', loadComponent: () => import('./recruiting/recruiting.component').then(m => m.RecruitingComponent) },
    { path: 'training', loadComponent: () => import('./training/training.component').then(m => m.TrainingComponent) },
    { path: 'competency', loadComponent: () => import('./competency-assessment/competency-assessment.component').then(m => m.CompetencyAssessmentComponent) },
    { path: 'performance', loadComponent: () => import('./performance-management/performance-management.component').then(m => m.PerformanceManagementComponent) },
    { path: 'analytics', loadComponent: () => import('./analytics/analytics.component').then(m => m.AnalyticsComponent) },
    { path: 'timesheet', loadComponent: () => import('./timesheet/timesheet.component').then(m => m.TimesheetComponent) },
    { path: 'documents', loadComponent: () => import('./hr-documents/hr-documents.component').then(m => m.HRDocumentsComponent) },
    { path: 'access-control', loadComponent: () => import('./access-control/access-control.component').then(m => m.AccessControlComponent) },
    { path: 'org-structure', loadComponent: () => import('./org-structure/org-structure.component').then(m => m.OrgStructureComponent) },
];

export default routes;
