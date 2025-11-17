import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { NgClass } from '@angular/common';
import { ObjectUtils } from 'primeng/utils';
import { FormsModule } from '@angular/forms';

interface expandedRows {
    [key: string]: boolean;
}

interface ges {
    name: string;
    directorName?: string;
    phoneNumber?: string;
    prod: number;
    totalAgg: number;
    workingAgg: number;
    pendingAgg: number;
    repairingAgg: number;
    idle: number;
    ges?: ges[];
}

@Component({
    selector: 'app-ges-widget',
    imports: [ButtonDirective, Ripple, TableModule, Button, FormsModule, ButtonIcon, NgClass, ButtonLabel],
    templateUrl: './ges.widget.html',
    styleUrl: './ges.widget.scss'
})
class GesWidget implements OnInit {
    cascades: ges[] = [];

    expandedRows: expandedRows = {};

    isExpanded: boolean = false;

    @Output() expansionChange = new EventEmitter<boolean>();

    ngOnInit(): void {
        this.cascades = [
            {
                'name': 'Ўрта Чирчиқ ГЭСлар каскади ФЛ(7)',
                'directorName': 'Олимов Алишер Норимбоевич',
                "phoneNumber": '+998950900320',
                'prod': 82.6,
                'totalAgg': 15,
                'workingAgg': 11,
                'pendingAgg': 4,
                'repairingAgg': 0,
                'idle': 0,
                'ges': [
                    { 'name': 'ГЭС-6 Чорбог', 'prod': 56.1, 'totalAgg': 4, 'workingAgg': 3, 'pendingAgg': 1, 'repairingAgg': 0, 'idle': 0 },
                    { 'name': 'ГЭС-27 Ходжикент', 'prod': 14.2, 'totalAgg': 3, 'workingAgg': 2, 'pendingAgg': 1, 'repairingAgg': 0, 'idle': 0 },
                    { 'name': 'ГЭС-28 Газалкент', 'prod': 11.2, 'totalAgg': 3, 'workingAgg': 1, 'pendingAgg': 2, 'repairingAgg': 0, 'idle': 0 },
                    { 'name': 'Угам КГЭС-1', 'prod': 0.3, 'totalAgg': 1, 'workingAgg': 1, 'pendingAgg': 0, 'repairingAgg': 0, 'idle': 0 },
                    { 'name': 'Угам КГЭС-2', 'prod': 0.3, 'totalAgg': 1, 'workingAgg': 1, 'pendingAgg': 0, 'repairingAgg': 0, 'idle': 0 },
                    { 'name': 'Угам КГЭС-3', 'prod': 0.4, 'totalAgg': 1, 'workingAgg': 1, 'pendingAgg': 0, 'repairingAgg': 0, 'idle': 0 },
                    { 'name': 'Испайсой микроГЭС', 'prod': 0.082, 'totalAgg': 2, 'workingAgg': 2, 'pendingAgg': 0, 'repairingAgg': 0, 'idle': 0 }
                ]
            },
            {
                name: 'Чирчик ГЭСлар каскади ФЛ(4)',
                directorName: 'Шодмонов Абдурасул Абдурашидович',
                prod: 29.3,
                totalAgg: 15,
                workingAgg: 6,
                pendingAgg: 9,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'ГЭС-8 Товоксой', prod: 9.9, totalAgg: 4, workingAgg: 2, pendingAgg: 2, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-7 Чирчик', prod: 11.3, totalAgg: 4, workingAgg: 2, pendingAgg: 2, repairingAgg: 0, idle: 0 },
                    { name: 'Камолот ГЭС', prod: 0, totalAgg: 4, workingAgg: 0, pendingAgg: 4, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-10 Окковок', prod: 8, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                ]
            },
            {
                name: 'Кодирия ГЭСлар каскади ФЛ(4)',
                directorName: 'Таджибаев Алишер Абдурахим ўғли',
                prod: 10.1,
                totalAgg: 6,
                workingAgg: 5,
                pendingAgg: 1,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'ГЭС-15 Окковок ГЭС-2', prod: 1.9, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-11 Кибрай', prod: 4, totalAgg: 1, workingAgg: 1, pendingAgg: 0, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-3 Кодирия', prod: 3.8, totalAgg: 2, workingAgg: 2, pendingAgg: 0, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-12 Салар', prod: 0.4, totalAgg: 1, workingAgg: 1, pendingAgg: 0, repairingAgg: 0, idle: 0 },
                ]
            },
            {
                name: 'Тошкент ГЭСлар каскади ФЛ(4)',
                directorName: 'Рўзиохунов Адхам Турсунмуродович',
                prod: 4.4,
                totalAgg: 9,
                workingAgg: 6,
                pendingAgg: 3,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'ГЭС-1 Бузсув', prod: 1.8, totalAgg: 2, workingAgg: 2, pendingAgg: 0, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-21 Шайхонтохур', prod: 0.5, totalAgg: 3, workingAgg: 2, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-4 Бурижар', prod: 0.9, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-9 Октепа', prod: 1.2, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                ]
            },
            {
                name: 'Куйи Бузсув ГЭСлар каскади ФЛ(6)',
                directorName: 'Розубаев Дилмурад Якуббаевич',
                prod: 4.4,
                totalAgg: 13,
                workingAgg: 4,
                pendingAgg: 9,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'ГЭС-14', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-18', prod: 0, totalAgg: 3, workingAgg: 0, pendingAgg: 3, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-19', prod: 0, totalAgg: 2, workingAgg: 0, pendingAgg: 2, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-23', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-22', prod: 0.6, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-41 Туябугиз', prod: 0.7, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                ]
            },
            {
                name: 'Фарход ГЭСлар каскади ФЛ(4)',
                directorName: 'Абдукаюмов Абдумажид Ворисович',
                prod: 4.4,
                totalAgg: 13,
                workingAgg: 4,
                pendingAgg: 9,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'ГЭС-16 Фарход ГЭС', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Сардоба сув омбори', prod: 0, totalAgg: 3, workingAgg: 0, pendingAgg: 3, repairingAgg: 0, idle: 0 },
                    { name: 'Зомин микроГЭС', prod: 0, totalAgg: 2, workingAgg: 0, pendingAgg: 2, repairingAgg: 0, idle: 0 },
                    { name: 'Жиззах микроГЭС', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                ]
            },
            {
                name: 'Самарканд ГЭСлар каскади ФЛ(15)',
                directorName: 'Пирмухамедов Бахтиёр Хуршидович',
                prod: 4.4,
                totalAgg: 13,
                workingAgg: 4,
                pendingAgg: 9,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'ГЭС-2Б Хишров ГЭС', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-3Б Иртишар ГЭС', prod: 0, totalAgg: 3, workingAgg: 0, pendingAgg: 3, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-1Б Талигулян-1', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-5Б Талигулян-3', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Ургут ГЭС', prod: 0, totalAgg: 2, workingAgg: 0, pendingAgg: 2, repairingAgg: 0, idle: 0 },
                    { name: 'Пасдарғом микроГЭС-3', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Шаудар-2 (ПК-135)', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Шаудар-3 (ПК-102)', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Микро ГЭС-2,3 (1Б)', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Микро ГЭС-3,4 (5Б)', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Микро ГЭС-1 (3Б)', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'МикроГЭС-2', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'МикроГЭС-3', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'МикроГЭС-8', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'МикроГЭС-10', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },

                ]
            },
            {
                name: 'Андижон ГЭСлар каскади ФЛ(4)',
                directorName: 'Нуриддинов Махмуд Тожибоевич',
                prod: 4.4,
                totalAgg: 13,
                workingAgg: 4,
                pendingAgg: 9,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'ГЭС-29 Андижон-1', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-36 Андижон-2', prod: 0, totalAgg: 3, workingAgg: 0, pendingAgg: 3, repairingAgg: 0, idle: 0 },
                    { name: 'Кудаш ГЭС', prod: 0, totalAgg: 2, workingAgg: 0, pendingAgg: 2, repairingAgg: 0, idle: 0 },
                    { name: 'Хонобод микроГЭС', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                ]
            },
            {
                name: 'Шахрихон ГЭСлар каскади ФЛ(8)',
                directorName: 'Ахмедов Темур Ботиржонович',
                prod: 4.4,
                totalAgg: 13,
                workingAgg: 4,
                pendingAgg: 9,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'ГЭС-5А', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-6А', prod: 0, totalAgg: 3, workingAgg: 0, pendingAgg: 3, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-ЮФК-1', prod: 0, totalAgg: 2, workingAgg: 0, pendingAgg: 2, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-ЮФК-2', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Заврақ микроГЭС', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Олтинкўл микроГЭС', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Водил микроГЭС', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Шохимардон КГЭС', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                ]
            },
            {
                name: 'КФК КГЭСлар каскади ФЛ(5)',
                directorName: 'Камолов Абдурашид Авазхон ўғли',
                prod: 4.4,
                totalAgg: 13,
                workingAgg: 4,
                pendingAgg: 9,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'ГЭС-8А', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-9А', prod: 0, totalAgg: 3, workingAgg: 0, pendingAgg: 3, repairingAgg: 0, idle: 0 },
                    { name: 'Норин ГЭС-1', prod: 0, totalAgg: 2, workingAgg: 0, pendingAgg: 2, repairingAgg: 0, idle: 0 },
                    { name: 'Чортоқ микроГЭС-1,2', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Янгиариқ микроГЭС', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                ]
            },
            {
                name: 'Тўполанг ГЭСлар каскади ФЛ(7)',
                directorName: 'Улуғов Асрор Аскаралиевич',
                prod: 4.4,
                totalAgg: 13,
                workingAgg: 4,
                pendingAgg: 9,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'ГЭС-34 Тўполанг ГЭС', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-43 (Зарчоб ГЭС-1)', prod: 0, totalAgg: 3, workingAgg: 0, pendingAgg: 3, repairingAgg: 0, idle: 0 },
                    { name: 'Зарчоб КГЭС-1а', prod: 0, totalAgg: 2, workingAgg: 0, pendingAgg: 2, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-44 (Зарчоб ГЭС-2)', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Зарчоб КГЭС-2а', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Зарчоб КГЭС-3', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Қумқўрғон микроГЭС', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                ]
            },
            {
                name: 'Оҳангарон ГЭС ФЛ(3)',
                directorName: 'Иброхим Абдусаматович Рахманов',
                prod: 4.4,
                totalAgg: 13,
                workingAgg: 4,
                pendingAgg: 9,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'ГЭС-35 Оҳангарон ГЭС', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Оҳангарон микроГЭС', prod: 0, totalAgg: 3, workingAgg: 0, pendingAgg: 3, repairingAgg: 0, idle: 0 },
                    { name: 'Эртошсой ГЭСа', prod: 0, totalAgg: 2, workingAgg: 0, pendingAgg: 2, repairingAgg: 0, idle: 0 },
                ]
            },
            {
                name: 'Оҳангарон ГЭС ФЛ(3)',
                directorName: 'Исмоилов Отабек Улугбекович',
                prod: 4.4,
                totalAgg: 13,
                workingAgg: 4,
                pendingAgg: 9,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'ГЭС-35 Оҳангарон ГЭС', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Оҳангарон микроГЭС', prod: 0, totalAgg: 3, workingAgg: 0, pendingAgg: 3, repairingAgg: 0, idle: 0 },
                    { name: 'Эртошсой ГЭСа', prod: 0, totalAgg: 2, workingAgg: 0, pendingAgg: 2, repairingAgg: 0, idle: 0 },
                ]
            },
            {
                name: 'Туямуйин ГЭС ФЛ(1)',
                directorName: 'Дурдиев Адилбек',
                prod: 4.4,
                totalAgg: 13,
                workingAgg: 4,
                pendingAgg: 9,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'Туямуйин ГЭС-30', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                ]
            },
            {
                name: 'Хисорак ГЭС ФЛ(3)',
                directorName: 'Курбонов Фарход Илхомович',
                prod: 4.4,
                totalAgg: 13,
                workingAgg: 4,
                pendingAgg: 9,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'ГЭС-35 Оҳангарон ГЭС', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'Оҳангарон микроГЭС', prod: 0, totalAgg: 3, workingAgg: 0, pendingAgg: 3, repairingAgg: 0, idle: 0 },
                    { name: 'Эртошсой ГЭСа', prod: 0, totalAgg: 2, workingAgg: 0, pendingAgg: 2, repairingAgg: 0, idle: 0 },
                ]
                },
            {
                name: 'Камчик КГЭС ФЛ(1)',
                directorName: 'Халбаев Джамалиддин Эрматович',
                prod: 4.4,
                totalAgg: 13,
                workingAgg: 4,
                pendingAgg: 9,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'Камчик КГЭС-42', prod: 1.3, totalAgg: 2, workingAgg: 1, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                ]
            }
        ];
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
