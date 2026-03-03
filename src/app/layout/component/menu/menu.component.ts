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
                        items: [
                            {
                                label: this.t('MENU.GES_INFO'),
                                items: [
                                    {
                                        label: this.t('MENU.GES'),
                                        routerLink: ['/viewer'],
                                        queryParams: { type: 'production' },
                                        routerLinkActiveOptions: { queryParams: 'exact' }
                                    },
                                    {
                                        label: this.t('MENU.SMALL_GES'),
                                        routerLink: ['/viewer'],
                                        queryParams: { type: 'minimicro' },
                                        routerLinkActiveOptions: { queryParams: 'exact' }
                                    },
                                    {
                                        label: this.t('MENU.EMERGENCY_SHUTDOWN'),
                                        routerLink: ['/shutdowns']
                                    },
                                    {
                                        label: this.t('MENU.DISCHARGE'),
                                        routerLink: ['/discharges']
                                    }
                                ]
                            },
                            {
                                label: this.t('MENU.RESERVOIR_INFO'),
                                items: [
                                    {
                                        label: this.t('MENU.RESERVOIR_SUMMARY'),
                                        routerLink: ['/reservoir-summary']
                                    },
                                    {
                                        label: this.t('MENU.RESERVOIR_SUMMARY_PDF'),
                                        routerLink: ['/reservoir-summary/pdf']
                                    },
                                    {
                                        label: this.t('MENU.RESERVOIR_SUMMARY_HOURLY'),
                                        routerLink: ['/reservoir-summary-hourly']
                                    },
                                    {
                                        label: this.t('MENU.HYDRAULIC_STRUCTURES'),
                                        routerLink: ['/reservoir-device']
                                    },
                                ]
                            },
                            {
                                label: this.t('MENU.OTHER_INFO'),
                                items: [
                                    {
                                        label: this.t('MENU.INCIDENTS'),
                                        routerLink: ['/incidents']
                                    },
                                    {
                                        label: this.t('MENU.VISITS'),
                                        routerLink: ['/visits']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        label: this.t('MENU.HRM'),
                        items: [
                            { label: this.t('HRM.MENU.DASHBOARD'), icon: 'pi pi-home', routerLink: ['/hrm/dashboard'] },
                            { label: this.t('HRM.MENU.MY_CABINET'), icon: 'pi pi-user', routerLink: ['/hrm/my-cabinet'] },
                            { label: this.t('HRM.MENU.PERSONNEL_RECORDS'), routerLink: ['/hrm/personnel-records'] },
                            { label: this.t('HRM.MENU.VACATION_MANAGEMENT'), routerLink: ['/hrm/vacations'] },
                            { label: this.t('HRM.MENU.SALARY_MANAGEMENT'), routerLink: ['/hrm/salary'] },
                            { label: this.t('HRM.MENU.RECRUITING'), routerLink: ['/hrm/recruiting'] },
                            { label: this.t('HRM.MENU.TRAINING'), routerLink: ['/hrm/training'] },
                            { label: this.t('HRM.MENU.COMPETENCY_ASSESSMENT'), routerLink: ['/hrm/competency'] },
                            { label: this.t('HRM.MENU.PERFORMANCE_MANAGEMENT'), routerLink: ['/hrm/performance'] },
                            { label: this.t('HRM.MENU.ANALYTICS'), routerLink: ['/hrm/analytics'] },
                            { label: this.t('HRM.MENU.TIMESHEET'), icon: 'pi pi-calendar', routerLink: ['/hrm/timesheet'] },
                            { label: this.t('HRM.MENU.HR_DOCUMENTS'), icon: 'pi pi-file', routerLink: ['/hrm/documents'] },
                            { label: this.t('HRM.MENU.ACCESS_CONTROL'), icon: 'pi pi-lock', routerLink: ['/hrm/access-control'] },
                            { label: this.t('HRM.MENU.ORG_STRUCTURE'), icon: 'pi pi-sitemap', routerLink: ['/hrm/org-structure'] },
                            { label: this.t('MENU.EMPLOYEES'), routerLink: ['/employees'] },
                            { label: this.t('MENU.POSITIONS'), routerLink: ['/positions'] },
                            { label: this.t('MENU.DEPARTMENTS'), routerLink: ['/departments'] },
                            { label: this.t('MENU.USERS'), routerLink: ['/users'] },
                            { label: this.t('MENU.ROLES'), routerLink: ['/roles'] }
                        ]
                    },
                    {
                        label: this.t('MENU.INVESTMENT_BLOCK'),
                        items: [
                            { label: this.t('MENU.ACTIVE_PHASE_PROJECTS'), routerLink: ['/invest-active'] },
                            {
                                label: this.t('MENU.PERSPECTIVE_PROJECTS'),
                                items: [
                                    { label: this.t('MENU.OWN_FUNDS'), routerLink: ['/invest-perspective'], queryParams: { type_id: 1 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                                    { label: this.t('MENU.PRIVATE_INVESTMENTS'), routerLink: ['/invest-perspective'], queryParams: { type_id: 2 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                                    { label: this.t('MENU.STATE_GUARANTEE_CREDITS'), routerLink: ['/invest-perspective'], queryParams: { type_id: 3 }, routerLinkActiveOptions: { queryParams: 'exact' } }
                                ]
                            }
                        ]
                    },
                    {
                        label: this.t('MENU.FINANCIAL'),
                        items: [
                            { label: this.t('MENU.GENERAL_DASHBOARD'), routerLink: ['/financial-dashboard'] },
                            { label: this.t('MENU.DEBIT_CREDIT'), routerLink: ['/debit-credit'] },
                            { label: this.t('MENU.REPAIR_COSTS'), routerLink: ['/repair-costs'] },
                            { label: this.t('MENU.PROCUREMENT'), routerLink: ['/procurement'] },
                            { label: this.t('MENU.KPI'), routerLink: ['/kpi'] },
                            { label: this.t('MENU.SALARY'), routerLink: ['/salary'] }
                        ]
                    },
                    {
                        label: this.t('MENU.PLANNING'),
                        items: [
                            { label: this.t('MENU.PLANNING_EVENTS'), routerLink: ['/planning/events'] },
                            { label: this.t('MENU.CHAIRMAN_RECEPTION'), routerLink: ['/planning/reception'] }
                        ]
                    },
                    {
                        label: this.t('MENU.CHANCELLERY'),
                        items: [
                            { label: this.t('MENU.CHANCELLERY_PENDING_SIGNATURES'), icon: 'pi pi-pen-to-square', routerLink: ['/chancellery/pending-signatures'] },
                            { label: this.t('MENU.CHANCELLERY_ORDERS'), routerLink: ['/chancellery/orders'] },
                            { label: this.t('MENU.CHANCELLERY_REPORTS'), routerLink: ['/chancellery/reports'] },
                            { label: this.t('MENU.CHANCELLERY_LETTERS'), routerLink: ['/chancellery/letters'] },
                            { label: this.t('MENU.CHANCELLERY_INSTRUCTIONS'), routerLink: ['/chancellery/instructions'] }
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
                            { label: this.t('MENU.LEGAL_LIBRARY_LEGISLATION'), routerLink: ['/legal-documents'], queryParams: { type_id: 8 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: this.t('MENU.LEGAL_LIBRARY_OTHER'), routerLink: ['/legal-documents'], queryParams: { type_id: 9 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: this.t('MENU.LEGAL_LIBRARY_UHE_ORDERS'), routerLink: ['/legal-documents'], queryParams: { type_id: 10 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: this.t('MENU.LEGAL_LIBRARY_UHE_PROTOCOLS'), routerLink: ['/legal-documents'], queryParams: { type_id: 11 }, routerLinkActiveOptions: { queryParams: 'exact' } }
                        ]
                    },
                    { label: this.t('MENU.CALLS'), routerLink: ['/calls'] },
                    { label: this.t('MENU.PRESS_SERVICE'), routerLink: ['/uzgidro-news'] }
                ]
            }
        ];
    }
}
