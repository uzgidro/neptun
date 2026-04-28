import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '@/core/services/auth.service';
import { HasUnsavedChanges } from '@/core/guards/auth.guard';
import { HourlyTabComponent } from './hourly-tab/hourly-tab.component';
import { ConfigTabComponent } from './config-tab/config-tab.component';

@Component({
    selector: 'app-reservoir-flood',
    standalone: true,
    imports: [
        CommonModule,
        TranslateModule,
        Tabs,
        TabList,
        Tab,
        TabPanels,
        TabPanel,
        HourlyTabComponent,
        ConfigTabComponent
    ],
    templateUrl: './reservoir-flood.component.html',
    styleUrls: ['./reservoir-flood.component.scss']
})
export class ReservoirFloodComponent implements HasUnsavedChanges {
    private authService = inject(AuthService);

    @ViewChild(HourlyTabComponent) hourlyTab?: HourlyTabComponent;

    activeTab: string = 'hourly';

    get canEditConfig(): boolean {
        return this.authService.hasRole('sc');
    }

    canDeactivate(): boolean {
        return this.hourlyTab ? !this.hourlyTab.hasUnsavedChanges() : true;
    }

    onTabChange(key: string | number): void {
        this.activeTab = String(key);
    }
}
