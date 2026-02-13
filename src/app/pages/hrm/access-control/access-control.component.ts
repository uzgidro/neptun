import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { ProgressBar } from 'primeng/progressbar';
import { Checkbox } from 'primeng/checkbox';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AccessControlService } from '@/core/services/access-control.service';
import { ContactService } from '@/core/services/contact.service';
import {
    AccessCard,
    AccessZone,
    AccessLog,
    AccessRequest,
    AccessStats,
    ZoneOccupancy,
    CardStatus,
    SecurityLevel,
    AccessEventStatus,
    RequestStatus,
    CARD_STATUSES,
    SECURITY_LEVELS,
    ACCESS_EVENT_STATUSES,
    REQUEST_STATUSES
} from '@/core/interfaces/hrm/access-control';

interface Employee {
    id: number;
    name: string;
    department: string;
    position: string;
}

@Component({
    selector: 'app-access-control',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonDirective,
        Select,
        TableModule,
        Tag,
        Tooltip,
        Dialog,
        InputText,
        Textarea,
        TabsModule,
        ConfirmDialog,
        InputGroup,
        InputGroupAddon,
        ProgressBar,
        Checkbox,
        TranslateModule
    ],
    providers: [ConfirmationService],
    templateUrl: './access-control.component.html',
    styleUrl: './access-control.component.scss'
})
export class AccessControlComponent implements OnInit, OnDestroy {
    // Data
    cards: AccessCard[] = [];
    zones: AccessZone[] = [];
    logs: AccessLog[] = [];
    requests: AccessRequest[] = [];
    employees: Employee[] = [];
    zoneOccupancy: ZoneOccupancy[] = [];

    // Stats
    stats: AccessStats = {
        total_cards: 0,
        active_cards: 0,
        blocked_cards: 0,
        expired_cards: 0,
        total_zones: 0,
        entries_today: 0,
        exits_today: 0,
        current_on_site: 0,
        denied_today: 0,
        pending_requests: 0
    };

    // Options
    cardStatuses = CARD_STATUSES;
    securityLevels = SECURITY_LEVELS;
    accessEventStatuses = ACCESS_EVENT_STATUSES;
    requestStatuses = REQUEST_STATUSES;

    // Filters
    searchQuery: string = '';
    selectedCardStatus: CardStatus | null = null;
    selectedZone: number | null = null;
    selectedLogStatus: AccessEventStatus | null = null;

    // State
    loading: boolean = false;
    activeTabIndex: number = 0;
    private refreshInterval: any;

    // Card Dialog
    displayCardDialog: boolean = false;
    isEditMode: boolean = false;
    selectedCard: AccessCard | null = null;
    cardForm: Partial<AccessCard> = {};
    selectedZonesForCard: number[] = [];

    // Request Dialog
    displayRequestDialog: boolean = false;
    selectedRequest: AccessRequest | null = null;
    rejectionReason: string = '';

