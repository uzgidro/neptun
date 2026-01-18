import { Component, inject, OnDestroy } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { UzMapComponent } from '@/pages/situation-center/sc-dashboard/widgets/sc-map/uzbekistan-map/uz-map.component';
import { DashboardService } from '@/core/services/dashboard.service';
import { GesShutdownService } from '@/core/services/ges-shutdown.service';
import { Organization } from '@/core/interfaces/organizations';
import { Reservoir } from '@/core/interfaces/reservoir';
import { ShutdownDto } from '@/core/interfaces/ges-shutdown';
import { forkJoin, Subject, takeUntil } from 'rxjs';

// Region organizations mapping
interface RegionOrganizations {
    reservoirs: number[];  // organization_id водохранилищ
    ges: number[];         // id ГЭС (для каскадов и отключений)
}

const REGION_ORGANIZATIONS: Record<string, RegionOrganizations> = {
    'UZAN': {
        reservoirs: [96],
        ges: [62, 63, 65, 66, 67, 68, 69, 70, 71]
    },
    'UZNG': {
        reservoirs: [],
        ges: [75, 76, 77, 78, 79, 95]  // Каскад 74: ГЭС 75-79, Каскад 15: ГЭС 42
    },
    'UZFA': {
        reservoirs: [],
        ges: [64, 72, 73]
    },
    'UZTO': {
        reservoirs: [97, 100],
        ges: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 31, 36, 37, 38, 39, 40, 41, 88, 89, 90, 102]
    },
    'UZTK': {
        reservoirs: [],
        ges: [32, 33, 34, 35]
    },
    'UZSI': {
        reservoirs: [43],
        ges: [42]
    },
    'UZJI': {
        reservoirs: [],
        ges: [44, 45]
    },
    'UZSA': {
        reservoirs: [],
        ges: [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61]
    },
    'UZQA': {
        reservoirs: [98],
        ges: [92, 93, 94]
    },
    'UZSU': {
        reservoirs: [99],
        ges: [80, 81, 82, 83, 84, 85, 86, 87]
    },
    'UZXO': {
        reservoirs: [],
        ges: [91]
    }
};

// Region cascade with filtered GES
interface RegionCascade {
    id: number;
    name: string;
    items: Organization[];
    totalPower: number;
    totalAggregates: { active: number; pending: number; repair: number };
}

// Region data interface
interface RegionData {
    cascades: RegionCascade[];
    discharges: { name: string; value: number }[];
    shutdowns: ShutdownDto[];
    reservoirs: Reservoir[];
    aggregates: {
        active: number;
        pending: number;
        repair: number;
    };
}

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
    imports: [UzMapComponent, DatePipe, DecimalPipe],
    templateUrl: './sc-map.component.html',
    styleUrl: './sc-map.component.scss'
})
export class ScMapComponent implements OnDestroy {
    private dashboardService = inject(DashboardService);
    private shutdownService = inject(GesShutdownService);
    private destroy$ = new Subject<void>();

    selectedStation: StationMarker | null = null;
    hoveredStation: StationMarker | null = null;
    selectedRegionId: string | null = null;

    // Region data
    regionData: RegionData | null = null;
    isLoadingRegionData = false;
    hasRegionMapping = false;

    // Region names mapping
    regionNames: Record<string, string> = {
        'UZFA': 'Ферганская область',
        'UZTO': 'Ташкентская область',
        'UZNG': 'Наманганская область',
        'UZAN': 'Андижанская область',
        'UZSI': 'Сырдарьинская область',
        'UZJI': 'Джизакская область',
        'UZSA': 'Самаркандская область',
        'UZQA': 'Кашкадарьинская область',
        'UZSU': 'Сурхандарьинская область',
        'UZQR': 'Республика Каракалпакстан',
        'UZNW': 'Навоийская область',
        'UZXO': 'Хорезмская область',
        'UZBU': 'Бухарская область',
        'UZTK': 'Ташкент'
    };

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onRegionClick(regionId: string): void {
        if (this.selectedRegionId === regionId) {
            this.selectedRegionId = null;
            this.regionData = null;
        } else {
            this.selectedRegionId = regionId;
            this.loadRegionData(regionId);
        }
    }

