import { Component } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { LayoutService } from '@/layout/service/layout.service';

@Component({
    standalone: true,
    selector: 'app-water-resource-widget',
    imports: [ChartModule],
    template: `<div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">Водные ресурсы</div>
        <p-chart type="doughnut" [data]="pieData" [options]="pieOptions"></p-chart>
    </div>`
})
export class WaterResourceWidget {
    pieData: any;
    pieOptions: any;

    subscription!: Subscription;

    constructor(public layoutService: LayoutService) {
        this.subscription = this.layoutService.configUpdate$.pipe(debounceTime(25)).subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.initChart();
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.pieData = {
            labels: ['Чарвак', 'Андижан', 'Тупаланг', 'Гисарак', 'Ахангаран', 'Сардоба'],
            datasets: [
                {
                    data: [871, 880, 932, 1073, 1037, 286],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--p-indigo-500'),
                        documentStyle.getPropertyValue('--p-purple-500'),
                        documentStyle.getPropertyValue('--p-sky-500'),
                        documentStyle.getPropertyValue('--p-teal-500'),
                        documentStyle.getPropertyValue('--p-rose-500'),
                        documentStyle.getPropertyValue('--p-lime-500')
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--p-indigo-400'),
                        documentStyle.getPropertyValue('--p-purple-400'),
                        documentStyle.getPropertyValue('--p-sky-400'),
                        documentStyle.getPropertyValue('--p-teal-400'),
                        documentStyle.getPropertyValue('--p-rose-400'),
                        documentStyle.getPropertyValue('--p-lime-400')
                    ]
                }
            ]
        };

        this.pieOptions = {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
