import { Component, inject, Input, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ReservoirDeviceService } from '@/core/services/reservoir-device.service';
import { PatchReservoirDeviceSummaryItem, PatchReservoirDeviceSummaryRequest, ReservoirDeviceSummaryResponse } from '@/core/interfaces/reservoir-device';
import { AuthService } from '@/core/services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { ScService } from '@/core/services/sc.service';
import { HttpResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-reservoir-device',
  imports: [TableModule, Button, InputNumberModule, FormsModule, TranslateModule],
  templateUrl: './reservoir-device.component.html',
  styleUrl: './reservoir-device.component.scss'
})
export class ReservoirDeviceComponent implements OnInit {
  devices: ReservoirDeviceSummaryResponse[] = [];
  loading = false;
  saving = false;

  // Track original values for reset
  originalDevices: ReservoirDeviceSummaryResponse[] = [];

  // Track which rows have been edited
  editedRows: Set<number> = new Set();

  // Editable columns
  editableColumns = [
    'count_total',
    'count_installed',
    'count_operational',
    'count_faulty',
    'count_active',
    'count_automation_scope',
    'criterion_1',
    'criterion_2'
  ];

  @Input() date: Date | null = null;

  authService = inject(AuthService);
  private reservoirDeviceService = inject(ReservoirDeviceService);
  private scService = inject(ScService);
  private messageService = inject(MessageService);

  // Export
  isExcelLoading = false;
  isPdfLoading = false;

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.loading = true;
    this.reservoirDeviceService.getReservoirDevices().subscribe({
      next: (data) => {
        this.devices = data;
        this.originalDevices = JSON.parse(JSON.stringify(data));
        this.editedRows.clear();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: err.message
        });
      },
      complete: () => (this.loading = false)
    });
  }

  onCellEdit(device: ReservoirDeviceSummaryResponse): void {
    this.editedRows.add(device.id);
  }

  get hasChanges(): boolean {
    return this.editedRows.size > 0;
  }

  resetChanges(): void {
    this.devices = JSON.parse(JSON.stringify(this.originalDevices));
    this.editedRows.clear();
    this.messageService.add({
      severity: 'info',
      summary: 'Сброс',
      detail: 'Изменения отменены'
    });
  }

  saveChanges(): void {
    const updates: PatchReservoirDeviceSummaryItem[] = [];

    this.editedRows.forEach(deviceId => {
      const editedDevice = this.devices.find(d => d.id === deviceId);
      if (editedDevice) {
        updates.push({
          organization_id: editedDevice.organization_id,
          device_type_name: editedDevice.device_type_name,
          count_total: editedDevice.count_total,
          count_installed: editedDevice.count_installed,
          count_operational: editedDevice.count_operational,
          count_faulty: editedDevice.count_faulty,
          count_active: editedDevice.count_active,
          count_automation_scope: editedDevice.count_automation_scope,
          criterion_1: editedDevice.criterion_1,
          criterion_2: editedDevice.criterion_2
        });
      }
    });

    if (updates.length === 0) {
      return;
    }

    const payload: PatchReservoirDeviceSummaryRequest = { updates };

    this.saving = true;
    this.reservoirDeviceService.patchReservoirDevices(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Изменения сохранены'
        });
        this.loadDevices();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка сохранения',
          detail: err.message
        });
      },
      complete: () => (this.saving = false)
    });
  }

  get dateYMD(): string {
    const date = this.date || new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  download(format: 'excel' | 'pdf') {
    if (format === 'excel') this.isExcelLoading = true;
    else this.isPdfLoading = true;

    const dateToUse = this.date || new Date();

    this.scService
      .downloadScReport(dateToUse, format)
      .pipe(
        finalize(() => {
          this.isExcelLoading = false;
          this.isPdfLoading = false;
        })
      )
      .subscribe({
        next: (response: HttpResponse<Blob>) => {
          const extension = format === 'excel' ? 'xlsx' : 'pdf';
          const filename = `sc_${this.dateYMD}.${extension}`;
          saveAs(response.body!, filename);
        },
        error: (err: any) => {
          console.error('Ошибка при скачивании:', err);
          this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось скачать файл' });
        }
      });
  }
}
