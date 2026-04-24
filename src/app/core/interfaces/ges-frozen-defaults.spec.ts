import {
    buildFrozenMap,
    FREEZABLE_FIELD_LABELS,
    FIELD_UNITS,
    FrozenDefault,
    FrozenMap,
    INTEGER_FREEZABLE_FIELDS,
    NOT_NULL_FREEZABLE_FIELDS,
} from './ges-frozen-defaults';

describe('ges-frozen-defaults', () => {
    describe('buildFrozenMap', () => {
        it('returns empty FrozenMap when given empty array', () => {
            const result: FrozenMap = buildFrozenMap([]);
            expect(result).toEqual({});
        });

        it('groups single entry under orgId and fieldName', () => {
            const entry: FrozenDefault = {
                organization_id: 42,
                cascade_id: null,
                field_name: 'water_head_m',
                frozen_value: 45,
                frozen_at: '2026-04-24T00:00:00Z',
                updated_at: '2026-04-24T00:00:00Z',
            };
            const result = buildFrozenMap([entry]);
            expect(result[42]).toBeDefined();
            expect(result[42]!['water_head_m']).toBe(entry);
        });

        it('groups multiple entries for same org under different fields', () => {
            const a: FrozenDefault = {
                organization_id: 42,
                cascade_id: null,
                field_name: 'water_head_m',
                frozen_value: 45,
                frozen_at: '2026-04-24T00:00:00Z',
                updated_at: '2026-04-24T00:00:00Z',
            };
            const b: FrozenDefault = {
                organization_id: 42,
                cascade_id: null,
                field_name: 'working_aggregates',
                frozen_value: 3,
                frozen_at: '2026-04-24T00:00:00Z',
                updated_at: '2026-04-24T00:00:00Z',
            };
            const result = buildFrozenMap([a, b]);
            expect(Object.keys(result)).toEqual(['42']);
            expect(result[42]!['water_head_m']).toBe(a);
            expect(result[42]!['working_aggregates']).toBe(b);
        });

        it('separates different orgs', () => {
            const a: FrozenDefault = {
                organization_id: 42,
                cascade_id: null,
                field_name: 'water_head_m',
                frozen_value: 45,
                frozen_at: '2026-04-24T00:00:00Z',
                updated_at: '2026-04-24T00:00:00Z',
            };
            const b: FrozenDefault = {
                organization_id: 43,
                cascade_id: null,
                field_name: 'water_head_m',
                frozen_value: 50,
                frozen_at: '2026-04-24T00:00:00Z',
                updated_at: '2026-04-24T00:00:00Z',
            };
            const result = buildFrozenMap([a, b]);
            expect(Object.keys(result).sort()).toEqual(['42', '43']);
            expect(result[42]!['water_head_m']).toBe(a);
            expect(result[43]!['water_head_m']).toBe(b);
        });
    });

    describe('INTEGER_FREEZABLE_FIELDS', () => {
        it('contains exactly working_aggregates, repair_aggregates, modernization_aggregates', () => {
            expect(INTEGER_FREEZABLE_FIELDS.size).toBe(3);
            expect(INTEGER_FREEZABLE_FIELDS.has('working_aggregates')).toBe(true);
            expect(INTEGER_FREEZABLE_FIELDS.has('repair_aggregates')).toBe(true);
            expect(INTEGER_FREEZABLE_FIELDS.has('modernization_aggregates')).toBe(true);
        });
    });

    describe('NOT_NULL_FREEZABLE_FIELDS', () => {
        it('contains exactly daily_production_mln_kwh, working_aggregates, repair_aggregates, modernization_aggregates', () => {
            expect(NOT_NULL_FREEZABLE_FIELDS.size).toBe(4);
            expect(NOT_NULL_FREEZABLE_FIELDS.has('daily_production_mln_kwh')).toBe(true);
            expect(NOT_NULL_FREEZABLE_FIELDS.has('working_aggregates')).toBe(true);
            expect(NOT_NULL_FREEZABLE_FIELDS.has('repair_aggregates')).toBe(true);
            expect(NOT_NULL_FREEZABLE_FIELDS.has('modernization_aggregates')).toBe(true);
        });
    });

    describe('FREEZABLE_FIELD_LABELS', () => {
        it('has all 10 freezable field labels', () => {
            const keys = Object.keys(FREEZABLE_FIELD_LABELS);
            expect(keys.length).toBe(10);
            const expected = [
                'daily_production_mln_kwh',
                'working_aggregates',
                'repair_aggregates',
                'modernization_aggregates',
                'water_level_m',
                'water_volume_mln_m3',
                'water_head_m',
                'reservoir_income_m3s',
                'total_outflow_m3s',
                'ges_flow_m3s',
            ];
            for (const k of expected) {
                expect(keys).toContain(k);
            }
        });
    });

    describe('FIELD_UNITS', () => {
        it('has all 10 freezable field units', () => {
            const keys = Object.keys(FIELD_UNITS);
            expect(keys.length).toBe(10);
            const expected = [
                'daily_production_mln_kwh',
                'working_aggregates',
                'repair_aggregates',
                'modernization_aggregates',
                'water_level_m',
                'water_volume_mln_m3',
                'water_head_m',
                'reservoir_income_m3s',
                'total_outflow_m3s',
                'ges_flow_m3s',
            ];
            for (const k of expected) {
                expect(keys).toContain(k);
            }
        });
    });
});
