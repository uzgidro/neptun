import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterModule, ToastModule],
    template: `
        <router-outlet></router-outlet>
        <p-toast />
    `
})
export class AppComponent {}
