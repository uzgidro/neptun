import { Component, inject, OnInit } from '@angular/core';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { NgClass } from '@angular/common';
import { Product, ProductService } from '@/pages/service/product.service';
import { ObjectUtils } from 'primeng/utils';
import { FormsModule } from '@angular/forms';

interface expandedRows {
    [key: string]: boolean;
}

interface ges {
    name: string;
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
export class GesWidget implements OnInit {
    products: Product[] = [];
    cascades: ges[] = [];

    expandedRows: expandedRows = {};

    isExpanded: boolean = false;

    private productService = inject(ProductService);

    ngOnInit(): void {
        this.productService.getProductsWithOrdersSmall().then((data) => (this.products = data));
        this.cascades = [
            {
                name: 'Урта Чирчик ГЭСлар каскади ФЛ',
                prod: 82.6,
                totalAgg: 15,
                workingAgg: 11,
                pendingAgg: 4,
                repairingAgg: 0,
                idle: 0,
                ges: [
                    { name: 'ГЭС-6 Чорбог', prod: 56.1, totalAgg: 4, workingAgg: 3, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-27 Ходжикент', prod: 14.2, totalAgg: 3, workingAgg: 2, pendingAgg: 1, repairingAgg: 0, idle: 0 },
                    { name: 'ГЭС-28 Газалкент', prod: 11.2, totalAgg: 3, workingAgg: 1, pendingAgg: 2, repairingAgg: 0, idle: 0 },
                    { name: 'Угам КГЭС-1', prod: 0.3, totalAgg: 1, workingAgg: 1, pendingAgg: 0, repairingAgg: 0, idle: 0 },
                    { name: 'Угам КГЭС-2', prod: 0.3, totalAgg: 1, workingAgg: 1, pendingAgg: 0, repairingAgg: 0, idle: 0 },
                    { name: 'Угам КГЭС-3', prod: 0.4, totalAgg: 1, workingAgg: 1, pendingAgg: 0, repairingAgg: 0, idle: 0 },
                    { name: 'Испайсой микроГЭС', prod: 0.082, totalAgg: 2, workingAgg: 2, pendingAgg: 0, repairingAgg: 0, idle: 0 }
                ]
            },
            {
                name: 'Чирчик ГЭСлар каскади ФЛ',
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
                    { name: 'ВЭУ-750 кВт', prod: 0, totalAgg: 1, workingAgg: 1, pendingAgg: 0, repairingAgg: 0, idle: 0 }
                ]
            },
            {
                name: 'Кодирия ГЭСлар каскади ФЛ',
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
                name: 'Тошкент ГЭСлар каскади ФЛ',
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
                name: 'Куйи Бузсув ГЭСлар каскади ФЛ',
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
            }
        ];
    }

    get isRowsHidden(): boolean {
        return Object.keys(this.expandedRows).length === 0;
    }

    expandAll() {
        if (ObjectUtils.isEmpty(this.expandedRows)) {
            this.expandedRows = this.products.reduce(
                (acc, p) => {
                    if (p.id) {
                        acc[p.id] = true;
                    }
                    return acc;
                },
                {} as { [key: string]: boolean }
            );
            this.isExpanded = true;
        } else {
            this.collapseAll();
        }
    }

    collapseAll() {
        this.expandedRows = {};
        this.isExpanded = false;
    }
}
