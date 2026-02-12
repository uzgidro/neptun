import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Avatar } from 'primeng/avatar';
import { Badge } from 'primeng/badge';
import { Tooltip } from 'primeng/tooltip';
import { ProgressBar } from 'primeng/progressbar';
import { Dialog } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EmployeeCabinetService } from '@/core/services/employee-cabinet.service';
import {
    DOCUMENT_TYPES,
    EmployeeProfile,
    LeaveBalance,
    MyCompetencies,
    MyDocument,
    MyNotification,
    MySalaryInfo,
    MyTask,
    MyTraining,
    MyVacationRequest,
    SalaryPayment,
    VACATION_STATUSES,
    VACATION_TYPES,
    VacationStatus
} from '@/core/interfaces/hrm/employee-cabinet';

@Component({
    selector: 'app-employee-cabinet',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, ButtonDirective, Tag, Avatar, Badge, Tooltip, ProgressBar, Dialog, TabsModule, TableModule, Select, DatePicker, Textarea, TranslateModule],
    templateUrl: './employee-cabinet.component.html',
    styleUrl: './employee-cabinet.component.scss'
})
export class EmployeeCabinetComponent implements OnInit, OnDestroy {
    // Data
    profile: EmployeeProfile | null = null;
    leaveBalance: LeaveBalance | null = null;
    salaryInfo: MySalaryInfo | null = null;
    training: MyTraining | null = null;
    competencies: MyCompetencies | null = null;
    notifications: MyNotification[] = [];
    tasks: MyTask[] = [];
    documents: MyDocument[] = [];
    vacationRequests: MyVacationRequest[] = [];

    loading: boolean = true;
    activeTab: number = 0;

    // Dialogs
    displayVacationDialog: boolean = false;
    displayPayslipDialog: boolean = false;
    displayPaymentHistoryDialog: boolean = false;
    displayEditProfileDialog: boolean = false;
    selectedPayslip: SalaryPayment | null = null;

    // Forms
    vacationForm: FormGroup;
    profileForm: FormGroup;
    submitted: boolean = false;

    // Constants
    vacationTypes = VACATION_TYPES;
    vacationStatuses = VACATION_STATUSES;
    documentTypes = DOCUMENT_TYPES;

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private cabinetService = inject(EmployeeCabinetService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.vacationForm = this.fb.group({
            type: [null, Validators.required],
            start_date: [null, Validators.required],
            end_date: [null, Validators.required],
            reason: [''],
            substitute_id: [null]
        });

        this.profileForm = this.fb.group({
            phone: [''],
            internal_phone: [''],
            email: ['', Validators.email]
        });
    }

    ngOnInit() {
        this.loadAllData();
    }

