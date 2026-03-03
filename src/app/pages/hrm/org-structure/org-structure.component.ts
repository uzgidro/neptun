import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { Select } from 'primeng/select';
import { TreeModule } from 'primeng/tree';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { TreeNode } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    OrgUnit,
    OrgEmployee,
    OrgStats,
    OrgUnitType,
    ORG_UNIT_TYPES,
    ORG_COLORS
} from '@/core/interfaces/hrm/org-structure';
import { OrgStructureService } from '@/core/services/org-structure.service';

// Predefined position titles
export const POSITION_TITLES = [
    'Председатель Правления',
    'Первый заместитель председателя правления',
    'Заместитель председателя правления',
    'Советник председателя правления',
    'Руководитель отдела',
    'Руководитель департамента',
    'Начальник управления',
    'Заместитель начальника управления',
    'Начальник центра',
    'Аппаратный руководитель',
    'Главный специалист',
    'Ведущий специалист',
    'Специалист 1 категории',
    'Специалист 2 категории',
    'Делопроизводитель'
];

export interface EmployeeForm {
    id?: number;
    name: string;
    position: string;
    position_custom?: string;
    department_id: number | null;
    hire_date: string;
    photo_url?: string;
    email?: string;
    phone?: string;
    is_manager: boolean;
}

@Component({
    selector: 'app-org-structure',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonDirective,
        Select,
        TreeModule,
        OrganizationChartModule,
        Dialog,
        InputText,
        Textarea,
        Tag,
        Tooltip,
        TranslateModule
    ],
    templateUrl: './org-structure.component.html',
    styleUrl: './org-structure.component.scss'
})
export class OrgStructureComponent implements OnInit, OnDestroy {
    // Data
    orgUnits: OrgUnit[] = [];
    orgTree: TreeNode[] = [];
    orgChartData: TreeNode[] = [];
    employees: OrgEmployee[] = [];

    // Stats
    stats: OrgStats = {
        total_departments: 0,
        total_employees: 0,
        total_managers: 0,
        avg_team_size: 0,
        max_depth: 0,
        vacancies: 0
    };

    // Options
    orgUnitTypes = ORG_UNIT_TYPES;
    viewModes = [
        { labelKey: 'HRM.ORG_STRUCTURE.VIEW_TREE', value: 'tree', icon: 'pi-list' },
        { labelKey: 'HRM.ORG_STRUCTURE.VIEW_CHART', value: 'chart', icon: 'pi-sitemap' },
        { labelKey: 'HRM.ORG_STRUCTURE.VIEW_LIST', value: 'list', icon: 'pi-th-large' }
    ];

    // State
    loading: boolean = false;
    viewMode: string = 'tree';
    selectedNode: TreeNode | null = null;

    // Department Dialog
    displayDepartmentDialog: boolean = false;
    isEditMode: boolean = false;
    selectedUnit: OrgUnit | null = null;
    unitForm: Partial<OrgUnit> = {};

    // Employee Dialog (View)
    displayEmployeeDialog: boolean = false;
    selectedEmployee: OrgEmployee | null = null;

    // Employee CRUD Dialog
    displayEmployeeCrudDialog: boolean = false;
    isEditEmployeeMode: boolean = false;
    positionTitles = POSITION_TITLES.map(p => ({ label: p, value: p }));
    useCustomPosition: boolean = false;
    employeeForm: EmployeeForm = this.getEmptyEmployeeForm();

    // Details Panel
    showDetails: boolean = false;
    detailsUnit: OrgUnit | null = null;
    detailsEmployees: OrgEmployee[] = [];

