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
import { ShutdownComponent } from '@/pages/situation-center/ges/shutdown/shutdown.component';
import { PositionComponent } from '@/pages/hrm/position/position.component';
import { DepartmentComponent } from '@/pages/hrm/department/department.component';
import { EmployeeComponent } from '@/pages/hrm/employee/employee.component';
import { EventsComponent } from '@/pages/planning/events/events.component';
import { ConstructionComponent } from '@/pages/situation-center/construction/construction.component';
import { ReceptionComponent } from '@/pages/planning/reception/reception.component';
import { ReservoirsSummaryComponent } from '@/pages/situation-center/reservoirs-info/reservoirs-summary/reservoirs-summary.component';
import { ReservoirSummaryPdfComponent } from '@/pages/situation-center/reservoirs-info/reservoir-summaty-pdf/reservoir-summary-pdf.component';
import { DischargesComponent } from '@/pages/situation-center/ges/discharges/discharges.component';
import { VisitsComponent } from '@/pages/situation-center/other/visits/visits.component';
import { IncidentsComponent } from '@/pages/situation-center/other/incidents/incidents.component';
import { ReservoirsDeviceComponent } from '@/pages/situation-center/reservoirs-info/reservoirs-device/reservoirs-device.component';
import { InvestPerspectiveProjectsComponent } from '@/pages/invest/invest-perspective-projects/invest-perspective-projects.component';
import { DebitCreditComponent } from '@/pages/financial-block/debit-credit/debit-credit.component';
import { RepairCostsComponent } from '@/pages/financial-block/repair-costs/repair-costs.component';
import { ProcurementComponent } from '@/pages/financial-block/procurement/procurement.component';
import { KpiComponent } from '@/pages/financial-block/kpi/kpi.component';
import { SalaryComponent } from '@/pages/financial-block/salary/salary.component';
import { FinancialDashboardComponent } from '@/pages/financial-block/dashboard/financial-dashboard.component';
import { OrdersComponent } from '@/pages/chancellery/orders/orders.component';
import { ReportsComponent } from '@/pages/chancellery/reports/reports.component';
import { LettersComponent } from '@/pages/chancellery/letters/letters.component';
import { InstructionsComponent } from '@/pages/chancellery/instructions/instructions.component';
import { PendingSignaturesComponent } from '@/pages/chancellery/pending-signatures/pending-signatures.component';
import { LegalDocumentsComponent } from '@/pages/legal-documents/legal-documents.component';
import { LexSearchComponent } from '@/pages/lex-search/lex-search.component';
import { CallsComponent } from '@/pages/calls/calls.component';
import { NewsComponent } from '@/pages/media/news/news.component';
import { InvestActiveProjectsComponent } from '@/pages/invest/invest-active-projects/invest-active-projects.component';
import { ScDashboardComponent } from '@/pages/situation-center/sc-dashboard/sc-dashboard.component';
import { PersonnelRecordsComponent } from '@/pages/hrm/personnel-records/personnel-records.component';
import { VacationManagementComponent } from '@/pages/hrm/vacation-management/vacation-management.component';
import { SalaryManagementComponent } from '@/pages/hrm/salary-management/salary-management.component';
import { RecruitingComponent } from '@/pages/hrm/recruiting/recruiting.component';
import { TrainingComponent } from '@/pages/hrm/training/training.component';
import { CompetencyAssessmentComponent } from '@/pages/hrm/competency-assessment/competency-assessment.component';
import { PerformanceManagementComponent } from '@/pages/hrm/performance-management/performance-management.component';
import { AnalyticsComponent } from '@/pages/hrm/analytics/analytics.component';
import { HRMDashboardComponent } from '@/pages/hrm/dashboard/dashboard.component';
import { EmployeeCabinetComponent } from '@/pages/hrm/employee-cabinet/employee-cabinet.component';


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
            { path: 'hrm/dashboard', component: HRMDashboardComponent, canActivate: [adminGuard] },
            { path: 'hrm/my-cabinet', component: EmployeeCabinetComponent, canActivate: [authGuard] },
            { path: 'hrm/personnel-records', component: PersonnelRecordsComponent, canActivate: [adminGuard] },
            { path: 'hrm/vacations', component: VacationManagementComponent, canActivate: [adminGuard] },
            { path: 'hrm/salary', component: SalaryManagementComponent, canActivate: [adminGuard] },
            { path: 'hrm/recruiting', component: RecruitingComponent, canActivate: [adminGuard] },
            { path: 'hrm/training', component: TrainingComponent, canActivate: [adminGuard] },
            { path: 'hrm/competency', component: CompetencyAssessmentComponent, canActivate: [adminGuard] },
            { path: 'hrm/performance', component: PerformanceManagementComponent, canActivate: [adminGuard] },
            { path: 'hrm/analytics', component: AnalyticsComponent, canActivate: [adminGuard] },
            { path: 'viewer', component: DocumentViewerComponent, canActivate: [raisGuard] },
            { path: 'discharges', component: DischargesComponent, canActivate: [raisGuard] },
            { path: 'shutdowns', component: ShutdownComponent, canActivate: [raisGuard] },
            { path: 'construction', component: ConstructionComponent, canActivate: [raisGuard] },
            { path: 'planning/events', component: EventsComponent, canActivate: [raisGuard] },
            { path: 'planning/reception', component: ReceptionComponent, canActivate: [raisGuard] },
            { path: 'reservoir-summary', component: ReservoirsSummaryComponent, canActivate: [raisGuard] },
            { path: 'shutdowns', component: ShutdownComponent, canActivate: [raisGuard] },
            { path: 'financial-dashboard', component: FinancialDashboardComponent, canActivate: [raisGuard] },
            { path: 'invest-perspective', component: InvestPerspectiveProjectsComponent, canActivate: [raisGuard] },
            { path: 'invest-active', component: InvestActiveProjectsComponent, canActivate: [raisGuard] },
            { path: 'debit-credit', component: DebitCreditComponent, canActivate: [raisGuard] },
            { path: 'repair-costs', component: RepairCostsComponent, canActivate: [raisGuard] },
            { path: 'procurement', component: ProcurementComponent, canActivate: [raisGuard] },
            { path: 'kpi', component: KpiComponent, canActivate: [raisGuard] },
            { path: 'salary', component: SalaryComponent, canActivate: [raisGuard] },
            { path: 'reservoir-summary/pdf', component: ReservoirSummaryPdfComponent, canActivate: [raisGuard] },
            { path: 'visits', component: VisitsComponent, canActivate: [raisGuard] },
            { path: 'incidents', component: IncidentsComponent, canActivate: [raisGuard] },
            { path: 'reservoir-device', component: ReservoirsDeviceComponent, canActivate: [raisGuard] },
            { path: 'chancellery/pending-signatures', component: PendingSignaturesComponent, canActivate: [raisGuard] },
            { path: 'chancellery/orders', component: OrdersComponent, canActivate: [raisGuard] },
            { path: 'chancellery/reports', component: ReportsComponent, canActivate: [raisGuard] },
            { path: 'chancellery/letters', component: LettersComponent, canActivate: [raisGuard] },
            { path: 'chancellery/instructions', component: InstructionsComponent, canActivate: [raisGuard] },
            { path: 'legal-documents', component: LegalDocumentsComponent, canActivate: [raisGuard] },
            { path: 'lex-search', component: LexSearchComponent, canActivate: [raisGuard] },
            { path: 'calls', component: CallsComponent, canActivate: [raisGuard] },
            { path: 'media/news', component: NewsComponent, canActivate: [raisGuard] },
        ]
    },
    { path: 'monitoring', component: ScDashboardComponent, canActivate: [authGuard] },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
