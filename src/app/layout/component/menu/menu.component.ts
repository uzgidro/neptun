import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuitemComponent } from '../menuitem/menuitem.component';
import { WeatherWidget } from '@/pages/dashboard/components/weather/weather.widget';
import { MenuItems } from '@/core/interfaces/menuitems';
import { InvestmentService } from '@/core/services/investment.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, MenuitemComponent, RouterModule, WeatherWidget],
    templateUrl: 'menu.component.html'
})
export class MenuComponent implements OnInit {
    model: MenuItems[] = [];
    private investmentService = inject(InvestmentService);

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
                                        label: 'Солнечные станции',
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
                            {label: "Проекты в активной фазе", role: ['rais', 'investment'], routerLink: ['/invest-active']}
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
                    { label: 'Звонки', role: ['rais'], routerLink: ['/calls'] },
                    { label: 'Пресс-служба', role: ['rais'], routerLink: ['/media/news'] }
                ]
            }
        ];

        this.investmentService.getTypes().subscribe((types) => {
            const investBlock = this.model[0].items?.find((item) => item.label === 'Инвестиционный блок');
            if (investBlock && investBlock.items) {
                const dynamicItems = types.map((t) => ({
                    label: t.name,
                    role: ['rais', 'investment'],
                    routerLink: ['/invest-perspective'],
                    queryParams: { type_id: t.id },
                    routerLinkActiveOptions: { queryParams: 'exact' }
                }));
                investBlock.items = [...investBlock.items, ...dynamicItems];
            }
        });
    }
}
