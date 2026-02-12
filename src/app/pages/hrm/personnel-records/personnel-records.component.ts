import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { Tooltip } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { PersonnelRecord, PersonnelRecordPayload } from '@/core/interfaces/hrm/personnel-record';
import { PersonnelRecordService } from '@/core/services/personnel-record.service';
import { DepartmentService } from '@/core/services/department.service';
import { PositionService } from '@/core/services/position.service';
import { ContactService } from '@/core/services/contact.service';
import { Department } from '@/core/interfaces/department';
import { Position } from '@/core/interfaces/position';
import { Contact } from '@/core/interfaces/contact';

@Component({
    selector: 'app-personnel-records',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        ButtonDirective,
        IconField,
        InputIcon,
        InputText,
        ButtonLabel,
        ButtonIcon,
        ReactiveFormsModule,
        InputTextComponent,
        SelectComponent,
        DatePickerComponent,
        DeleteConfirmationComponent,
        Tooltip,
        Tag,
        DialogComponent,
        TranslateModule
    ],
    templateUrl: './personnel-records.component.html',
    styleUrl: './personnel-records.component.scss'
})
export class PersonnelRecordsComponent implements OnInit, OnDestroy {
    records: PersonnelRecord[] = [];
    loading: boolean = true;
    displayDialog: boolean = false;
    displayDeleteDialog: boolean = false;
    submitted: boolean = false;
    isEditMode: boolean = false;
    selectedRecord: PersonnelRecord | null = null;
    recordForm: FormGroup;

    // Data from services
    employees: { id: number; name: string }[] = [];
    departments: Department[] = [];
    positions: Position[] = [];

    contractTypes = [
        { id: 'permanent', name: 'Бессрочный' },
        { id: 'temporary', name: 'Срочный' },
        { id: 'contract', name: 'Контракт' }
    ];

    statuses = [
        { id: 'active', name: 'Активный' },
        { id: 'on_leave', name: 'В отпуске' },
        { id: 'dismissed', name: 'Уволен' }
    ];

