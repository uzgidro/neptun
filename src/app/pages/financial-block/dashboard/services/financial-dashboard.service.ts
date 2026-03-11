import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
    DebitCreditSummary,
    InvestmentSummary,
    RepairCostsSummary,
    ProcurementSummary,
    KpiSummary,
    SalarySummary,
    OtherExpensesSummary,
    FinancialDashboardData,
    ModuleCard
} from '../models/financial-summary.model';

@Injectable({
    providedIn: 'root'
})
export class FinancialDashboardService {
    private dashboardData = new BehaviorSubject<FinancialDashboardData>(this.getInitialData());

    private debitCreditData = new BehaviorSubject<DebitCreditSummary>(this.getEmptyDebitCredit());
    private investmentData = new BehaviorSubject<InvestmentSummary>(this.getEmptyInvestment());
    private repairCostsData = new BehaviorSubject<RepairCostsSummary>(this.getEmptyRepairCosts());
    private procurementData = new BehaviorSubject<ProcurementSummary>(this.getEmptyProcurement());
    private kpiData = new BehaviorSubject<KpiSummary>(this.getEmptyKpi());
    private salaryData = new BehaviorSubject<SalarySummary>(this.getEmptySalary());
    private otherExpensesData = new BehaviorSubject<OtherExpensesSummary>(this.getEmptyOtherExpenses());

    // Observables для подписки
    dashboardData$ = this.dashboardData.asObservable();
    debitCreditData$ = this.debitCreditData.asObservable();
    investmentData$ = this.investmentData.asObservable();
    repairCostsData$ = this.repairCostsData.asObservable();
    procurementData$ = this.procurementData.asObservable();
    kpiData$ = this.kpiData.asObservable();
    salaryData$ = this.salaryData.asObservable();
    otherExpensesData$ = this.otherExpensesData.asObservable();

    // Методы обновления данных из модулей
    updateDebitCredit(data: DebitCreditSummary): void {
        this.debitCreditData.next(data);
        this.updateDashboard();
    }

    updateInvestment(data: InvestmentSummary): void {
        this.investmentData.next(data);
        this.updateDashboard();
    }

    updateRepairCosts(data: RepairCostsSummary): void {
        this.repairCostsData.next(data);
        this.updateDashboard();
    }

    updateProcurement(data: ProcurementSummary): void {
        this.procurementData.next(data);
        this.updateDashboard();
    }

    updateKpi(data: KpiSummary): void {
        this.kpiData.next(data);
        this.updateDashboard();
    }

    updateSalary(data: SalarySummary): void {
        this.salaryData.next(data);
        this.updateDashboard();
    }

    updateOtherExpenses(data: OtherExpensesSummary): void {
        this.otherExpensesData.next(data);
        this.updateDashboard();
    }

    private updateDashboard(): void {
        const aggregated: FinancialDashboardData = {
            debitCredit: this.debitCreditData.getValue(),
            investment: this.investmentData.getValue(),
            repairCosts: this.repairCostsData.getValue(),
            procurement: this.procurementData.getValue(),
            kpi: this.kpiData.getValue(),
            salary: this.salaryData.getValue(),
            otherExpenses: this.otherExpensesData.getValue(),
            lastUpdated: new Date()
        };
        this.dashboardData.next(aggregated);
    }

    // Вычисляемые показатели
    getTotalIncome(): number {
        const dc = this.debitCreditData.getValue();
        const inv = this.investmentData.getValue();
        return dc.totalDebit + inv.totalDebit;
    }

    getTotalExpenses(): number {
        const dc = this.debitCreditData.getValue();
        const inv = this.investmentData.getValue();
        const repair = this.repairCostsData.getValue();
        const proc = this.procurementData.getValue();
        const salary = this.salaryData.getValue();
        const other = this.otherExpensesData.getValue();

        return dc.totalCredit + inv.totalCredit + repair.totalActualCost + proc.deliveredAmount + salary.totalNetPay + other.totalAmount;
    }

    getNetBalance(): number {
        return this.getTotalIncome() - this.getTotalExpenses();
    }

