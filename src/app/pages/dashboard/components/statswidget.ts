import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule, CurrencyPipe, ButtonModule],
    template: `<div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Работники</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">3892</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">24 новых </span>
                <span class="text-muted-color">за последний месяц</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-3">Дебит</span>
                        @if (showInUSD) {
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ debitAmountUSD | currency: 'USD':'symbol':'1.0-0' }}</div>
                        } @else {
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ debitAmountUZS | number: '1.0-0' }} UZS</div>
                        }
                    </div>
                    <div class="flex items-start">
                        <button pButton type="button" icon="pi pi-dollar" class="p-button-text p-button-plain p-button-rounded" (click)="toggleCurrency()"></button>
                        <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border ml-2" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-wallet text-green-500 text-xl!"></i>
                        </div>
                    </div>
                </div>
                <span class="text-primary font-medium">+500.000 UZS </span>
                <span class="text-muted-color">за прошедшую неделю</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-3">Кредит</span>
                        @if (showInUSD) {
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ creditAmountUSD | currency: 'USD':'symbol':'1.0-0' }}</div>
                        } @else {
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ creditAmountUZS | number: '1.0-0' }} UZS</div>
                        }
                    </div>
                    <div class="flex items-start">
                        <button pButton type="button" icon="pi pi-dollar" class="p-button-text p-button-plain p-button-rounded" (click)="toggleCurrency()"></button>
                        <div class="flex items-center justify-center bg-rose-100 dark:bg-rose-400/10 rounded-border ml-2" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-wallet text-rose-500 text-xl!"></i>
                        </div>
                    </div>
                </div>
                <span class="text-primary font-medium">+150.000 UZS </span>
                <span class="text-muted-color">за прошлую неделю</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Выработка</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">11.124 млн КВт/ч</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-bolt text-purple-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-muted-color">Падение на </span>
                <span class="text-primary font-medium">4% </span>
                <span class="text-muted-color">за сутки</span>
            </div>
        </div>`
})
export class StatsWidget implements OnInit {
    // Amounts in UZS
    debitAmountUZS: number = 1580000;
    creditAmountUZS: number = 250000;

    // Amounts in USD
    debitAmountUSD: number = 0;
    creditAmountUSD: number = 0;

    // Flag to toggle currency
    showInUSD: boolean = false;

    // Exchange rate (for example, in a real application it's better to get it from an API)
    private usdExchangeRate: number = 12650;

    ngOnInit() {
        this.convertAmountsToUSD();
    }

    convertAmountsToUSD() {
        this.debitAmountUSD = this.debitAmountUZS / this.usdExchangeRate;
        this.creditAmountUSD = this.creditAmountUZS / this.usdExchangeRate;
    }

    toggleCurrency() {
        this.showInUSD = !this.showInUSD;
    }
}
