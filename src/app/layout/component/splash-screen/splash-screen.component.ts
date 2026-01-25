import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-splash-screen',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './splash-screen.component.html',
    styleUrl: './splash-screen.component.scss',
    animations: [
        trigger('fadeOut', [
            state('visible', style({ opacity: 1 })),
            state('hidden', style({ opacity: 0 })),
            transition('visible => hidden', animate('600ms ease-out'))
        ])
    ]
})
export class SplashScreenComponent implements OnInit, OnDestroy {
    @Input() duration: number = 3500;
    @Output() complete = new EventEmitter<void>();

    isVisible: boolean = true;
    animationState: 'visible' | 'hidden' = 'visible';

    // Power generation counter
    currentPower: number = 0;
    targetPower: number = 2847; // МВт

    // Animation states
    lightningActive: boolean = false;
    private animationInterval: any;
    private powerInterval: any;
    private hideTimeout: any;

    ngOnInit(): void {
        this.startAnimations();
        this.animatePowerCounter();

        this.hideTimeout = setTimeout(() => {
            this.hide();
        }, this.duration);
    }

    ngOnDestroy(): void {
        this.clearIntervals();
    }

    private startAnimations(): void {
        this.animationInterval = setInterval(() => {
            this.lightningActive = true;
            setTimeout(() => {
                this.lightningActive = false;
            }, 150);
        }, 800);
    }

    private animatePowerCounter(): void {
        const step = this.targetPower / 50;
        let current = 0;

        this.powerInterval = setInterval(() => {
            current += step;
            if (current >= this.targetPower) {
                this.currentPower = this.targetPower;
                clearInterval(this.powerInterval);
            } else {
                this.currentPower = Math.round(current);
            }
        }, 40);
    }

    private clearIntervals(): void {
        if (this.animationInterval) clearInterval(this.animationInterval);
        if (this.powerInterval) clearInterval(this.powerInterval);
        if (this.hideTimeout) clearTimeout(this.hideTimeout);
    }

    hide(): void {
        this.animationState = 'hidden';
        setTimeout(() => {
            this.isVisible = false;
            this.complete.emit();
        }, 600);
    }
}
