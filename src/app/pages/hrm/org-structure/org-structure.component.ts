import { Component, inject, OnInit } from '@angular/core';
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
import {
    OrgUnit,
    OrgEmployee,
    OrgStats,
    OrgUnitType,
    ORG_UNIT_TYPES,
    ORG_COLORS
} from '@/core/interfaces/hrm/org-structure';

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
    manager_id?: number | null;
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
        Tooltip
    ],
    templateUrl: './org-structure.component.html',
    styleUrl: './org-structure.component.scss'
})
export class OrgStructureComponent implements OnInit {
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
        { label: 'Дерево', value: 'tree', icon: 'pi-list' },
        { label: 'Оргчарт', value: 'chart', icon: 'pi-sitemap' },
        { label: 'Список', value: 'list', icon: 'pi-th-large' }
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

    ngOnInit(): void {
        this.loadOrgUnits();
        this.loadEmployees();
    }

    private loadOrgUnits(): void {
        this.loading = true;

        setTimeout(() => {
            this.orgUnits = this.generateMockOrgUnits();
            this.buildOrgTree();
            this.buildOrgChart();
            this.calculateStats();
            this.loading = false;
        }, 500);
    }

    private loadEmployees(): void {
        this.employees = [
            { id: 1, name: 'Абдуллаев Шавкат Рахимович', position: 'Председатель Правления', department_id: 2, department_name: 'Руководство', hire_date: '2018-01-15', is_manager: true, subordinates_count: 1250 },
            { id: 2, name: 'Каримов Бахром Тулкинович', position: 'Заместитель Председателя', department_id: 2, department_name: 'Руководство', manager_id: 1, manager_name: 'Абдуллаев Ш.Р.', hire_date: '2018-03-20', is_manager: true, subordinates_count: 200 },
            { id: 3, name: 'Рахимова Нигора Ильхомовна', position: 'Корпоративный секретарь', department_id: 3, department_name: 'Корпоративный секретариат', manager_id: 1, manager_name: 'Абдуллаев Ш.Р.', hire_date: '2015-06-01', is_manager: true, subordinates_count: 8 },
            { id: 4, name: 'Хамидов Улугбек Сардорович', position: 'Начальник службы внутреннего аудита', department_id: 5, department_name: 'Служба внутреннего аудита', manager_id: 1, manager_name: 'Абдуллаев Ш.Р.', hire_date: '2016-02-14', is_manager: true, subordinates_count: 10 },
            { id: 5, name: 'Юлдашев Фаррух Анварович', position: 'Директор Департамента эксплуатации ГЭС', department_id: 17, department_name: 'Департамент эксплуатации ГЭС', manager_id: 1, manager_name: 'Абдуллаев Ш.Р.', hire_date: '2012-01-10', is_manager: true, subordinates_count: 150 },
            { id: 6, name: 'Исмаилова Дилноза Бахтияровна', position: 'Директор Департамента цифровизации', department_id: 23, department_name: 'Департамент цифровизации и ИКТ', manager_id: 1, manager_name: 'Абдуллаев Ш.Р.', hire_date: '2019-05-15', is_manager: true, subordinates_count: 35 },
            { id: 7, name: 'Назаров Жасур Кахрамонович', position: 'Начальник Ситуационного центра', department_id: 25, department_name: 'Ситуационный центр', manager_id: 6, manager_name: 'Исмаилова Д.Б.', hire_date: '2020-08-01', is_manager: true, subordinates_count: 12 },
            { id: 8, name: 'Турсунов Алишер Рустамович', position: 'Начальник Управления человеческих ресурсов', department_id: 32, department_name: 'Управление человеческих ресурсов', manager_id: 1, manager_name: 'Абдуллаев Ш.Р.', hire_date: '2017-11-20', is_manager: true, subordinates_count: 12 },
            { id: 9, name: 'Мирзаева Гулчехра Бахромовна', position: 'Главный бухгалтер', department_id: 34, department_name: 'Департамент бухгалтерского учета', manager_id: 1, manager_name: 'Абдуллаев Ш.Р.', hire_date: '2010-03-01', is_manager: true, subordinates_count: 20 },
            { id: 10, name: 'Расулов Темур Икрамович', position: 'Директор Департамента иностранных инвестиций', department_id: 27, department_name: 'Департамент иностранных инвестиций', manager_id: 1, manager_name: 'Абдуллаев Ш.Р.', hire_date: '2014-01-15', is_manager: true, subordinates_count: 25 },
            { id: 11, name: 'Холматов Дониёр Шухратович', position: 'Специалист по AI', department_id: 24, department_name: 'Отдел внедрения ИИ', manager_id: 6, manager_name: 'Исмаилова Д.Б.', hire_date: '2022-06-01', is_manager: false, subordinates_count: 0 },
            { id: 12, name: 'Сафарова Мадина Равшановна', position: 'HR-специалист', department_id: 32, department_name: 'Управление человеческих ресурсов', manager_id: 8, manager_name: 'Турсунов А.Р.', hire_date: '2021-02-15', is_manager: false, subordinates_count: 0 }
        ];
    }

