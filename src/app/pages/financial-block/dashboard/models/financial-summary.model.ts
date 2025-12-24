// Модели для агрегированных данных финансового блока

export interface DebitCreditSummary {
    totalDebit: number;
    totalCredit: number;
    balance: number;
    transactionsCount: number;
    pendingCount: number;
}

export interface InvestmentSummary {
    totalDebit: number;
    totalCredit: number;
    balance: number;
    projectsCount: number;
    inProgressCount: number;
    completedCount: number;
}

export interface RepairCostsSummary {
    totalPlannedCost: number;
    totalActualCost: number;
    costDifference: number;
    repairsCount: number;
    inProgressCount: number;
    completedCount: number;
}

export interface ProcurementSummary {
    totalAmount: number;
    procurementsCount: number;
    pendingCount: number;
    inProgressCount: number;
    deliveredCount: number;
    deliveredAmount: number;
}

export interface KpiSummary {
    overallKpi: number;
    criticalCount: number;
    warningCount: number;
    completedCount: number;
    totalCount: number;
}

export interface SalarySummary {
    totalFOT: number;
    totalNetPay: number;
    averageSalary: number;
    totalDeductions: number;
    employeesCount: number;
    paidCount: number;
    pendingAmount: number;
}

export interface FinancialDashboardData {
    debitCredit: DebitCreditSummary;
    investment: InvestmentSummary;
    repairCosts: RepairCostsSummary;
    procurement: ProcurementSummary;
    kpi: KpiSummary;
    salary: SalarySummary;
    lastUpdated: Date;
}

export interface ModuleCard {
    title: string;
    icon: string;
    route: string;
    metrics: MetricItem[];
    color: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: number;
}

export interface MetricItem {
    label: string;
    value: number | string;
    format?: 'currency' | 'number' | 'percent';
    color?: 'success' | 'warning' | 'danger' | 'info';
}
