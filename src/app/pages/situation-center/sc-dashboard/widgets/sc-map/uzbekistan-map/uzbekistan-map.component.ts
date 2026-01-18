import { Component } from '@angular/core';

@Component({
    selector: 'uzbekistan-map',
    standalone: true,
    templateUrl: './map.svg',
    styles: [`
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }
        :host ::ng-deep svg {
            width: 100%;
            height: 100%;
            fill: rgba(0, 168, 204, 0.15);
            stroke: rgba(0, 212, 255, 0.4);
            stroke-width: 1;
        }
        :host ::ng-deep svg path:hover {
            fill: rgba(0, 212, 255, 0.25);
            filter: drop-shadow(0 0 8px rgba(0, 212, 255, 0.5));
        }
    `]
})
export class UzbekistanMapComponent {}
