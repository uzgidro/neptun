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
                        label: this.t('MENU.HRM'),
                        role: ['admin', 'rais'],
                        items: [
                            { label: this.t('MENU.ORGANIZATIONS'), role: ['rais'], routerLink: ['/organizations'] },
                            { label: this.t('MENU.BIRTHDAYS'), role: ['rais'], routerLink: ['/birthdays'] },
                            { label: this.t('MENU.PERSONNEL_LOSS'), role: ['rais'], routerLink: ['/personnel-loss'] },
                            { label: this.t('MENU.EMPLOYEES'), role: ['admin'], routerLink: ['/employees'] },
                            { label: this.t('MENU.POSITIONS'), role: ['admin'], routerLink: ['/positions'] },
                            { label: this.t('MENU.DEPARTMENTS'), role: ['admin'], routerLink: ['/departments'] },
                            { label: this.t('MENU.USERS'), role: ['admin'], routerLink: ['/users'] },
                            { label: this.t('MENU.ROLES'), role: ['admin'], routerLink: ['/roles'] }
                        ]
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
                                        role: ['rais', 'sc']
                                    },
                                    {
                                        label: this.t('MENU.SMALL_GES'),
                                        role: ['rais', 'sc']
                                    },
                                    {
                                        label: this.t('MENU.SUN'),
                                        role: ['rais', 'sc']
                                    },
                                    {
                                        label: this.t('MENU.EMERGENCY_SHUTDOWN'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/shutdowns']
                                    },
                                    {
                                        label: this.t('MENU.PRODUCTION'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/viewer'],
                                        queryParams: { type: 'production' },
                                        routerLinkActiveOptions: { queryParams: 'exact' }
                                    },
                                    {
                                        label: this.t('MENU.DISCHARGE'),
                                        role: ['rais', 'sc'],
                                        routerLink: ['/discharge']
                                    }
                                ]
                            },
                            {
                                label: this.t('MENU.RESERVOIR_INFO'),
                                role: ['rais', 'sc'],
                                items: [
                                    {
                                        label: this.t('MENU.RESERVOIRS'),
                                        role: ['rais', 'sc']
                                    },
                                    {
                                        label: this.t('MENU.MODSNOW'),
                                        role: ['rais', 'sc']
                                    },
                                    {
                                        label: this.t('MENU.FILTRATION'),
                                        role: ['rais', 'sc']
                                    }
                                ]
                            },
                            {
                                label: this.t('MENU.OTHER_INFO'),
                                role: ['rais', 'sc'],
                                items: [
                                    {
                                        label: this.t('MENU.EVENTS'),
                                        role: ['rais', 'sc']
                                    },
                                    {
                                        label: this.t('MENU.EARTHQUAKE'),
                                        role: ['rais', 'sc'],
                                        url: 'https://soep.uz/',
                                        target: '_blank'
                                    }
                                ]
                            },
                            {
                                label: this.t('MENU.CONSTRUCTION'),
                                role: ['rais', 'sc'],
                                routerLink: ['/construction']
                            },
                            {
                                label: this.t('MENU.RESERVOIRS'),
                                role: ['rais', 'sc'],
                                routerLink: ['/reservoir']
                            },
                            { label: this.t('MENU.CATEGORIES'), role: ['sc'], routerLink: ['/categories'] },
                            { label: this.t('MENU.FILES'), role: ['sc'], routerLink: ['/files'] }
                        ]
                    },
                    {
                        label: this.t('MENU.FINANCIAL'),
                        role: ['rais'],
                        items: [
                            { label: this.t('MENU.GENERAL_DASHBOARD'), role: ['rais'], routerLink: ['/financial-dashboard'] },
                            { label: this.t('MENU.DEBIT_CREDIT'), role: ['rais'], routerLink: ['/debit-credit'] },
                            { label: this.t('MENU.INVESTMENT'), role: ['rais'], routerLink: ['/investment'] },
                            { label: this.t('MENU.REPAIR_COSTS'), role: ['rais'], routerLink: ['/repair-costs'] },
                            { label: this.t('MENU.PROCUREMENT'), role: ['rais'], routerLink: ['/procurement'] },
                            { label: this.t('MENU.KPI'), role: ['rais'], routerLink: ['/kpi'] },
                            { label: this.t('MENU.SALARY'), role: ['rais'], routerLink: ['/salary'] }
                        ]
                    },
                    {
                        label: this.t('MENU.PLANNING'),
                        role: ['rais'],
                        items: [
                            { label: this.t('MENU.ALL_EVENTS'), role: ['rais', 'assistant'], routerLink: ['/planning/events'] }
                        ]
                    },
                    {
                        label: this.t('MENU.MAIL'),
                        role: ['rais'],
                        items: [
                            { label: this.t('MENU.ORDERS'), role: ['rais'], routerLink: ['/mail/orders'] },
                            { label: this.t('MENU.REPORTS'), role: ['rais'], routerLink: ['/mail/reports'] },
                            { label: this.t('MENU.LETTERS'), role: ['rais'], routerLink: ['/mail/letters'] },
                            { label: this.t('MENU.INSTRUCTIONS'), role: ['rais'], routerLink: ['/mail/instructions'] },
                            {
                                label: this.t('MENU.RESOLUTIONS'),
                                role: ['rais'],
                                items: [
                                    { label: this.t('MENU.PRESIDENT'), role: ['rais'], routerLink: ['/mail/resolutions'], queryParams: { type: 'president' } },
                                    { label: this.t('MENU.CABINET'), role: ['rais'], routerLink: ['/mail/resolutions'], queryParams: { type: 'cabinet' } },
                                    { label: this.t('MENU.DECREES'), role: ['rais'], routerLink: ['/mail/resolutions'], queryParams: { type: 'decree' } },
                                    { label: this.t('MENU.ORDERS'), role: ['rais'], routerLink: ['/mail/resolutions'], queryParams: { type: 'order' } },
                                    { label: this.t('MENU.AGREEMENTS'), role: ['rais'], routerLink: ['/mail/resolutions'], queryParams: { type: 'agreement' } }
                                ]
                            }
                        ]
                    },
                    { label: this.t('MENU.CALLS'), role: ['rais'], routerLink: ['/calls'] },
                    { label: this.t('MENU.PRESS_SERVICE'), role: ['rais'], routerLink: ['/media/news'] }
                ]
            }
        ];
    }

    oldMenu() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'UI Components',
                items: [
                    { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
                    { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input-number'] },
                    { label: 'Button', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/uikit/button'] },
                    { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
                    { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
                    { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
                    { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
                    { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
                    { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
                    { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
                    { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
                    { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
                    { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
                    { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
                    { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] }
                ]
            },
            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Landing',
                        icon: 'pi pi-fw pi-globe',
                        routerLink: ['/landing']
                    },
                    {
                        label: 'Auth',
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: 'LoginComponent',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/auth/login']
                            },
                            {
                                label: 'Error',
                                icon: 'pi pi-fw pi-times-circle',
                                routerLink: ['/auth/error']
                            },
                            {
                                label: 'Access Denied',
                                icon: 'pi pi-fw pi-lock',
                                routerLink: ['/auth/access']
                            }
                        ]
                    },
                    {
                        label: 'Crud',
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: ['/pages/crud']
                    },
                    {
                        label: 'Not Found',
                        icon: 'pi pi-fw pi-exclamation-circle',
                        routerLink: ['/pages/notfound']
                    },
                    {
                        label: 'Empty',
                        icon: 'pi pi-fw pi-circle-off',
                        routerLink: ['/pages/empty']
                    }
                ]
            },
            {
                label: 'Hierarchy',
                items: [
                    {
                        label: 'Submenu 1',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 1.1',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: 'Submenu 1.2',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    },
                    {
                        label: 'Submenu 2',
                        icon: 'pi pi-fw pi-bookmark',
                        items: [
                            {
                                label: 'Submenu 2.1',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [
                                    { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
                                    { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
                                ]
                            },
                            {
                                label: 'Submenu 2.2',
                                icon: 'pi pi-fw pi-bookmark',
                                items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Get Started',
                items: [
                    {
                        label: 'Documentation',
                        icon: 'pi pi-fw pi-book',
                        routerLink: ['/documentation']
                    },
                    {
                        label: 'View Source',
                        icon: 'pi pi-fw pi-github',
                        url: 'https://github.com/primefaces/sakai-ng',
                        target: '_blank'
                    }
                ]
            }
        ];
    }
}
