import { Injectable } from '@angular/core';
import { from, Observable, Observer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class LocationService {

    constructor() {
    }

    /**
     * Запрашивает текущее местоположение пользователя и преобразует его в адрес.
     * @returns Observable, который выдает адрес в формате "Страна/Город" или сообщение об ошибке.
     */
    getCurrentLocationAddress(): Observable<string> {
        return this.getCurrentPosition().pipe(
            switchMap(position => {
                return this.getAddressFromCoordinates(position.coords.latitude, position.coords.longitude);
            })
        );
    }

    getCurrentPosition(): Observable<GeolocationPosition> {
        return new Observable((observer: Observer<GeolocationPosition>) => {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position: GeolocationPosition) => {
                        observer.next(position);
                        observer.complete();
                    },
                    (error: GeolocationPositionError) => {
                        observer.error(error);
                    }
                );
            } else {
                observer.error('Геолокация не поддерживается этим браузером.');
            }
        });
    }

    private getAddressFromCoordinates(lat: number, lon: number): Observable<string> {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

        return from(fetch(url)).pipe(
            switchMap(response => response.json()),
            map((data: any) => {
                if (data && data.address) {
                    const country = data.address.country || '';
                    const city = data.address.city || data.address.town || data.address.village || '';
                    if (country && city) {
                        return `${country}/${city}`;
                    }
                    return country || 'Не удалось определить местоположение';
                }
                return 'Не удалось определить адрес';
            })
        );
    }
}