    // Block Dialog
    displayBlockDialog: boolean = false;
    blockReason: string = '';

    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private accessControlService = inject(AccessControlService);
    private contactService = inject(ContactService);
    private translate = inject(TranslateService);
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.loadAllData();
        this.startAutoRefresh();
    }

    ngOnDestroy(): void {
        this.stopAutoRefresh();
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadAllData(): void {
        this.loading = true;

        forkJoin({
            cards: this.accessControlService.getCards(),
            zones: this.accessControlService.getZones(),
            logs: this.accessControlService.getLogs(),
            requests: this.accessControlService.getRequests(),
            employees: this.contactService.getContacts()
        }).pipe(takeUntil(this.destroy$)).subscribe({
            next: (data) => {
                this.cards = data.cards;
                this.zones = data.zones;
                this.logs = data.logs;
                this.requests = data.requests;
                this.employees = data.employees.map(e => ({
                    id: e.id,
                    name: e.name,
                    department: e.department?.name || '',
                    position: e.position?.name || ''
                }));
                this.zoneOccupancy = this.zones.map(z => ({
                    zone_id: z.id,
                    zone_name: z.name,
                    current: z.current_occupancy || 0,
                    max: z.max_occupancy || 100,
                    percentage: Math.round(((z.current_occupancy || 0) / (z.max_occupancy || 100)) * 100)
                }));
                this.calculateStats();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading data:', err);
                this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.ACCESS_CONTROL.LOAD_ERROR') });
                this.loading = false;
            }
        });
    }

    private startAutoRefresh(): void {
        this.refreshInterval = setInterval(() => {
            this.loadLogs();
            this.calculateStats();
        }, 30000);
    }

    private stopAutoRefresh(): void {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    loadLogs(): void {
        this.accessControlService.getLogs()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.logs = data;
                    this.calculateStats();
                },
                error: (err) => console.error(err)
            });
    }

    private calculateStats(): void {
        this.stats = {
            total_cards: this.cards.length,
            active_cards: this.cards.filter(c => c.status === 'active').length,
            blocked_cards: this.cards.filter(c => c.status === 'blocked').length,
            expired_cards: this.cards.filter(c => c.status === 'expired').length,
            total_zones: this.zones.length,
            entries_today: this.logs.filter(l => l.direction === 'entry' && l.status === 'granted').length,
            exits_today: this.logs.filter(l => l.direction === 'exit' && l.status === 'granted').length,
            current_on_site: this.zones.reduce((sum, z) => sum + (z.current_occupancy || 0), 0),
            denied_today: this.logs.filter(l => l.status === 'denied').length,
            pending_requests: this.requests.filter(r => r.status === 'pending').length
        };
    }

    // Filtering
    get filteredCards(): AccessCard[] {
        return this.cards.filter(card => {
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                const matches = card.employee_name.toLowerCase().includes(query) ||
                    card.card_number.toLowerCase().includes(query) ||
                    card.employee_code.toLowerCase().includes(query);
                if (!matches) return false;
            }
            if (this.selectedCardStatus && card.status !== this.selectedCardStatus) return false;
            return !(this.selectedZone && !card.access_zones.includes(this.selectedZone));

        });
    }

    get filteredLogs(): AccessLog[] {
        return this.logs.filter(log => {
            if (this.selectedLogStatus && log.status !== this.selectedLogStatus) return false;
            return !(this.selectedZone && log.zone_id !== this.selectedZone);

        });
    }

    clearFilters(): void {
        this.searchQuery = '';
        this.selectedCardStatus = null;
        this.selectedZone = null;
        this.selectedLogStatus = null;
    }

    // Card management
    openNewCardDialog(): void {
        this.isEditMode = false;
        this.cardForm = {
            status: 'active',
            valid_from: new Date().toISOString().split('T')[0],
            valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        this.selectedZonesForCard = [1]; // Default: main entrance
        this.displayCardDialog = true;
    }

    openEditCardDialog(card: AccessCard): void {
        this.isEditMode = true;
        this.selectedCard = card;
        this.cardForm = { ...card };
        this.selectedZonesForCard = [...card.access_zones];
        this.displayCardDialog = true;
    }

    saveCard(): void {
        if (!this.cardForm.employee_id) {
            this.messageService.add({ severity: 'error', summary: this.translate.instant('COMMON.ERROR'), detail: this.translate.instant('HRM.ACCESS_CONTROL.SELECT_EMPLOYEE') });
            return;
        }

        const employee = this.employees.find(e => e.id === this.cardForm.employee_id);

        if (this.isEditMode && this.selectedCard) {
            const index = this.cards.findIndex(c => c.id === this.selectedCard!.id);
            if (index !== -1) {
                this.cards[index] = {
                    ...this.cards[index],
                    ...this.cardForm,
                    access_zones: this.selectedZonesForCard
                } as AccessCard;
            }
            this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.ACCESS_CONTROL.CARD_UPDATED') });
        } else {
            const newCard: AccessCard = {
                id: Math.max(...this.cards.map(c => c.id)) + 1,
                card_number: this.generateCardNumber(),
                employee_id: this.cardForm.employee_id!,
                employee_name: employee?.name || '',
                employee_code: `EMP-${String(this.cardForm.employee_id).padStart(3, '0')}`,
                department_name: employee?.department || '',
                position_name: employee?.position || '',
                status: 'active',
                issued_at: new Date().toISOString().split('T')[0],
                valid_from: this.cardForm.valid_from || new Date().toISOString().split('T')[0],
                valid_until: this.cardForm.valid_until || '',
                access_zones: this.selectedZonesForCard
            };
            this.cards.unshift(newCard);
            this.messageService.add({ severity: 'success', summary: this.translate.instant('COMMON.SUCCESS'), detail: this.translate.instant('HRM.ACCESS_CONTROL.CARD_ISSUED') });
        }

        this.displayCardDialog = false;
        this.calculateStats();
    }

    private generateCardNumber(): string {
        const year = new Date().getFullYear();
        const num = String(this.cards.length + 1).padStart(4, '0');
        return `AC-${year}-${num}`;
    }

    // Block/Unblock card
    openBlockDialog(card: AccessCard): void {
        this.selectedCard = card;
        this.blockReason = '';
        this.displayBlockDialog = true;
    }

    blockCard(): void {
        if (!this.selectedCard) return;

        this.selectedCard.status = 'blocked';
        this.selectedCard.notes = this.blockReason || this.translate.instant('HRM.ACCESS_CONTROL.BLOCKED_BY_ADMIN');

        this.messageService.add({ severity: 'warn', summary: this.translate.instant('HRM.ACCESS_CONTROL.BLOCKED'), detail: this.translate.instant('HRM.ACCESS_CONTROL.CARD_BLOCKED') });
        this.displayBlockDialog = false;
        this.calculateStats();
    }

    unblockCard(card: AccessCard): void {
        this.confirmationService.confirm({
            message: this.translate.instant('HRM.ACCESS_CONTROL.CONFIRM_UNBLOCK', { number: card.card_number }),
            header: this.translate.instant('COMMON.CONFIRM'),
            icon: 'pi pi-question-circle',
            acceptLabel: this.translate.instant('COMMON.YES'),
            rejectLabel: this.translate.instant('COMMON.NO'),
            accept: () => {
                card.status = 'active';
                card.notes = undefined;
                this.messageService.add({ severity: 'success', summary: this.translate.instant('HRM.ACCESS_CONTROL.UNBLOCKED'), detail: this.translate.instant('HRM.ACCESS_CONTROL.CARD_UNBLOCKED') });
                this.calculateStats();
            }
        });
    }

    // Requests
    openRequestDialog(request: AccessRequest): void {
        this.selectedRequest = request;
        this.rejectionReason = '';
        this.displayRequestDialog = true;
    }

    approveRequest(): void {
        if (!this.selectedRequest) return;

        this.selectedRequest.status = 'approved';
        this.selectedRequest.processed_at = new Date().toISOString();
        this.selectedRequest.processed_by_name = this.translate.instant('HRM.ACCESS_CONTROL.ADMINISTRATOR');

        // Add zones to employee's card
        const card = this.cards.find(c => c.employee_id === this.selectedRequest!.employee_id);
        if (card) {
            this.selectedRequest.requested_zones.forEach(zoneId => {
                if (!card.access_zones.includes(zoneId)) {
                    card.access_zones.push(zoneId);
                }
            });
        }

        this.messageService.add({ severity: 'success', summary: this.translate.instant('HRM.ACCESS_CONTROL.APPROVED'), detail: this.translate.instant('HRM.ACCESS_CONTROL.REQUEST_APPROVED') });
        this.displayRequestDialog = false;
        this.calculateStats();
    }

    rejectRequest(): void {
        if (!this.selectedRequest) return;

        this.selectedRequest.status = 'rejected';
        this.selectedRequest.processed_at = new Date().toISOString();
        this.selectedRequest.processed_by_name = this.translate.instant('HRM.ACCESS_CONTROL.ADMINISTRATOR');
        this.selectedRequest.rejection_reason = this.rejectionReason;

        this.messageService.add({ severity: 'warn', summary: this.translate.instant('HRM.ACCESS_CONTROL.REJECTED'), detail: this.translate.instant('HRM.ACCESS_CONTROL.REQUEST_REJECTED') });
        this.displayRequestDialog = false;
        this.calculateStats();
    }

    // Helpers
    getCardStatusLabel(status: CardStatus): string {
        return this.cardStatuses.find(s => s.value === status)?.label || status;
    }

    getCardStatusSeverity(status: CardStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const found = this.cardStatuses.find(s => s.value === status);
        return (found?.severity as any) || 'secondary';
    }

    getSecurityLevelLabel(level: SecurityLevel): string {
        return this.securityLevels.find(l => l.value === level)?.label || level;
    }

    getSecurityLevelColor(level: SecurityLevel): string {
        return this.securityLevels.find(l => l.value === level)?.color || 'gray';
    }

    getAccessStatusLabel(status: AccessEventStatus): string {
        return this.accessEventStatuses.find(s => s.value === status)?.label || status;
    }

    getAccessStatusSeverity(status: AccessEventStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const found = this.accessEventStatuses.find(s => s.value === status);
        return (found?.severity as any) || 'secondary';
    }

    getRequestStatusLabel(status: RequestStatus): string {
        return this.requestStatuses.find(s => s.value === status)?.label || status;
    }

    getRequestStatusSeverity(status: RequestStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const found = this.requestStatuses.find(s => s.value === status);
        return (found?.severity as any) || 'secondary';
    }

    getZoneName(zoneId: number): string {
        return this.zones.find(z => z.id === zoneId)?.name || '';
    }

    getZoneNames(zoneIds: number[]): string {
        return zoneIds.map(id => this.getZoneName(id)).join(', ');
    }

    formatDateTime(dateStr: string): string {
        const lang = this.translate.currentLang || 'ru';
        const locale = lang === 'uz-latn' ? 'uz' : lang === 'uz-cyrl' ? 'uz' : lang;
        return new Date(dateStr).toLocaleString(locale);
    }

    formatDate(dateStr: string): string {
        const lang = this.translate.currentLang || 'ru';
        const locale = lang === 'uz-latn' ? 'uz' : lang === 'uz-cyrl' ? 'uz' : lang;
        return new Date(dateStr).toLocaleDateString(locale);
    }

    formatTime(dateStr: string): string {
        const lang = this.translate.currentLang || 'ru';
        const locale = lang === 'uz-latn' ? 'uz' : lang === 'uz-cyrl' ? 'uz' : lang;
        return new Date(dateStr).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    }

    getOccupancyColor(percentage: number): string {
        if (percentage < 50) return 'green';
        if (percentage < 80) return 'orange';
        return 'red';
    }

    isZoneSelected(zoneId: number): boolean {
        return this.selectedZonesForCard.includes(zoneId);
    }

    toggleZoneSelection(zoneId: number): void {
        const index = this.selectedZonesForCard.indexOf(zoneId);
        if (index > -1) {
            this.selectedZonesForCard.splice(index, 1);
        } else {
            this.selectedZonesForCard.push(zoneId);
        }
    }

    onTabChange(event: any): void {
        this.activeTabIndex = event.index;
    }
}
