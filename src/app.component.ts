import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { LocationService } from './app/core/services/location.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterModule, ToastModule],
    template: `
        <div *ngIf="locationAddress" class="location-banner">
            {{ locationAddress }}
        </div>
        <router-outlet></router-outlet>
        <p-toast />
    `,
    styles: [`
        .location-banner {
            background-color: #007bff;
            color: white;
            text-align: center;
            padding: 5px;
            font-weight: bold;
        }
    `]
})
export class AppComponent implements OnInit {
    private locationService = inject(LocationService);
    locationAddress: string | null = null;

    ngOnInit(): void {
        this.locationService.getCurrentLocationAddress().subscribe({
            next: (address) => {
                this.locationAddress = address;
                console.log('Адрес получен:', address);
            },
            error: (error) => {
                console.error('Ошибка получения адреса:', error);
                this.locationAddress = 'Не удалось определить местоположение';
            }
        });
    }
}
