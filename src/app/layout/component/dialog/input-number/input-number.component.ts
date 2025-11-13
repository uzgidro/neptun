import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { NgClass } from '@angular/common';
import { Message } from 'primeng/message';

let nextId = 0;

@Component({
    selector: 'app-input-number',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, FloatLabelModule, InputNumberModule, NgClass, Message],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputNumberdComponent),
            multi: true
        }
    ],
    templateUrl: './input-number.component.html',
    styleUrl: './input-number.component.scss'
})
export class InputNumberdComponent implements ControlValueAccessor {
    @Input() label: string = 'Число';
    @Input() submitted: boolean = false;
    @Input() errorMessage: string = 'Это поле обязательно';
    @Input() required: boolean = false;
    @Input() showButtons: boolean = true;
    @Input() mode: 'decimal' | 'currency' = 'decimal';

    uniqueId: string;
    internalValue: number | null = null;
    isDisabled: boolean = false;

    constructor() {
        this.uniqueId = 'input-number_' + nextId++;
    }

    onChange = (value: any) => {};
    onTouched = () => {};

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

    onValueChange(newValue: number) {
        this.internalValue = newValue;
        this.onChange(newValue);
    }
}
