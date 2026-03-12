# Filtration Module Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement CRUD for filtration locations/piezometers and a comparison page for filtration/piezometer measurements across reservoir organizations.

**Architecture:** Two pages under reservoirs-info: settings (CRUD, sc-only) and comparison (all roles). Shared interfaces in `filtration.ts`, two services (`FiltrationService` for CRUD, `FiltrationComparisonService` for comparison/measurements). Standalone components, lazy-loaded routes.

**Tech Stack:** Angular 20, PrimeNG 20, Tailwind CSS 4, RxJS, Reactive Forms.

**Specs:** `docs/superpowers/specs/2026-03-12-filtration-settings-design.md`, `docs/superpowers/specs/2026-03-12-filtration-comparison-design.md`

**API docs:** `docs/FILTRATION_API.md`, `docs/FILTRATION_COMPARISON_API.md`

---

## File Map

### Shared (both pages use)

| File | Action | Responsibility |
|------|--------|---------------|
| `src/app/core/interfaces/filtration.ts` | Create | `Location`, `Piezometer`, request types |
| `src/app/core/interfaces/filtration-comparison.ts` | Create | `LocationReading`, `PiezoReading`, `OrgComparison`, `ComparisonSnapshot`, `UpsertRequest` |
| `src/app/core/services/filtration.service.ts` | Create | CRUD for locations + piezometers |
| `src/app/core/services/filtration-comparison.service.ts` | Create | `getComparison()`, `saveMeasurements()` |
| `src/app/core/guards/auth.guard.ts` | Modify | Add `filtrationGuard` |
| `src/app.routes.ts` | Modify | Add 2 routes |
| `src/assets/i18n/ru.json` | Modify | Translation keys |
| `src/assets/i18n/uz-cyrl.json` | Modify | Translation keys |
| `src/assets/i18n/uz-latn.json` | Modify | Translation keys |
| `src/assets/i18n/en.json` | Modify | Translation keys |

### Settings Page (CRUD)

| File | Action | Responsibility |
|------|--------|---------------|
| `src/app/pages/situation-center/reservoirs-info/filtration-settings/filtration-settings.component.ts` | Create | Smart page: org dropdown, CRUD orchestration |
| `src/app/pages/situation-center/reservoirs-info/filtration-settings/filtration-settings.component.html` | Create | Template |
| `src/app/pages/situation-center/reservoirs-info/filtration-settings/filtration-settings.component.scss` | Create | Styles |
| `src/app/pages/situation-center/reservoirs-info/filtration-settings/components/location-dialog.component.ts` | Create | Location create/edit dialog |
| `src/app/pages/situation-center/reservoirs-info/filtration-settings/components/location-dialog.component.html` | Create | Dialog template |
| `src/app/pages/situation-center/reservoirs-info/filtration-settings/components/piezometer-dialog.component.ts` | Create | Piezometer create/edit dialog |
| `src/app/pages/situation-center/reservoirs-info/filtration-settings/components/piezometer-dialog.component.html` | Create | Dialog template |

### Comparison Page

| File | Action | Responsibility |
|------|--------|---------------|
| `src/app/pages/situation-center/reservoirs-info/filtration-comparison/filtration-comparison.component.ts` | Create | Smart page: load comparison, build FormArray, save |
| `src/app/pages/situation-center/reservoirs-info/filtration-comparison/filtration-comparison.component.html` | Create | Template |
| `src/app/pages/situation-center/reservoirs-info/filtration-comparison/filtration-comparison.component.scss` | Create | Styles |
| `src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/org-comparison-card.component.ts` | Create | Card for one organization |
| `src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/org-comparison-card.component.html` | Create | Card template |
| `src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/filtration-table.component.ts` | Create | Filtration table (current + historical + delta rows) |
| `src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/filtration-table.component.html` | Create | Table template |
| `src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/piezometer-table.component.ts` | Create | Piezometer table with pressure/non_pressure grouping |
| `src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/piezometer-table.component.html` | Create | Table template |

---

## Chunk 1: Foundation (interfaces, services, guard, routes, i18n)

These tasks have **no UI dependencies** and can be executed in parallel.

### Task 1: Interfaces

**Files:**

- Create: `src/app/core/interfaces/filtration.ts`
- Create: `src/app/core/interfaces/filtration-comparison.ts`

- [ ] **Step 1: Create `filtration.ts`**

```typescript
// src/app/core/interfaces/filtration.ts

export interface Location {
    id: number;
    organization_id: number;
    name: string;
    norm: number | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface Piezometer {
    id: number;
    organization_id: number;
    name: string;
    type: 'pressure' | 'non_pressure';
    norm: number | null;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface CreateLocationRequest {
    organization_id: number;
    name: string;
    norm?: number | null;
    sort_order?: number;
}

export interface UpdateLocationRequest {
    name?: string;
    norm?: number | null;
    sort_order?: number;
}

export interface CreatePiezometerRequest {
    organization_id: number;
    name: string;
    type: 'pressure' | 'non_pressure';
    norm?: number | null;
    sort_order?: number;
}

export interface UpdatePiezometerRequest {
    name?: string;
    type?: 'pressure' | 'non_pressure';
    norm?: number | null;
    sort_order?: number;
}
```

- [ ] **Step 2: Create `filtration-comparison.ts`**

```typescript
// src/app/core/interfaces/filtration-comparison.ts

import { Location, Piezometer } from './filtration';

export interface LocationReading extends Location {
    flow_rate: number | null;
}

export interface PiezoReading extends Piezometer {
    level: number | null;
}

export interface PiezometerCounts {
    pressure: number;
    non_pressure: number;
}

export interface ComparisonSnapshot {
    date: string;
    level: number | null;
    volume: number | null;
    locations: LocationReading[];
    piezometers: PiezoReading[];
    piezometer_counts: PiezometerCounts;
}

export interface OrgComparison {
    organization_id: number;
    organization_name: string;
    current: ComparisonSnapshot;
    historical: ComparisonSnapshot | null;
}

export interface UpsertRequest {
    organization_id: number;
    date: string;
    filtration_measurements?: { location_id: number; flow_rate: number | null }[];
    piezometer_measurements?: { piezometer_id: number; level: number | null }[];
}
```

- [ ] **Step 3: Verify compilation**

Run: `npx ng build --configuration=development 2>&1 | head -5`
Expected: no errors related to filtration files

- [ ] **Step 4: Commit**

```bash
git add src/app/core/interfaces/filtration.ts src/app/core/interfaces/filtration-comparison.ts
git commit -m "feat(filtration): add interfaces for locations, piezometers, and comparison"
```

---

### Task 2: FiltrationService (CRUD)

**Files:**

- Create: `src/app/core/services/filtration.service.ts`

**Reference:** `src/app/core/services/api.service.ts` (base class), `src/app/core/services/ges.service.ts` (pattern)

- [ ] **Step 1: Create service**

