import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { DatePicker } from 'primeng/datepicker';
import { Message } from 'primeng/message';

let nextId = 0

@Component({
    selector: 'app-date-picker',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, FloatLabel, DatePicker, Message],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DatePickerComponent),
            multi: true
        }
    ],
    templateUrl: './date-picker.component.html',
    styleUrl: './date-picker.component.scss'
})
export class DatePickerComponent implements ControlValueAccessor {
    @Input() label: string = 'Дата';
    @Input() submitted: boolean = false;
    @Input() isEditMode: boolean = false;
    @Input() maxDate: Date = new Date();
    @Input() errorMessage: string = 'Это поле обязательно';

    uniqueId: string;
    internalValue: Date | null = null;
    isDisabled: boolean = false;

    constructor() {
        this.uniqueId = 'date_picker_' + nextId++;
    }

    onChange = (value: any) => {};
    onTouched = () => {};


    fuck(fn: any) {
        console.log(fn);
    }


    writeValue(value: any): void {
        console.log('write value: ' +value);
        if (value && !(value instanceof Date)) {
            this.internalValue = new Date(value);
        } else {
            this.internalValue = value;
        }
    }

    registerOnChange(fn: any): void {
        console.log('register on change'+fn);
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        console.log('reg on touch'+fn);
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        console.log('set disabled'+isDisabled);
        this.isDisabled = isDisabled;
    }

    onValueChange(newValue: Date) {
        console.log('on value change'+newValue);
        this.internalValue = newValue;
        this.onChange(newValue);
        this.onTouched();
    }
}
