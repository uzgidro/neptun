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
    @Input() duration: number = 4000;
    @Output() complete = new EventEmitter<void>();

    isVisible: boolean = true;
    animationState: 'visible' | 'hidden' = 'visible';

    private hideTimeout: any;

    ngOnInit(): void {
        this.hideTimeout = setTimeout(() => {
            this.hide();
        }, this.duration);
    }

    ngOnDestroy(): void {
        if (this.hideTimeout) clearTimeout(this.hideTimeout);
    }

    hide(): void {
        this.animationState = 'hidden';
        setTimeout(() => {
            this.isVisible = false;
            this.complete.emit();
        }, 600);
    }

    skipSplash(): void {
        if (this.hideTimeout) clearTimeout(this.hideTimeout);
        this.hide();
    }
}
