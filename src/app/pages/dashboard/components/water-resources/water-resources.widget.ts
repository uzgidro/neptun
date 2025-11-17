import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';

interface reservoir {
    name: string;
    income: number;
    release: number;
    level: number;
    volume: number;
    incomeDiff: number;
    releaseDiff: number;
    levelDiff: number;
    volumeDiff: number;
}

@Component({
    standalone: true,
    selector: 'app-water-resources-widget',
    imports: [ChartModule, Button, TableModule],
    templateUrl: './water-resources.widget.html'
})
export class WaterResourcesWidget implements OnInit {
    reservoirs: reservoir[] = [];

    ngOnInit() {
        this.reservoirs = [
            {name: 'Чарвак', income: 68, release: 0, level: 870.48, volume: 1293.4, incomeDiff: -1, releaseDiff: -439, levelDiff: 0.01, volumeDiff: 0.3},
            {name: 'Андижан', income: 42, release: 74, level: 880.05, volume: 780.5, incomeDiff: -1, releaseDiff: 0, levelDiff: -0.02, volumeDiff: -0.6},
            {name: 'Тупаланг', income: 9, release: 28, level: 930.76, volume: 291.23, incomeDiff: -0.1, releaseDiff: 0, levelDiff: -0.07, volumeDiff: -0.41},
            {name: 'Гисарак', income: 2.45, release: 5, level: 1072.91, volume: 45.57, incomeDiff: 0, releaseDiff: 0, levelDiff: -0.04, volumeDiff: -0.05},
            {name: 'Ахангаран', income: 4.15, release: 6, level: 1036.99, volume: 57.48, incomeDiff: 0.46, releaseDiff: 0, levelDiff: -0.02, volumeDiff: -0.04},
            {name: 'Сардоба', income: 0, release: 0, level: 285.64, volume: 248.09, incomeDiff: 0, releaseDiff: 0, levelDiff: 0, volumeDiff: -0.53},
        ];
    }
}