```typescript
// src/app/core/services/filtration.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import {
    Location,
    Piezometer,
    CreateLocationRequest,
    UpdateLocationRequest,
    CreatePiezometerRequest,
    UpdatePiezometerRequest
} from '@/core/interfaces/filtration';

const FILTRATION = '/filtration';
const LOCATIONS = '/locations';
const PIEZOMETERS = '/piezometers';

@Injectable({ providedIn: 'root' })
export class FiltrationService extends ApiService {

    // Locations
    getLocations(organizationId: number): Observable<Location[]> {
        const params = new HttpParams().set('organization_id', organizationId);
        return this.http.get<Location[]>(`${this.BASE_URL}${FILTRATION}${LOCATIONS}`, { params });
    }

    createLocation(payload: CreateLocationRequest): Observable<any> {
        return this.http.post(`${this.BASE_URL}${FILTRATION}${LOCATIONS}`, payload);
    }

    updateLocation(id: number, payload: UpdateLocationRequest): Observable<{ status: string }> {
        return this.http.patch<{ status: string }>(`${this.BASE_URL}${FILTRATION}${LOCATIONS}/${id}`, payload);
    }

    deleteLocation(id: number): Observable<{ status: string }> {
        return this.http.delete<{ status: string }>(`${this.BASE_URL}${FILTRATION}${LOCATIONS}/${id}`);
    }

    // Piezometers
    getPiezometers(organizationId: number): Observable<Piezometer[]> {
        const params = new HttpParams().set('organization_id', organizationId);
        return this.http.get<Piezometer[]>(`${this.BASE_URL}${FILTRATION}${PIEZOMETERS}`, { params });
    }

    createPiezometer(payload: CreatePiezometerRequest): Observable<any> {
        return this.http.post(`${this.BASE_URL}${FILTRATION}${PIEZOMETERS}`, payload);
    }

    updatePiezometer(id: number, payload: UpdatePiezometerRequest): Observable<{ status: string }> {
        return this.http.patch<{ status: string }>(`${this.BASE_URL}${FILTRATION}${PIEZOMETERS}/${id}`, payload);
    }

    deletePiezometer(id: number): Observable<{ status: string }> {
        return this.http.delete<{ status: string }>(`${this.BASE_URL}${FILTRATION}${PIEZOMETERS}/${id}`);
    }
}
```

- [ ] **Step 2: Verify compilation**

Run: `npx ng build --configuration=development 2>&1 | head -5`

- [ ] **Step 3: Commit**

```bash
git add src/app/core/services/filtration.service.ts
git commit -m "feat(filtration): add FiltrationService with CRUD for locations and piezometers"
```

---

### Task 3: FiltrationComparisonService

**Files:**

- Create: `src/app/core/services/filtration-comparison.service.ts`

- [ ] **Step 1: Create service**

```typescript
// src/app/core/services/filtration-comparison.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { OrgComparison, UpsertRequest } from '@/core/interfaces/filtration-comparison';

const FILTRATION = '/filtration';
const COMPARISON = '/comparison';
const MEASUREMENTS = '/measurements';

@Injectable({ providedIn: 'root' })
export class FiltrationComparisonService extends ApiService {

    getComparison(date: string): Observable<OrgComparison[]> {
        const params = new HttpParams().set('date', date);
        return this.http.get<OrgComparison[]>(`${this.BASE_URL}${FILTRATION}${COMPARISON}`, { params });
    }

    saveMeasurements(payload: UpsertRequest): Observable<{ status: string }> {
        return this.http.post<{ status: string }>(`${this.BASE_URL}${FILTRATION}${MEASUREMENTS}`, payload);
    }
}
```

- [ ] **Step 2: Verify compilation**

Run: `npx ng build --configuration=development 2>&1 | head -5`

- [ ] **Step 3: Commit**

```bash
git add src/app/core/services/filtration-comparison.service.ts
git commit -m "feat(filtration): add FiltrationComparisonService for comparison and measurements"
```

---

### Task 4: Guard + Routes

**Files:**

- Modify: `src/app/core/guards/auth.guard.ts` (add after line 45)
- Modify: `src/app.routes.ts` (add 2 routes in children array)

- [ ] **Step 1: Add `filtrationGuard` to `auth.guard.ts`**

Add after the `positionsGuard` (line 45), before the closing empty line:

```typescript
export const filtrationGuard: CanActivateFn = (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.hasRole(['sc', 'rais', 'reservoir']) ? true : router.createUrlTree(['/notfound']);
}
```

Also add `unsavedChangesGuard` (functional canDeactivate guard) in the same file, after `filtrationGuard`:

```typescript
export const unsavedChangesGuard = (component: any): boolean | Observable<boolean> => {
    if (component.canDeactivate) {
        return component.canDeactivate();
    }
    return true;
}
```

- [ ] **Step 2: Add routes to `app.routes.ts`**

Add the import at line 7 (extend existing import):

```typescript
import { adminGuard, authGuard, filtrationGuard, hrmGuard, positionsGuard, raisGuard, scGuard, unsavedChangesGuard } from '@/core/guards/auth.guard';
```

Add two routes inside the `children` array (after the `snow-cover` route, line 63):

```typescript
            { path: 'filtration-settings', loadComponent: () => import('./app/pages/situation-center/reservoirs-info/filtration-settings/filtration-settings.component').then(m => m.FiltrationSettingsComponent), canActivate: [scGuard] },
            { path: 'filtration-comparison', loadComponent: () => import('./app/pages/situation-center/reservoirs-info/filtration-comparison/filtration-comparison.component').then(m => m.FiltrationComparisonComponent), canActivate: [filtrationGuard], canDeactivate: [unsavedChangesGuard] },
```

