import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '@/core/services/auth.service';
import { ConfigTabComponent } from './config-tab/config-tab.component';
import { DataEntryTabComponent } from './data-entry-tab/data-entry-tab.component';
import { PlansTabComponent } from './plans-tab/plans-tab.component';
import { HasUnsavedChanges } from '@/core/guards/auth.guard';

interface TabDef {
    key: string;
    label: string;
    requiresScRais?: boolean;
}

@Component({
    selector: 'app-ges-daily-report',
    standalone: true,
    imports: [
        TranslateModule,
        Tabs, TabList, Tab, TabPanels, TabPanel,
        ConfigTabComponent,
        DataEntryTabComponent,
        PlansTabComponent
    ],
    templateUrl: './daily-report.component.html'
})
export class DailyReportComponent implements HasUnsavedChanges, OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private authService = inject(AuthService);

    @ViewChild(DataEntryTabComponent) dataEntryTab?: DataEntryTabComponent;

    isScOrRais = this.authService.isScOrRais();

    allTabs: TabDef[] = [
        { key: 'data-entry', label: 'GES_REPORT.DATA_ENTRY' },
        { key: 'plans', label: 'GES_REPORT.PLANS', requiresScRais: true },
        { key: 'config', label: 'GES_REPORT.CONFIG', requiresScRais: true }
    ];

    get tabs(): TabDef[] {
        return this.allTabs.filter(t => !t.requiresScRais || this.isScOrRais);
    }

    activeTab = '';

    ngOnInit(): void {
        const tab = this.route.snapshot.queryParamMap.get('tab');
        const validKeys = this.tabs.map(t => t.key);
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

    canDeactivate(): boolean {
        return this.dataEntryTab ? this.dataEntryTab.canDeactivate() : true;
    }
}
