import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Organization } from '@/core/interfaces/organizations';
import { DashboardService } from '@/core/services/dashboard.service';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-ges-widget',
    imports: [ButtonDirective, Ripple, TableModule, Button, FormsModule, ButtonIcon, NgClass, ButtonLabel, DecimalPipe],
    templateUrl: './ges.widget.html',
    styleUrl: './ges.widget.scss'
})
class GesWidget implements OnInit {
    cascades: Organization[] = [];

    expandedRows: expandedRows = {};

    loading: boolean = false;

    private dashboardService: DashboardService = inject(DashboardService);

    @Input() expanded: boolean = false;
    @Output() expansionChange = new EventEmitter<boolean>();

    ngOnInit(): void {
        this.loading = true;
        this.dashboardService.getOrganizationsCascades().subscribe({
            next: (res) => {
                this.cascades = res;
            },
            error: (err) => {
                console.log(err);
            },
            complete: () => {
                this.loading = false;
            }
        });
    }

    expandAll() {
        this.expanded = !this.expanded;
        this.expansionChange.emit(this.expanded);
    }
}

export default GesWidget;
