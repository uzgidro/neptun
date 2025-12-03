import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        Планшет Председателя от
        <a href="https://uzgidro.uz" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">АО "Узбекгидроэнерго"</a>
    </div>`
})
export class AppFooter {}
