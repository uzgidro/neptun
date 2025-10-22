import { Component, inject, OnInit } from '@angular/core';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Rating } from 'primeng/rating';
import { Tag } from 'primeng/tag';
import { Product, ProductService } from '@/pages/service/product.service';
import { ObjectUtils } from 'primeng/utils';
import { FormsModule } from '@angular/forms';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-ges-widget',
    imports: [ButtonDirective, Ripple, TableModule, Button, CurrencyPipe, Rating, Tag, FormsModule, ButtonIcon, NgClass, ButtonLabel],
    templateUrl: './ges.widget.html',
    styleUrl: './ges.widget.scss'
})
export class GesWidget implements OnInit {
    products: Product[] = [];

    expandedRows: expandedRows = {};

    isExpanded: boolean = false;

    private productService = inject(ProductService);

    ngOnInit(): void {
        this.productService.getProductsWithOrdersSmall().then((data) => (this.products = data));
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

    getSeverity(status: string) {
        switch (status) {
            case 'qualified':
            case 'instock':
            case 'INSTOCK':
            case 'DELIVERED':
            case 'delivered':
                return 'success';

            case 'negotiation':
            case 'lowstock':
            case 'LOWSTOCK':
            case 'PENDING':
            case 'pending':
                return 'warn';

            case 'unqualified':
            case 'outofstock':
            case 'OUTOFSTOCK':
            case 'CANCELLED':
            case 'cancelled':
                return 'danger';

            default:
                return 'info';
        }
    }
}