    // Получение карточек для дашборда
    getModuleCards(): ModuleCard[] {
        const dc = this.debitCreditData.getValue();
        const inv = this.investmentData.getValue();
        const repair = this.repairCostsData.getValue();
        const proc = this.procurementData.getValue();
        const kpi = this.kpiData.getValue();
        const salary = this.salaryData.getValue();
        const other = this.otherExpensesData.getValue();

        return [
            {
                title: 'Дебет/Кредит',
                icon: 'pi pi-wallet',
                route: '/debit-credit',
                color: '#3B82F6',
                metrics: [
                    { label: 'Дебет', value: dc.totalDebit, format: 'currency', color: 'success' },
                    { label: 'Кредит', value: dc.totalCredit, format: 'currency', color: 'danger' },
                    { label: 'Баланс', value: dc.balance, format: 'currency', color: dc.balance >= 0 ? 'success' : 'danger' }
                ]
            },
            {
                title: 'Инвестиции',
                icon: 'pi pi-chart-line',
                route: '/invest-perspective-projects',
                color: '#10B981',
                metrics: [
                    { label: 'Дебет', value: inv.totalDebit, format: 'currency', color: 'success' },
                    { label: 'Кредит', value: inv.totalCredit, format: 'currency', color: 'danger' },
                    { label: 'Проекты', value: inv.projectsCount, format: 'number', color: 'info' }
                ]
            },
            {
                title: 'Затраты на ремонт',
                icon: 'pi pi-wrench',
                route: '/repair-costs',
                color: '#F59E0B',
                metrics: [
                    { label: 'План', value: repair.totalPlannedCost, format: 'currency', color: 'info' },
                    { label: 'Факт', value: repair.totalActualCost, format: 'currency', color: repair.costDifference <= 0 ? 'success' : 'warning' },
                    { label: 'Ремонтов', value: repair.repairsCount, format: 'number', color: 'info' }
                ]
            },
            {
                title: 'Закупки',
                icon: 'pi pi-shopping-cart',
                route: '/procurement',
                color: '#8B5CF6',
                metrics: [
                    { label: 'Общая сумма', value: proc.totalAmount, format: 'currency', color: 'info' },
                    { label: 'Доставлено', value: proc.deliveredCount, format: 'number', color: 'success' },
                    { label: 'В процессе', value: proc.pendingCount + proc.inProgressCount, format: 'number', color: 'warning' }
                ]
            },
            {
                title: 'KPI',
                icon: 'pi pi-chart-bar',
                route: '/kpi',
                color: '#EC4899',
                metrics: [
                    { label: 'Общий KPI', value: kpi.overallKpi, format: 'percent', color: kpi.overallKpi >= 80 ? 'success' : 'warning' },
                    { label: 'Выполнено', value: kpi.completedCount, format: 'number', color: 'success' },
                    { label: 'Критично', value: kpi.criticalCount, format: 'number', color: 'danger' }
                ]
            },
            {
                title: 'Заработная плата',
                icon: 'pi pi-users',
                route: '/salary',
                color: '#06B6D4',
                metrics: [
                    { label: 'ФОТ', value: salary.totalFOT, format: 'currency', color: 'info' },
                    { label: 'К выплате', value: salary.totalNetPay, format: 'currency', color: 'warning' },
                    { label: 'Сотрудников', value: salary.employeesCount, format: 'number', color: 'info' }
                ]
            },
            {
                title: 'Прочие расходы',
                icon: 'pi pi-money-bill',
                route: '/financial-dashboard',
                color: '#F97316',
                metrics: [
                    { label: 'Общая сумма', value: other.totalAmount, format: 'currency', color: 'danger' },
                    { label: 'Записей', value: other.expensesCount, format: 'number', color: 'info' },
                    { label: 'Категорий', value: other.categories.length, format: 'number', color: 'info' }
                ]
            }
        ];
    }

    // Загрузка начальных данных (агрегация mock-данных из модулей)
    loadInitialData(): void {
        this.updateDebitCredit({
            totalDebit: 525000,
            totalCredit: 532000,
            balance: -7000,
            transactionsCount: 8,
            pendingCount: 2
        });

        this.updateInvestment({
            totalDebit: 0,
            totalCredit: 0,
            balance: 0,
            projectsCount: 0
        });

        this.updateRepairCosts({
            totalPlannedCost: 21600000,
            totalActualCost: 13000000,
            costDifference: -700000,
            repairsCount: 8,
            inProgressCount: 1,
            completedCount: 5
        });

        this.updateProcurement({
            totalAmount: 266000000,
            procurementsCount: 10,
            pendingCount: 2,
            inProgressCount: 4,
            deliveredCount: 4,
            deliveredAmount: 155000000
        });

        this.updateKpi({
            overallKpi: 93,
            criticalCount: 3,
            warningCount: 7,
            completedCount: 5,
            totalCount: 15
        });

        this.updateSalary({
            totalFOT: 138200000,
            totalNetPay: 115825300,
            averageSalary: 11582530,
            totalDeductions: 22374700,
            employeesCount: 10,
            paidCount: 7,
            pendingAmount: 5836000
        });

        this.updateOtherExpenses({
            totalAmount: 18500000,
            expensesCount: 12,
            categories: [
                { name: 'Коммунальные услуги', amount: 5200000 },
                { name: 'Транспорт', amount: 3800000 },
                { name: 'Связь и интернет', amount: 2100000 },
                { name: 'Охрана', amount: 3400000 },
                { name: 'Страхование', amount: 2500000 },
                { name: 'Разное', amount: 1500000 }
            ]
        });
    }

    // Начальные/пустые данные
    private getInitialData(): FinancialDashboardData {
        return {
            debitCredit: this.getEmptyDebitCredit(),
            investment: this.getEmptyInvestment(),
            repairCosts: this.getEmptyRepairCosts(),
            procurement: this.getEmptyProcurement(),
            kpi: this.getEmptyKpi(),
            salary: this.getEmptySalary(),
            otherExpenses: this.getEmptyOtherExpenses(),
            lastUpdated: new Date()
        };
    }

    private getEmptyDebitCredit(): DebitCreditSummary {
        return { totalDebit: 0, totalCredit: 0, balance: 0, transactionsCount: 0, pendingCount: 0 };
    }

    private getEmptyInvestment(): InvestmentSummary {
        return { totalDebit: 0, totalCredit: 0, balance: 0, projectsCount: 0 };
    }

    private getEmptyRepairCosts(): RepairCostsSummary {
        return { totalPlannedCost: 0, totalActualCost: 0, costDifference: 0, repairsCount: 0, inProgressCount: 0, completedCount: 0 };
    }

    private getEmptyProcurement(): ProcurementSummary {
        return { totalAmount: 0, procurementsCount: 0, pendingCount: 0, inProgressCount: 0, deliveredCount: 0, deliveredAmount: 0 };
    }

    private getEmptyKpi(): KpiSummary {
        return { overallKpi: 0, criticalCount: 0, warningCount: 0, completedCount: 0, totalCount: 0 };
    }

    private getEmptySalary(): SalarySummary {
        return { totalFOT: 0, totalNetPay: 0, averageSalary: 0, totalDeductions: 0, employeesCount: 0, paidCount: 0, pendingAmount: 0 };
    }

    private getEmptyOtherExpenses(): OtherExpensesSummary {
        return { totalAmount: 0, expensesCount: 0, categories: [] };
    }
}
