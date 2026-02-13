// Org Structure - Организационная структура

export interface OrgUnit {
    id: number;
    name: string;
    code: string;
    type: OrgUnitType;
    parent_id: number | null;
    head_id?: number;
    head_name?: string;
    head_position?: string;
    head_photo?: string;
    employee_count: number;
    budget?: number;
    location?: string;
    description?: string;
    is_active: boolean;
    created_at: string;
    children?: OrgUnit[];
    level?: number;
    expanded?: boolean;
}

export interface OrgEmployee {
    id: number;
    name: string;
    position: string;
    department_id: number;
    department_name: string;
    email?: string;
    phone?: string;
    photo?: string;
    photo_url?: string;
    manager_id?: number;
    manager_name?: string;
    hire_date: string;
    is_manager: boolean;
    subordinates_count: number;
    direct_reports?: OrgEmployee[];
}

export interface OrgChartNode {
    id: number;
    name: string;
    title: string;
    type: 'department' | 'employee';
    photo?: string;
    email?: string;
    phone?: string;
    employee_count?: number;
    children?: OrgChartNode[];
    expanded?: boolean;
    styleClass?: string;
}

export interface OrgStats {
    total_departments: number;
    total_employees: number;
    total_managers: number;
    avg_team_size: number;
    max_depth: number;
    vacancies: number;
}

export interface DepartmentDetails {
    id: number;
    name: string;
    code: string;
    type: OrgUnitType;
    head: OrgEmployee | null;
    employees: OrgEmployee[];
    sub_departments: OrgUnit[];
    parent: OrgUnit | null;
    budget?: number;
    location?: string;
    description?: string;
    created_at: string;
    stats: {
        total_employees: number;
        managers: number;
        avg_tenure_months: number;
    };
}

// Types
export type OrgUnitType =
    | 'company'        // Компания
    | 'branch'         // Филиал
    | 'division'       // Дивизион
    | 'department'     // Департамент
    | 'section'        // Отдел
    | 'group'          // Группа
    | 'team';          // Команда

// Constants
export const ORG_UNIT_TYPES: { value: OrgUnitType; label: string; icon: string; color: string }[] = [
    { value: 'company', label: 'Компания', icon: 'pi-building', color: 'purple' },
    { value: 'branch', label: 'Филиал', icon: 'pi-map-marker', color: 'blue' },
    { value: 'division', label: 'Дивизион', icon: 'pi-th-large', color: 'cyan' },
    { value: 'department', label: 'Департамент', icon: 'pi-sitemap', color: 'green' },
    { value: 'section', label: 'Отдел', icon: 'pi-users', color: 'orange' },
    { value: 'group', label: 'Группа', icon: 'pi-user-plus', color: 'yellow' },
    { value: 'team', label: 'Команда', icon: 'pi-user', color: 'gray' }
];

export const ORG_COLORS: string[] = [
    '#8b5cf6', // purple
    '#3b82f6', // blue
    '#06b6d4', // cyan
    '#22c55e', // green
    '#f97316', // orange
    '#eab308', // yellow
    '#6b7280', // gray
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f43f5e'  // rose
];