    private messageService = inject(MessageService);
    private orgStructureService = inject(OrgStructureService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.loadOrgUnits();
        this.loadEmployees();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadOrgUnits(): void {
        this.loading = true;
        this.orgStructureService.getOrgUnits()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (units) => {
                    this.orgUnits = units;
                    this.buildOrgTree();
                    this.buildOrgChart();
                    this.calculateStats();
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.ORG_STRUCTURE.LOAD_ERROR') });
                }
            });
    }

    private loadEmployees(): void {
        this.orgStructureService.getOrgEmployees()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (employees) => {
                    this.employees = employees;
                    this.calculateStats();
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.ORG_STRUCTURE.EMPLOYEES_LOAD_ERROR') });
                }
            });
    }

    private buildOrgTree(): void {
        const unitMap = new Map<number, TreeNode>();

        // Create nodes
        this.orgUnits.forEach(unit => {
            const typeInfo = this.getUnitTypeInfo(unit.type);
            unitMap.set(unit.id, {
                key: String(unit.id),
                label: unit.name,
                data: unit,
                icon: `pi ${typeInfo.icon}`,
                expanded: unit.type === 'company' || unit.type === 'department',
                children: [],
                styleClass: `org-node-${typeInfo.color}`
            });
        });

        // Build hierarchy
        this.orgTree = [];
        this.orgUnits.forEach(unit => {
            const node = unitMap.get(unit.id)!;
            if (unit.parent_id === null) {
                this.orgTree.push(node);
            } else {
                const parent = unitMap.get(unit.parent_id);
                if (parent) {
                    parent.children!.push(node);
                }
            }
        });
    }

    private buildOrgChart(): void {
        const buildChartNode = (unit: OrgUnit): TreeNode => {
            const children = this.orgUnits
                .filter(u => u.parent_id === unit.id)
                .map(u => buildChartNode(u));

            return {
                label: unit.name,
                type: 'department',
                expanded: unit.type === 'company' || unit.type === 'department',
                data: unit,
                children: children.length > 0 ? children : undefined,
                styleClass: `chart-node-${this.getUnitTypeInfo(unit.type).color}`
            };
        };

        const rootUnit = this.orgUnits.find(u => u.parent_id === null);
        if (rootUnit) {
            this.orgChartData = [buildChartNode(rootUnit)];
        }
    }

    private calculateStats(): void {
        const totalEmployees = this.orgUnits.reduce((sum, u) => sum + (u.employee_count || 0), 0);
        this.stats = {
            total_departments: this.orgUnits.length,
            total_employees: totalEmployees,
            total_managers: this.employees.filter(e => e.is_manager).length,
            avg_team_size: this.orgUnits.length > 0 ? Math.round(totalEmployees / this.orgUnits.length) : 0,
            max_depth: this.calculateMaxDepth(),
            vacancies: this.orgUnits.filter(u => !u.head_id && u.type !== 'company').length
        };
    }

    private calculateMaxDepth(): number {
        const getDepth = (unitId: number | null, depth: number): number => {
            const children = this.orgUnits.filter(u => u.parent_id === unitId);
            if (children.length === 0) return depth;
            return Math.max(...children.map(c => getDepth(c.id, depth + 1)));
        };
        return getDepth(null, 0);
    }

    // View
    setViewMode(mode: string): void {
        this.viewMode = mode;
    }

    // Tree events
    onNodeSelect(event: any): void {
        this.selectedNode = event.node;
        this.showUnitDetails(event.node.data);
    }

    onNodeExpand(event: any): void {
        // Can load children dynamically here if needed
    }

    // Chart events
    onChartNodeSelect(event: any): void {
        if (event.node && event.node.data) {
            this.showUnitDetails(event.node.data);
        }
    }

    // Details
    showUnitDetails(unit: OrgUnit): void {
        this.detailsUnit = unit;
        this.detailsEmployees = this.employees.filter(e => e.department_id === unit.id);
        this.showDetails = true;
    }

    closeDetails(): void {
        this.showDetails = false;
        this.detailsUnit = null;
    }

    showEmployeeDetails(employee: OrgEmployee): void {
        this.selectedEmployee = employee;
        this.displayEmployeeDialog = true;
    }

    // Employee CRUD
    private getEmptyEmployeeForm(): EmployeeForm {
        return {
            name: '',
            position: '',
            position_custom: '',
            department_id: null,
            hire_date: new Date().toISOString().split('T')[0],
            photo_url: '',
            email: '',
            phone: '',
            is_manager: false
        };
    }

    openAddEmployeeDialog(departmentId?: number): void {
        this.isEditEmployeeMode = false;
        this.useCustomPosition = false;
        this.employeeForm = this.getEmptyEmployeeForm();
        if (departmentId) {
            this.employeeForm.department_id = departmentId;
        } else if (this.detailsUnit) {
            this.employeeForm.department_id = this.detailsUnit.id;
        }
        this.displayEmployeeCrudDialog = true;
    }

    openEditEmployeeDialog(employee: OrgEmployee): void {
        this.isEditEmployeeMode = true;
        const isCustomPosition = !POSITION_TITLES.includes(employee.position);
        this.useCustomPosition = isCustomPosition;

        this.employeeForm = {
            id: employee.id,
            name: employee.name,
            position: isCustomPosition ? '' : employee.position,
            position_custom: isCustomPosition ? employee.position : '',
            department_id: employee.department_id,
            hire_date: employee.hire_date,
            photo_url: employee.photo_url || '',
            email: employee.email || '',
            phone: employee.phone || '',
            is_manager: employee.is_manager
        };
        this.displayEmployeeCrudDialog = true;
    }

    toggleCustomPosition(): void {
        this.useCustomPosition = !this.useCustomPosition;
        if (this.useCustomPosition) {
            this.employeeForm.position = '';
        } else {
            this.employeeForm.position_custom = '';
        }
    }

    saveEmployee(): void {
        const position = this.useCustomPosition
            ? this.employeeForm.position_custom
            : this.employeeForm.position;

        if (!this.employeeForm.name || !position || !this.employeeForm.department_id) {
            this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.ORG_STRUCTURE.FILL_REQUIRED') });
            return;
        }

        const department = this.orgUnits.find(u => u.id === this.employeeForm.department_id);

        if (this.isEditEmployeeMode && this.employeeForm.id) {
            // Update existing employee
            const index = this.employees.findIndex(e => e.id === this.employeeForm.id);
            if (index !== -1) {
                this.employees[index] = {
                    ...this.employees[index],
                    name: this.employeeForm.name,
                    position: position!,
                    department_id: this.employeeForm.department_id,
                    department_name: department?.name || '',
                    hire_date: this.employeeForm.hire_date,
                    photo_url: this.employeeForm.photo_url,
                    email: this.employeeForm.email,
                    phone: this.employeeForm.phone,
                    is_manager: this.employeeForm.is_manager
                };
            }
            this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.ORG_STRUCTURE.EMPLOYEE_SAVED') });
        } else {
            // Create new employee
            const newEmployee: OrgEmployee = {
                id: Math.max(...this.employees.map(e => e.id), 0) + 1,
                name: this.employeeForm.name,
                position: position!,
                department_id: this.employeeForm.department_id,
                department_name: department?.name || '',
                hire_date: this.employeeForm.hire_date,
                photo_url: this.employeeForm.photo_url,
                email: this.employeeForm.email,
                phone: this.employeeForm.phone,
                is_manager: this.employeeForm.is_manager
            };
            this.employees.push(newEmployee);

            // Update department employee count
            if (department) {
                department.employee_count++;
            }

            this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.ORG_STRUCTURE.EMPLOYEE_ADDED') });
        }

        // Refresh details panel
        if (this.detailsUnit) {
            this.detailsEmployees = this.employees.filter(e => e.department_id === this.detailsUnit!.id);
        }
        this.calculateStats();
        this.displayEmployeeCrudDialog = false;
    }

    deleteEmployee(employee: OrgEmployee): void {
        const index = this.employees.findIndex(e => e.id === employee.id);
        if (index !== -1) {
            this.employees.splice(index, 1);

            // Update department employee count
            const department = this.orgUnits.find(u => u.id === employee.department_id);
            if (department && department.employee_count > 0) {
                department.employee_count--;
            }

            // Refresh details panel
            if (this.detailsUnit) {
                this.detailsEmployees = this.employees.filter(e => e.department_id === this.detailsUnit!.id);
            }
            this.calculateStats();
            this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.ORG_STRUCTURE.EMPLOYEE_DELETED') });
        }
    }

    onPhotoUpload(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // In a real app, this would upload to server and get URL
            // For now, create a local object URL
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.employeeForm.photo_url = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // Unit CRUD
    openNewUnitDialog(parentUnit?: OrgUnit): void {
        this.isEditMode = false;
        this.unitForm = {
            type: parentUnit ? this.getChildType(parentUnit.type) : 'department',
            parent_id: parentUnit?.id || null,
            is_active: true,
            employee_count: 0
        };
        this.displayDepartmentDialog = true;
    }

    openEditUnitDialog(unit: OrgUnit): void {
        this.isEditMode = true;
        this.selectedUnit = unit;
        this.unitForm = { ...unit };
        this.displayDepartmentDialog = true;
    }

    saveUnit(): void {
        if (!this.unitForm.name || !this.unitForm.code) {
            this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.ORG_STRUCTURE.FILL_REQUIRED') });
            return;
        }

        if (this.isEditMode && this.selectedUnit) {
            const index = this.orgUnits.findIndex(u => u.id === this.selectedUnit!.id);
            if (index !== -1) {
                this.orgUnits[index] = { ...this.orgUnits[index], ...this.unitForm } as OrgUnit;
            }
            this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.ORG_STRUCTURE.DEPARTMENT_UPDATED') });
        } else {
            const newUnit: OrgUnit = {
                id: Math.max(...this.orgUnits.map(u => u.id)) + 1,
                name: this.unitForm.name!,
                code: this.unitForm.code!,
                type: this.unitForm.type as OrgUnitType,
                parent_id: this.unitForm.parent_id || null,
                employee_count: 0,
                is_active: true,
                created_at: new Date().toISOString()
            };
            this.orgUnits.push(newUnit);
            this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.ORG_STRUCTURE.DEPARTMENT_ADDED') });
        }

        this.buildOrgTree();
        this.buildOrgChart();
        this.calculateStats();
        this.displayDepartmentDialog = false;
    }

    private getChildType(parentType: OrgUnitType): OrgUnitType {
        const hierarchy: Record<OrgUnitType, OrgUnitType> = {
            company: 'department',
            branch: 'department',
            division: 'department',
            department: 'section',
            section: 'group',
            group: 'team',
            team: 'team'
        };
        return hierarchy[parentType];
    }

    // Helpers
    getUnitTypeInfo(type: OrgUnitType): { label: string; icon: string; color: string } {
        return this.orgUnitTypes.find(t => t.value === type) || { label: type, icon: 'pi-folder', color: 'gray' };
    }

    getParentUnit(unit: OrgUnit): OrgUnit | undefined {
        return this.orgUnits.find(u => u.id === unit.parent_id);
    }

    getChildUnits(unit: OrgUnit): OrgUnit[] {
        return this.orgUnits.filter(u => u.parent_id === unit.id);
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('ru-RU');
    }

    getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    getAvatarColor(id: number): string {
        return ORG_COLORS[id % ORG_COLORS.length];
    }
}
