import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-topbar-search',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [InputTextModule, IconFieldModule, InputIconModule, TranslateModule],
    template: `
        <p-iconfield class="topbar-search hidden md:block">
            <p-inputicon styleClass="pi pi-search" />
            <input type="text" pInputText [placeholder]="'TOPBAR.SEARCH_PLACEHOLDER' | translate" class="topbar-search-input" />
        </p-iconfield>
    `,
    styles: [`
        :host {
            margin-left: 1.5rem;
        }
        :host ::ng-deep .topbar-search {
            .topbar-search-input {
                width: 300px;
                font-size: 0.875rem;
                padding: 0.5rem 0.75rem 0.5rem 2.25rem;
                border-radius: 2rem;
            }
        }
    `]
})
export class TopbarSearchComponent {}