- [ ] **Step 3: Verify compilation** (will fail until components exist — that's OK, just verify no syntax errors in guard/route files)

- [ ] **Step 4: Commit**

```bash
git add src/app/core/guards/auth.guard.ts src/app.routes.ts
git commit -m "feat(filtration): add filtrationGuard and routes for settings and comparison pages"
```

---

### Task 5: Translation Keys

**Files:**

- Modify: `src/assets/i18n/ru.json`
- Modify: `src/assets/i18n/uz-cyrl.json`
- Modify: `src/assets/i18n/uz-latn.json`
- Modify: `src/assets/i18n/en.json`

- [ ] **Step 1: Add keys to all 4 i18n files**

The key `"FILTRATION": "Фильтрация"` already exists as a flat string but is **not referenced** in any `.ts` or `.html` file (verified via grep). Replace it with a nested object. Add these keys:

**ru.json:**

```json
"FILTRATION": {
    "TITLE": "Фильтрация",
    "SETTINGS": "Настройка фильтрации",
    "COMPARISON": "Сравнительная таблица",
    "LOCATIONS": "Места фильтрации",
    "PIEZOMETERS": "Пьезометры",
    "ADD_LOCATION": "Добавить место фильтрации",
    "EDIT_LOCATION": "Редактировать место фильтрации",
    "ADD_PIEZOMETER": "Добавить пьезометр",
    "EDIT_PIEZOMETER": "Редактировать пьезометр",
    "NAME": "Название",
    "NORM": "Меъёр",
    "SORT_ORDER": "Порядок",
    "TYPE": "Тип",
    "PRESSURE": "Босимли",
    "NON_PRESSURE": "Босимсиз",
    "TOTAL": "Жами",
    "DEVIATION": "+,-",
    "DATE": "Дата",
    "LEVEL": "Сатҳ, м",
    "VOLUME": "Ҳажм, млн м³",
    "FLOW_RATE": "Расход, л/с",
    "CURRENT": "Текущая дата",
    "HISTORICAL": "Историческая дата",
    "DELTA": "Разница",
    "NO_DATA": "Нет данных фильтрации",
    "SELECT_ORGANIZATION": "Выберите организацию",
    "SAVE_SUCCESS": "Данные успешно сохранены",
    "SAVE_ERROR": "Ошибка сохранения",
    "SAVE_PARTIAL_ERROR": "Не удалось сохранить данные для: {{orgs}}",
    "UNSAVED_CHANGES": "Есть несохранённые изменения. Продолжить?",
    "DELETE_LOCATION_CONFIRM": "При удалении будут удалены все связанные замеры. Продолжить?",
    "DELETE_PIEZOMETER_CONFIRM": "При удалении будут удалены все связанные замеры. Продолжить?",
    "NAME_EXISTS": "Название уже существует в этой организации",
    "EXPORT_EXCEL": "Excel",
    "EXPORT_PDF": "PDF",
    "EXPORT_IN_DEVELOPMENT": "В разработке",
    "NO_LOCATIONS": "Нет мест фильтрации",
    "NO_PIEZOMETERS": "Нет пьезометров"
}
```

**en.json:** English equivalents of the same keys.

**uz-cyrl.json / uz-latn.json:** Uzbek equivalents. Most domain terms (Босимли, Меъёр, Жами, Сатҳ, Ҳажм) stay the same in uz-cyrl. For uz-latn — transliterate.

- [ ] **Step 2: Verify JSON is valid**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/assets/i18n/ru.json','utf8')); console.log('OK')"`
Repeat for all 4 files.

- [ ] **Step 3: Commit**

```bash
git add src/assets/i18n/ru.json src/assets/i18n/en.json src/assets/i18n/uz-cyrl.json src/assets/i18n/uz-latn.json
git commit -m "feat(filtration): add i18n translation keys for filtration module"
```

---

## Chunk 2: Settings Page (CRUD)

**Depends on:** Chunk 1 (interfaces, services, routes)

### Task 6: Location Dialog Component

**Files:**

- Create: `src/app/pages/situation-center/reservoirs-info/filtration-settings/components/location-dialog.component.ts`
- Create: `src/app/pages/situation-center/reservoirs-info/filtration-settings/components/location-dialog.component.html`

**Reference:** `src/app/layout/component/dialog/dialog/dialog.component.ts` for the `app-dialog` wrapper pattern. `src/app/pages/situation-center/ges/ges-detail/sections/discharges/ges-discharges-section.component.ts` for form pattern.

- [ ] **Step 1: Create component TS**

```typescript
// location-dialog.component.ts
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslateModule } from '@ngx-translate/core';
import { Location } from '@/core/interfaces/filtration';

@Component({
    selector: 'app-location-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogComponent, InputTextModule, InputNumberModule, TranslateModule],
    templateUrl: './location-dialog.component.html'
})
export class LocationDialogComponent implements OnChanges {
    @Input() visible = false;
    @Input() location: Location | null = null;
    @Input() submitting = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() save = new EventEmitter<any>();

    form!: FormGroup;

    constructor(private fb: FormBuilder) {
        this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['location'] || changes['visible']) {
            if (this.visible) {
                this.location ? this.populateForm() : this.initForm();
            }
        }
    }

    private initForm(): void {
        this.form = this.fb.group({
            name: ['', Validators.required],
            norm: [null],
            sort_order: [0]
        });
    }

    private populateForm(): void {
        if (!this.location) return;
        this.form = this.fb.group({
            name: [this.location.name, Validators.required],
            norm: [this.location.norm],
            sort_order: [this.location.sort_order]
        });
    }

    onSave(): void {
        if (this.form.valid) {
            this.save.emit(this.form.value);
        }
    }

    onCancel(): void {
        this.visibleChange.emit(false);
    }
}
```

- [ ] **Step 2: Create template**

```html
<!-- location-dialog.component.html -->
<app-dialog
    [visible]="visible"
    [header]="location ? ('FILTRATION.EDIT_LOCATION' | translate) : ('FILTRATION.ADD_LOCATION' | translate)"
    [form]="form"
    [submitting]="submitting"
    (visibleChange)="visibleChange.emit($event)"
    (save)="onSave()"
    (cancel)="onCancel()">

    <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
            <label for="name">{{ 'FILTRATION.NAME' | translate }}</label>
            <input pInputText id="name" [formControl]="form.controls['name']" />
        </div>

        <div class="flex flex-col gap-2">
            <label for="norm">{{ 'FILTRATION.NORM' | translate }}</label>
            <p-inputNumber id="norm" [formControl]="form.controls['norm']"
                mode="decimal" [maxFractionDigits]="2" [minFractionDigits]="0" />
        </div>

        <div class="flex flex-col gap-2">
            <label for="sort_order">{{ 'FILTRATION.SORT_ORDER' | translate }}</label>
            <p-inputNumber id="sort_order" [formControl]="form.controls['sort_order']" />
        </div>
    </div>
</app-dialog>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/situation-center/reservoirs-info/filtration-settings/components/location-dialog.component.ts
git add src/app/pages/situation-center/reservoirs-info/filtration-settings/components/location-dialog.component.html
git commit -m "feat(filtration): add LocationDialogComponent"
```

---

### Task 7: Piezometer Dialog Component

**Files:**

- Create: `src/app/pages/situation-center/reservoirs-info/filtration-settings/components/piezometer-dialog.component.ts`
- Create: `src/app/pages/situation-center/reservoirs-info/filtration-settings/components/piezometer-dialog.component.html`

- [ ] **Step 1: Create component TS**

Same pattern as `LocationDialogComponent` but with additional `type` field (`p-select` with options `pressure`/`non_pressure`).

```typescript
// piezometer-dialog.component.ts
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogComponent } from '@/layout/component/dialog/dialog/dialog.component';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Piezometer } from '@/core/interfaces/filtration';

@Component({
    selector: 'app-piezometer-dialog',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DialogComponent, InputTextModule, InputNumberModule, SelectModule, TranslateModule],
    templateUrl: './piezometer-dialog.component.html'
})
export class PiezometerDialogComponent implements OnChanges {
    @Input() visible = false;
    @Input() piezometer: Piezometer | null = null;
    @Input() submitting = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() save = new EventEmitter<any>();

    form!: FormGroup;
    typeOptions: { label: string; value: string }[] = [];

    constructor(private fb: FormBuilder, private translate: TranslateService) {
        this.initForm();
        this.typeOptions = [
            { label: this.translate.instant('FILTRATION.PRESSURE'), value: 'pressure' },
            { label: this.translate.instant('FILTRATION.NON_PRESSURE'), value: 'non_pressure' }
        ];
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['piezometer'] || changes['visible']) {
            if (this.visible) {
                this.piezometer ? this.populateForm() : this.initForm();
            }
        }
    }

    private initForm(): void {
        this.form = this.fb.group({
            name: ['', Validators.required],
            type: ['pressure', Validators.required],
            norm: [null],
            sort_order: [0]
        });
    }

    private populateForm(): void {
        if (!this.piezometer) return;
        this.form = this.fb.group({
            name: [this.piezometer.name, Validators.required],
            type: [this.piezometer.type, Validators.required],
            norm: [this.piezometer.norm],
            sort_order: [this.piezometer.sort_order]
        });
    }

    onSave(): void {
        if (this.form.valid) {
            this.save.emit(this.form.value);
        }
    }

    onCancel(): void {
        this.visibleChange.emit(false);
    }
}
```

- [ ] **Step 2: Create template**

```html
<!-- piezometer-dialog.component.html -->
<app-dialog
    [visible]="visible"
    [header]="piezometer ? ('FILTRATION.EDIT_PIEZOMETER' | translate) : ('FILTRATION.ADD_PIEZOMETER' | translate)"
    [form]="form"
    [submitting]="submitting"
    (visibleChange)="visibleChange.emit($event)"
    (save)="onSave()"
    (cancel)="onCancel()">

    <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
            <label for="name">{{ 'FILTRATION.NAME' | translate }}</label>
            <input pInputText id="name" [formControl]="form.controls['name']" />
        </div>

        <div class="flex flex-col gap-2">
            <label for="type">{{ 'FILTRATION.TYPE' | translate }}</label>
            <p-select id="type" [formControl]="form.controls['type']"
                [options]="typeOptions" optionLabel="label" optionValue="value" />
        </div>

        <div class="flex flex-col gap-2">
            <label for="norm">{{ 'FILTRATION.NORM' | translate }}</label>
            <p-inputNumber id="norm" [formControl]="form.controls['norm']"
                mode="decimal" [maxFractionDigits]="2" [minFractionDigits]="0" />
        </div>

        <div class="flex flex-col gap-2">
            <label for="sort_order">{{ 'FILTRATION.SORT_ORDER' | translate }}</label>
            <p-inputNumber id="sort_order" [formControl]="form.controls['sort_order']" />
        </div>
    </div>
</app-dialog>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/situation-center/reservoirs-info/filtration-settings/components/piezometer-dialog.component.ts
git add src/app/pages/situation-center/reservoirs-info/filtration-settings/components/piezometer-dialog.component.html
git commit -m "feat(filtration): add PiezometerDialogComponent"
```

---

### Task 8: Filtration Settings Page

**Files:**

- Create: `src/app/pages/situation-center/reservoirs-info/filtration-settings/filtration-settings.component.ts`
- Create: `src/app/pages/situation-center/reservoirs-info/filtration-settings/filtration-settings.component.html`
- Create: `src/app/pages/situation-center/reservoirs-info/filtration-settings/filtration-settings.component.scss`

**Reference:** `src/app/pages/situation-center/ges/ges-detail/sections/discharges/ges-discharges-section.component.ts` for CRUD pattern. `src/app/core/services/organization.service.ts` line 17 for `getOrganizationsFlat()`.

- [ ] **Step 1: Create component TS**

```typescript
// filtration-settings.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { FiltrationService } from '@/core/services/filtration.service';
import { OrganizationService } from '@/core/services/organization.service';
import { Location, Piezometer } from '@/core/interfaces/filtration';
import { LocationDialogComponent } from './components/location-dialog.component';
import { PiezometerDialogComponent } from './components/piezometer-dialog.component';
import { DeleteConfirmationComponent } from '@/layout/component/dialog/delete-confirmation/delete-confirmation.component';

@Component({
    selector: 'app-filtration-settings',
    standalone: true,
    imports: [
        CommonModule, FormsModule, TableModule, ButtonModule, SelectModule,
        MessageModule, TranslateModule, LocationDialogComponent,
        PiezometerDialogComponent, DeleteConfirmationComponent
    ],
    templateUrl: './filtration-settings.component.html',
    styleUrl: './filtration-settings.component.scss'
})
export class FiltrationSettingsComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    organizations: any[] = [];
    selectedOrganizationId: number | null = null;

    locations: Location[] = [];
    piezometers: Piezometer[] = [];
    loading = false;

    // Location dialog
    locationDialogVisible = false;
    editingLocation: Location | null = null;
    locationSubmitting = false;

    // Piezometer dialog
    piezometerDialogVisible = false;
    editingPiezometer: Piezometer | null = null;
    piezometerSubmitting = false;

    // Delete confirmation
    deleteDialogVisible = false;
    deleteMessage = '';
    private pendingDelete: (() => void) | null = null;

    constructor(
        private filtrationService: FiltrationService,
        private organizationService: OrganizationService,
        private messageService: MessageService,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        this.organizationService.getOrganizationsFlat()
            .pipe(takeUntil(this.destroy$))
            .subscribe(orgs => {
                this.organizations = orgs
                    .filter((o: any) => o.types?.includes('reservoir'))
                    .map((o: any) => ({ label: o.name, value: o.id }));
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onOrganizationChange(): void {
        if (!this.selectedOrganizationId) return;
        this.loadData();
    }

    private loadData(): void {
        if (!this.selectedOrganizationId) return;
        this.loading = true;
        forkJoin({
            locations: this.filtrationService.getLocations(this.selectedOrganizationId),
            piezometers: this.filtrationService.getPiezometers(this.selectedOrganizationId)
        }).pipe(takeUntil(this.destroy$))
          .subscribe({
            next: ({ locations, piezometers }) => {
                this.locations = locations;
                this.piezometers = piezometers;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: this.translate.instant('FILTRATION.SAVE_ERROR') });
            }
        });
    }

    // Location CRUD
    openNewLocation(): void {
        this.editingLocation = null;
        this.locationDialogVisible = true;
    }

    editLocation(loc: Location): void {
        this.editingLocation = loc;
        this.locationDialogVisible = true;
    }

    onSaveLocation(formValue: any): void {
        this.locationSubmitting = true;
        const obs = this.editingLocation
            ? this.filtrationService.updateLocation(this.editingLocation.id, formValue)
            : this.filtrationService.createLocation({ ...formValue, organization_id: this.selectedOrganizationId });

        obs.pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.locationDialogVisible = false;
                this.locationSubmitting = false;
                this.messageService.add({ severity: 'success', summary: this.translate.instant('FILTRATION.SAVE_SUCCESS') });
                this.loadData();
            },
            error: (err) => {
                this.locationSubmitting = false;
                const msg = err.status === 409
                    ? this.translate.instant('FILTRATION.NAME_EXISTS')
                    : this.translate.instant('FILTRATION.SAVE_ERROR');
                this.messageService.add({ severity: 'error', summary: msg });
            }
        });
    }

    confirmDeleteLocation(loc: Location): void {
        this.deleteMessage = this.translate.instant('FILTRATION.DELETE_LOCATION_CONFIRM');
        this.deleteDialogVisible = true;
        this.pendingDelete = () => {
            this.filtrationService.deleteLocation(loc.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.DELETE') });
                        this.loadData();
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: this.translate.instant('FILTRATION.SAVE_ERROR') })
                });
        };
    }

    // Piezometer CRUD
    openNewPiezometer(): void {
        this.editingPiezometer = null;
        this.piezometerDialogVisible = true;
    }

    editPiezometer(p: Piezometer): void {
        this.editingPiezometer = p;
        this.piezometerDialogVisible = true;
    }

    onSavePiezometer(formValue: any): void {
        this.piezometerSubmitting = true;
        const obs = this.editingPiezometer
            ? this.filtrationService.updatePiezometer(this.editingPiezometer.id, formValue)
            : this.filtrationService.createPiezometer({ ...formValue, organization_id: this.selectedOrganizationId });

        obs.pipe(takeUntil(this.destroy$)).subscribe({
            next: () => {
                this.piezometerDialogVisible = false;
                this.piezometerSubmitting = false;
                this.messageService.add({ severity: 'success', summary: this.translate.instant('FILTRATION.SAVE_SUCCESS') });
                this.loadData();
            },
            error: (err) => {
                this.piezometerSubmitting = false;
                const msg = err.status === 409
                    ? this.translate.instant('FILTRATION.NAME_EXISTS')
                    : this.translate.instant('FILTRATION.SAVE_ERROR');
                this.messageService.add({ severity: 'error', summary: msg });
            }
        });
    }

    confirmDeletePiezometer(p: Piezometer): void {
        this.deleteMessage = this.translate.instant('FILTRATION.DELETE_PIEZOMETER_CONFIRM');
        this.deleteDialogVisible = true;
        this.pendingDelete = () => {
            this.filtrationService.deletePiezometer(p.id)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.DELETE') });
                        this.loadData();
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: this.translate.instant('FILTRATION.SAVE_ERROR') })
                });
        };
    }

    onDeleteConfirm(): void {
        this.pendingDelete?.();
        this.deleteDialogVisible = false;
        this.pendingDelete = null;
    }
}
```

- [ ] **Step 2: Create template**

```html
<!-- filtration-settings.component.html -->
<div class="flex flex-col gap-6">
    <!-- Organization selector -->
    <div class="flex items-center gap-4">
        <label class="font-semibold">{{ 'FILTRATION.SELECT_ORGANIZATION' | translate }}</label>
        <p-select
            [(ngModel)]="selectedOrganizationId"
            [options]="organizations"
            optionLabel="label"
            optionValue="value"
            [placeholder]="'FILTRATION.SELECT_ORGANIZATION' | translate"
            (onChange)="onOrganizationChange()"
            class="w-80" />
    </div>

    @if (selectedOrganizationId) {
        <!-- Locations table -->
        <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold m-0">{{ 'FILTRATION.LOCATIONS' | translate }}</h3>
                <p-button [label]="'COMMON.ADD' | translate" icon="pi pi-plus" (onClick)="openNewLocation()" />
            </div>

            <p-table [value]="locations" [loading]="loading" [scrollable]="true" scrollHeight="400px">
                <ng-template #header>
                    <tr>
                        <th style="width: 60px">№</th>
                        <th>{{ 'FILTRATION.NAME' | translate }}</th>
                        <th>{{ 'FILTRATION.NORM' | translate }}</th>
                        <th>{{ 'FILTRATION.SORT_ORDER' | translate }}</th>
                        <th style="width: 100px">{{ 'COMMON.ACTIONS' | translate }}</th>
                    </tr>
                </ng-template>
                <ng-template #body let-loc let-i="rowIndex">
                    <tr>
                        <td>{{ i + 1 }}</td>
                        <td>{{ loc.name }}</td>
                        <td>{{ loc.norm ?? '—' }}</td>
                        <td>{{ loc.sort_order }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" (onClick)="editLocation(loc)" />
                                <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="confirmDeleteLocation(loc)" />
                            </div>
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr><td colspan="5" class="text-center p-4">{{ 'FILTRATION.NO_LOCATIONS' | translate }}</td></tr>
                </ng-template>
            </p-table>
        </div>

        <!-- Piezometers table -->
        <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold m-0">{{ 'FILTRATION.PIEZOMETERS' | translate }}</h3>
                <p-button [label]="'COMMON.ADD' | translate" icon="pi pi-plus" (onClick)="openNewPiezometer()" />
            </div>

            <p-table [value]="piezometers" [loading]="loading" [scrollable]="true" scrollHeight="400px">
                <ng-template #header>
                    <tr>
                        <th style="width: 60px">№</th>
                        <th>{{ 'FILTRATION.NAME' | translate }}</th>
                        <th>{{ 'FILTRATION.TYPE' | translate }}</th>
                        <th>{{ 'FILTRATION.NORM' | translate }}</th>
                        <th>{{ 'FILTRATION.SORT_ORDER' | translate }}</th>
                        <th style="width: 100px">{{ 'COMMON.ACTIONS' | translate }}</th>
                    </tr>
                </ng-template>
                <ng-template #body let-p let-i="rowIndex">
                    <tr>
                        <td>{{ i + 1 }}</td>
                        <td>{{ p.name }}</td>
                        <td>{{ p.type === 'pressure' ? ('FILTRATION.PRESSURE' | translate) : ('FILTRATION.NON_PRESSURE' | translate) }}</td>
                        <td>{{ p.norm ?? '—' }}</td>
                        <td>{{ p.sort_order }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" (onClick)="editPiezometer(p)" />
                                <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="confirmDeletePiezometer(p)" />
                            </div>
                        </td>
                    </tr>
                </ng-template>
                <ng-template #emptymessage>
                    <tr><td colspan="6" class="text-center p-4">{{ 'FILTRATION.NO_PIEZOMETERS' | translate }}</td></tr>
                </ng-template>
            </p-table>
        </div>
    }
</div>

<!-- Dialogs -->
<app-location-dialog
    [(visible)]="locationDialogVisible"
    [location]="editingLocation"
    [submitting]="locationSubmitting"
    (save)="onSaveLocation($event)" />

<app-piezometer-dialog
    [(visible)]="piezometerDialogVisible"
    [piezometer]="editingPiezometer"
    [submitting]="piezometerSubmitting"
    (save)="onSavePiezometer($event)" />

<app-delete-confirmation
    [(visible)]="deleteDialogVisible"
    [message]="deleteMessage"
    (onConfirm)="onDeleteConfirm()" />
```

- [ ] **Step 3: Create empty SCSS file**

```scss
// filtration-settings.component.scss
```

- [ ] **Step 4: Verify build**

Run: `npx ng build --configuration=development 2>&1 | tail -10`
Expected: successful build

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/situation-center/reservoirs-info/filtration-settings/
git commit -m "feat(filtration): add FiltrationSettingsComponent with locations and piezometers CRUD"
```

---

## Chunk 3: Comparison Page

**Depends on:** Chunk 1 (interfaces, services, routes)

### Task 9: OrgComparisonCardComponent

**Files:**

- Create: `src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/org-comparison-card.component.ts`
- Create: `src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/org-comparison-card.component.html`

- [ ] **Step 1: Create component TS**

```typescript
// org-comparison-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OrgComparison } from '@/core/interfaces/filtration-comparison';
import { FiltrationTableComponent } from './filtration-table.component';
import { PiezometerTableComponent } from './piezometer-table.component';

@Component({
    selector: 'app-org-comparison-card',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule, FiltrationTableComponent, PiezometerTableComponent],
    templateUrl: './org-comparison-card.component.html'
})
export class OrgComparisonCardComponent {
    @Input() org!: OrgComparison;
    @Input() formGroup!: FormGroup;
}
```

- [ ] **Step 2: Create template**

```html
<!-- org-comparison-card.component.html -->
<div class="border border-surface rounded-lg mb-6">
    <!-- Header -->
    <div class="bg-surface-100 p-4 rounded-t-lg">
        <h3 class="text-lg font-bold m-0">{{ org.organization_name }}</h3>
        <div class="flex gap-6 mt-2 text-sm">
            <span>{{ 'FILTRATION.LEVEL' | translate }}: <strong>{{ org.current.level ?? '—' }}</strong></span>
            <span>{{ 'FILTRATION.VOLUME' | translate }}: <strong>{{ org.current.volume ?? '—' }}</strong></span>
        </div>
    </div>

    <div class="p-4 flex flex-col gap-6">
        <!-- Filtration table -->
        <app-filtration-table
            [currentLocations]="org.current.locations"
            [historicalLocations]="org.historical?.locations ?? null"
            [currentDate]="org.current.date"
            [historicalDate]="org.historical?.date ?? null"
            [currentFormArray]="formGroup.get('current.locations')"
            [historicalFormArray]="formGroup.get('historical.locations')" />

        <!-- Piezometer table -->
        <app-piezometer-table
            [currentPiezometers]="org.current.piezometers"
            [historicalPiezometers]="org.historical?.piezometers ?? null"
            [piezometerCounts]="org.current.piezometer_counts"
            [currentDate]="org.current.date"
            [historicalDate]="org.historical?.date ?? null"
            [currentFormArray]="formGroup.get('current.piezometers')"
            [historicalFormArray]="formGroup.get('historical.piezometers')" />
    </div>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/org-comparison-card.*
