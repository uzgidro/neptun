import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TranslateModule } from '@ngx-translate/core';

import { GesService } from '@/core/services/ges.service';
import { AuthService } from '@/core/services/auth.service';
import { GesResponse } from '@/core/interfaces/ges';

import { GesDashboardComponent } from './components/ges-dashboard/ges-dashboard.component';
import { GesInfoSectionComponent } from './sections/info/ges-info-section.component';
import { GesContactsSectionComponent } from './sections/contacts/ges-contacts-section.component';
import { GesShutdownsSectionComponent } from './sections/shutdowns/ges-shutdowns-section.component';
import { GesDischargesSectionComponent } from './sections/discharges/ges-discharges-section.component';
import { GesIncidentsSectionComponent } from './sections/incidents/ges-incidents-section.component';
import { GesVisitsSectionComponent } from './sections/visits/ges-visits-section.component';
import { GesTelemetrySectionComponent } from './sections/telemetry/ges-telemetry-section.component';
import { GesMnemonicSectionComponent } from './sections/mnemonic/ges-mnemonic-section.component';

@Component({
    selector: 'app-ges-detail',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        Tabs,
        TabList,
        Tab,
        TabPanels,
        TabPanel,
        ProgressSpinner,
        GesDashboardComponent,
        GesInfoSectionComponent,
        GesContactsSectionComponent,
        GesShutdownsSectionComponent,
        GesDischargesSectionComponent,
        GesIncidentsSectionComponent,
        GesVisitsSectionComponent,
        GesTelemetrySectionComponent,
        GesMnemonicSectionComponent
    ],
    templateUrl: './ges-detail.component.html',
    styleUrl: './ges-detail.component.scss'
})
export class GesDetailComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private gesService = inject(GesService);
    private messageService = inject(MessageService);
    authService = inject(AuthService);

    gesId: number = 0;
    gesInfo: GesResponse | null = null;
    loading = false;
    activeTabIndex = 0;

    private destroy$ = new Subject<void>();

    get canEdit(): boolean {
        return this.authService.hasRole('sc');
    }

    ngOnInit(): void {
        this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            const id = parseInt(params['id'], 10);
            if (!isNaN(id)) {
                this.gesId = id;
                this.loadGesInfo();
            } else {
                this.router.navigate(['/notfound']);
            }
        });
    }

    loadGesInfo(): void {
        this.loading = true;
        this.gesService.getGesInfo(this.gesId).subscribe({
            next: (data) => {
                this.gesInfo = data;
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'GES_DETAIL.ERROR_LOADING',
                    detail: err.message
                });
                this.loading = false;
            },
            complete: () => {
                this.loading = false;
            }
        });
    }

    onTabChange(index: string | number): void {
        this.activeTabIndex = Number(index);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
