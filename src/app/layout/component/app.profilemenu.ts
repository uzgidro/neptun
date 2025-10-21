import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/core/services/auth.service';
import { StyleClassModule } from 'primeng/styleclass';
import { RouterModule } from '@angular/router';
import { JwtService } from '@/core/services/jwt.service';

@Component({
    selector: 'app-profile-menu',
    standalone: true,
    imports: [CommonModule, StyleClassModule, RouterModule],
    template: `
        @if (userName) {
            <div class="relative">
                <button
                    type="button"
                    class="layout-topbar-action"
                    pStyleClass="@next"
                    enterFromClass="hidden"
                    enterActiveClass="animate-scalein"
                    leaveToClass="hidden"
                    leaveActiveClass="animate-fadeout"
                    [hideOnOutsideClick]="true"
                >
                    <i class="pi pi-user"></i>
                    <span>Пользователь</span>
                </button>

                <div
                    class="hidden absolute top-13 right-0 w-72 p-4 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-md">
                    <div class="text-center mb-4">
                        <div class="font-semibold text-lg">{{ userName }}</div>
                        <!--                    <span class="text-muted-color text-sm">User Role</span>-->
                    </div>
                    <hr class="my-4 border-t border-surface" />
                    <!--                <ul class="list-none p-0 m-0 flex flex-col gap-2">-->
                    <!--                    <li><a class="flex items-center gap-2 p-2 rounded-border-sm hover:bg-surface-100 dark:hover:bg-surface-800/70" routerLink="/pages/empty"><i class="pi pi-plus"></i><span>New</span></a></li>-->
                    <!--                    <li><a class="flex items-center gap-2 p-2 rounded-border-sm hover:bg-surface-100 dark:hover:bg-surface-800/70" routerLink="/pages/empty"><i class="pi pi-search"></i><span>Search</span></a></li>-->
                    <!--                    <li><a class="flex items-center gap-2 p-2 rounded-border-sm hover:bg-surface-100 dark:hover:bg-surface-800/70" routerLink="/pages/empty"><i class="pi pi-cog"></i><span>Setting</span></a></li>-->
                    <!--                    <li><a class="flex items-center gap-2 p-2 rounded-border-sm hover:bg-surface-100 dark:hover:bg-surface-800/70" routerLink="/pages/empty"><i class="pi pi-inbox"></i><span>Message</span></a></li>-->
                    <!--                </ul>-->
                    <!--                <hr class="my-4 border-t border-surface" />-->
                    <a (click)="logout()"
                       class="cursor-pointer flex items-center gap-2 p-2 rounded-border-sm hover:bg-surface-100 dark:hover:bg-surface-800/70"><i
                        class="pi pi-sign-out"></i><span>Выйти</span></a>
                </div>
            </div>
        }
    `
})
export class ProfileMenu implements OnInit {
    authService = inject(AuthService);
    jwtService = inject(JwtService);
    userName: string | null = null;

    ngOnInit(): void {
        this.userName = this.jwtService.getDecodedToken()?.name || 'User';
    }

    logout(): void {
        this.authService.signOut();
    }
}
