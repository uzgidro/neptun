import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-constructions-widget',
    imports: [ButtonDirective, ButtonIcon, NgClass],
    templateUrl: './constructions.widget.html'
})
export class ConstructionsWidget {
    @Input() expanded: boolean = false;
    @Output() expansionChange = new EventEmitter<boolean>();

    expandAll() {
        this.expanded = !this.expanded;
        this.expansionChange.emit(this.expanded);
    }
}
