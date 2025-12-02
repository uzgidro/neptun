import { Component } from '@angular/core';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { TableModule } from 'primeng/table';
import { DecimalPipe } from '@angular/common';

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
        name: '"Узбекгидроэнерго" АЖ "Самарқанд гидроэлектрстанциялари каскади Филиали',
        value: 165
    },
    {
        name: '"Узбектидроэнерго" АЖ "Тулоланг гидроэлектрстанцияси" филиали',
        value: 222
    },
    {
        name: '"Ўзбекгидроэнерго" АЖ "Туямўйин гидроэлектрстанцияси" филиали',
        value: 98
    },
    {
        name: '"Ўзбекгидроэнерго" АЖ "Ўрта Чирчик гидроэлектрстанциялари каскади" Филиали',
        value: 340
    },
    {
        name: '"Ўзбекгидроэнерго" АЖ "Фарход гидроэлектрстанцияси" филиали',
        value: 236
    },
    {
        name: '"Ўзбекгидроэнерго" АЖ "Хисорак гидроэлектрстанцияси" филиали',
        value: 117
    },
    {
        name: '"Ўзбекгидроэнерго" АЖ "Чирчик гидроэлектрстанциялари каскади" филиал',
        value: 160
    },
    {
        name: '"Ўзбекгидроэнерго" АЖ "Шаҳрихон гидроэлектрстанциялари каскади" филиали',
        value: 93
    },
    {
        name: '"Ўзбекгидроэнерго" АЖ "Тошкент гидроэлектрстанциялари каскади" филиали',
        value: 91
    },
    {
        name: '"Ўзбектидроэнерго" АЖ "Катта Фарғона каналидаги кичик гидроэлектрстанциялари каскади филиал',
        value: 99
    },
    {
        name: '"Ўзбектидроэнерго" АЖ "Андижон гидроэлектрстанцияси" филиали',
        value: 199
    },
    {
        name: '"Ўзбекгидроэнерго" АЖ "Камчик гидроэлектрстанцияси" филиали',
        value: 46
    },
    {
        name: '"Узбекгидроэнерго" АЖ "Кодирия гидроэлектрстанциялари каскади филиали',
        value: 135
    },
    {
        name: '"Ўзбектидроэнерго" АЖ "Қуйи Бузсув гидроэлектрстанциялари каскади" Филиали',
        value: 148
    },
    {
        name: '"Ўзбекгидроэнерго" АЖ "Охангарон гидроэлектрстанцияси" филиали',
        value: 82
    }
];

@Component({
    selector: 'app-employees-widget',
    imports: [DialogComponent, TableModule, DecimalPipe],
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
