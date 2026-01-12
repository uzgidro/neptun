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
                            { label: this.t('MENU.CATEGORIES'), role: ['sc'], routerLink: ['/categories'] },
                            { label: this.t('MENU.FILES'), role: ['sc'], routerLink: ['/files'] }
                        ]
                    },
                    {
                        label: 'Инвестиционный блок',
                        role: ['rais', 'investment'],
                        items: [
                            { label: 'Проекты в активной фазе', role: ['rais', 'investment'], routerLink: ['/invest-active'] },
                            {
                                label: 'Перспективные проекты',
                                role: ['rais', 'investment'],
                                items: [
                                    { label: 'За счет собственных средств', role: ['rais', 'investment'], routerLink: ['/invest-perspective'], queryParams: { type_id: 1 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                                    { label: 'За счет частных инвестиций (ГЧП)', role: ['rais', 'investment'], routerLink: ['/invest-perspective'], queryParams: { type_id: 2 }, routerLinkActiveOptions: { queryParams: 'exact' } },
                                    { label: 'За счет кредитов под государственной гарантией', role: ['rais', 'investment'], routerLink: ['/invest-perspective'], queryParams: { type_id: 3 }, routerLinkActiveOptions: { queryParams: 'exact' } }
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
                            // { label: 'Встречи', role: ['rais'], routerLink: ['/planning'], queryParams: { type: 'meeting' }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            // { label: 'Созвоны', role: ['rais'], routerLink: ['/planning'], queryParams: { type: 'call' }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            // { label: 'Переговоры', role: ['rais'], routerLink: ['/planning'], queryParams: { type: 'negotiation' }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            // { label: 'ВКС', role: ['rais'], routerLink: ['/planning'], queryParams: { type: 'vcs' }, routerLinkActiveOptions: { queryParams: 'exact' } },
                            { label: 'События', role: ['rais', 'assistant'], routerLink: ['/planning/events'] },
                            { label: 'Приемная Председателя Правления', role: ['rais', 'assistant', 'sc'], routerLink: ['/planning/reception'] }
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
                    { label: this.t('MENU.CALLS'), role: ['rais'], routerLink: ['/calls'] },
                    { label: this.t('MENU.PRESS_SERVICE'), role: ['rais'], routerLink: ['/media/news'] }
                ]
            }
        ];
    }
}
