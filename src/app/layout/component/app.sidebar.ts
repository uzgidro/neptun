import { Component, ElementRef, inject } from '@angular/core';
import { MenuComponent } from './menu/menu.component';
import { AuthService } from '@/core/services/auth.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [MenuComponent],
    template: ` <div class="layout-sidebar">
        <div class="p-4 block lg:hidden font-bold text-xl text-primary">
            <span>Планшет</span>
            @if (authService.hasRole('first deputy')) {
                <span> Первого заместителя</span>
            }
            <span> Руководителя</span>
        </div>
        <app-menu></app-menu>
    </div>`
})
export class AppSidebar {
    authService = inject(AuthService);
    constructor(public el: ElementRef) {}
}
