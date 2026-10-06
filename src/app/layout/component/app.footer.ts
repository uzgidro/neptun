import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        Планшет Председателя от
        <span class="text-primary font-bold">АО «Тепловые электрические станции»</span>
    </div>`
})
export class AppFooter {}
