export type FreezableField =
    | 'daily_production_mln_kwh'
    | 'working_aggregates'
    | 'repair_aggregates'
    | 'modernization_aggregates'
    | 'water_level_m'
    | 'water_volume_mln_m3'
    | 'water_head_m'
    | 'reservoir_income_m3s'
    | 'total_outflow_m3s'
    | 'ges_flow_m3s';

export interface FrozenDefault {
    organization_id: number;
    cascade_id: number | null;
    field_name: FreezableField;
    frozen_value: number;
    frozen_at: string;
    updated_at: string;
}

export type FrozenMap = Record<number, Partial<Record<FreezableField, FrozenDefault>>>;

export interface UpsertFrozenDefaultRequest {
    organization_id: number;
    field_name: FreezableField;
    frozen_value: number;
}

export interface DeleteFrozenDefaultRequest {
    organization_id: number;
    field_name: FreezableField;
}

export function buildFrozenMap(list: FrozenDefault[]): FrozenMap {
    return list.reduce<FrozenMap>((acc, fd) => {
        if (!acc[fd.organization_id]) acc[fd.organization_id] = {};
        acc[fd.organization_id]![fd.field_name] = fd;
        return acc;
    }, {});
}

export const INTEGER_FREEZABLE_FIELDS: ReadonlySet<FreezableField> = new Set<FreezableField>([
    'working_aggregates', 'repair_aggregates', 'modernization_aggregates'
]);

export const NOT_NULL_FREEZABLE_FIELDS: ReadonlySet<FreezableField> = new Set<FreezableField>([
    'daily_production_mln_kwh', 'working_aggregates', 'repair_aggregates', 'modernization_aggregates'
]);

export const FREEZABLE_FIELD_LABELS: Record<FreezableField, string> = {
    daily_production_mln_kwh: 'GES_REPORT.PRODUCTION',
    working_aggregates:       'GES_REPORT.WORKING_AGGREGATES',
    repair_aggregates:        'GES_REPORT.REPAIR_AGGREGATES',
    modernization_aggregates: 'GES_REPORT.MODERNIZATION_AGGREGATES',
    water_level_m:            'GES_REPORT.WATER_LEVEL',
    water_volume_mln_m3:      'GES_REPORT.WATER_VOLUME',
    water_head_m:             'GES_REPORT.WATER_HEAD',
    reservoir_income_m3s:     'GES_REPORT.RESERVOIR_INCOME',
    total_outflow_m3s:        'GES_REPORT.TOTAL_OUTFLOW',
    ges_flow_m3s:             'GES_REPORT.GES_FLOW',
};

export const FIELD_UNITS: Record<FreezableField, string> = {
    daily_production_mln_kwh: 'млн кВт·ч',
    working_aggregates:       'шт.',
    repair_aggregates:        'шт.',
    modernization_aggregates: 'шт.',
    water_level_m:            'м',
    water_volume_mln_m3:      'млн м³',
    water_head_m:             'м',
    reservoir_income_m3s:     'м³/с',
    total_outflow_m3s:        'м³/с',
    ges_flow_m3s:             'м³/с',
};
