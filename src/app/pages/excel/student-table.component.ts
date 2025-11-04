import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { StudentData } from './excel.component';

@Component({
    selector: 'app-student-table',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule],
    template: `
        <div class="card">
            <div class="flex justify-between items-center mb-4">
                <h5 class="font-semibold text-xl m-0">{{ title }}</h5>
                <p-button label="Добавить" icon="pi pi-plus" (click)="onAdd.emit()"></p-button>
            </div>

            <p-table [value]="tableData" dataKey="id" [tableStyle]="{ 'min-width': '50rem' }">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Школа</th>
                        <th>Ученик</th>
                        <th>Класс</th>
                        <th>Возраст</th>
                        <th style="width: 5rem"></th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-student>
                    <tr>
                        <td>{{ student.school }}</td>
                        <td>{{ student.student }}</td>
                        <td>{{ student.class }}</td>
                        <td>{{ student.age }}</td>
                        <td><p-button icon="pi pi-trash" styleClass="p-button-danger p-button-text" (click)="onDelete.emit(student)"></p-button></td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class StudentTableComponent {
    @Input() title: string = 'Список учеников';
    @Input() tableData: StudentData[] = [];
    @Output() onAdd = new EventEmitter<void>();
    @Output() onDelete = new EventEmitter<StudentData>();
}