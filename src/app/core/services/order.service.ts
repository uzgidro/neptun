import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Order, OrderPayload, OrderStatus } from '@/core/interfaces/order';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private mockOrders: Order[] = [
        {
            id: 1,
            number: '001-П',
            date: '2025-01-15',
            title: 'О назначении ответственных лиц',
            description: 'Приказ о назначении ответственных лиц за безопасность на объектах',
            status: 'signed',
            signedBy: 'Иванов И.И.',
            createdAt: '2025-01-15T10:00:00'
        },
        {
            id: 2,
            number: '002-П',
            date: '2025-01-20',
            title: 'О проведении планового ремонта',
            description: 'Приказ о проведении планового ремонта производственного оборудования',
            status: 'pending',
            createdAt: '2025-01-20T09:30:00'
        },
        {
            id: 3,
            number: '003-П',
            date: '2025-02-01',
            title: 'Об утверждении графика отпусков',
            description: 'Приказ об утверждении графика отпусков на 2025 год',
            status: 'signed',
            signedBy: 'Петров П.П.',
            createdAt: '2025-02-01T14:00:00'
        },
        {
            id: 4,
            number: '004-П',
            date: '2025-02-10',
            title: 'О премировании сотрудников',
            description: 'Приказ о премировании сотрудников по итогам работы за январь',
            status: 'draft',
            createdAt: '2025-02-10T11:00:00'
        },
        {
            id: 5,
            number: '005-П',
            date: '2025-02-15',
            title: 'Об изменении штатного расписания',
            description: 'Приказ об изменении штатного расписания организации',
            status: 'cancelled',
            createdAt: '2025-02-15T16:00:00'
        }
    ];

    private nextId = 6;

    getAll(): Observable<Order[]> {
        return of([...this.mockOrders]).pipe(delay(300));
    }

    getById(id: number): Observable<Order | undefined> {
        const order = this.mockOrders.find(o => o.id === id);
        return of(order).pipe(delay(200));
    }

    create(payload: OrderPayload): Observable<Order> {
        const newOrder: Order = {
            id: this.nextId++,
            ...payload,
            createdAt: new Date().toISOString()
        };
        this.mockOrders.unshift(newOrder);
        return of(newOrder).pipe(delay(300));
    }

    update(id: number, payload: OrderPayload): Observable<Order> {
        const index = this.mockOrders.findIndex(o => o.id === id);
        if (index !== -1) {
            this.mockOrders[index] = {
                ...this.mockOrders[index],
                ...payload,
                updatedAt: new Date().toISOString()
            };
            return of(this.mockOrders[index]).pipe(delay(300));
        }
        throw new Error('Order not found');
    }

    delete(id: number): Observable<void> {
        const index = this.mockOrders.findIndex(o => o.id === id);
        if (index !== -1) {
            this.mockOrders.splice(index, 1);
        }
        return of(undefined).pipe(delay(300));
    }

    getStatusLabel(status: OrderStatus): string {
        const labels: Record<OrderStatus, string> = {
            draft: 'Черновик',
            pending: 'На согласовании',
            signed: 'Подписан',
            cancelled: 'Отменён'
        };
        return labels[status];
    }

    getStatusSeverity(status: OrderStatus): 'info' | 'warn' | 'success' | 'danger' | 'secondary' | 'contrast' {
        const severities: Record<OrderStatus, 'info' | 'warn' | 'success' | 'danger'> = {
            draft: 'info',
            pending: 'warn',
            signed: 'success',
            cancelled: 'danger'
        };
        return severities[status];
    }
}
