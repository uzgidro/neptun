import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    EmployeeTimesheet,
    TimesheetDay,
    TimesheetSummary,
    AttendanceStatus,
    ATTENDANCE_STATUSES,
    MONTHS,
    DAYS_OF_WEEK,
    Holiday
} from '@/core/interfaces/hrm/timesheet';
import { TimesheetService } from '@/core/services/timesheet.service';
import { DepartmentService } from '@/core/services/department.service';
import { Department } from '@/core/interfaces/department';

@Component({
    selector: 'app-timesheet',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonDirective,
        Card,
        Select,
        TableModule,
        Tooltip,
        Dialog,
        InputText,
        Textarea,
        TranslateModule
    ],
    templateUrl: './timesheet.component.html',
    styleUrl: './timesheet.component.scss'
})
export class TimesheetComponent implements OnInit, OnDestroy {
    // Data
    employees: EmployeeTimesheet[] = [];
    departments: Department[] = [];
    holidays: Holiday[] = [];

    // Filters
    selectedMonth: number = new Date().getMonth() + 1;
    selectedYear: number = new Date().getFullYear();
    selectedDepartment: number | null = null;

    // Options
    months = MONTHS;
    years: number[] = [];
    attendanceStatuses = ATTENDANCE_STATUSES;
    daysOfWeek = DAYS_OF_WEEK;

    // Calendar
    calendarDays: { date: string; dayOfMonth: number; dayOfWeek: number; isWeekend: boolean; isHoliday: boolean; holidayName?: string }[] = [];

    // State
    loading: boolean = false;

    // Dialog
    displayEditDialog: boolean = false;
    selectedEmployee: EmployeeTimesheet | null = null;
    selectedDay: TimesheetDay | null = null;
    editForm = {
        status: null as AttendanceStatus | null,
        check_in: '',
        check_out: '',
        notes: ''
    };

    // Summary
    totalSummary: TimesheetSummary = {
        total_work_days: 0,
        days_present: 0,
        days_absent: 0,
        days_vacation: 0,
        days_sick_leave: 0,
        days_business_trip: 0,
        days_remote: 0,
        total_worked_hours: 0,
        total_overtime_hours: 0,
        total_undertime_hours: 0
    };

    private timesheetService = inject(TimesheetService);
    private departmentService = inject(DepartmentService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.initYears();
        this.loadDepartments();
        this.loadHolidays();
        this.generateCalendar();
        this.loadTimesheet();
    }

    private initYears(): void {
        const currentYear = new Date().getFullYear();
        for (let y = currentYear - 2; y <= currentYear + 1; y++) {
            this.years.push(y);
        }
    }

