import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'sc-header',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './sc-header.component.html',
    styleUrl: './sc-header.component.scss'
})
export class ScHeaderComponent implements OnInit, OnDestroy {
    currentDate: Date = new Date();
    private timerSubscription?: Subscription;

    // Mock weather data
    weather = {
        temperature: 24,
        condition: 'Ясно',
        icon: 'pi-sun'
    };

    ngOnInit(): void {
        // Update time every second
        this.timerSubscription = interval(1000).subscribe(() => {
            this.currentDate = new Date();
        });
    }

    ngOnDestroy(): void {
        this.timerSubscription?.unsubscribe();
    }
}
