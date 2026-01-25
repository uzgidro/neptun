import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { Tooltip } from 'primeng/tooltip';
import { Tag } from 'primeng/tag';
import { InputTextComponent } from '@/layout/component/dialog/input-text/input-text.component';
import { SelectComponent } from '@/layout/component/dialog/select/select.component';
import { DatePickerComponent } from '@/layout/component/dialog/date-picker/date-picker.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { PersonnelRecord } from '@/core/interfaces/hrm/personnel-record';

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
        DialogComponent
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
    private nextId = 100;

    // Mock data
    employees = [
        { id: 1, name: 'Иванов Иван Иванович' },
        { id: 2, name: 'Петров Петр Петрович' },
        { id: 3, name: 'Сидорова Анна Михайловна' },
        { id: 4, name: 'Козлов Алексей Сергеевич' },
        { id: 5, name: 'Новикова Елена Владимировна' }
    ];

    departments = [
        { id: 1, name: 'IT отдел' },
        { id: 2, name: 'Бухгалтерия' },
        { id: 3, name: 'Отдел кадров' },
        { id: 4, name: 'Юридический отдел' },
        { id: 5, name: 'Отдел продаж' }
    ];

    positions = [
        { id: 1, name: 'Разработчик' },
        { id: 2, name: 'Бухгалтер' },
        { id: 3, name: 'HR-менеджер' },
        { id: 4, name: 'Юрист' },
        { id: 5, name: 'Менеджер по продажам' },
        { id: 6, name: 'Руководитель отдела' }
    ];

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

    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);
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
        this.loadMockData();
    }

    private loadMockData(): void {
        // Simulate loading delay
        setTimeout(() => {
            this.records = [
                {
                    id: 1,
                    employee_id: 1,
                    employee_name: 'Иванов Иван Иванович',
                    tab_number: 'ТН-001',
                    hire_date: '2020-03-15',
                    department_id: 1,
                    department_name: 'IT отдел',
                    position_id: 1,
                    position_name: 'Разработчик',
                    contract_type: 'permanent',
                    status: 'active'
                },
                {
                    id: 2,
                    employee_id: 2,
                    employee_name: 'Петров Петр Петрович',
                    tab_number: 'ТН-002',
                    hire_date: '2019-07-01',
                    department_id: 2,
                    department_name: 'Бухгалтерия',
                    position_id: 2,
                    position_name: 'Бухгалтер',
                    contract_type: 'permanent',
                    status: 'active'
                },
                {
                    id: 3,
                    employee_id: 3,
                    employee_name: 'Сидорова Анна Михайловна',
                    tab_number: 'ТН-003',
                    hire_date: '2021-01-10',
                    department_id: 3,
                    department_name: 'Отдел кадров',
                    position_id: 3,
                    position_name: 'HR-менеджер',
                    contract_type: 'temporary',
                    contract_end_date: '2024-12-31',
                    status: 'on_leave'
                },
                {
                    id: 4,
                    employee_id: 4,
                    employee_name: 'Козлов Алексей Сергеевич',
                    tab_number: 'ТН-004',
                    hire_date: '2018-05-20',
                    department_id: 4,
                    department_name: 'Юридический отдел',
                    position_id: 4,
                    position_name: 'Юрист',
                    contract_type: 'permanent',
                    status: 'active'
                },
                {
                    id: 5,
                    employee_id: 5,
                    employee_name: 'Новикова Елена Владимировна',
                    tab_number: 'ТН-005',
                    hire_date: '2022-09-01',
                    department_id: 5,
                    department_name: 'Отдел продаж',
                    position_id: 5,
                    position_name: 'Менеджер по продажам',
                    contract_type: 'contract',
                    contract_end_date: '2025-08-31',
                    status: 'active'
                }
            ];
            this.loading = false;
        }, 500);
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

        const selectedEmployee = this.employees.find(e => e.id === record.employee_id);
        const selectedDept = this.departments.find(d => d.id === record.department_id);
        const selectedPos = this.positions.find(p => p.id === record.position_id);
        const selectedContractType = this.contractTypes.find(c => c.id === record.contract_type);
        const selectedStatus = this.statuses.find(s => s.id === record.status);

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
        const newRecord: PersonnelRecord = {
            id: this.nextId++,
            employee_id: formValue.employee_id?.id,
            employee_name: formValue.employee_id?.name,
            tab_number: formValue.tab_number,
            hire_date: formValue.hire_date ? this.dateToYMD(formValue.hire_date) : '',
            department_id: formValue.department_id?.id,
            department_name: formValue.department_id?.name,
            position_id: formValue.position_id?.id,
            position_name: formValue.position_id?.name,
            contract_type: formValue.contract_type?.id,
            contract_end_date: formValue.contract_end_date ? this.dateToYMD(formValue.contract_end_date) : undefined,
            status: formValue.status?.id
        };

        this.records = [...this.records, newRecord];
        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Запись успешно создана' });
        this.closeDialog();
    }

    private updateRecord() {
        if (!this.selectedRecord) return;

        const formValue = this.recordForm.value;
        const index = this.records.findIndex(r => r.id === this.selectedRecord!.id);

        if (index !== -1) {
            this.records[index] = {
                ...this.records[index],
                employee_id: formValue.employee_id?.id,
                employee_name: formValue.employee_id?.name,
                tab_number: formValue.tab_number,
                hire_date: formValue.hire_date ? this.dateToYMD(formValue.hire_date) : '',
                department_id: formValue.department_id?.id,
                department_name: formValue.department_id?.name,
                position_id: formValue.position_id?.id,
                position_name: formValue.position_id?.name,
                contract_type: formValue.contract_type?.id,
                contract_end_date: formValue.contract_end_date ? this.dateToYMD(formValue.contract_end_date) : undefined,
                status: formValue.status?.id
            };
            this.records = [...this.records];
        }

        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Запись успешно обновлена' });
        this.closeDialog();
    }

    openDeleteDialog(record: PersonnelRecord): void {
        this.selectedRecord = record;
        this.displayDeleteDialog = true;
    }

    confirmDelete(): void {
        if (!this.selectedRecord) return;

        this.records = this.records.filter(r => r.id !== this.selectedRecord!.id);
        this.messageService.add({ severity: 'success', summary: 'Успех', detail: 'Запись успешно удалена' });
        this.displayDeleteDialog = false;
        this.selectedRecord = null;
    }

    getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        switch (status) {
            case 'active': return 'success';
            case 'on_leave': return 'warn';
            case 'dismissed': return 'danger';
            default: return 'info';
        }
    }

    getStatusLabel(status: string): string {
        const found = this.statuses.find(s => s.id === status);
        return found ? found.name : status;
    }

    getContractTypeLabel(type: string): string {
        const found = this.contractTypes.find(c => c.id === type);
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
