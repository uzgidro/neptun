import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { MultiSelect } from 'primeng/multiselect';
import { NgClass } from '@angular/common';
import { Message } from 'primeng/message';

let nextId = 0;

@Component({
    selector: 'app-multi-select',
    imports: [FloatLabel, MultiSelect, FormsModule, NgClass, Message, ReactiveFormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultiSelectComponent),
            multi: true
        }
    ],
    templateUrl: './multi-select.component.html',
    styleUrl: './multi-select.component.scss'
})
export class MultiSelectComponent implements ControlValueAccessor {
    @Input() label: string = 'Выбор';
    @Input() loading: boolean = false;
    @Input() disable: boolean = false;
    @Input() submitted: boolean = false;
    @Input() filter: boolean = true;
    @Input() showClear: boolean = true;
    @Input() required: boolean = true;
    @Input() errorMessage: string = 'Выбор обязателен';

    @Input() items: any[] = [];

    @Input() optionLabel: string = 'name';
    @Input() optionValue: string | undefined;
    @Input() placeholder: string | undefined;
    @Input() styleClass: string = '';
    @Input() style: Record<string, string> | undefined;
    @Input() appendTo: string = 'body';

    @Input() maxSelectedLabels: number = 3;
    @Input() selectionLimit: number = 0;
    @Input() display: string = 'comma';

    internalValue: any[] = [];
    isDisabled: boolean = false;
    uniqueId: string;

    protected onChange = (value: any) => {};
    protected onTouched = () => {};

    constructor() {
        this.uniqueId = 'multi_select_' + nextId++;
    }

    writeValue(value: any): void {
        this.internalValue = value ?? [];
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
    }

    get isEmpty(): boolean {
        return !this.internalValue || this.internalValue.length === 0;
    }
}
