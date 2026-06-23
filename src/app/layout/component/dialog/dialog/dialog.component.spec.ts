import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Button } from 'primeng/button';

import { DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
    let component: DialogComponent;
    let fixture: ComponentFixture<DialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DialogComponent],
            providers: [provideNoopAnimations()]
        }).compileComponents();

        fixture = TestBed.createComponent(DialogComponent);
        component = fixture.componentInstance;
        component.header = 'Test';
        component.visible = true;
    });

    function saveButton(): Button | null {
        // The save button is the last p-button in the footer.
        const buttons = fixture.debugElement.queryAll(By.directive(Button));
        return buttons.length ? buttons[buttons.length - 1].componentInstance as Button : null;
    }

    it('save button stays enabled when the form is invalid', () => {
        component.form = new FormGroup({
            name: new FormControl('', Validators.required) // empty → invalid
        });
        fixture.detectChanges();
        expect(component.form.invalid).toBeTrue();
        expect(saveButton()?.disabled).toBeFalsy();
    });

    it('save button is disabled only while submitting', () => {
        component.form = new FormGroup({ name: new FormControl('', Validators.required) });
        component.submitting = true;
        fixture.detectChanges();
        expect(saveButton()?.disabled).toBeTrue();
    });

    it('onSaveClick emits save even when the form is invalid', () => {
        component.form = new FormGroup({ name: new FormControl('', Validators.required) });
        fixture.detectChanges();
        const spy = jasmine.createSpy('save');
        component.save.subscribe(spy);
        component.onSaveClick();
        expect(spy).toHaveBeenCalled();
    });
});
