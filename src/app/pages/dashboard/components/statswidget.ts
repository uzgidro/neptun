import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `<div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Личный состав</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">3892</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">24 новых </span>
                <span class="text-muted-color">За последний месяц</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Дебит</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">$1.580.000</div>
                    </div>
                    <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-green-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">+$500.000 </span>
                <span class="text-muted-color">за прошедшую неделю</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Кредит</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">$250.000</div>
                    </div>
                    <div class="flex items-center justify-center bg-rose-100 dark:bg-rose-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-dollar text-rose-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">+$150.000 </span>
                <span class="text-muted-color">за прошлую неделю</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Выработка</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">11.124 mln KWt/h</div>
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
export class StatsWidget {}
