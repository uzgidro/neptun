import { Component } from '@angular/core';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { TableModule } from 'primeng/table';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface OrganizationOption {
    name: string;
    value: number;
}

const ORGANIZATIONS: OrganizationOption[] = [
    {
        name: 'Центральный аппарат',
        value: 150
    },
    {
        name: '"МолокоПром" АО - Производственный кластер "Самарканд"',
        value: 165
    },
    {
        name: '"МолокоПром" АО - Молокозавод "Ташкент-1"',
        value: 222
    },
    {
        name: '"МолокоПром" АО - Молокозавод "Фергана"',
        value: 98
    },
    {
        name: '"МолокоПром" АО - Производственный кластер "Центр"',
        value: 340
    },
    {
        name: '"МолокоПром" АО - Молокозавод "Бухара"',
        value: 236
    },
    {
        name: '"МолокоПром" АО - Мини-цех "Навои"',
        value: 117
    },
    {
        name: '"МолокоПром" АО - Производственный кластер "Восток"',
        value: 160
    },
    {
        name: '"МолокоПром" АО - Молокозавод "Андижан"',
        value: 93
    },
    {
        name: '"МолокоПром" АО - Молокозавод "Ташкент-2"',
        value: 91
    },
    {
        name: '"МолокоПром" АО - Производственный кластер "Запад"',
        value: 99
    },
    {
        name: '"МолокоПром" АО - Молокозавод "Наманган"',
        value: 199
    },
    {
        name: '"МолокоПром" АО - Филиал "Джизак"',
        value: 46
    },
    {
        name: '"МолокоПром" АО - Мини-цех "Карши"',
        value: 135
    },
    {
        name: '"МолокоПром" АО - Филиал "Хорезм"',
        value: 148
    },
    {
        name: '"МолокоПром" АО - Мини-цех "Термез"',
        value: 82
    }
];

@Component({
    selector: 'app-employees-widget',
    imports: [DialogComponent, TableModule, DecimalPipe, TranslateModule],
    templateUrl: './employees-widget.component.html',
    styleUrl: './employees-widget.component.scss'
})
export class EmployeesWidget {
    showDialog: boolean = false;
    organizations = ORGANIZATIONS;

    get totalEmployees(): number {
        return this.organizations.reduce((sum, org) => sum + org.value, 0);
    }

    openDialog() {
        this.showDialog = true;
    }
}
