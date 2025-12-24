import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
    DebitCreditSummary,
    InvestmentSummary,
    RepairCostsSummary,
    ProcurementSummary,
    KpiSummary,
    SalarySummary,
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

    // Observables для подписки
    dashboardData$ = this.dashboardData.asObservable();
    debitCreditData$ = this.debitCreditData.asObservable();
    investmentData$ = this.investmentData.asObservable();
    repairCostsData$ = this.repairCostsData.asObservable();
    procurementData$ = this.procurementData.asObservable();
    kpiData$ = this.kpiData.asObservable();
    salaryData$ = this.salaryData.asObservable();

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

    private updateDashboard(): void {
        const aggregated: FinancialDashboardData = {
            debitCredit: this.debitCreditData.getValue(),
            investment: this.investmentData.getValue(),
            repairCosts: this.repairCostsData.getValue(),
            procurement: this.procurementData.getValue(),
            kpi: this.kpiData.getValue(),
            salary: this.salaryData.getValue(),
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

        return dc.totalCredit + inv.totalCredit + repair.totalActualCost + proc.deliveredAmount + salary.totalNetPay;
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

        return [
            {
                title: 'Дебит/Кредит',
                icon: 'pi pi-wallet',
                route: '/debit-credit',
                color: '#3B82F6',
                metrics: [
                    { label: 'Дебит', value: dc.totalDebit, format: 'currency', color: 'success' },
                    { label: 'Кредит', value: dc.totalCredit, format: 'currency', color: 'danger' },
                    { label: 'Баланс', value: dc.balance, format: 'currency', color: dc.balance >= 0 ? 'success' : 'danger' }
                ]
            },
            {
                title: 'Инвестиции',
                icon: 'pi pi-chart-line',
                route: '/investment',
                color: '#10B981',
                metrics: [
                    { label: 'Дебит', value: inv.totalDebit, format: 'currency', color: 'success' },
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
            }
        ];
    }

    // Загрузка начальных данных (вызывается при старте)
    loadInitialData(): void {
        // Данные Дебит/Кредит (из debit-credit модуля)
        this.updateDebitCredit({
            totalDebit: 525000,
            totalCredit: 532000,
            balance: -7000,
            transactionsCount: 8,
            pendingCount: 2
        });

        // Данные Инвестиции
        this.updateInvestment({
            totalDebit: 0,
            totalCredit: 0,
            balance: 0,
            projectsCount: 0,
            inProgressCount: 0,
            completedCount: 0
        });

        // Данные Ремонт
        this.updateRepairCosts({
            totalPlannedCost: 0,
            totalActualCost: 0,
            costDifference: 0,
            repairsCount: 0,
            inProgressCount: 0,
            completedCount: 0
        });

        // Данные Закупки
        this.updateProcurement({
            totalAmount: 0,
            procurementsCount: 0,
            pendingCount: 0,
            inProgressCount: 0,
            deliveredCount: 0,
            deliveredAmount: 0
        });

        // Данные KPI
        this.updateKpi({
            overallKpi: 0,
            criticalCount: 0,
            warningCount: 0,
            completedCount: 0,
            totalCount: 0
        });

        // Данные ЗП
        this.updateSalary({
            totalFOT: 0,
            totalNetPay: 0,
            averageSalary: 0,
            totalDeductions: 0,
            employeesCount: 0,
            paidCount: 0,
            pendingAmount: 0
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
            lastUpdated: new Date()
        };
    }

    private getEmptyDebitCredit(): DebitCreditSummary {
        return { totalDebit: 0, totalCredit: 0, balance: 0, transactionsCount: 0, pendingCount: 0 };
    }

    private getEmptyInvestment(): InvestmentSummary {
        return { totalDebit: 0, totalCredit: 0, balance: 0, projectsCount: 0, inProgressCount: 0, completedCount: 0 };
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
}
