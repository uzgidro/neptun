import { Component, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-uz-map',
  imports: [],
  templateUrl: './uz-map.component.html',
  styleUrl: './uz-map.component.scss'
})
export class UzMapComponent {
  @Output() regionClick = new EventEmitter<string>();

  // Регионы без данных (некликабельные)
  private disabledRegions = ['UZNW', 'UZBU', 'UZQR'];

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as SVGElement;
    if (target.tagName === 'path' && target.id) {
      if (!this.disabledRegions.includes(target.id)) {
        this.regionClick.emit(target.id);
      }
    }
  }
}
