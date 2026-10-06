import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuitemComponent } from '../menuitem/menuitem.component';
import { WeatherWidget } from '@/pages/dashboard/components/weather/weather.widget';
import { MenuItems } from '@/core/interfaces/menuitems';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '@/core/services/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, MenuitemComponent, RouterModule, WeatherWidget],
    templateUrl: 'menu.component.html'
})
export class MenuComponent implements OnInit {
    model: MenuItems[] = [];
    private translate = inject(TranslateService);
    private authService = inject(AuthService);

    get canSeeOverview(): boolean {
        return this.authService.canSeeOverview();
    }

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
        if (this.authService.isOnlyCascade()) {
            this.model = [
                {
                    items: [
                        { label: this.t('MENU.CASCADE_REPORT'), routerLink: ['/ges-daily-report'] },
                        { label: this.t('MENU.SOLAR_REPORT'), routerLink: ['/solar-report'] },
                        { label: this.t('MENU.EMERGENCY_SHUTDOWN'), routerLink: ['/shutdowns'] }
                    ]
                }
            ];
            return;
        }

        if (this.authService.isOnlyReservoirDuty()) {
            this.model = [
                {
                    items: [
                        { label: this.t('MENU.RESERVOIR_FLOOD'), routerLink: ['/reservoir-flood'] }
                    ]
                }
            ];
            return;
        }

        this.model = [
            {
                items: [
                    {
                        label: this.t('MENU.HOME'),
                        role: ['admin', 'sc', 'rais'],
                        routerLink: ['/dashboard']
                    },
                    {
                        label: this.t('MENU.OPERATIONAL_MONITORING'),
                        role: ['admin', 'sc', 'rais'],
                        routerLink: ['/monitoring']
                    },
                    {
                        label: this.t('MENU.ADMINISTRATION'),
                        role: ['admin'],
                        items: [
                            { label: this.t('MENU.ORGANIZATIONS'), role: ['admin'], routerLink: ['/organizations'] },
                            { label: this.t('MENU.ORGANIZATION_TYPES'), role: ['admin'], routerLink: ['/organization-types'] },
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
                        role: ['admin', 'sc', 'rais'],
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
                    { label: this.t('MENU.RESERVOIR_FLOOD'), role: ['reservoir_flood'], routerLink: ['/reservoir-flood'] },
                    { label: this.t('MENU.FILTRATION'), role: ['reservoir'], routerLink: ['/manual-comparison-entry'] },
                    { label: this.t('MENU.RESERVOIR_DUTY_SUMMARY'), role: ['reservoir'], routerLink: ['/reservoir-duty-entry'] },
                    { label: this.t('MENU.CASCADE_REPORT'), role: ['cascade'], routerLink: ['/ges-daily-report'] },
                    { label: this.t('MENU.SOLAR_REPORT'), role: ['cascade'], routerLink: ['/solar-report'] },
                    { label: this.t('MENU.CALLS'), role: ['rais'], routerLink: ['/calls'] },
                    { label: this.t('MENU.PRESS_SERVICE'), role: ['admin', 'sc', 'rais'], routerLink: ['/uzgidro-news'] }
                ]
            }
        ];
    }
}