git commit -m "feat(filtration): add OrgComparisonCardComponent"
```

---

### Task 10: FiltrationTableComponent

> **Important:** This is a **unified table** (current + delta + historical in one table), NOT two separate tables. See spec `2026-03-12-filtration-comparison-design.md` line 265.

**Files:**

- Create: `src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/filtration-table.component.ts`
- Create: `src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/filtration-table.component.html`

- [ ] **Step 1: Create component TS**

```typescript
// filtration-table.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslateModule } from '@ngx-translate/core';
import { LocationReading } from '@/core/interfaces/filtration-comparison';

@Component({
    selector: 'app-filtration-table',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputNumberModule, TranslateModule],
    templateUrl: './filtration-table.component.html'
})
export class FiltrationTableComponent {
    @Input() currentLocations: LocationReading[] = [];
    @Input() historicalLocations: LocationReading[] | null = null;
    @Input() currentDate = '';
    @Input() historicalDate: string | null = null;
    @Input() currentFormArray!: FormArray;
    @Input() historicalFormArray: FormArray | null = null;

    get totalCurrent(): number | null {
        const values = this.currentLocations.map(l => l.flow_rate).filter(v => v !== null) as number[];
        return values.length ? values.reduce((a, b) => a + b, 0) : null;
    }

    get totalHistorical(): number | null {
        if (!this.historicalLocations) return null;
        const values = this.historicalLocations.map(l => l.flow_rate).filter(v => v !== null) as number[];
        return values.length ? values.reduce((a, b) => a + b, 0) : null;
    }

