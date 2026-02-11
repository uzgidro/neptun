import { Component, inject, OnDestroy } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UzMapComponent } from '@/pages/situation-center/sc-dashboard/widgets/sc-map/uzbekistan-map/uz-map.component';
import { DashboardService } from '@/core/services/dashboard.service';
import { GesShutdownService } from '@/core/services/ges-shutdown.service';
import { Organization } from '@/core/interfaces/organizations';
import { Reservoir } from '@/core/interfaces/reservoir';
import { ShutdownDto } from '@/core/interfaces/ges-shutdown';
import { forkJoin, Subject, takeUntil } from 'rxjs';

// Region organizations mapping
interface RegionOrganizations {
    reservoirs: number[];  // organization_id резервуаров хранения
    plants: number[];      // id молокозаводов (для кластеров и остановок)
}

const REGION_ORGANIZATIONS: Record<string, RegionOrganizations> = {
    'UZAN': {
        reservoirs: [96],
        plants: [62, 63, 65, 66, 67, 68, 69, 70, 71]
    },
    'UZNG': {
        reservoirs: [],
        plants: [75, 76, 77, 78, 79, 95]  // Кластер 74: заводы 75-79, Кластер 15: завод 42
    },
    'UZFA': {
        reservoirs: [],
        plants: [64, 72, 73]
    },
    'UZTO': {
        reservoirs: [97, 100],
        plants: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30, 31, 36, 37, 38, 39, 40, 41, 88, 89, 90, 102]
    },
    'UZTK': {
        reservoirs: [],
        plants: [32, 33, 34, 35]
    },
    'UZSI': {
        reservoirs: [43],
        plants: [42]
    },
    'UZJI': {
        reservoirs: [],
        plants: [44, 45]
    },
    'UZSA': {
        reservoirs: [],
        plants: [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61]
    },
    'UZQA': {
        reservoirs: [98],
        plants: [92, 93, 94]
    },
    'UZSU': {
        reservoirs: [99],
        plants: [80, 81, 82, 83, 84, 85, 86, 87]
    },
    'UZXO': {
        reservoirs: [],
        plants: [91]
    }
};

// Region cluster with filtered plants
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
    discharges: { id: number; name: string; value: number }[];
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
    type: 'plant' | 'mini' | 'branch';
    status: 'active' | 'stopped' | 'repair';
    x: number; // percentage
    y: number; // percentage
    power: number; // MW
    region: string;
}

@Component({
    selector: 'sc-map',
    standalone: true,
    imports: [UzMapComponent, DatePipe, DecimalPipe, TranslateModule],
    templateUrl: './sc-map.component.html',
    styleUrl: './sc-map.component.scss'
})
export class ScMapComponent implements OnDestroy {
    private dashboardService = inject(DashboardService);
    private shutdownService = inject(GesShutdownService);
    private translateService = inject(TranslateService);
    private router = inject(Router);
    private destroy$ = new Subject<void>();

    selectedStation: StationMarker | null = null;
    hoveredStation: StationMarker | null = null;
    selectedRegionId: string | null = null;

    // Region data
    regionData: RegionData | null = null;
    isLoadingRegionData = false;
    hasRegionMapping = false;

