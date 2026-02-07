import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-production',
    imports: [TranslateModule],
    templateUrl: './production-widget.component.html',
    styleUrl: './production-widget.component.scss'
})
export class ProductionWidget {}
