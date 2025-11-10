import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { Select } from 'primeng/select';
import { NgClass } from '@angular/common';
import { Message } from 'primeng/message';
import { PrimeTemplate } from 'primeng/api';

let nextId = 0

@Component({
    selector: 'app-group-select',
    imports: [FloatLabel, Select, FormsModule, NgClass, Message, PrimeTemplate, ReactiveFormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => GroupSelectComponent),
            multi: true
        }
    ],
    templateUrl: './group-select.component.html',
    styleUrl: './group-select.component.scss'
})
export class GroupSelectComponent implements ControlValueAccessor {
    @Input() label: string = 'Выбор';
    @Input() loading: boolean = false;
    @Input() disable: boolean = false;
    @Input() submitted: boolean = false;
    @Input() errorMessage: string = 'Выбор обязателен';

    @Input() items: any[] = [];

    internalValue: any = null;
    isDisabled: boolean = false;
    uniqueId: string;

    protected onChange = (value: any) => {};
    protected onTouched = () => {};

    constructor() {
        this.uniqueId = 'group_select_' + nextId++;
    }

    writeValue(value: any): void {
        this.internalValue = value;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    onValueChange(newValue: any) {
        this.internalValue = newValue;
        this.onChange(newValue);
        this.onTouched();
    }
}
