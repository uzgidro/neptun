import { Component, inject, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { ProfileMenu } from '../app.profilemenu';
import { LayoutService } from '../../service/layout.service';
import { PopoverModule } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { AppConfigurator } from '@/layout/component/app.configurator';
import { ButtonDirective } from 'primeng/button';
import { TopbarCalendarComponent } from '@/layout/component/topbar/topbar-calendar/topbar-calendar.component';
import { FastCallService } from '@/core/services/fast-call.service';
import { FastCall } from '@/core/interfaces/fast-call';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, ProfileMenu, PopoverModule, TableModule, ToastModule, FormsModule, AppConfigurator, ButtonDirective, TopbarCalendarComponent, NgOptimizedImage],
    providers: [MessageService], // Добавляем сервис для уведомлений
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo" routerLink="/">
                <img ngSrc="/images/logo-x.png" alt="" width="52" height="22" />
                <span>Планшет председателя</span>
            </a>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <div class="hidden">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <app-topbar-calendar></app-topbar-calendar>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>

                    <!-- Обновленная кнопка "Звонок" с Popover -->
                    <p-toast />
                    <button type="button" class="layout-topbar-action" (click)="phonePopover.toggle($event)">
                        <i class="pi pi-phone"></i>
                        <span>Звонок</span>
                    </button>
                    <p-popover #phonePopover [style]="{ width: '450px' }">
                        <p-table [value]="contacts" dataKey="id" [rows]="5" [paginator]="true">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Имя</th>
                                    <th style="width: 8rem">Действие</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-contact>
                                <tr>
                                    <td>{{ contact.contact.name }}</td>
                                    <td>
                                        <a pButton outlined class="p-button-sm" [href]="'tel:' + contact.contact.phone">
                                            <i class="pi pi-phone text-green-500"></i>
                                            <!--                                            <span class="ml-2">Позвонить</span>-->
                                        </a>
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </p-popover>

                    <app-profile-menu />
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar implements OnInit {
    items!: MenuItem[];
    contacts: FastCall[] = [];

    layoutService = inject(LayoutService);
    messageService = inject(MessageService);
    private fastCallsService: FastCallService = inject(FastCallService);

    ngOnInit() {
        this.fastCallsService.getFastCalls().subscribe({
            next: (data) => {
                this.contacts = data;
            }
        });
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
