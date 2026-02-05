import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

const ALARM_MUTED_KEY = 'sc-alarm-muted';

@Injectable({
    providedIn: 'root'
})
export class AlarmService {
    private platformId = inject(PLATFORM_ID);

    private _muted$ = new BehaviorSubject<boolean>(false);
    private _hasActiveShutdowns$ = new BehaviorSubject<boolean>(false);
    private _isPlaying$ = new BehaviorSubject<boolean>(false);

    private alarmAudio: HTMLAudioElement | null = null;
    private userInteracted = false;

    constructor() {
        this.init();
    }

    private init(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        this._muted$.next(localStorage.getItem(ALARM_MUTED_KEY) === 'true');

        this.alarmAudio = new Audio('assets/audio/alarm.mp3');
        this.alarmAudio.loop = true;
        this.alarmAudio.volume = 0.5;

        const handleInteraction = () => {
            this.userInteracted = true;
            this.updateAlarmState();
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };
        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);
    }

    get muted$(): Observable<boolean> {
        return this._muted$.asObservable();
    }

    get muted(): boolean {
        return this._muted$.value;
    }

    get hasActiveShutdowns$(): Observable<boolean> {
        return this._hasActiveShutdowns$.asObservable();
    }

    get hasActiveShutdowns(): boolean {
        return this._hasActiveShutdowns$.value;
    }

    get isPlaying$(): Observable<boolean> {
        return this._isPlaying$.asObservable();
    }

    get isPlaying(): boolean {
        return this._isPlaying$.value;
    }

    setHasActiveShutdowns(value: boolean): void {
        this._hasActiveShutdowns$.next(value);
        this.updateAlarmState();
    }

    toggleMute(): void {
        const newValue = !this._muted$.value;
        this._muted$.next(newValue);

        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem(ALARM_MUTED_KEY, String(newValue));
        }

        this.updateAlarmState();
    }

    private updateAlarmState(): void {
        if (!this.alarmAudio) return;

        if (this._hasActiveShutdowns$.value && !this._muted$.value) {
            this.alarmAudio
                .play()
                .then(() => {
                    this._isPlaying$.next(true);
                    this.userInteracted = true;
                })
                .catch(() => {
                    this._isPlaying$.next(false);
                });
        } else {
            this.alarmAudio.pause();
            this.alarmAudio.currentTime = 0;
            this._isPlaying$.next(false);
        }
    }

    stopAlarm(): void {
        if (this.alarmAudio) {
            this.alarmAudio.pause();
            this.alarmAudio.currentTime = 0;
            this._isPlaying$.next(false);
        }
    }
}