    get totalDelta(): number | null {
        const c = this.totalCurrent;
        const h = this.totalHistorical;
        if (c === null || h === null) return null;
        return c - h;
    }

    getDelta(index: number): number | null {
        const curr = this.currentFormArray?.at(index)?.get('flow_rate')?.value;
        const hist = this.historicalFormArray?.at(index)?.get('flow_rate')?.value;
        if (curr === null || curr === undefined || hist === null || hist === undefined) return null;
        return curr - hist;
    }

    getDeviation(location: LocationReading, formArray: FormArray, index: number): number | null {
        if (location.norm === null) return null;
        const val = formArray?.at(index)?.get('flow_rate')?.value;
        if (val === null || val === undefined) return null;
        return val - location.norm;
    }

    exceedsNorm(location: LocationReading, formArray: FormArray, index: number): boolean {
        if (location.norm === null) return false;
        const val = formArray?.at(index)?.get('flow_rate')?.value;
        return val !== null && val !== undefined && val > location.norm;
    }
}
```

- [ ] **Step 2: Create template**

```html
<!-- filtration-table.component.html -->
<div class="overflow-x-auto">
    <table class="w-full border-collapse text-sm">
        <thead>
            <tr class="bg-surface-100">
                <th class="sticky-col border p-2 text-left min-w-24">{{ 'FILTRATION.DATE' | translate }}</th>
                <th class="border p-2 text-center min-w-20">{{ 'FILTRATION.TOTAL' | translate }}</th>
                @for (loc of currentLocations; track loc.id) {
                    <th class="border p-2 text-center min-w-20">{{ loc.name }}</th>
                    @if (loc.norm !== null) {
                        <th class="border p-2 text-center min-w-16">{{ 'FILTRATION.NORM' | translate }}</th>
                        <th class="border p-2 text-center min-w-16">{{ 'FILTRATION.DEVIATION' | translate }}</th>
                    }
                }
            </tr>
        </thead>
        <tbody>
            <!-- Current row -->
            <tr>
                <td class="sticky-col border p-2 font-semibold">{{ currentDate }}</td>
                <td class="border p-2 text-center">{{ totalCurrent ?? '—' }}</td>
                @for (loc of currentLocations; track loc.id; let i = $index) {
                    <td class="border p-1 text-center" [class.bg-red-100]="exceedsNorm(loc, currentFormArray, i)">
                        <p-inputNumber
                            [formControl]="currentFormArray.at(i).get('flow_rate')"
                            mode="decimal" [maxFractionDigits]="2" [minFractionDigits]="0"
                            [inputStyle]="{'width': '5rem', 'text-align': 'center'}" />
                    </td>
                    @if (loc.norm !== null) {
                        <td class="border p-2 text-center text-surface-500">{{ loc.norm }}</td>
                        <td class="border p-2 text-center">{{ getDeviation(loc, currentFormArray, i) ?? '—' }}</td>
                    }
                }
            </tr>

            <!-- Delta row (only if historical exists) -->
            @if (historicalLocations) {
                <tr class="bg-surface-50 text-xs text-surface-500">
                    <td class="sticky-col border p-2">{{ 'FILTRATION.DEVIATION' | translate }}</td>
                    <td class="border p-2 text-center">{{ totalDelta !== null ? (totalDelta >= 0 ? '+' : '') + totalDelta.toFixed(2) : '—' }}</td>
                    @for (loc of currentLocations; track loc.id; let i = $index) {
                        <td class="border p-2 text-center">
                            @if (getDelta(i) !== null) {
                                {{ getDelta(i)! >= 0 ? '+' : '' }}{{ getDelta(i)!.toFixed(2) }}
                            } @else { — }
                        </td>
                        @if (loc.norm !== null) {
                            <td class="border p-2"></td>
                            <td class="border p-2"></td>
                        }
                    }
                </tr>

                <!-- Historical row -->
                <tr>
                    <td class="sticky-col border p-2 font-semibold">{{ historicalDate }}</td>
                    <td class="border p-2 text-center">{{ totalHistorical ?? '—' }}</td>
                    @for (loc of historicalLocations!; track loc.id; let i = $index) {
                        <td class="border p-1 text-center" [class.bg-red-100]="exceedsNorm(loc, historicalFormArray!, i)">
                            <p-inputNumber
                                [formControl]="historicalFormArray!.at(i).get('flow_rate')"
                                mode="decimal" [maxFractionDigits]="2" [minFractionDigits]="0"
                                [inputStyle]="{'width': '5rem', 'text-align': 'center'}" />
                        </td>
                        @if (loc.norm !== null) {
                            <td class="border p-2 text-center text-surface-500">{{ loc.norm }}</td>
                            <td class="border p-2 text-center">{{ getDeviation(loc, historicalFormArray!, i) ?? '—' }}</td>
                        }
                    }
                </tr>
            }
        </tbody>
    </table>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/filtration-table.*
