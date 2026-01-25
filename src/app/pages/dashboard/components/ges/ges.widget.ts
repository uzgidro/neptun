import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DecimalPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { Organization } from '@/core/interfaces/organizations';
import { DashboardService } from '@/core/services/dashboard.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-ges-widget',
    imports: [ButtonDirective, TableModule, FormsModule, ButtonIcon, NgClass, DecimalPipe, TranslateModule],
    templateUrl: './ges.widget.html',
    styleUrl: './ges.widget.scss'
})
class GesWidget implements OnInit, OnDestroy {
    cascades: Organization[] = [];

    expandedRows: expandedRows = {};

    loading: boolean = false;

    lastUpdated: Date | null = null;

    private dashboardService: DashboardService = inject(DashboardService);
    private translate: TranslateService = inject(TranslateService);
    private refreshSubscription?: Subscription;

    @Input() expanded: boolean = false;
    @Output() expansionChange = new EventEmitter<boolean>();

    ngOnInit(): void {
        this.loadData();
        // Auto-refresh every 2 minutes
        this.refreshSubscription = interval(120000).subscribe(() => this.loadData());
    }

    private loadData(): void {
        this.loading = true;
        this.dashboardService.getOrganizationsCascades().subscribe({
            next: (res) => {
                this.cascades = res.map((cascade) => ({
                    ...cascade,
                    contacts: this.sortContacts(cascade.contacts)
                }));
                this.lastUpdated = new Date();
            },
            error: () => {},
            complete: () => {
                this.loading = false;
            }
        });
    }

    refresh(): void {
        this.loadData();
    }

    getTimeAgo(): string {
        if (!this.lastUpdated) return '';
        const seconds = Math.floor((new Date().getTime() - this.lastUpdated.getTime()) / 1000);
        if (seconds < 60) return this.translate.instant('DASHBOARD.JUST_NOW');
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} ${this.translate.instant('DASHBOARD.MINUTES_AGO')}`;
        const hours = Math.floor(minutes / 60);
        return `${hours} ${this.translate.instant('DASHBOARD.HOURS_AGO')}`;
    }

    private sortContacts(contacts: any[]): any[] {
        if (!contacts) return [];
        return [...contacts].sort((a, b) => {
            const posA = a.position?.description?.toLowerCase() || '';
            const posB = b.position?.description?.toLowerCase() || '';
            // Директор должен быть первым
            if (posA.includes('директор')) return -1;
            if (posB.includes('директор')) return 1;
            return 0;
        });
    }

    expandAll() {
        this.expanded = !this.expanded;
        this.expansionChange.emit(this.expanded);
    }

    ngOnDestroy(): void {
        this.refreshSubscription?.unsubscribe();
    }
}

export default GesWidget;
