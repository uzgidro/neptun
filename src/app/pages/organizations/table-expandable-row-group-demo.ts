import { Component, inject, OnInit } from '@angular/core';
import { Ripple } from 'primeng/ripple';
import { Tag } from 'primeng/tag';
import { Button, ButtonDirective } from 'primeng/button';
import { CurrencyPipe } from '@angular/common';
import { Rating } from 'primeng/rating';
import { TableModule } from 'primeng/table';
import { Customer, CustomerService } from '@/pages/service/customer.service';
import { FormsModule } from '@angular/forms';
import { ObjectUtils } from 'primeng/utils';
import { Product, ProductService } from '@/pages/service/product.service';

@Component({
    selector: 'table-expandable-row-group-demo',
    templateUrl: 'table-expandable-row-group-demo.html',
    standalone: true,
    imports: [Button, ButtonDirective, CurrencyPipe, Rating, Ripple, TableModule, Tag, FormsModule],
    providers: [CustomerService],
    styles: [
        `
            :host ::ng-deep .p-rowgroup-footer td {
                font-weight: 700;
            }

            :host ::ng-deep .p-rowgroup-header {
                span {
                    font-weight: 700;
                }

                .p-row-toggler {
                    vertical-align: middle;
                    margin-right: 0.25rem;
                }
            }
        `
    ]
})
export class TableExpandableRowGroupDemo implements OnInit {
    customers!: Customer[];
    products: Product[] = [];
    isExpanded: boolean = false;
    expandedRows: { [key: string]: boolean } = {};

    private productService = inject(ProductService);



    ngOnInit() {
        this.productService.getProductsWithOrdersSmall().then((data) => (this.products = data));

        // this.customerService.getCustomersMedium().then((data) => {
        //     this.customers = data;
        // });
    }


    expandAll() {
        if(ObjectUtils.isEmpty(this.expandedRows)) {
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
            this.collapseAll()
        }

    }

    collapseAll() {
        this.expandedRows = {};
        this.isExpanded = false;
    }















    calculateCustomerTotal(name: string) {
        let total = 0;

        if (this.customers) {
            for (let customer of this.customers) {
                if (customer.representative?.name === name) {
                    total++;
                }
            }
        }

        return total;
    }

    getSeverity(status: string) {
        switch (status) {
            case 'unqualified':
                return 'danger';

            case 'qualified':
                return 'success';

            case 'new':
                return 'info';

            case 'negotiation':
                return 'warn';

            case 'renewal':
                return null;
            default:
                return 'info';
        }
    }
}
