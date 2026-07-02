import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { ShutdownDischargeComponent } from '@/pages/situation-center/ges/shutdown/shutdown_discharges/shutdown-discharge.component';
import { DischargeSummaryComponent } from './summary-tab/discharge-summary.component';
import { AuthService } from '@/core/services/auth.service';

interface TabDef {
    key: string;
    label: string;
    requiresScRais?: boolean;
}

@Component({
    selector: 'app-discharges',
    imports: [ShutdownDischargeComponent, DischargeSummaryComponent, TranslateModule, Tabs, TabList, Tab, TabPanels, TabPanel],
    templateUrl: './discharges.component.html',
    styleUrl: './discharges.component.scss'
})
export class DischargesComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private authService = inject(AuthService);

    isScOrRais = this.authService.isScOrRais();

    allTabs: TabDef[] = [
        { key: 'journal', label: 'SITUATION_CENTER.DISCHARGE.TAB_JOURNAL' },
        // API сводки отдаёт 403 не-sc/rais, хотя raisGuard пускает сюда и другие роли.
        { key: 'summary', label: 'SITUATION_CENTER.DISCHARGE.TAB_SUMMARY', requiresScRais: true }
    ];

    get tabs(): TabDef[] {
        return this.allTabs.filter((t) => !t.requiresScRais || this.isScOrRais);
    }

    activeTab = '';

    selectedDate: Date | null = null;

    ngOnInit(): void {
        const tab = this.route.snapshot.queryParamMap.get('tab');
        const validKeys = this.tabs.map((t) => t.key);
        this.activeTab = tab && validKeys.includes(tab) ? tab : validKeys[0];
    }

    onTabChange(key: string | number): void {
        this.activeTab = String(key);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { tab: this.activeTab },
            queryParamsHandling: 'merge'
        });
    }

    onDateChange(date: Date): void {
        this.selectedDate = date;
    }
}
