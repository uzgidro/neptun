import { Component } from '@angular/core';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';

@Component({
    selector: 'app-ges-widget',
    imports: [ButtonDirective, Ripple, TableModule, ButtonIcon],
    templateUrl: './ges.widget.html',
    styleUrl: './ges.widget.scss'
})
export class GesWidget {}
