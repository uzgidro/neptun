import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { ProfileMenu } from './profile/app.profilemenu';
import { LayoutService } from '../../service/layout.service';
import { PopoverModule } from 'primeng/popover';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { AppConfigurator } from '@/layout/component/app.configurator';
import { TopbarCalendarWidget } from '@/layout/component/topbar/topbar-calendar/topbar-calendar-widget.component';
import { FastCallWidget } from '@/layout/component/topbar/fast-call/fast-call.widget';
import { InboxWidget } from '@/layout/component/topbar/inbox/inbox-widget.component';
import { updateSurfacePalette } from '@primeuix/themes';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, ProfileMenu, PopoverModule, TableModule, ToastModule, FormsModule, AppConfigurator, TopbarCalendarWidget, NgOptimizedImage, FastCallWidget, InboxWidget],
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

            <!-- Fast calls -->
            <app-fast-call></app-fast-call>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <!--  Calendar  -->
                    <app-topbar-calendar></app-topbar-calendar>

                    <!-- Inbox -->
                    <app-inbox></app-inbox>

                    <!-- Profile -->
                    <app-profile-menu />
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    layoutService = inject(LayoutService);
    configurator = new AppConfigurator();

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => {
            let surfaceName: string;
            if (!state.darkTheme) {
                let surface = this.configurator.surfaces.find((value) => {
                    return value.name == 'ocean';
                });
                surfaceName = surface?.name ?? 'ocean';
                updateSurfacePalette(surface?.palette);
            } else {
                let surface = this.configurator.surfaces.find((value) => {
                    return value.name == 'slate';
                });
                surfaceName = surface?.name ?? 'ocean';
                updateSurfacePalette(surface?.palette);
            }
            return { ...state, darkTheme: !state.darkTheme, surface: surfaceName };
        });
    }
}
