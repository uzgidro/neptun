import { Injectable } from '@angular/core';
import { ApiService } from '@/core/services/api.service';
import { Observable } from 'rxjs';
import { OrgUnit, OrgEmployee } from '@/core/interfaces/hrm/org-structure';

const ORG_STRUCTURE = '/hrm/org-structure';

@Injectable({
    providedIn: 'root'
})
export class OrgStructureService extends ApiService {
    // Org Units
    getOrgUnits(): Observable<OrgUnit[]> {
        return this.http.get<OrgUnit[]>(this.BASE_URL + ORG_STRUCTURE + '/units');
    }

    getOrgUnit(id: number): Observable<OrgUnit> {
        return this.http.get<OrgUnit>(this.BASE_URL + ORG_STRUCTURE + '/units/' + id);
    }

    createOrgUnit(data: Partial<OrgUnit>): Observable<OrgUnit> {
        return this.http.post<OrgUnit>(this.BASE_URL + ORG_STRUCTURE + '/units', data);
    }

    updateOrgUnit(id: number, data: Partial<OrgUnit>): Observable<OrgUnit> {
        return this.http.patch<OrgUnit>(this.BASE_URL + ORG_STRUCTURE + '/units/' + id, data);
    }

    deleteOrgUnit(id: number): Observable<any> {
        return this.http.delete(this.BASE_URL + ORG_STRUCTURE + '/units/' + id);
    }

    // Employees in org structure
    getOrgEmployees(): Observable<OrgEmployee[]> {
        return this.http.get<OrgEmployee[]>(this.BASE_URL + ORG_STRUCTURE + '/employees');
    }

    getUnitEmployees(unitId: number): Observable<OrgEmployee[]> {
        return this.http.get<OrgEmployee[]>(this.BASE_URL + ORG_STRUCTURE + '/units/' + unitId + '/employees');
    }

    assignEmployee(unitId: number, employeeId: number): Observable<any> {
        return this.http.post(this.BASE_URL + ORG_STRUCTURE + '/units/' + unitId + '/employees', { employee_id: employeeId });
    }

    removeEmployee(unitId: number, employeeId: number): Observable<any> {
        return this.http.delete(this.BASE_URL + ORG_STRUCTURE + '/units/' + unitId + '/employees/' + employeeId);
    }
}