    private personnelRecordService = inject(PersonnelRecordService);
    private departmentService = inject(DepartmentService);
    private positionService = inject(PositionService);
    private contactService = inject(ContactService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    constructor() {
        this.recordForm = this.fb.group({
            employee_id: [null, Validators.required],
            tab_number: ['', Validators.required],
            hire_date: [null, Validators.required],
            department_id: [null, Validators.required],
            position_id: [null, Validators.required],
            contract_type: [null, Validators.required],
            contract_end_date: [null],
            status: [null, Validators.required]
        });
    }

    ngOnInit() {
        this.loadRecords();
        this.loadDepartments();
        this.loadPositions();
        this.loadEmployees();
    }

    private loadRecords(): void {
        this.personnelRecordService
            .getPersonnelRecords()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.records = data;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.PERSONNEL_RECORDS.LOAD_ERROR') });
                    console.error(err);
                },
                complete: () => (this.loading = false)
            });
    }

    private loadDepartments(): void {
        this.departmentService
            .getDepartments()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.departments = data;
                },
                error: (err) => console.error(err)
            });
    }

    private loadPositions(): void {
        this.positionService
            .getPositions()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.positions = data;
                },
                error: (err) => console.error(err)
            });
    }

    private loadEmployees(): void {
        this.contactService
            .getContacts()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data: Contact[]) => {
                    this.employees = data.map((c) => ({ id: c.id, name: c.name }));
                },
                error: (err) => console.error(err)
            });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openDialog(): void {
        this.isEditMode = false;
        this.selectedRecord = null;
        this.submitted = false;
        this.recordForm.reset();
        this.recordForm.patchValue({ status: this.statuses[0] });
        this.displayDialog = true;
    }

    openEditDialog(record: PersonnelRecord): void {
        this.isEditMode = true;
        this.selectedRecord = record;
        this.submitted = false;
        this.recordForm.reset();

        const selectedEmployee = this.employees.find((e) => e.id === record.employee_id);
        const selectedDept = this.departments.find((d) => d.id === record.department_id);
        const selectedPos = this.positions.find((p) => p.id === record.position_id);
        const selectedContractType = this.contractTypes.find((c) => c.id === record.contract_type);
        const selectedStatus = this.statuses.find((s) => s.id === record.status);

        this.recordForm.patchValue({
            employee_id: selectedEmployee || null,
            tab_number: record.tab_number,
            hire_date: record.hire_date ? new Date(record.hire_date) : null,
            department_id: selectedDept || null,
            position_id: selectedPos || null,
            contract_type: selectedContractType || null,
            contract_end_date: record.contract_end_date ? new Date(record.contract_end_date) : null,
            status: selectedStatus || null
        });

        this.displayDialog = true;
    }

    closeDialog(): void {
        this.displayDialog = false;
        this.isEditMode = false;
        this.selectedRecord = null;
    }

    onSubmit() {
        this.submitted = true;
        if (this.recordForm.invalid) return;

        if (this.isEditMode && this.selectedRecord) {
            this.updateRecord();
        } else {
            this.createRecord();
        }
    }

    private createRecord() {
        const formValue = this.recordForm.value;
        const payload: PersonnelRecordPayload = {
            employee_id: formValue.employee_id?.id,
            tab_number: formValue.tab_number,
            hire_date: formValue.hire_date ? this.dateToYMD(formValue.hire_date) : undefined,
            department_id: formValue.department_id?.id,
            position_id: formValue.position_id?.id,
            contract_type: formValue.contract_type?.id,
            contract_end_date: formValue.contract_end_date ? this.dateToYMD(formValue.contract_end_date) : undefined,
            status: formValue.status?.id
        };

        this.personnelRecordService
            .createPersonnelRecord(payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.PERSONNEL_RECORDS.CREATE_SUCCESS') });
                    this.loadRecords();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.PERSONNEL_RECORDS.CREATE_ERROR') });
                    console.error(err);
                }
            });
    }

    private updateRecord() {
        if (!this.selectedRecord) return;

        const formValue = this.recordForm.value;
        const payload: PersonnelRecordPayload = {
            employee_id: formValue.employee_id?.id,
            tab_number: formValue.tab_number,
            hire_date: formValue.hire_date ? this.dateToYMD(formValue.hire_date) : undefined,
            department_id: formValue.department_id?.id,
            position_id: formValue.position_id?.id,
            contract_type: formValue.contract_type?.id,
            contract_end_date: formValue.contract_end_date ? this.dateToYMD(formValue.contract_end_date) : undefined,
            status: formValue.status?.id
        };

        this.personnelRecordService
            .updatePersonnelRecord(this.selectedRecord.id, payload)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.PERSONNEL_RECORDS.UPDATE_SUCCESS') });
                    this.loadRecords();
                    this.closeDialog();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.PERSONNEL_RECORDS.UPDATE_ERROR') });
                    console.error(err);
                }
            });
    }

    openDeleteDialog(record: PersonnelRecord): void {
        this.selectedRecord = record;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedRecord) return;

        this.personnelRecordService
            .deletePersonnelRecord(this.selectedRecord.id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.PERSONNEL_RECORDS.DELETE_SUCCESS') });
                    this.loadRecords();
                    this.displayDeleteDialog = false;
                    this.selectedRecord = null;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.PERSONNEL_RECORDS.DELETE_ERROR') });
                    console.error(err);
                }
            });
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status) {
            case 'active':
                return 'success';
            case 'on_leave':
                return 'warn';
            case 'dismissed':
                return 'danger';
            default:
                return 'info';
        }
    }

    getStatusLabel(status: string): string {
        const found = this.statuses.find((s) => s.id === status);
        return found ? found.name : status;
    }

    getContractTypeLabel(type: string): string {
        const found = this.contractTypes.find((c) => c.id === type);
        return found ? found.name : type;
    }

    private dateToYMD(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
