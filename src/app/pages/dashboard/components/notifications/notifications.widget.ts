import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { DatePipe } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [ButtonModule, MenuModule, DatePipe],
    templateUrl: './notifications.widget.html'
})
export class NotificationsWidget {
    today = new Date();
    yesterday = new Date().setDate(this.today.getDate() - 1);
    third = new Date().setDate(this.today.getDate() - 2);

    items = [
        { label: 'Add New', icon: 'pi pi-fw pi-plus' },
        { label: 'Remove', icon: 'pi pi-fw pi-trash' }
    ];
}
