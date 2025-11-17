import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { NgClass } from '@angular/common';
import { Message } from 'primeng/message';

let nextId = 0;

@Component({
    selector: 'app-input-text',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, FloatLabel, InputText, NgClass, Message],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputTextComponent),
            multi: true
        }
    ],
    templateUrl: './input-text.component.html',
    styleUrl: './input-text.component.scss'
})
export class InputTextComponent implements ControlValueAccessor {
    @Input() label: string = '"5:AB';
    @Input() submitted: boolean = false;
    @Input() errorMessage: string = '-B> ?>;5 >1O70B5;L=>';
    @Input() required: boolean = true;
    @Input() type: string = 'text';

    uniqueId: string;
    internalValue: string | null = null;
    isDisabled: boolean = false;

    constructor() {
        this.uniqueId = 'input-text_' + nextId++;
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

    onValueChange(newValue: string) {
        this.internalValue = newValue;
        this.onChange(newValue);
    }
}