git commit -m "feat(filtration): add FiltrationTableComponent with current/historical/delta rows"
```

---

### Task 11: PiezometerTableComponent

**Files:**

- Create: `src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/piezometer-table.component.ts`
- Create: `src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/piezometer-table.component.html`

- [ ] **Step 1: Create component TS**

```typescript
// piezometer-table.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TranslateModule } from '@ngx-translate/core';
import { PiezoReading, PiezometerCounts } from '@/core/interfaces/filtration-comparison';

interface PiezoGroup {
    type: 'pressure' | 'non_pressure';
    label: string;
    count: number;
    currentItems: PiezoReading[];
    historicalItems: PiezoReading[] | null;
    currentIndices: number[];   // indices in the original FormArray
    historicalIndices: number[];
}

@Component({
    selector: 'app-piezometer-table',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputNumberModule, TranslateModule],
    templateUrl: './piezometer-table.component.html'
})
export class PiezometerTableComponent implements OnChanges {
    @Input() currentPiezometers: PiezoReading[] = [];
    @Input() historicalPiezometers: PiezoReading[] | null = null;
    @Input() piezometerCounts!: PiezometerCounts;
    @Input() currentDate = '';
    @Input() historicalDate: string | null = null;
    @Input() currentFormArray!: FormArray;
    @Input() historicalFormArray: FormArray | null = null;