    private loadAllData(): void {
        this.loading = true;

        forkJoin({
            profile: this.cabinetService.getMyProfile(),
            leaveBalance: this.cabinetService.getMyLeaveBalance(),
            salaryInfo: this.cabinetService.getMySalaryInfo(),
            training: this.cabinetService.getMyTraining(),
            competencies: this.cabinetService.getMyCompetencies(),
            notifications: this.cabinetService.getMyNotifications(),
            tasks: this.cabinetService.getMyTasks(),
            documents: this.cabinetService.getMyDocuments(),
            vacations: this.cabinetService.getMyVacations()
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.profile = data.profile;
                    this.leaveBalance = data.leaveBalance;
                    this.salaryInfo = data.salaryInfo;
                    this.training = data.training;
                    this.competencies = data.competencies;
                    this.notifications = data.notifications;
                    this.tasks = data.tasks;
                    this.documents = data.documents;
                    this.vacationRequests = data.vacations;
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Error loading data:', err);
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.EMPLOYEE_CABINET.LOAD_ERROR') });
                    this.loading = false;
                }
            });
    }

    // Actions
    openEditProfileDialog(): void {
        if (this.profile) {
            this.profileForm.patchValue({
                phone: this.profile.phone || '',
                internal_phone: this.profile.internal_phone || '',
                email: this.profile.email || ''
            });
        }
        this.submitted = false;
        this.displayEditProfileDialog = true;
    }

    saveProfile(): void {
        this.submitted = true;
        if (this.profileForm.invalid || !this.profile) return;

        const formValue = this.profileForm.value;
        const payload = {
            phone: formValue.phone,
            internal_phone: formValue.internal_phone,
            email: formValue.email
        };

        this.cabinetService
            .updateMyProfile(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updatedProfile) => {
                    this.profile = updatedProfile;
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.EMPLOYEE_CABINET.PROFILE_UPDATED') });
                    this.displayEditProfileDialog = false;
                },
                error: (err) => {
                    console.error('Error updating profile:', err);
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.EMPLOYEE_CABINET.PROFILE_UPDATE_ERROR') });
                }
            });
    }

    openVacationDialog(): void {
        this.submitted = false;
        this.vacationForm.reset();
        this.displayVacationDialog = true;
    }

    submitVacationRequest(): void {
        this.submitted = true;
        if (this.vacationForm.invalid) return;

        const formValue = this.vacationForm.value;
        const payload = {
            type: formValue.type?.value,
            start_date: formValue.start_date instanceof Date ? formValue.start_date.toISOString().split('T')[0] : formValue.start_date,
            end_date: formValue.end_date instanceof Date ? formValue.end_date.toISOString().split('T')[0] : formValue.end_date,
            reason: formValue.reason
        };

        this.cabinetService
            .createVacationRequest(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (newRequest) => {
                    this.vacationRequests = [newRequest, ...this.vacationRequests];
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.EMPLOYEE_CABINET.VACATION_SUBMITTED') });
                    this.displayVacationDialog = false;
                },
                error: (err) => {
                    console.error('Error creating request:', err);
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.EMPLOYEE_CABINET.VACATION_SUBMIT_ERROR') });
                }
            });
    }

    cancelVacationRequest(request: MyVacationRequest): void {
        this.cabinetService
            .cancelVacationRequest(request.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updatedRequest) => {
                    const index = this.vacationRequests.findIndex((r) => r.id === request.id);
                    if (index !== -1) {
                        this.vacationRequests[index] = updatedRequest;
                        this.vacationRequests = [...this.vacationRequests];
                    }
                    this.messageService.add({ severity: 'info', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.EMPLOYEE_CABINET.VACATION_CANCELLED') });
                },
                error: (err) => {
                    console.error('Error cancelling request:', err);
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.EMPLOYEE_CABINET.VACATION_CANCEL_ERROR') });
                }
            });
    }

    openPayslipDialog(payment: SalaryPayment): void {
        this.selectedPayslip = payment;
        this.displayPayslipDialog = true;
    }

    downloadPayslip(payment: SalaryPayment): void {
        this.cabinetService
            .downloadPayslip(payment.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const link = window.document.createElement('a');
                    link.href = url;
                    link.download = `payslip_${payment.period_month}_${payment.period_year}.pdf`;
                    link.click();
                    window.URL.revokeObjectURL(url);
                },
                error: (err) => {
                    console.error('Error downloading:', err);
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.EMPLOYEE_CABINET.PAYSLIP_ERROR') });
                }
            });
    }

    downloadDocument(doc: MyDocument): void {
        this.cabinetService
            .downloadDocument(doc.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const link = window.document.createElement('a');
                    link.href = url;
                    link.download = doc.name;
                    link.click();
                    window.URL.revokeObjectURL(url);
                },
                error: (err) => {
                    console.error('Error downloading:', err);
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.EMPLOYEE_CABINET.DOCUMENT_ERROR') });
                }
            });
    }

    downloadCertificate(training: any): void {
        if (training.certificate_url) {
            window.open(training.certificate_url, '_blank');
        }
    }

    markNotificationAsRead(notification: MyNotification): void {
        if (notification.read) return;

        this.cabinetService
            .markNotificationAsRead(notification.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updated) => {
                    notification.read = true;
                    notification.read_at = new Date().toISOString();
                },
                error: (err) => console.error('Error:', err)
            });
    }

    markAllNotificationsAsRead(): void {
        this.cabinetService
            .markAllNotificationsAsRead()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.notifications.forEach((n) => {
                        n.read = true;
                        n.read_at = new Date().toISOString();
                    });
                },
                error: (err) => console.error('Error:', err)
            });
    }

    // Helpers
    getInitials(name: string): string {
        if (!name) return '';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2);
    }

    calculateDays(start: Date | string, end: Date | string): number {
        const startDate = start instanceof Date ? start : new Date(start);
        const endDate = end instanceof Date ? end : new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    getMonthName(month: number): string {
        return this.translate.instant(`HRM.EMPLOYEE_CABINET.MONTH_${month}`);
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const lang = this.translate.currentLang || 'ru';
        const locale = lang === 'uz-latn' ? 'uz' : lang === 'uz-cyrl' ? 'uz' : lang;
        return date.toLocaleDateString(locale);
    }

    formatDateTime(dateStr: string): string {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const lang = this.translate.currentLang || 'ru';
        const locale = lang === 'uz-latn' ? 'uz' : lang === 'uz-cyrl' ? 'uz' : lang;
        return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    formatCurrency(value: number): string {
        const lang = this.translate.currentLang || 'ru';
        const locale = lang === 'uz-latn' ? 'uz' : lang === 'uz-cyrl' ? 'uz' : lang;
        return new Intl.NumberFormat(locale).format(value) + ' сум';
    }

    getVacationTypeLabel(type: string): string {
        const found = this.vacationTypes.find((t) => t.value === type);
        return found ? found.label : type;
    }

    getVacationStatusSeverity(status: VacationStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const found = this.vacationStatuses.find((s) => s.value === status);
        return (found?.severity as any) || 'info';
    }

    getVacationStatusLabel(status: VacationStatus): string {
        const found = this.vacationStatuses.find((s) => s.value === status);
        return found ? found.label : status;
    }

    getDocumentIcon(type: string): string {
        const found = this.documentTypes.find((d) => d.value === type);
        return found ? found.icon : 'pi-file';
    }

    getUnreadNotificationsCount(): number {
        return this.notifications.filter((n) => !n.read).length;
    }

    getCompetencyStars(level: number): string[] {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(i <= level ? 'pi-star-fill' : 'pi-star');
        }
        return stars;
    }

    getRelativeTime(timestamp: string): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} ${this.translate.instant('HRM.EMPLOYEE_CABINET.MIN_AGO')}`;
        if (diffHours < 24) return `${diffHours} ${this.translate.instant('HRM.EMPLOYEE_CABINET.HOURS_AGO')}`;
        if (diffDays === 1) return this.translate.instant('HRM.EMPLOYEE_CABINET.YESTERDAY');
        if (diffDays < 7) return `${diffDays} ${this.translate.instant('HRM.EMPLOYEE_CABINET.DAYS_AGO')}`;
        const lang = this.translate.currentLang || 'ru';
        const locale = lang === 'uz-latn' ? 'uz' : lang === 'uz-cyrl' ? 'uz' : lang;
        return date.toLocaleDateString(locale);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
