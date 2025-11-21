import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { DecimalPipe, NgClass } from '@angular/common';
import { ObjectUtils } from 'primeng/utils';
import { FormsModule } from '@angular/forms';
import { OrganizationService } from '@/core/services/organization.service';
import { Organization } from '@/core/interfaces/organizations';

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

    isExpanded: boolean = false;

    loading: boolean = false;

    private organizationService: OrganizationService = inject(OrganizationService);

    @Output() expansionChange = new EventEmitter<boolean>();

    ngOnInit(): void {
        this.loading = true;
        this.organizationService.getOrganizationsCascades().subscribe({
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
    get isRowsHidden(): boolean {
        return Object.keys(this.expandedRows).length === 0;
    }

    expandAll() {
        if (ObjectUtils.isEmpty(this.expandedRows)) {
            this.expandedRows = this.cascades.reduce(
                (acc, p) => {
                    if (p.name) {
                        acc[p.name] = true;
                    }
                    return acc;
                },
                {} as { [key: string]: boolean }
            );
            this.isExpanded = true;
            this.expansionChange.emit(true);
        } else {
            this.collapseAll();
        }
    }

    collapseAll() {
        this.expandedRows = {};
        this.isExpanded = false;
        this.expansionChange.emit(false);
    }

    onRowExpand() {
        // Use setTimeout to ensure expandedRows is updated
        const hasExpandedRows = !this.isRowsHidden;
        this.expansionChange.emit(hasExpandedRows);
    }

    onRowCollapse() {
        const hasExpandedRows = !this.isRowsHidden;
        this.expansionChange.emit(hasExpandedRows);
    }
}

export default GesWidget;