    groups: PiezoGroup[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['currentPiezometers'] || changes['historicalPiezometers'] || changes['piezometerCounts']) {
            this.buildGroups();
        }
    }

    private buildGroups(): void {
        this.groups = [];
        for (const type of ['pressure', 'non_pressure'] as const) {
            const currentItems = this.currentPiezometers.filter(p => p.type === type);
            const currentIndices = this.currentPiezometers
                .map((p, i) => p.type === type ? i : -1)
                .filter(i => i !== -1);

            const historicalItems = this.historicalPiezometers?.filter(p => p.type === type) ?? null;
            const historicalIndices = this.historicalPiezometers
                ? this.historicalPiezometers.map((p, i) => p.type === type ? i : -1).filter(i => i !== -1)
                : [];

            const count = type === 'pressure' ? this.piezometerCounts.pressure : this.piezometerCounts.non_pressure;

            if (currentItems.length > 0 || count > 0) {
                this.groups.push({
                    type,
                    label: type === 'pressure' ? 'FILTRATION.PRESSURE' : 'FILTRATION.NON_PRESSURE',
                    count,
                    currentItems,
                    historicalItems,
                    currentIndices,
                    historicalIndices
                });
            }
        }
    }

    getDelta(currentIdx: number, historicalIdx: number): number | null {
        const curr = this.currentFormArray?.at(currentIdx)?.get('level')?.value;
        const hist = this.historicalFormArray?.at(historicalIdx)?.get('level')?.value;
        if (curr === null || curr === undefined || hist === null || hist === undefined) return null;
        return curr - hist;
    }

    getDeviation(piezo: PiezoReading, formArray: FormArray, index: number): number | null {
        if (piezo.norm === null) return null;
        const val = formArray?.at(index)?.get('level')?.value;
        if (val === null || val === undefined) return null;
        return val - piezo.norm;
    }

    exceedsNorm(piezo: PiezoReading, formArray: FormArray, index: number): boolean {
        if (piezo.norm === null) return false;
        const val = formArray?.at(index)?.get('level')?.value;
        return val !== null && val !== undefined && val > piezo.norm;
    }
}
```

- [ ] **Step 2: Create template**

```html
<!-- piezometer-table.component.html -->
@for (group of groups; track group.type) {
    <div class="overflow-x-auto mt-4">
        <h4 class="text-sm font-semibold mb-2">{{ group.label | translate }} ({{ group.count }})</h4>
        <table class="w-full border-collapse text-sm">
            <thead>
                <tr class="bg-surface-100">
                    <th class="sticky-col border p-2 text-left min-w-24">{{ 'FILTRATION.DATE' | translate }}</th>
                    @for (p of group.currentItems; track p.id) {
                        <th class="border p-2 text-center min-w-20">{{ p.name }}</th>
                        @if (p.norm !== null) {
                            <th class="border p-2 text-center min-w-16">{{ 'FILTRATION.NORM' | translate }}</th>
                            <th class="border p-2 text-center min-w-16">{{ 'FILTRATION.DEVIATION' | translate }}</th>
                        }
                    }
                </tr>
            </thead>
            <tbody>
                <!-- Current row -->
                <tr>
                    <td class="sticky-col border p-2 font-semibold">{{ currentDate }}</td>
                    @for (p of group.currentItems; track p.id; let j = $index) {
                        <td class="border p-1 text-center" [class.bg-red-100]="exceedsNorm(p, currentFormArray, group.currentIndices[j])">
                            <p-inputNumber
                                [formControl]="currentFormArray.at(group.currentIndices[j]).get('level')"
                                mode="decimal" [maxFractionDigits]="2" [minFractionDigits]="0"
                                [inputStyle]="{'width': '5rem', 'text-align': 'center'}" />
                        </td>
                        @if (p.norm !== null) {
                            <td class="border p-2 text-center text-surface-500">{{ p.norm }}</td>
                            <td class="border p-2 text-center">{{ getDeviation(p, currentFormArray, group.currentIndices[j]) ?? '—' }}</td>
                        }
                    }
                </tr>

                <!-- Delta row -->
                @if (group.historicalItems) {
                    <tr class="bg-surface-50 text-xs text-surface-500">
                        <td class="sticky-col border p-2">{{ 'FILTRATION.DEVIATION' | translate }}</td>
                        @for (p of group.currentItems; track p.id; let j = $index) {
                            <td class="border p-2 text-center">
                                @if (getDelta(group.currentIndices[j], group.historicalIndices[j]) !== null) {
                                    {{ getDelta(group.currentIndices[j], group.historicalIndices[j])! >= 0 ? '+' : '' }}{{ getDelta(group.currentIndices[j], group.historicalIndices[j])!.toFixed(2) }}
                                } @else { — }
                            </td>
                            @if (p.norm !== null) {
                                <td class="border p-2"></td>
                                <td class="border p-2"></td>
                            }
                        }
                    </tr>

                    <!-- Historical row -->
                    <tr>
                        <td class="sticky-col border p-2 font-semibold">{{ historicalDate }}</td>
                        @for (p of group.historicalItems!; track p.id; let j = $index) {
                            <td class="border p-1 text-center" [class.bg-red-100]="exceedsNorm(p, historicalFormArray!, group.historicalIndices[j])">
                                <p-inputNumber
                                    [formControl]="historicalFormArray!.at(group.historicalIndices[j]).get('level')"
                                    mode="decimal" [maxFractionDigits]="2" [minFractionDigits]="0"
                                    [inputStyle]="{'width': '5rem', 'text-align': 'center'}" />
                            </td>
                            @if (p.norm !== null) {
                                <td class="border p-2 text-center text-surface-500">{{ p.norm }}</td>
                                <td class="border p-2 text-center">{{ getDeviation(p, historicalFormArray!, group.historicalIndices[j]) ?? '—' }}</td>
                            }
                        }
                    </tr>
                }
            </tbody>
        </table>
    </div>
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/situation-center/reservoirs-info/filtration-comparison/components/piezometer-table.*
git commit -m "feat(filtration): add PiezometerTableComponent with pressure/non_pressure grouping"
```

---

### Task 12: FiltrationComparisonComponent (Main Page)

**Files:**

- Create: `src/app/pages/situation-center/reservoirs-info/filtration-comparison/filtration-comparison.component.ts`
- Create: `src/app/pages/situation-center/reservoirs-info/filtration-comparison/filtration-comparison.component.html`
- Create: `src/app/pages/situation-center/reservoirs-info/filtration-comparison/filtration-comparison.component.scss`

- [ ] **Step 1: Create component TS**

```typescript
// filtration-comparison.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, Observable, forkJoin, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FiltrationComparisonService } from '@/core/services/filtration-comparison.service';
import { OrgComparison, ComparisonSnapshot, UpsertRequest } from '@/core/interfaces/filtration-comparison';
import { OrgComparisonCardComponent } from './components/org-comparison-card.component';

@Component({
    selector: 'app-filtration-comparison',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, DatePickerModule, ButtonModule,
        MessageModule, TooltipModule, ConfirmDialogModule, TranslateModule,
        OrgComparisonCardComponent
    ],
    templateUrl: './filtration-comparison.component.html',
    styleUrl: './filtration-comparison.component.scss'
})
export class FiltrationComparisonComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    data: OrgComparison[] = [];
    form!: FormGroup;
    selectedDate!: Date;
    loading = false;
    saving = false;

    constructor(
        private comparisonService: FiltrationComparisonService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private translate: TranslateService
    ) {}

    ngOnInit(): void {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        this.selectedDate = yesterday;
        this.loadComparison(this.dateToYMD(yesterday));
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onDateChange(date: Date): void {
        if (this.form?.dirty) {
            this.confirmationService.confirm({
                message: this.translate.instant('FILTRATION.UNSAVED_CHANGES'),
                accept: () => {
                    this.selectedDate = date;
                    this.loadComparison(this.dateToYMD(date));
                },
                reject: () => {
                    this.selectedDate = new Date(this.selectedDate); // reset picker
                }
            });
        } else {
            this.selectedDate = date;
            this.loadComparison(this.dateToYMD(date));
        }
    }

    private loadComparison(date: string): void {
        this.loading = true;
        this.comparisonService.getComparison(date)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.data = data;
                    this.buildForm(data);
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                    this.messageService.add({ severity: 'error', summary: this.translate.instant('FILTRATION.SAVE_ERROR') });
                }
            });
    }

    private buildForm(data: OrgComparison[]): void {
        const orgs = new FormArray(data.map(org => this.buildOrgFormGroup(org)));
        this.form = new FormGroup({ organizations: orgs });
    }

    private buildOrgFormGroup(org: OrgComparison): FormGroup {
        const group: any = {
            organization_id: new FormControl(org.organization_id),
            current: this.buildSnapshotFormGroup(org.current)
        };
        group.historical = org.historical ? this.buildSnapshotFormGroup(org.historical) : new FormControl(null);
        return new FormGroup(group);
    }

    private buildSnapshotFormGroup(snapshot: ComparisonSnapshot): FormGroup {
        const locations = new FormArray(
            snapshot.locations.map(loc => new FormGroup({
                location_id: new FormControl(loc.id),
                flow_rate: new FormControl(loc.flow_rate)
            }))
        );
        const piezometers = new FormArray(
            snapshot.piezometers.map(p => new FormGroup({
                piezometer_id: new FormControl(p.id),
                level: new FormControl(p.level)
            }))
        );
        return new FormGroup({
            date: new FormControl(snapshot.date),
            locations,
            piezometers
        });
    }

    get orgFormArray(): FormArray {
        return this.form?.get('organizations') as FormArray;
    }

    getOrgFormGroup(index: number): FormGroup {
        return this.orgFormArray.at(index) as FormGroup;
    }

    save(): void {
        this.saving = true;
        const requests: Observable<any>[] = [];
        const orgNames: string[] = [];

        for (let i = 0; i < this.data.length; i++) {
            const orgFg = this.getOrgFormGroup(i);
            if (!orgFg.dirty) continue;

            const orgId = this.data[i].organization_id;
            const orgName = this.data[i].organization_name;
            orgNames.push(orgName);

            // Current
            const currentFg = orgFg.get('current') as FormGroup;
            const currentReq: UpsertRequest = {
                organization_id: orgId,
                date: currentFg.get('date')!.value,
                filtration_measurements: (currentFg.get('locations') as FormArray).controls.map((c: any) => ({
                    location_id: c.get('location_id').value,
                    flow_rate: c.get('flow_rate').value
                })),
                piezometer_measurements: (currentFg.get('piezometers') as FormArray).controls.map((c: any) => ({
                    piezometer_id: c.get('piezometer_id').value,
                    level: c.get('level').value
                }))
            };
            requests.push(
                this.comparisonService.saveMeasurements(currentReq).pipe(catchError(err => of({ error: true, org: orgName })))
            );

            // Historical (if exists)
            const histFg = orgFg.get('historical');
            if (histFg?.value && histFg instanceof FormGroup) {
                const histReq: UpsertRequest = {
                    organization_id: orgId,
                    date: histFg.get('date')!.value,
                    filtration_measurements: (histFg.get('locations') as FormArray).controls.map((c: any) => ({
                        location_id: c.get('location_id').value,
                        flow_rate: c.get('flow_rate').value
                    })),
                    piezometer_measurements: (histFg.get('piezometers') as FormArray).controls.map((c: any) => ({
                        piezometer_id: c.get('piezometer_id').value,
                        level: c.get('level').value
                    }))
                };
                requests.push(
                    this.comparisonService.saveMeasurements(histReq).pipe(catchError(err => of({ error: true, org: orgName })))
                );
            }
        }

        if (requests.length === 0) {
            this.saving = false;
            return;
        }

        forkJoin(requests).pipe(takeUntil(this.destroy$)).subscribe({
            next: (results) => {
                const failed = results.filter((r: any) => r?.error).map((r: any) => r.org);
                if (failed.length > 0) {
                    const uniqueFailed = [...new Set(failed)];
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('FILTRATION.SAVE_PARTIAL_ERROR', { orgs: uniqueFailed.join(', ') })
                    });
                } else {
                    this.messageService.add({ severity: 'success', summary: this.translate.instant('FILTRATION.SAVE_SUCCESS') });
                }
                this.saving = false;
                // Reload to sync
                this.loadComparison(this.dateToYMD(this.selectedDate));
            }
        });
    }

    canDeactivate(): boolean | Observable<boolean> {
        if (!this.form?.dirty) return true;
        return new Observable<boolean>(observer => {
            this.confirmationService.confirm({
                message: this.translate.instant('FILTRATION.UNSAVED_CHANGES'),
                accept: () => { observer.next(true); observer.complete(); },
                reject: () => { observer.next(false); observer.complete(); }
            });
        });
    }

    private dateToYMD(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
```

- [ ] **Step 2: Create template**

```html
<!-- filtration-comparison.component.html -->
<div class="flex flex-col gap-4">
    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-4 sticky top-0 z-10 bg-surface-0 py-3">
        <p-datePicker
            [(ngModel)]="selectedDate"
            (onSelect)="onDateChange($event)"
            dateFormat="dd.mm.yy"
            [showIcon]="true" />

        <div class="flex gap-2">
            <p-button
                [label]="'FILTRATION.EXPORT_EXCEL' | translate"
                icon="pi pi-file-excel"
                [disabled]="true"
                [pTooltip]="'FILTRATION.EXPORT_IN_DEVELOPMENT' | translate"
                severity="secondary" />
            <p-button
                [label]="'FILTRATION.EXPORT_PDF' | translate"
                icon="pi pi-file-pdf"
                [disabled]="true"
                [pTooltip]="'FILTRATION.EXPORT_IN_DEVELOPMENT' | translate"
                severity="secondary" />
            <p-button
                [label]="'COMMON.SAVE' | translate"
                icon="pi pi-save"
                [disabled]="!form?.dirty || saving"
                [loading]="saving"
                (onClick)="save()" />
        </div>
    </div>

    <!-- Loading -->
    @if (loading) {
        <div class="flex justify-center p-8">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
        </div>
    }

    <!-- Empty state -->
    @if (!loading && data.length === 0) {
        <p-message severity="info" [text]="'FILTRATION.NO_DATA' | translate" />
    }

    <!-- Organization cards -->
    @if (!loading && data.length > 0) {
        @for (org of data; track org.organization_id; let i = $index) {
            <app-org-comparison-card [org]="org" [formGroup]="getOrgFormGroup(i)" />
        }
    }
</div>

<p-confirmDialog />
```

Note: The template uses `[(ngModel)]` on datePicker — add `FormsModule` to imports.

- [ ] **Step 3: Create SCSS**

```scss
// filtration-comparison.component.scss
:host ::ng-deep {
    .sticky-col {
        position: sticky;
        left: 0;
        z-index: 1;
        background: var(--p-surface-0);
    }
}
```

- [ ] **Step 4: Add `FormsModule` to component imports** (needed for `ngModel` on datePicker)

In the TS file, add `FormsModule` to the imports array.

- [ ] **Step 5: Verify full build**

Run: `npx ng build --configuration=development 2>&1 | tail -10`
Expected: successful build

- [ ] **Step 6: Commit**

```bash
git add src/app/pages/situation-center/reservoirs-info/filtration-comparison/
git commit -m "feat(filtration): add FiltrationComparisonComponent with form, save, and date switching"
```

---

## Parallelism Map

Tasks that can run **in parallel** (no shared file dependencies):

| Group | Tasks | Dependencies |
|-------|-------|-------------|
| **Group A** | Task 1 (interfaces) | None |
| **Group B** | Task 2 (FiltrationService), Task 3 (ComparisonService) | Task 1 |
| **Group C** | Task 4 (guard + routes) | None (components don't exist yet but routes use loadComponent) |
| **Group D** | Task 5 (i18n) | None |
| **Group E** | Task 6 (location dialog), Task 7 (piezometer dialog) | Task 1 |
| **Group F** | Task 8 (settings page) | Tasks 1, 2, 5, 6, 7 |
| **Group G** | Task 9 (card), Task 10 (filtration table), Task 11 (piezometer table) | Task 1 |
| **Group H** | Task 12 (comparison page) | Tasks 1, 3, 5, 9, 10, 11 |

**Optimal parallel execution:**

1. **Wave 1** (parallel): Tasks 1, 4, 5
2. **Wave 2** (parallel): Tasks 2, 3, 6, 7, 9, 10, 11
3. **Wave 3** (parallel): Tasks 8, 12