    // Region key mapping
    regionKeyMap: Record<string, string> = {
        UZFA: 'SITUATION_CENTER.DASHBOARD.REGIONS.FERGANA',
        UZTO: 'SITUATION_CENTER.DASHBOARD.REGIONS.TASHKENT',
        UZNG: 'SITUATION_CENTER.DASHBOARD.REGIONS.NAMANGAN',
        UZAN: 'SITUATION_CENTER.DASHBOARD.REGIONS.ANDIJAN',
        UZSI: 'SITUATION_CENTER.DASHBOARD.REGIONS.SYRDARYA',
        UZJI: 'SITUATION_CENTER.DASHBOARD.REGIONS.JIZZAKH',
        UZSA: 'SITUATION_CENTER.DASHBOARD.REGIONS.SAMARKAND',
        UZQA: 'SITUATION_CENTER.DASHBOARD.REGIONS.KASHKADARYA',
        UZSU: 'SITUATION_CENTER.DASHBOARD.REGIONS.SURKHANDARYA',
        UZQR: 'SITUATION_CENTER.DASHBOARD.REGIONS.KARAKALPAKSTAN',
        UZNW: 'SITUATION_CENTER.DASHBOARD.REGIONS.NAVOI',
        UZXO: 'SITUATION_CENTER.DASHBOARD.REGIONS.KHOREZM',
        UZBU: 'SITUATION_CENTER.DASHBOARD.REGIONS.BUKHARA',
        UZTK: 'SITUATION_CENTER.DASHBOARD.REGIONS.TASHKENT_CITY'
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

    private filterRegionData(cascades: Organization[], reservoirs: Reservoir[], shutdownsDto: { ges: ShutdownDto[]; mini: ShutdownDto[]; micro: ShutdownDto[] }, regionOrgs: RegionOrganizations): RegionData {
        // Filter clusters that have plants in the region
        const regionCascades: RegionCascade[] = cascades
            .map((cascade) => {
                const filteredItems = (cascade.items || []).filter((item) => regionOrgs.plants.includes(item.id));
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

        // Flatten clusters to get all plants
        const regionPlants = regionCascades.flatMap((c) => c.items);

        // Списания продукции (current_discharge > 0)
        const discharges = regionPlants.filter((item) => (item.current_discharge || 0) > 0).map((item) => ({ id: item.id, name: item.name, value: item.current_discharge || 0 }));

        // Остановки линий (ended_at === null) - все типы заводов
        const allShutdowns = [...shutdownsDto.ges, ...shutdownsDto.mini, ...shutdownsDto.micro];
        const shutdowns = allShutdowns.filter((s) => regionOrgs.plants.includes(s.organization_id)).filter((s) => s.ended_at === null);

        // Водохранилища
        const filteredReservoirs = reservoirs.filter((r) => regionOrgs.reservoirs.includes(r.organization_id));

        // Производственные линии (общий итог)
        const aggregates = regionPlants.reduce(
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
        const key = this.regionKeyMap[id];
        return key ? this.translateService.instant(key) : id;
    }

    // Mock station markers with positions on the map (production capacity in tons/day)
    stations: StationMarker[] = [
        { id: 1, name: 'Молокозавод №1', type: 'plant', status: 'active', x: 62, y: 22, power: 620, region: 'Регион Юг' },
        { id: 2, name: 'Молокозавод №2', type: 'plant', status: 'active', x: 58, y: 25, power: 165, region: 'Регион Центр' },
        { id: 3, name: 'Молокозавод №3', type: 'plant', status: 'repair', x: 55, y: 28, power: 120, region: 'Регион Запад' },
        { id: 4, name: 'Филиал №1', type: 'plant', status: 'active', x: 52, y: 30, power: 88, region: 'Регион Столица' },
        { id: 5, name: 'Филиал №2', type: 'plant', status: 'active', x: 78, y: 45, power: 126, region: 'Регион Восток' },
        { id: 6, name: 'Молокозавод №4', type: 'plant', status: 'stopped', x: 88, y: 38, power: 140, region: 'Регион Восток-2' },
        { id: 7, name: 'Мини-цех №1', type: 'mini', status: 'active', x: 48, y: 35, power: 52, region: 'Регион Столица' },
        { id: 8, name: 'Мини-цех №2', type: 'mini', status: 'active', x: 56, y: 18, power: 12, region: 'Регион Столица' },
        { id: 9, name: 'Мини-цех №3', type: 'mini', status: 'active', x: 50, y: 15, power: 8, region: 'Регион Столица' },
        { id: 10, name: 'Филиал №3', type: 'branch', status: 'active', x: 45, y: 42, power: 2, region: 'Регион Центр-2' },
        { id: 11, name: 'Молокозавод №5', type: 'plant', status: 'active', x: 72, y: 32, power: 126, region: 'Регион Юг-2' },
        { id: 12, name: 'Мини-цех №4', type: 'mini', status: 'repair', x: 82, y: 42, power: 5, region: 'Регион Восток' }
    ];

    getStationStatusClass(status: string): string {
        return `marker-${status}`;
    }

    getTypeIcon(type: string): string {
        const icons: Record<string, string> = {
            plant: 'pi-building',
            mini: 'pi-cog',
            branch: 'pi-circle'
        };
        return icons[type] || 'pi-building';
    }

    onStationHover(station: StationMarker | null): void {
        this.hoveredStation = station;
    }

    onStationClick(station: StationMarker): void {
        this.selectedStation = this.selectedStation?.id === station.id ? null : station;
    }

    getMarkerSize(type: string): number {
        const sizes: Record<string, number> = {
            plant: 24,
            mini: 20,
            branch: 16
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

    navigateToGes(id: number, event?: Event): void {
        event?.stopPropagation();
        this.router.navigate(['/plant', id]);
    }
}