    closePanel(): void {
        this.selectedRegionId = null;
        this.regionData = null;
    }

    private loadRegionData(regionId: string): void {
        const regionOrgs = REGION_ORGANIZATIONS[regionId];
        this.hasRegionMapping = !!regionOrgs;

        if (!regionOrgs) {
            this.regionData = null;
            return;
        }

        this.isLoadingRegionData = true;
        this.regionData = null;

        forkJoin({
            cascades: this.dashboardService.getOrganizationsCascades(),
            reservoirs: this.dashboardService.getReservoirs(),
            shutdowns: this.shutdownService.getShutdowns()
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: ({ cascades, reservoirs, shutdowns }) => {
                    this.regionData = this.filterRegionData(cascades, reservoirs, shutdowns, regionOrgs);
                    this.isLoadingRegionData = false;
                },
                error: () => {
                    this.isLoadingRegionData = false;
                }
            });
    }

    private filterRegionData(
        cascades: Organization[],
        reservoirs: Reservoir[],
        shutdownsDto: { ges: ShutdownDto[]; mini: ShutdownDto[]; micro: ShutdownDto[] },
        regionOrgs: RegionOrganizations
    ): RegionData {
        // Filter cascades that have GES in the region
        const regionCascades: RegionCascade[] = cascades
            .map(cascade => {
                const filteredItems = (cascade.items || []).filter(item => regionOrgs.ges.includes(item.id));
                if (filteredItems.length === 0) return null;

                const totalPower = filteredItems.reduce((sum, item) => sum + (item.ascue_metrics?.active || 0), 0);
                const totalAggregates = filteredItems.reduce(
                    (acc, item) => ({
                        active: acc.active + (item.ascue_metrics?.active_agg_count || 0),
                        pending: acc.pending + (item.ascue_metrics?.pending_agg_count || 0),
                        repair: acc.repair + (item.ascue_metrics?.repair_agg_count || 0)
                    }),
                    { active: 0, pending: 0, repair: 0 }
                );

                return {
                    id: cascade.id,
                    name: cascade.name,
                    items: filteredItems,
                    totalPower,
                    totalAggregates
                };
            })
            .filter((c): c is RegionCascade => c !== null);

        // Flatten cascades to get all GES
        const regionGes = regionCascades.flatMap(c => c.items);

        // Водосбросы (current_discharge > 0)
        const discharges = regionGes
            .filter(item => (item.current_discharge || 0) > 0)
            .map(item => ({ name: item.name, value: item.current_discharge || 0 }));

        // Отключения (ended_at === null) - все типы ГЭС
        const allShutdowns = [...shutdownsDto.ges, ...shutdownsDto.mini, ...shutdownsDto.micro];
        const shutdowns = allShutdowns
            .filter(s => regionOrgs.ges.includes(s.organization_id))
            .filter(s => s.ended_at === null);

        // Водохранилища
        const filteredReservoirs = reservoirs.filter(r => regionOrgs.reservoirs.includes(r.organization_id));

        // АСКУЭ агрегаты (общий итог)
        const aggregates = regionGes.reduce(
            (acc, item) => ({
                active: acc.active + (item.ascue_metrics?.active_agg_count || 0),
                pending: acc.pending + (item.ascue_metrics?.pending_agg_count || 0),
                repair: acc.repair + (item.ascue_metrics?.repair_agg_count || 0)
            }),
            { active: 0, pending: 0, repair: 0 }
        );

        return { cascades: regionCascades, discharges, shutdowns, reservoirs: filteredReservoirs, aggregates };
    }

    getRegionName(id: string): string {
        return this.regionNames[id] || id;
    }

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
