import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@/core/services/auth.service';
import { Popover } from 'primeng/popover';
import { RouterModule } from '@angular/router';
import { JwtService } from '@/core/services/jwt.service';
import { Contact } from '@/core/interfaces/contact';
import { ContactService } from '@/core/services/contact.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-profile-menu',
    standalone: true,
    imports: [CommonModule, Popover, RouterModule, TranslateModule],
    template: `
        <button type="button" class="layout-topbar-action" (click)="profilePopover.toggle($event)">
            @if (contact?.icon?.url) {
                <img [src]="contact!.icon!.url" [alt]="contact!.name" class="w-6 h-6 rounded-full object-cover" />
            } @else {
                <i class="pi pi-user"></i>
            }
            <span>{{ contact?.name || ('MENU.USER' | translate) }}</span>
        </button>
        <p-popover #profilePopover [style]="{ width: '300px' }">
            <div class="p-4">
                @if (contact) {
                    <div class="flex flex-col items-center mb-4">
                        @if (contact.icon?.url) {
                            <img [src]="contact.icon!.url" [alt]="contact.name" class="w-20 h-20 rounded-full object-cover mb-3" />
                        } @else {
                            <i class="pi pi-user text-6xl text-gray-400 mb-3"></i>
                        }
                        <div class="font-semibold text-lg text-center">{{ contact.name }}</div>
                        @if (contact.email) {
                            <div class="text-sm text-gray-600 text-center">{{ contact.email }}</div>
                        }
                    </div>
                } @else {
                    <div class="flex items-center justify-center p-4">
                        <i class="pi pi-spin pi-spinner text-2xl"></i>
                    </div>
                }
                <hr class="my-4 border-t border-surface" />
                <a (click)="logout()" class="cursor-pointer flex items-center gap-2 p-2 rounded-border-sm hover:bg-surface-100 dark:hover:bg-surface-800/70">
                    <i class="pi pi-sign-out"></i>
                    <span>{{ 'AUTH.LOGOUT' | translate }}</span>
                </a>
            </div>
        </p-popover>
    `
})
export class ProfileMenu implements OnInit {
    private authService: AuthService = inject(AuthService);
    private jwtService: JwtService = inject(JwtService);
    private contactService: ContactService = inject(ContactService);

    contact?: Contact;

    ngOnInit(): void {
        let id = this.jwtService.getDecodedToken().contact_id;
        if (typeof id === 'number') {
            this.contactService.getContact(id).subscribe({
                next: (data) => {
                    this.contact = data;
                }
            });
        }
    }

    logout(): void {
        this.authService.signOut();
    }
}
