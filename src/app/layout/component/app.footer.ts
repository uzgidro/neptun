import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        NEPTUN by
        <a href="https://uzgidro.uz" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">JSC "Uzbekgidroenergo"</a>
    </div>`
})
export class AppFooter {}
