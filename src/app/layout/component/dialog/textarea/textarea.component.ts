import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { Textarea } from 'primeng/textarea';
import { NgClass } from '@angular/common';
import { Message } from 'primeng/message';

let nextId = 0

@Component({
    selector: 'app-textarea',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, FloatLabel, Textarea, NgClass, Message],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextareaComponent),
            multi: true
        }
    ],
    templateUrl: './textarea.component.html',
    styleUrl: './textarea.component.scss'
})
export class TextareaComponent implements ControlValueAccessor {
    @Input() label: string = 'Текст';
    @Input() submitted: boolean = false;
    @Input() errorMessage: string = 'Это поле обязательно';
    @Input() rows: number = 3;
    @Input() required: boolean = false;

    uniqueId: string;
    internalValue: string | null = null;
    isDisabled: boolean = false;

    constructor() {
        this.uniqueId = 'textarea_' + nextId++;
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