    private loadDepartments(): void {
        this.departmentService.getDepartments()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.departments = data;
                },
                error: (err) => console.error(err)
            });
    }

    private loadHolidays(): void {
        this.timesheetService.getHolidays(this.selectedYear)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.holidays = data;
                    this.generateCalendar();
                },
                error: (err) => console.error(err)
            });
    }

    generateCalendar(): void {
        this.calendarDays = [];
        const daysInMonth = new Date(this.selectedYear, this.selectedMonth, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.selectedYear, this.selectedMonth - 1, day);
            const dateStr = this.formatDateISO(date);
            const dayOfWeek = date.getDay();
            const holiday = this.holidays.find(h => h.date === dateStr);

            this.calendarDays.push({
                date: dateStr,
                dayOfMonth: day,
                dayOfWeek: dayOfWeek,
                isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
                isHoliday: !!holiday,
                holidayName: holiday?.name
            });
        }
    }

    loadTimesheet(): void {
        this.loading = true;

        const filter = {
            month: this.selectedMonth,
            year: this.selectedYear,
            department_id: this.selectedDepartment || undefined
        };

        this.timesheetService.getTimesheets(filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.employees = data;
                    this.calculateTotalSummary();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.TIMESHEET.LOAD_ERROR') });
                    console.error(err);
                },
                complete: () => (this.loading = false)
            });
    }

    private calculateEmployeeSummary(days: TimesheetDay[]): TimesheetSummary {
        const summary: TimesheetSummary = {
            total_work_days: 0,
            days_present: 0,
            days_absent: 0,
            days_vacation: 0,
            days_sick_leave: 0,
            days_business_trip: 0,
            days_remote: 0,
            total_worked_hours: 0,
            total_overtime_hours: 0,
            total_undertime_hours: 0
        };

        days.forEach(day => {
            if (!day.is_weekend && !day.is_holiday) {
                summary.total_work_days++;
            }

            switch (day.status) {
                case 'present':
                case 'late':
                case 'left_early':
                    summary.days_present++;
                    break;
                case 'absent':
                    summary.days_absent++;
                    break;
                case 'vacation':
                case 'unpaid_leave':
                    summary.days_vacation++;
                    break;
                case 'sick_leave':
                    summary.days_sick_leave++;
                    break;
                case 'business_trip':
                    summary.days_business_trip++;
                    summary.days_present++;
                    break;
                case 'remote':
                    summary.days_remote++;
                    summary.days_present++;
                    break;
            }

            summary.total_worked_hours += day.worked_hours || 0;
            summary.total_overtime_hours += day.overtime_hours || 0;
        });

        const expectedHours = summary.total_work_days * 8;
        summary.total_undertime_hours = Math.max(0, expectedHours - summary.total_worked_hours);

        return summary;
    }

    private calculateTotalSummary(): void {
        this.totalSummary = {
            total_work_days: 0,
            days_present: 0,
            days_absent: 0,
            days_vacation: 0,
            days_sick_leave: 0,
            days_business_trip: 0,
            days_remote: 0,
            total_worked_hours: 0,
            total_overtime_hours: 0,
            total_undertime_hours: 0
        };

        if (this.employees.length > 0) {
            this.totalSummary.total_work_days = this.employees[0].summary.total_work_days;
        }

        this.employees.forEach(emp => {
            this.totalSummary.days_present += emp.summary.days_present;
            this.totalSummary.days_absent += emp.summary.days_absent;
            this.totalSummary.days_vacation += emp.summary.days_vacation;
            this.totalSummary.days_sick_leave += emp.summary.days_sick_leave;
            this.totalSummary.days_business_trip += emp.summary.days_business_trip;
            this.totalSummary.days_remote += emp.summary.days_remote;
            this.totalSummary.total_worked_hours += emp.summary.total_worked_hours;
            this.totalSummary.total_overtime_hours += emp.summary.total_overtime_hours;
            this.totalSummary.total_undertime_hours += emp.summary.total_undertime_hours;
        });
    }

    onFilterChange(): void {
        this.generateCalendar();
        this.loadTimesheet();
    }

    // Cell display helpers
    getCellClass(day: TimesheetDay): string {
        const statusInfo = this.attendanceStatuses.find(s => s.value === day.status);
        return statusInfo ? `status-${statusInfo.color}` : '';
    }

    getCellIcon(day: TimesheetDay): string {
        const statusInfo = this.attendanceStatuses.find(s => s.value === day.status);
        return statusInfo?.icon || '';
    }

    getCellTooltip(day: TimesheetDay): string {
        const statusInfo = this.attendanceStatuses.find(s => s.value === day.status);
        let tooltip = statusInfo?.label || '';

        if (day.check_in && day.check_out) {
            tooltip += `\n${day.check_in} - ${day.check_out}`;
        }
        if (day.worked_hours) {
            tooltip += `\n${this.translate.instant('HRM.TIMESHEET.WORKED')}: ${day.worked_hours}${this.translate.instant('HRM.TIMESHEET.HOURS_SHORT')}`;
        }
        if (day.overtime_hours) {
            tooltip += `\n${this.translate.instant('HRM.TIMESHEET.OVERTIME')}: ${day.overtime_hours}${this.translate.instant('HRM.TIMESHEET.HOURS_SHORT')}`;
        }
        if (day.is_holiday && day.holiday_name) {
            tooltip = day.holiday_name;
        }

        return tooltip;
    }

    getStatusLabel(status: AttendanceStatus): string {
        return this.attendanceStatuses.find(s => s.value === status)?.label || status;
    }

    getStatusSeverity(status: AttendanceStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (status) {
            case 'present':
                return 'success';
            case 'remote':
            case 'business_trip':
                return 'info';
            case 'vacation':
            case 'sick_leave':
                return 'warn';
            case 'absent':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    getDayOfWeekShort(dayOfWeek: number): string {
        return this.daysOfWeek.find(d => d.value === dayOfWeek)?.short || '';
    }

    // Edit dialog
    openEditDialog(employee: EmployeeTimesheet, day: TimesheetDay): void {
        if (day.is_weekend || day.is_holiday) return;

        this.selectedEmployee = employee;
        this.selectedDay = day;
        this.editForm = {
            status: day.status,
            check_in: day.check_in || '',
            check_out: day.check_out || '',
            notes: day.notes || ''
        };
        this.displayEditDialog = true;
    }

    saveEdit(): void {
        if (!this.selectedEmployee || !this.selectedDay || !this.editForm.status) return;

        const dayIndex = this.selectedEmployee.days.findIndex(d => d.date === this.selectedDay!.date);
        if (dayIndex !== -1) {
            this.selectedEmployee.days[dayIndex] = {
                ...this.selectedEmployee.days[dayIndex],
                status: this.editForm.status,
                check_in: this.editForm.check_in || undefined,
                check_out: this.editForm.check_out || undefined,
                notes: this.editForm.notes || undefined
            };

            // Recalculate worked hours
            if (this.editForm.check_in && this.editForm.check_out) {
                const [inH, inM] = this.editForm.check_in.split(':').map(Number);
                const [outH, outM] = this.editForm.check_out.split(':').map(Number);
                const worked = (outH + outM / 60) - (inH + inM / 60) - 1; // minus 1 hour break
                this.selectedEmployee.days[dayIndex].worked_hours = Math.max(0, worked);
                this.selectedEmployee.days[dayIndex].overtime_hours = Math.max(0, worked - 8);
            }

            // Recalculate summary
            this.selectedEmployee.summary = this.calculateEmployeeSummary(this.selectedEmployee.days);
            this.calculateTotalSummary();
        }

        this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('COMMON.SUCCESS'),
            detail: this.translate.instant('HRM.TIMESHEET.DATA_UPDATED')
        });

        this.displayEditDialog = false;
    }

    // Export
    exportToExcel(): void {
        const filter = {
            month: this.selectedMonth,
            year: this.selectedYear,
            department_id: this.selectedDepartment || undefined
        };

        this.timesheetService.exportToExcel(filter)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `timesheet_${this.selectedYear}_${this.selectedMonth}.xlsx`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.EXPORT'),
                        detail: this.translate.instant('HRM.TIMESHEET.EXPORT_SUCCESS')
                    });
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('HRM.TIMESHEET.EXPORT_ERROR')
                    });
                    console.error(err);
                }
            });
    }

    // Helpers
    private formatDateISO(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    getMonthName(month: number): string {
        return this.months.find(m => m.value === month)?.label || '';
    }

    getAttendanceRate(): number {
        if (this.employees.length === 0 || this.totalSummary.total_work_days === 0) return 0;
        const totalPossibleDays = this.employees.length * this.totalSummary.total_work_days;
        return Math.round((this.totalSummary.days_present / totalPossibleDays) * 100);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
