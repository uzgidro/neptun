import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuitemComponent } from '../menuitem/menuitem.component';
import { MenuItems } from '@/core/interfaces/menuitems';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, MenuitemComponent, RouterModule],
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
                        label: 'Ситуационный центр',
                        role: ['rais', 'sc'],
                        items: [
                            {
                                label: 'Информация о ГЭС',
                                role: ['rais', 'sc'],
                                items: [
                                    {
                                        label: 'ГЭС',
                                        role: ['rais', 'sc']
                                    },
                                    {
                                        label: 'Малые и микро ГЭС',
                                        role: ['rais', 'sc']
                                    },
                                    {
                                        label: 'Солнце',
                                        role: ['rais', 'sc']
                                    },
                                    {
                                        label: 'Аварийные отключение',
                                        role: ['rais', 'sc'],
                                        routerLink: ['/viewer'],
                                        queryParams: { type: 'shutdown' },
                                        routerLinkActiveOptions: { queryParams: 'exact' }
                                    },
                                    {
                                        label: 'Выработка',
                                        role: ['rais', 'sc'],
                                        routerLink: ['/viewer'],
                                        queryParams: { type: 'production' },
                                        routerLinkActiveOptions: { queryParams: 'exact' }
                                    }
                                ]
                            },
                            {
                                label: 'Информация о водохранилищах',
                                role: ['rais', 'sc'],
                                items: [
                                    {
                                        label: 'Водохранилища',
                                        role: ['rais', 'sc']
                                    },
                                    {
                                        label: 'MODSNOW',
                                        role: ['rais', 'sc']
                                    },
                                    {
                                        label: 'Фильтрация',
                                        role: ['rais', 'sc']
                                    }
                                ]
                            },
                            {
                                label: 'Прочая информация',
                                role: ['rais', 'sc'],
                                items: [
                                    {
                                        label: 'События',
                                        role: ['rais', 'sc']
                                    },
                                    {
                                        label: 'Землетрясение',
                                        role: ['rais', 'sc'],
                                        url: 'https://soep.uz/',
                                        target: '_blank'
                                    }
                                ]
                            },
                            {
                                label: 'Строительство',
                                role: ['rais', 'sc'],
                                routerLink: ['/viewer'],
                                queryParams: { type: 'construction' },
                                routerLinkActiveOptions: { queryParams: 'exact' }
                            },
                            { label: 'Категории', role: ['sc'], routerLink: ['/categories'] },
                            { label: 'Файлы', role: ['sc'], routerLink: ['/files'] }
                        ]
                    },
                    {
                        label: 'Кадровый персонал',
                        role: ['admin', 'rais'],
                        items: [
                            { label: 'Организации', role: ['rais'] },
                            { label: 'Пользователи', role: ['admin'], routerLink: ['/users'] },
                            { label: 'Роли', role: ['admin'], routerLink: ['/roles'] }
                        ]
                    },
                    {label: 'Встречи', role: ['rais'], items: []},
                    {label: 'Звонки', role: ['rais'], items: []},
                    {label: 'Переговоры', role: ['rais'], items: []},
                    {label: 'Финансовый блок', role: ['rais'], items: []},
                    {label: 'Постановления', role: ['rais'], items: []},
                    {label: 'Почта', role: ['rais'], items: []},
                    {label: 'Рапорты', role: ['rais'], items: []},
                    {label: 'Контроль и инвентаризация', role: ['rais'], items: []},
                    {label: 'Телефонный справочник', role: ['rais'], items: []},
                    {label: 'СМИ', role: ['rais'], items: []},
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
                    { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
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
                                label: 'Login',
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
