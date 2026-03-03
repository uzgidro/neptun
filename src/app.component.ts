import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { SplashScreenComponent } from '@/layout/component/splash-screen/splash-screen.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterModule, ToastModule, SplashScreenComponent],
    template: `
        @if (showSplash) {
            <app-splash-screen [duration]="3500" (complete)="onSplashComplete()"></app-splash-screen>
        }
        <router-outlet></router-outlet>
        <p-toast />
    `
})
export class AppComponent implements OnInit {
    showSplash: boolean = true;

    ngOnInit(): void {
        const splashShown = sessionStorage.getItem('splashShown');
        if (splashShown) {
            this.showSplash = false;
        }
    }

    onSplashComplete(): void {
        this.showSplash = false;
        sessionStorage.setItem('splashShown', 'true');
    }
}
