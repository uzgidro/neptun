import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        Планшет Председателя от
        <a href="#" class="text-primary font-bold hover:underline">АО "МолокоПром"</a>
    </div>`
})
export class AppFooter {}