    private generateMockOrgUnits(): OrgUnit[] {
        return [
            { id: 1, name: 'АО "Узбекгидроэнерго"', code: 'UGE', type: 'company', parent_id: null, head_id: 1, head_name: 'Председатель Правления', head_position: 'Председатель Правления', employee_count: 1250, is_active: true, created_at: '2001-01-01' },
            { id: 2, name: 'Руководство', code: 'MGMT', type: 'department', parent_id: 1, employee_count: 15, is_active: true, created_at: '2001-01-01' },
            { id: 3, name: 'Служба корпоративного и стратегического консультанта - Корпоративный секретариат', code: 'CORP-SEC', type: 'section', parent_id: 1, employee_count: 8, is_active: true, created_at: '2010-01-01' },
            { id: 4, name: 'Отдел "Комплаенс-контроль" и противодействия коррупции', code: 'COMPL', type: 'section', parent_id: 1, employee_count: 6, is_active: true, created_at: '2018-01-01' },
            { id: 5, name: 'Служба внутреннего аудита', code: 'AUDIT', type: 'section', parent_id: 1, employee_count: 10, is_active: true, created_at: '2005-01-01' },
            { id: 6, name: 'Отдел охраны окружающей среды и кадастра', code: 'ENV', type: 'section', parent_id: 1, employee_count: 7, is_active: true, created_at: '2008-01-01' },
            { id: 7, name: 'Секретариат при Председателе Правления', code: 'SEC-CHR', type: 'section', parent_id: 1, employee_count: 5, is_active: true, created_at: '2001-01-01' },
            { id: 8, name: 'Руководитель Аппарата', code: 'APP-HEAD', type: 'section', parent_id: 1, employee_count: 3, is_active: true, created_at: '2001-01-01' },
            { id: 9, name: 'Информационно-аналитический отдел', code: 'INFO-AN', type: 'section', parent_id: 1, employee_count: 8, is_active: true, created_at: '2012-01-01' },
            { id: 10, name: 'Канцелярия', code: 'OFFICE', type: 'section', parent_id: 1, employee_count: 6, is_active: true, created_at: '2001-01-01' },
            { id: 11, name: 'Первый отдел', code: 'FIRST', type: 'section', parent_id: 1, employee_count: 4, is_active: true, created_at: '2001-01-01' },
            { id: 12, name: 'Пресс служба', code: 'PRESS', type: 'section', parent_id: 1, employee_count: 5, is_active: true, created_at: '2010-01-01' },
            { id: 13, name: 'Контрольный отдел', code: 'CONTROL', type: 'section', parent_id: 1, employee_count: 7, is_active: true, created_at: '2005-01-01' },
            { id: 14, name: 'Служба охраны труда и техники безопасности', code: 'SAFETY', type: 'section', parent_id: 1, employee_count: 12, is_active: true, created_at: '2001-01-01' },
            { id: 15, name: 'Управление безопасности и специальных дел', code: 'SEC-SPEC', type: 'section', parent_id: 1, employee_count: 15, is_active: true, created_at: '2005-01-01' },
            { id: 16, name: 'Отдел обеспечения информационной безопасности', code: 'INFO-SEC', type: 'section', parent_id: 1, employee_count: 8, is_active: true, created_at: '2015-01-01' },
            { id: 17, name: 'Департамент эксплуатации гидроэлектростанций', code: 'DEP-GES', type: 'department', parent_id: 1, employee_count: 150, is_active: true, created_at: '2001-01-01' },
            { id: 18, name: 'Управление по контролю за эксплуатацией ГЭС и их гидротехнических сооружений', code: 'GES-CTRL', type: 'section', parent_id: 17, employee_count: 25, is_active: true, created_at: '2001-01-01' },
            { id: 19, name: 'Управление капитального строительства', code: 'CAP-BUILD', type: 'section', parent_id: 17, employee_count: 30, is_active: true, created_at: '2001-01-01' },
            { id: 20, name: 'Департамент по организации эффективного и безопасного использования водохранилищ', code: 'DEP-WATER', type: 'department', parent_id: 1, employee_count: 45, is_active: true, created_at: '2010-01-01' },
            { id: 21, name: 'Отдел эксплуатации и организации ремонтных работ водохранилищ', code: 'WATER-REP', type: 'section', parent_id: 20, employee_count: 20, is_active: true, created_at: '2010-01-01' },
            { id: 22, name: 'Отдел модернизации и автоматизации водохранилищ', code: 'WATER-MOD', type: 'section', parent_id: 20, employee_count: 15, is_active: true, created_at: '2015-01-01' },
            { id: 23, name: 'Департамент цифровизации и внедрения ИКТ', code: 'DEP-IT', type: 'department', parent_id: 1, employee_count: 35, is_active: true, created_at: '2018-01-01' },
            { id: 24, name: 'Отдел внедрения искусственного интеллекта', code: 'AI', type: 'section', parent_id: 23, employee_count: 8, is_active: true, created_at: '2022-01-01' },
            { id: 25, name: 'Ситуационный центр', code: 'SIT-CTR', type: 'section', parent_id: 23, employee_count: 12, is_active: true, created_at: '2020-01-01' },
            { id: 26, name: 'Отдел организации эксплуатации электрических сетей и подстанций', code: 'ELEC-NET', type: 'section', parent_id: 1, employee_count: 20, is_active: true, created_at: '2005-01-01' },
            { id: 27, name: 'Департамент иностранных инвестиций', code: 'DEP-INVEST', type: 'department', parent_id: 1, employee_count: 25, is_active: true, created_at: '2012-01-01' },
            { id: 28, name: 'Управление перспективного развития и реализации проектов государственно-частного партнерства', code: 'PPP', type: 'section', parent_id: 27, employee_count: 10, is_active: true, created_at: '2015-01-01' },
            { id: 29, name: 'Управление мониторинга инвестиционных программ, контроля закупок по иностранным инвестициям', code: 'INV-MON', type: 'section', parent_id: 27, employee_count: 8, is_active: true, created_at: '2015-01-01' },
            { id: 30, name: 'Отдел локализации, расширения кооперационных связей в промышленности и инновационного развития', code: 'LOCAL', type: 'section', parent_id: 1, employee_count: 6, is_active: true, created_at: '2018-01-01' },
            { id: 31, name: 'Протокол и служба организации международных отношений', code: 'INTL', type: 'section', parent_id: 1, employee_count: 7, is_active: true, created_at: '2010-01-01' },
            { id: 32, name: 'Управление человеческих ресурсов', code: 'HR', type: 'section', parent_id: 1, employee_count: 12, is_active: true, created_at: '2001-01-01' },
            { id: 33, name: 'Департамент экономического анализа, планирования и управления рисками', code: 'DEP-ECON', type: 'department', parent_id: 1, employee_count: 18, is_active: true, created_at: '2008-01-01' },
            { id: 34, name: 'Департамент бухгалтерского учета и финансовой отчетности', code: 'DEP-ACC', type: 'department', parent_id: 1, employee_count: 20, is_active: true, created_at: '2001-01-01' },
            { id: 35, name: 'Отдел налогового учета и отчетности', code: 'TAX', type: 'section', parent_id: 34, employee_count: 8, is_active: true, created_at: '2005-01-01' },
            { id: 36, name: 'Отдел корпоративных отношений', code: 'CORP-REL', type: 'section', parent_id: 1, employee_count: 5, is_active: true, created_at: '2012-01-01' },
            { id: 37, name: 'Департамент международных финансовых отчетов', code: 'DEP-IFRS', type: 'department', parent_id: 1, employee_count: 10, is_active: true, created_at: '2015-01-01' },
            { id: 38, name: 'Отдел координации закупок', code: 'PROC', type: 'section', parent_id: 1, employee_count: 8, is_active: true, created_at: '2010-01-01' },
            { id: 39, name: 'Отдел духовно-просветительской работы', code: 'SPIRIT', type: 'section', parent_id: 1, employee_count: 4, is_active: true, created_at: '2018-01-01' },
            { id: 40, name: 'Офис трансформации и внедрения принципов ESG', code: 'ESG', type: 'section', parent_id: 1, employee_count: 6, is_active: true, created_at: '2022-01-01' },
            { id: 41, name: 'Отдел финансирования и контроля денежных потоков', code: 'FIN-CTRL', type: 'section', parent_id: 1, employee_count: 7, is_active: true, created_at: '2008-01-01' },
            { id: 42, name: 'Специалисты', code: 'SPEC', type: 'group', parent_id: 1, employee_count: 10, is_active: true, created_at: '2001-01-01' },
            { id: 43, name: 'У руководителя аппарата, по административно-хозяйственной работе', code: 'ADM-ECO', type: 'section', parent_id: 8, employee_count: 15, is_active: true, created_at: '2001-01-01' },
            { id: 44, name: 'Юридический отдел', code: 'LEGAL', type: 'section', parent_id: 1, employee_count: 8, is_active: true, created_at: '2001-01-01' }
        ];
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
        this.stats = {
            total_departments: this.orgUnits.length,
            total_employees: this.orgUnits.reduce((sum, u) => sum + u.employee_count, 0),
            total_managers: this.employees.filter(e => e.is_manager).length,
            avg_team_size: Math.round(this.orgUnits.reduce((sum, u) => sum + u.employee_count, 0) / this.orgUnits.length),
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
            manager_id: null,
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
            manager_id: employee.manager_id || null,
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
            this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Заполните обязательные поля (ФИО, должность, отдел)' });
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
                    manager_id: this.employeeForm.manager_id || undefined,
                    manager_name: this.getManagerName(this.employeeForm.manager_id),
                    hire_date: this.employeeForm.hire_date,
                    photo_url: this.employeeForm.photo_url,
                    email: this.employeeForm.email,
                    phone: this.employeeForm.phone,
                    is_manager: this.employeeForm.is_manager
                };
            }
            this.messageService.add({ severity: 'success', summary: 'Сохранено', detail: 'Данные сотрудника обновлены' });
        } else {
            // Create new employee
            const newEmployee: OrgEmployee = {
                id: Math.max(...this.employees.map(e => e.id), 0) + 1,
                name: this.employeeForm.name,
                position: position!,
                department_id: this.employeeForm.department_id,
                department_name: department?.name || '',
                manager_id: this.employeeForm.manager_id || undefined,
                manager_name: this.getManagerName(this.employeeForm.manager_id),
                hire_date: this.employeeForm.hire_date,
                photo_url: this.employeeForm.photo_url,
                email: this.employeeForm.email,
                phone: this.employeeForm.phone,
                is_manager: this.employeeForm.is_manager,
                subordinates_count: 0
            };
            this.employees.push(newEmployee);

            // Update department employee count
            if (department) {
                department.employee_count++;
            }

            this.messageService.add({ severity: 'success', summary: 'Создано', detail: 'Сотрудник добавлен' });
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
            this.messageService.add({ severity: 'success', summary: 'Удалено', detail: 'Сотрудник удалён' });
        }
    }

    private getManagerName(managerId: number | null | undefined): string | undefined {
        if (!managerId) return undefined;
        const manager = this.employees.find(e => e.id === managerId);
        return manager?.name;
    }

    getManagersForDepartment(): OrgEmployee[] {
        return this.employees.filter(e => e.is_manager);
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
            this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Заполните обязательные поля' });
            return;
        }

        if (this.isEditMode && this.selectedUnit) {
            const index = this.orgUnits.findIndex(u => u.id === this.selectedUnit!.id);
            if (index !== -1) {
                this.orgUnits[index] = { ...this.orgUnits[index], ...this.unitForm } as OrgUnit;
            }
            this.messageService.add({ severity: 'success', summary: 'Сохранено', detail: 'Подразделение обновлено' });
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
            this.messageService.add({ severity: 'success', summary: 'Создано', detail: 'Подразделение добавлено' });
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
