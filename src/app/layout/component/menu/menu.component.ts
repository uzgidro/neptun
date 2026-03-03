import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuitemComponent } from '../menuitem/menuitem.component';
import { WeatherWidget } from '@/pages/dashboard/components/weather/weather.widget';
import { MenuItems } from '@/core/interfaces/menuitems';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, MenuitemComponent, RouterModule, WeatherWidget],
    templateUrl: 'menu.component.html'
})
export class MenuComponent implements OnInit {
    model: MenuItems[] = [];
    private translate = inject(TranslateService);

    ngOnInit() {
        this.buildMenu();
        this.translate.onLangChange.subscribe(() => {
            this.buildMenu();
        });
    }

    private t(key: string): string {
        return this.translate.instant(key);
    }

    private buildMenu() {
        this.model = [
            {
                items: [
                    {
                        label: this.t('MENU.HOME'),
                        routerLink: ['/dashboard']
                    },
                    {
                        label: this.t('MENU.OPERATIONAL_MONITORING'),
                        routerLink: ['/monitoring']
                    },
                    {
                        label: this.t('MENU.SITUATION_CENTER'),
                        role: ['rais', 'sc'],
                        items: [
                            {
                                label: this.t('MENU.GES_INFO'),
                                role: ['rais', 'sc'],
                                items: [
                                    {
                                        label: this.t('MENU.GES'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/viewer'],
                                        queryParams: { type: 'production' },
                                        routerLinkActiveOptions: { queryParams: 'exact' }
                                    },
                                    {
                                        label: this.t('MENU.SMALL_GES'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/viewer'],
                                        queryParams: { type: 'minimicro' },
                                        routerLinkActiveOptions: { queryParams: 'exact' }
                                    },
                                    {
                                        label: this.t('MENU.SUN'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/viewer'],
                                        queryParams: { type: 'sun' },
                                        routerLinkActiveOptions: { queryParams: 'exact' }
                                    },
                                    {
                                        label: this.t('MENU.EMERGENCY_SHUTDOWN'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/shutdowns']
                                    },
                                    {
                                        label: this.t('MENU.DISCHARGE'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/discharges']
                                    }
                                ]
                            },
                            {
                                label: this.t('MENU.RESERVOIR_INFO'),
                                role: ['rais', 'sc'],
                                items: [
                                    {
                                        label: this.t('MENU.RESERVOIR_SUMMARY'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/reservoir-summary']
                                    },
                                    {
                                        label: this.t('MENU.RESERVOIR_SUMMARY_PDF'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/reservoir-summary/pdf']
                                    },
                                    {
                                        label: this.t('MENU.RESERVOIR_SUMMARY_HOURLY'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/reservoir-summary-hourly']
                                    },
                                    {
                                        label: this.t('MENU.HYDRAULIC_STRUCTURES'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/reservoir-device']
                                    },
                                    {
                                        label: this.t('MENU.SNOW_COVER'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/snow-cover']
                                    }
                                ]
                            },
                            {
                                label: this.t('MENU.OTHER_INFO'),
                                role: ['rais', 'sc'],
                                items: [
                                    {
                                        label: this.t('MENU.EARTHQUAKE'),
                                        role: ['rais', 'sc'],
                                        url: 'https://soep.uz/',
                                        target: '_blank'
                                    },
                                    {
                                        label: this.t('MENU.INCIDENTS'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/incidents']
                                    },
                                    {
                                        label: this.t('MENU.VISITS'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/visits']
                                    }
                                ]
                            },
                            { label: this.t('MENU.CATEGORIES'), role: ['sc'], routerLink: ['/categories'] },
                            { label: this.t('MENU.FILES'), role: ['sc'], routerLink: ['/files'] }
                        ]
                    },
                    {
                        label: this.t('MENU.HRM'),
                        role: ['hrm_admin', 'hrm_manager', 'hrm_employee', 'rais'],
                        items: [
                            { label: this.t('HRM.MENU.DASHBOARD'), icon: 'pi pi-home', role: ['hrm_admin', 'hrm_manager', 'hrm_employee', 'rais'], routerLink: ['/hrm/dashboard'] },
                            { label: this.t('HRM.MENU.MY_CABINET'), icon: 'pi pi-user', routerLink: ['/hrm/my-cabinet'] },
                            { label: this.t('HRM.MENU.PERSONNEL_RECORDS'), role: ['hrm_admin', 'hrm_manager', 'hrm_employee', 'rais'], routerLink: ['/hrm/personnel-records'] },
                            { label: this.t('HRM.MENU.VACATION_MANAGEMENT'), role: ['hrm_admin', 'hrm_manager', 'hrm_employee', 'rais'], routerLink: ['/hrm/vacations'] },
                            { label: this.t('HRM.MENU.SALARY_MANAGEMENT'), role: ['hrm_admin', 'hrm_manager', 'hrm_employee', 'rais'], routerLink: ['/hrm/salary'] },
                            { label: this.t('HRM.MENU.RECRUITING'), role: ['hrm_admin', 'hrm_manager', 'hrm_employee', 'rais'], routerLink: ['/hrm/recruiting'] },
                            { label: this.t('HRM.MENU.TRAINING'), role: ['hrm_admin', 'hrm_manager', 'hrm_employee', 'rais'], routerLink: ['/hrm/training'] },
                            { label: this.t('HRM.MENU.COMPETENCY_ASSESSMENT'), role: ['hrm_admin', 'hrm_manager', 'hrm_employee', 'rais'], routerLink: ['/hrm/competency'] },
                            { label: this.t('HRM.MENU.PERFORMANCE_MANAGEMENT'), role: ['hrm_admin', 'hrm_manager', 'hrm_employee', 'rais'], routerLink: ['/hrm/performance'] },
                            { label: this.t('HRM.MENU.ANALYTICS'), role: ['hrm_admin', 'hrm_manager', 'hrm_employee', 'rais'], routerLink: ['/hrm/analytics'] },
                            { label: this.t('HRM.MENU.TIMESHEET'), icon: 'pi pi-calendar', role: ['hrm_admin', 'hrm_manager', 'hrm_employee', 'rais'], routerLink: ['/hrm/timesheet'] },
                            { label: this.t('HRM.MENU.HR_DOCUMENTS'), icon: 'pi pi-file', role: ['hrm_admin', 'hrm_manager', 'hrm_employee', 'rais'], routerLink: ['/hrm/documents'] },
                            { label: this.t('HRM.MENU.ACCESS_CONTROL'), icon: 'pi pi-lock', role: ['hrm_admin', 'hrm_manager'], routerLink: ['/hrm/access-control'] },
                            { label: this.t('HRM.MENU.ORG_STRUCTURE'), icon: 'pi pi-sitemap', role: ['hrm_admin', 'hrm_manager', 'hrm_employee', 'rais'], routerLink: ['/hrm/org-structure'] },
                            { label: this.t('MENU.EMPLOYEES'), role: ['hrm_admin', 'hrm_manager'], routerLink: ['/employees'] },
                            { label: this.t('MENU.POSITIONS'), role: ['hrm_admin', 'hrm_manager'], routerLink: ['/positions'] },
                            { label: this.t('MENU.DEPARTMENTS'), role: ['hrm_admin', 'hrm_manager'], routerLink: ['/departments'] },
                            { label: this.t('MENU.USERS'), role: ['admin'], routerLink: ['/users'] },
                            { label: this.t('MENU.ROLES'), role: ['admin'], routerLink: ['/roles'] }
                        ]
                    },
                    {
                        label: this.t('MENU.INVESTMENT_BLOCK'),
                        role: ['rais', 'investment'],
                        items: [
                            { label: this.t('MENU.ACTIVE_PHASE_PROJECTS'), role: ['rais', 'investment'], routerLink: ['/invest-active'] },
                            {
                                label: this.t('MENU.PERSPECTIVE_PROJECTS'),
                                role: ['rais', 'investment'],
                                items: [
                                    { label: this.t('MENU.OWN_FUNDS'), role: ['rais', 'investment'], routerLink: ['/invest-perspective'], queryParams: { type_id: 1 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                                    { label: this.t('MENU.PRIVATE_INVESTMENTS'), role: ['rais', 'investment'], routerLink: ['/invest-perspective'], queryParams: { type_id: 2 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                                    { label: this.t('MENU.STATE_GUARANTEE_CREDITS'), role: ['rais', 'investment'], routerLink: ['/invest-perspective'], queryParams: { type_id: 3 }, routerLinkActiveOptions: { queryParams: 'exact' } }
                                ]
                            }
                        ]
                    },
                    {
                        label: this.t('MENU.FINANCIAL'),
                        role: ['rais'],
                        items: [
                            { label: this.t('MENU.GENERAL_DASHBOARD'), role: ['rais'], routerLink: ['/financial-dashboard'] },
                            { label: this.t('MENU.DEBIT_CREDIT'), role: ['rais'], routerLink: ['/debit-credit'] },
                            { label: this.t('MENU.REPAIR_COSTS'), role: ['rais'], routerLink: ['/repair-costs'] },
                            { label: this.t('MENU.PROCUREMENT'), role: ['rais'], routerLink: ['/procurement'] },
                            { label: this.t('MENU.KPI'), role: ['rais'], routerLink: ['/kpi'] },
                            { label: this.t('MENU.SALARY'), role: ['rais'], routerLink: ['/salary'] }
                        ]
                    },
                    {
                        label: this.t('MENU.PLANNING'),
                        role: ['rais', 'assistant', 'sc'],
                        items: [
                            { label: this.t('MENU.PLANNING_EVENTS'), role: ['rais', 'assistant'], routerLink: ['/planning/events'] },
                            { label: this.t('MENU.CHAIRMAN_RECEPTION'), role: ['rais', 'assistant', 'sc'], routerLink: ['/planning/reception'] }
                        ]
                    },
                    {
                        label: this.t('MENU.CHANCELLERY'),
                        role: ['rais', 'chancellery'],
                        items: [
                            { label: this.t('MENU.CHANCELLERY_PENDING_SIGNATURES'), icon: 'pi pi-pen-to-square', role: ['rais', 'chancellery'], routerLink: ['/chancellery/pending-signatures'] },
                            { label: this.t('MENU.CHANCELLERY_ORDERS'), role: ['rais', 'chancellery'], routerLink: ['/chancellery/orders'] },
                            { label: this.t('MENU.CHANCELLERY_REPORTS'), role: ['rais', 'chancellery'], routerLink: ['/chancellery/reports'] },
                            { label: this.t('MENU.CHANCELLERY_LETTERS'), role: ['rais', 'chancellery'], routerLink: ['/chancellery/letters'] },
                            { label: this.t('MENU.CHANCELLERY_INSTRUCTIONS'), role: ['rais', 'chancellery'], routerLink: ['/chancellery/instructions'] }
                        ]
                    },
                    {
                        label: this.t('MENU.LEGAL_LIBRARY'),
                        items: [
                            { label: this.t('MENU.LEX_SEARCH'), icon: 'pi pi-globe', routerLink: ['/lex-search'] },
                            { label: this.t('MENU.LEGAL_LIBRARY_ALL'), routerLink: ['/legal-documents'], routerLinkActiveOptions: { exact: true, queryParams: 'exact' } },
                            { label: this.t('MENU.LEGAL_LIBRARY_LAWS'), routerLink: ['/legal-documents'], queryParams: { type_id: 1 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: this.t('MENU.LEGAL_LIBRARY_PRESIDENT_DECREES'), routerLink: ['/legal-documents'], queryParams: { type_id: 2 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: this.t('MENU.LEGAL_LIBRARY_PRESIDENT_RESOLUTIONS'), routerLink: ['/legal-documents'], queryParams: { type_id: 3 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: this.t('MENU.LEGAL_LIBRARY_PRESIDENT_ORDERS'), routerLink: ['/legal-documents'], queryParams: { type_id: 4 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: this.t('MENU.LEGAL_LIBRARY_GOVT_RESOLUTIONS'), routerLink: ['/legal-documents'], queryParams: { type_id: 5 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: this.t('MENU.LEGAL_LIBRARY_CABINET_ORDERS'), routerLink: ['/legal-documents'], queryParams: { type_id: 6 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: this.t('MENU.LEGAL_LIBRARY_DEPT_ACTS'), routerLink: ['/legal-documents'], queryParams: { type_id: 7 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: this.t('MENU.LEGAL_LIBRARY_LEGISLATION'), role: ['rais'], routerLink: ['/legal-documents'], queryParams: { type_id: 8 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: this.t('MENU.LEGAL_LIBRARY_OTHER'), routerLink: ['/legal-documents'], queryParams: { type_id: 9 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: this.t('MENU.LEGAL_LIBRARY_UHE_ORDERS'), routerLink: ['/legal-documents'], queryParams: { type_id: 10 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: this.t('MENU.LEGAL_LIBRARY_UHE_PROTOCOLS'), routerLink: ['/legal-documents'], queryParams: { type_id: 11 }, routerLinkActiveOptions: { queryParams: 'exact' } }
                        ]
                    },
                    { label: this.t('MENU.CALLS'), role: ['rais'], routerLink: ['/calls'] },
                    { label: this.t('MENU.PRESS_SERVICE'), routerLink: ['/uzgidro-news'] }
                ]
            }
        ];
    }
}
