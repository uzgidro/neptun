import { Component } from '@angular/core';
import { UzMapComponent } from '@/pages/situation-center/sc-dashboard/widgets/sc-map/uzbekistan-map/uz-map.component';

interface StationMarker {
    id: number;
    name: string;
    type: 'ges' | 'mini' | 'micro';
    status: 'active' | 'stopped' | 'repair';
    x: number; // percentage
    y: number; // percentage
    power: number; // MW
    region: string;
}

@Component({
    selector: 'sc-map',
    standalone: true,
    imports: [UzMapComponent],
    templateUrl: './sc-map.component.html',
    styleUrl: './sc-map.component.scss'
})
export class ScMapComponent {
    selectedStation: StationMarker | null = null;
    hoveredStation: StationMarker | null = null;

    // Mock station markers with positions on the map
    stations: StationMarker[] = [
        { id: 1, name: 'Чарвакская ГЭС', type: 'ges', status: 'active', x: 62, y: 22, power: 620, region: 'Ташкентская область' },
        { id: 2, name: 'Ходжикентская ГЭС', type: 'ges', status: 'active', x: 58, y: 25, power: 165, region: 'Ташкентская область' },
        { id: 3, name: 'Газалкентская ГЭС', type: 'ges', status: 'repair', x: 55, y: 28, power: 120, region: 'Ташкентская область' },
        { id: 4, name: 'Чирчик ГЭС-1', type: 'ges', status: 'active', x: 52, y: 30, power: 88, region: 'Ташкентская область' },
        { id: 5, name: 'Фархадская ГЭС', type: 'ges', status: 'active', x: 78, y: 45, power: 126, region: 'Сырдарьинская область' },
        { id: 6, name: 'Андижанская ГЭС', type: 'ges', status: 'stopped', x: 88, y: 38, power: 140, region: 'Андижанская область' },
        { id: 7, name: 'Туябугузская ГЭС', type: 'ges', status: 'active', x: 48, y: 35, power: 52, region: 'Ташкентская область' },
        { id: 8, name: 'мини ГЭС Угам', type: 'mini', status: 'active', x: 56, y: 18, power: 12, region: 'Ташкентская область' },
        { id: 9, name: 'мини ГЭС Пскем', type: 'mini', status: 'active', x: 50, y: 15, power: 8, region: 'Ташкентская область' },
        { id: 10, name: 'микро ГЭС Арнасай', type: 'micro', status: 'active', x: 45, y: 42, power: 2, region: 'Джизакская область' },
        { id: 11, name: 'Кайраккумская ГЭС', type: 'ges', status: 'active', x: 72, y: 32, power: 126, region: 'Согдийская область' },
        { id: 12, name: 'мини ГЭС Сох', type: 'mini', status: 'repair', x: 82, y: 42, power: 5, region: 'Ферганская область' }
    ];

    getStationStatusClass(status: string): string {
        return `marker-${status}`;
    }

    getTypeIcon(type: string): string {
        const icons: Record<string, string> = {
            ges: 'pi-bolt',
            mini: 'pi-cog',
            micro: 'pi-circle'
        };
        return icons[type] || 'pi-bolt';
    }

    onStationHover(station: StationMarker | null): void {
        this.hoveredStation = station;
    }

    onStationClick(station: StationMarker): void {
        this.selectedStation = this.selectedStation?.id === station.id ? null : station;
    }

    getMarkerSize(type: string): number {
        const sizes: Record<string, number> = {
            ges: 24,
            mini: 20,
            micro: 16
        };
        return sizes[type] || 20;
    }

    get totalStations(): number {
        return this.stations.length;
    }

    get activeStationsCount(): number {
        return this.stations.filter((s) => s.status === 'active').length;
    }

    get totalPower(): number {
        return this.stations.reduce((sum, s) => sum + s.power, 0);
    }
}
