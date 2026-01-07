import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuitemComponent } from '../menuitem/menuitem.component';
import { WeatherWidget } from '@/pages/dashboard/components/weather/weather.widget';
import { MenuItems } from '@/core/interfaces/menuitems';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, MenuitemComponent, RouterModule, WeatherWidget],
    templateUrl: 'menu.component.html'
})
export class MenuComponent implements OnInit {
    model: MenuItems[] = [];

    ngOnInit() {
        this.model = [
            {
                items: [
                    {
                        label: 'Главная',
                        routerLink: ['/dashboard']
                    },
                    {
                        label: 'Кадровый персонал (HRM)',
                        role: ['admin', 'rais'],
                        items: [
                            { label: 'Организации', role: ['rais'], routerLink: ['/organizations'] },
                            { label: 'Дни рождения', role: ['rais'], routerLink: ['/birthdays'] },
                            { label: 'Потеря личного состава', role: ['rais'], routerLink: ['/personnel-loss'] },
                            { label: 'Работники', role: ['admin'], routerLink: ['/employees'] },
                            { label: 'Должности', role: ['admin'], routerLink: ['/positions'] },
                            { label: 'Отделы', role: ['admin'], routerLink: ['/departments'] },
                            { label: 'Пользователи', role: ['admin'], routerLink: ['/users'] },
                            { label: 'Роли', role: ['admin'], routerLink: ['/roles'] }
                        ]
                    },
                    {
                        label: 'Ситуационный центр',
                        role: ['rais', 'sc'],
                        items: [
                            {
                                label: 'Информация о ГЭС',
                                role: ['rais', 'sc'],
                                items: [
                                    {
                                        label: 'ГЭС',
                                        role: ['rais', 'sc'],
                                        routerLink: ['/viewer'],
                                        queryParams: { type: 'production' },
                                        routerLinkActiveOptions: { queryParams: 'exact' }
                                    },
                                    {
                                        label: 'Малые и микро ГЭС',
                                        role: ['rais', 'sc'],
                                        routerLink: ['/viewer'],
                                        queryParams: { type: 'minimicro' },
                                        routerLinkActiveOptions: { queryParams: 'exact' }
                                    },
                                    {
                                        label: 'Солнце',
                                        role: ['rais', 'sc'],
                                        routerLink: ['/viewer'],
                                        queryParams: { type: 'sun' },
                                        routerLinkActiveOptions: { queryParams: 'exact' }
                                    },
                                    {
                                        label: 'Аварийные отключение',
                                        role: ['rais', 'sc'],
                                        routerLink: ['/shutdowns']
                                    },
                                    {
                                        label: 'Холостые водосбросы',
                                        role: ['rais', 'sc'],
                                        routerLink: ['/discharges']
                                    }
                                ]
                            },
                            {
                                label: 'Информация о водохранилищах',
                                role: ['rais', 'sc'],
                                items: [
                                    {
                                        label: 'Сводка',
                                        role: ['rais', 'sc'],
                                        routerLink: ['/reservoir-summary']
                                    },
                                    {
                                        label: 'Сводка PDF',
                                        role: ['rais', 'sc'],
                                        routerLink: ['/reservoir-summary/pdf']
                                    },
                                    {
                                        label: 'Гидротехнические сооружения',
                                        role: ['rais', 'sc'],
                                        routerLink: ['/reservoir-device']
                                    }
                                ]
                            },
                            {
                                label: 'Прочая информация',
                                role: ['rais', 'sc'],
                                items: [
                                    // {
                                    //     label: 'События',
                                    //     role: ['rais', 'sc']
                                    // },
                                    {
                                        label: 'Землетрясение',
                                        role: ['rais', 'sc'],
                                        url: 'https://soep.uz/',
                                        target: '_blank'
                                    },
                                    {
                                        label: 'Инциденты',
                                        role: ['rais', 'sc'],
                                        routerLink: ['/incidents']
                                    },
                                    {
                                        label: 'Визиты',
                                        role: ['rais', 'sc'],
                                        routerLink: ['/visits']
                                    }
                                ]
                            },
                            { label: 'Категории', role: ['sc'], routerLink: ['/categories'] },
                            { label: 'Файлы', role: ['sc'], routerLink: ['/files'] }
                        ]
                    },
                    {
                        label: 'Инвестиционный блок',
                        role: ['rais', 'investment'],
                        items: [
                            {label: "Перспективные проекты", role: ['rais', 'investment'], routerLink: ['/invest']},
                            {label: "Проекты в активной фазе", role: ['rais', 'investment']}
                        ]
                    },
                    {
                        label: 'Финансовый блок',
                        role: ['rais'],
                        items: [
                            { label: 'Общий дашборд', role: ['rais'], routerLink: ['/financial-dashboard'] },
                            { label: 'Дебит / кредит', role: ['rais'], routerLink: ['/debit-credit'] },
                            { label: 'Затраты на ремонт', role: ['rais'], routerLink: ['/repair-costs'] },
                            { label: 'Закупки', role: ['rais'], routerLink: ['/procurement'] },
                            { label: 'KPI', role: ['rais'], routerLink: ['/kpi'] },
                            { label: 'Заработная плата', role: ['rais'], routerLink: ['/salary'] }
                        ]
                    },
                    {
                        label: 'Планирование',
                        role: ['rais', 'assistant'],
                        items: [
                            // { label: 'Встречи', role: ['rais'], routerLink: ['/planning'], queryParams: { type: 'meeting' }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            // { label: 'Созвоны', role: ['rais'], routerLink: ['/planning'], queryParams: { type: 'call' }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            // { label: 'Переговоры', role: ['rais'], routerLink: ['/planning'], queryParams: { type: 'negotiation' }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            // { label: 'ВКС', role: ['rais'], routerLink: ['/planning'], queryParams: { type: 'vcs' }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: 'События', role: ['rais', 'assistant'], routerLink: ['/planning/events'] },
                            { label: 'Приемная', role: ['rais', 'assistant'], routerLink: ['/planning/reception'] }
                        ]
                    },
                    {
                        label: 'Канцелярия',
                        role: ['rais'],
                        items: [
                            { label: 'Приказы', role: ['rais'], routerLink: ['/mail/orders'] },
                            { label: 'Рапорты', role: ['rais'], routerLink: ['/mail/reports'] },
                            { label: 'Письма', role: ['rais'], routerLink: ['/mail/letters'] },
                            { label: 'Инструкции', role: ['rais'], routerLink: ['/mail/instructions'] },
                            {
                                label: 'Нормативно правовая документация',
                                role: ['rais'],
                                items: [
                                    { label: 'Законы Республики Узбекистан', role: ['rais'] },
                                    { label: 'Постановления Президента Республики Узбекистан', role: ['rais'], routerLink: ['/mail/resolutions'], queryParams: { type: 'president' }, routerLinkActiveOptions: { queryParams: 'exact' } },
                                    { label: 'Указы Президента Республики Узбекистан', role: ['rais'], routerLink: ['/mail/resolutions'], queryParams: { type: 'decree' }, routerLinkActiveOptions: { queryParams: 'exact' } },
                                    { label: 'Постановления Кабинета министров', role: ['rais'], routerLink: ['/mail/resolutions'], queryParams: { type: 'cabinet' }, routerLinkActiveOptions: { queryParams: 'exact' } },
                                    { label: 'Приказы министерств и ведомств', role: ['rais'], routerLink: ['/mail/resolutions'], queryParams: { type: 'order' }, routerLinkActiveOptions: { queryParams: 'exact' } },
                                    { label: 'Совместные соглашения(NDA)', role: ['rais'], routerLink: ['/mail/resolutions'], queryParams: { type: 'agreement' }, routerLinkActiveOptions: { queryParams: 'exact' } },
                                    { label: 'Иные документы', role: ['rais'] }
                                ]
                            }
                        ]
                    },
                    { label: 'Звонки', role: ['rais'], routerLink: ['/calls'] },
                    { label: 'Пресс-служба', role: ['rais'], routerLink: ['/media/news'] }
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
