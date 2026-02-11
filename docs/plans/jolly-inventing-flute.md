# Plan: Dairy Plant Mnemonic Schema Viewer Component

## Context

The Dairy Plant detail page has a `GesMnemonicComponent` that currently generates a simple grid of circles from telemetry data. We have 57 real SVG mnemonic diagrams in `src/assets/svg/` (named `ges-{orgId}-{name}.svg`) with ID-based data binding convention (`g509`, `a509`, `c509` etc.). The goal is to rewrite the component to load these real SVGs inline and bind live telemetry data to them, plus add a dedicated "Мнемосхема" tab to the Dairy Plant detail page.

The component is used in **two places**:

1. Dashboard widget (50% width card) — already wired via `<app-ges-mnemonic [gesId]="gesId" [telemetry]="telemetry">`
2. New tab #7 "Мнемосхема" — needs a wrapper section component with auto-refresh

## Files to Create/Modify

### CREATE (4 files)

1. **`ges-detail/components/ges-mnemonic/ges-svg-registry.ts`** — Static map of 57 `gesId → filename` entries + `getSvgAssetUrl()` helper
2. **`ges-detail/sections/mnemonic/ges-mnemonic-section.component.ts`** — Tab wrapper with auto-refresh (follows `GesTelemetrySectionComponent` pattern)
3. **`ges-detail/sections/mnemonic/ges-mnemonic-section.component.html`** — Toolbar + `<app-ges-mnemonic>`
4. **`ges-detail/sections/mnemonic/ges-mnemonic-section.component.scss`** — Minimal styles

### REWRITE (3 files)

5. **`ges-detail/components/ges-mnemonic/ges-mnemonic.component.ts`** — SVG loading via HttpClient + inline DOM insertion + telemetry binding
6. **`ges-detail/components/ges-mnemonic/ges-mnemonic.component.html`** — SVG container with loading/error/no-schema states
7. **`ges-detail/components/ges-mnemonic/ges-mnemonic.component.scss`** — SVG container styles

### MODIFY (6 files)

8. **`ges-detail/ges-detail.component.ts`** — Add import for `GesMnemonicSectionComponent`
9. **`ges-detail/ges-detail.component.html`** — Add tab #7 "Мнемосхема"
10. **`src/assets/i18n/ru.json`** — Add translation keys
11. **`src/assets/i18n/en.json`** — Add translation keys
12. **`src/assets/i18n/uz-cyrl.json`** — Add translation keys
13. **`src/assets/i18n/uz-latn.json`** — Add translation keys

## Implementation Steps

### Step 1: Create `ges-svg-registry.ts`

Static `Map<number, string>` with all 57 entries mapping gesId to SVG filename. Export helper `getSvgAssetUrl(gesId)` returning `/assets/svg/{filename}` or `null`.

### Step 2: Rewrite `ges-mnemonic.component.ts`

Keep same `@Input()` contract (`gesId`, `telemetry`) so dashboard usage doesn't break.

Core logic:

- `ngOnChanges`: if `gesId` changed → `loadSvg()`, if `telemetry` changed → `bindTelemetryToSvg()`
- `loadSvg()`: resolve URL via registry → `HttpClient.get(url, { responseType: 'text' })` → `DomSanitizer.bypassSecurityTrustHtml()` → set `svgContent`
- `bindTelemetryToSvg()`: after DOM update (`setTimeout 0`), for each `TelemetryEnvelope`:
    - Find `<text id="g{deviceId}">` → set textContent to power value
    - Find `<text id="a{deviceId}">` → KIUM value
    - Find `<text id="k{deviceId}">` → KPD value
    - Find `<text id="n{deviceId}">` → NA value
    - Find `<text id="w{deviceId}">` → water flow value
    - Find `<path id="c{deviceId}">` + `c{id}1`, `c{id}2` → set fill green (active) or red (alarm/inactive)

State management: `svgLoading`, `svgError`, `hasSvg` flags for template states.

### Step 3: Rewrite `ges-mnemonic.component.html`

Four states:

1. `!hasSvg` → placeholder ("Мнемосхема не доступна")
2. `svgLoading` → `<p-progressSpinner>`
3. `svgError` → error message
4. else → `<div #svgContainer [innerHTML]="svgContent">`

### Step 4: Rewrite `ges-mnemonic.component.scss`

`.svg-wrapper` with `overflow: auto`, background, border-radius. Use `::ng-deep svg` to ensure SVG fills container width.

### Step 5: Create `ges-mnemonic-section` component

Follows exact pattern of `GesTelemetrySectionComponent`:

- `@Input() gesId`
- `ngOnInit()` → `loadData()` + `interval(120000)` auto-refresh
- `loadData()` → `gesService.getTelemetry(gesId)`
- Toolbar with "last updated" time + refresh button
- Renders `<app-ges-mnemonic [gesId]="gesId" [telemetry]="telemetry">`

### Step 6: Add tab to `ges-detail`

In `.ts`: add import for `GesMnemonicSectionComponent`
In `.html`: add `<p-tab [value]="7">` and `<p-tabpanel [value]="7">` with `<app-ges-mnemonic-section [gesId]="gesId">`

### Step 7: Add translations

Add to all 4 i18n files:

- `GES_DETAIL.TABS.MNEMONIC`: "Мнемосхема"
- `GES_DETAIL.MNEMONIC.NO_SCHEMA`: "Мнемосхема не доступна для данной станции"
- `GES_DETAIL.MNEMONIC.NO_SCHEMA_DESC`: "Схема для данного Молокозавода ещё не загружена"
- `GES_DETAIL.MNEMONIC.LOAD_ERROR`: "Ошибка загрузки мнемосхемы"

## Verification

1. Navigate to a Dairy Plant that has an SVG (e.g. `/ges/62` — Андижон-1)
    - Dashboard widget should show the real SVG instead of circles
    - Tab "Мнемосхема" should show the same SVG with toolbar
    - If telemetry is available, values should appear in SVG text elements
2. Navigate to a Dairy Plant without SVG (e.g. a station not in the registry)
    - Both dashboard widget and tab should show "Мнемосхема не доступна" placeholder
3. Verify auto-refresh: wait 2 minutes on the mnemonic tab, telemetry should update
