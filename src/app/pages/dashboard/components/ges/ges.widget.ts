import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonDirective, ButtonIcon } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { Organization } from '@/core/interfaces/organizations';
import { DashboardService } from '@/core/services/dashboard.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface ExpandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-ges-widget',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ButtonDirective, TableModule, FormsModule, ButtonIcon, DecimalPipe, TranslateModule],
    templateUrl: './ges.widget.html'
})
class GesWidget implements OnInit, OnDestroy {
    cascades: Organization[] = [];

    expandedRows: ExpandedRows = {};

    loading: boolean = false;

    lastUpdated: Date | null = null;

    private dashboardService: DashboardService = inject(DashboardService);
    private translate: TranslateService = inject(TranslateService);
    private router: Router = inject(Router);
    private cdr = inject(ChangeDetectorRef);
    private refreshSubscription?: Subscription;

    @Input() expanded: boolean = false;
    @Output() expansionChange = new EventEmitter<boolean>();

    ngOnInit(): void {
        this.loadData();
        const REFRESH_INTERVAL = 120_000;
        this.refreshSubscription = interval(REFRESH_INTERVAL).subscribe(() => this.loadData());
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
                this.cdr.markForCheck();
            },
            error: () => {
                this.loading = false;
                this.cdr.markForCheck();
            },
            complete: () => {
                this.loading = false;
                this.cdr.markForCheck();
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

    openGesDetail(ges: Organization): void {
        this.router.navigate(['/plant', ges.id]);
    }

    ngOnDestroy(): void {
        this.refreshSubscription?.unsubscribe();
    }
}

export default GesWidget;
