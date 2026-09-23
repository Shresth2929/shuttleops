import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Driver, DriverActivity, DriverActivityType } from '../../../../core/models/driver.model';
import { RouteService } from '../../../../core/services/route.service';
import { VehicleService } from '../../../../core/services/vehicle.service';

function timeOrderValidator(control: AbstractControl): ValidationErrors | null {
  const start = control.get('startTime')?.value;
  const end = control.get('endTime')?.value;
  if (start && end) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    if (endMin <= startMin) {
      return { invalidTimeOrder: true };
    }
  }
  return null;
}

@Component({
  selector: 'app-activity-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="activity-form">
      <!-- Validation warning banner -->
      <div *ngIf="form.errors?.['invalidTimeOrder'] && form.touched" class="form-banner error">
        <mat-icon class="banner-icon">error_outline</mat-icon>
        <span>End time must be after start time.</span>
      </div>

      <!-- Driver info chip -->
      <div class="driver-context-banner" *ngIf="driver">
        <div class="driver-avatar">{{ driver.name.substring(0, 2).toUpperCase() }}</div>
        <div class="driver-context-text">
          <div class="name">{{ driver.name }}</div>
          <div class="meta font-mono">Shift: {{ driver.shift.startTime }} - {{ driver.shift.endTime }} • {{ driver.status }}</div>
        </div>
      </div>

      <!-- Activity Type -->
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Activity Type</mat-label>
        <mat-select formControlName="type">
          <mat-option value="Pickup/Drop">Pickup / Drop Trip</mat-option>
          <mat-option value="Break">Rest / Meal Break</mat-option>
          <mat-option value="Vehicle change">Vehicle Change</mat-option>
          <mat-option value="Empty leg">Empty Leg / Depot Transfer</mat-option>
          <mat-option value="Duty">Full Shift Duty Block</mat-option>
        </mat-select>
        <mat-error *ngIf="form.get('type')?.hasError('required')">Activity type is required</mat-error>
      </mat-form-field>

      <!-- Time Range -->
      <div class="form-row">
        <mat-form-field appearance="outline" class="form-col">
          <mat-label>Start Time (HH:mm)</mat-label>
          <input matInput type="time" formControlName="startTime" />
          <mat-error *ngIf="form.get('startTime')?.hasError('required')">Start time required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-col">
          <mat-label>End Time (HH:mm)</mat-label>
          <input matInput type="time" formControlName="endTime" />
          <mat-error *ngIf="form.get('endTime')?.hasError('required')">End time required</mat-error>
        </mat-form-field>
      </div>

      <!-- Route (Relevant for Trip) -->
      <mat-form-field
        *ngIf="form.get('type')?.value === 'Pickup/Drop' || form.get('type')?.value === 'Empty leg'"
        appearance="outline"
        class="w-full"
      >
        <mat-label>Assigned Route</mat-label>
        <mat-select formControlName="routeId" (selectionChange)="onRouteSelected($event.value)">
          <mat-option *ngFor="let r of routes()" [value]="r.id">
            {{ r.code }} • {{ r.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Vehicle -->
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Assigned Vehicle</mat-label>
        <mat-select formControlName="vehicleId" (selectionChange)="onVehicleSelected($event.value)">
          <mat-option *ngFor="let v of vehicles()" [value]="v.id">
            {{ v.vehicleNumber }} ({{ v.type }})
          </mat-option>
        </mat-select>
      </mat-form-field>

      <!-- Notes -->
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Notes / Schedule Remarks</mat-label>
        <textarea matInput formControlName="notes" rows="2" placeholder="e.g. Peak student queue support, lunch break at cafeteria"></textarea>
      </mat-form-field>

      <!-- Form Actions -->
      <div class="form-actions">
        <button
          *ngIf="isEditMode"
          mat-stroked-button
          type="button"
          class="btn-danger-text"
          (click)="deleted.emit()"
        >
          <mat-icon>delete</mat-icon>
          <span>Delete</span>
        </button>

        <div class="actions-right">
          <button mat-button type="button" class="btn-secondary" (click)="cancelled.emit()">
            Cancel
          </button>
          <button
            mat-flat-button
            color="primary"
            class="btn-primary"
            type="submit"
            [disabled]="form.invalid"
          >
            <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
            <span>{{ isEditMode ? 'Update Activity' : 'Add to Schedule' }}</span>
          </button>
        </div>
      </div>
    </form>
  `,
  styles: [`
    .activity-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 4px;
    }

    .form-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: var(--so-radius-md);
      font-size: var(--so-font-xs);

      &.error {
        background-color: #FEF2F2;
        border: 1px solid #FECACA;
        color: #991B1B;
      }

      .banner-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .driver-context-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      background: var(--so-bg);
      border: 1px solid var(--so-border);
      border-radius: var(--so-radius-md);
      margin-bottom: 8px;
    }

    .driver-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--so-primary);
      color: #FFFFFF;
      font-size: 11px;
      font-weight: var(--so-fw-bold);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .driver-context-text {
      .name {
        font-size: var(--so-font-sm);
        font-weight: var(--so-fw-bold);
        color: var(--so-text-primary);
      }
      .meta {
        font-size: 11px;
        color: var(--so-text-muted);
      }
    }

    .form-row {
      display: flex;
      gap: 12px;
    }

    .form-col {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--so-border);
    }

    .actions-right {
      display: flex;
      gap: 10px;
      margin-left: auto;
    }

    .btn-danger-text {
      color: #DC2626 !important;
      border-color: #FECACA !important;

      &:hover {
        background-color: #FEF2F2 !important;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityEditorComponent implements OnInit {
  @Input() driver?: Driver | null;
  @Input() activity?: DriverActivity | null;
  @Input() isEditMode = false;
  @Output() saved = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private routeService = inject(RouteService);
  private vehicleService = inject(VehicleService);

  readonly routes = this.routeService.routes;
  readonly vehicles = this.vehicleService.vehicles;

  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const a = this.activity;
    const d = this.driver;

    this.form = this.fb.group({
      type: [a?.type || 'Pickup/Drop', [Validators.required]],
      startTime: [a?.startTime || '09:00', [Validators.required]],
      endTime: [a?.endTime || '10:00', [Validators.required]],
      date: [a?.date || '2026-09-22', [Validators.required]],
      routeId: [a?.routeId || 'RT-101'],
      routeName: [a?.routeName || 'Hostel Block A ↔ Academic Block'],
      vehicleId: [a?.vehicleId || d?.currentVehicleId || 'VEH-101'],
      vehicleNumber: [a?.vehicleNumber || d?.currentVehicleNumber || 'KA-01-EA-4521'],
      notes: [a?.notes || '']
    }, { validators: timeOrderValidator });
  }

  onRouteSelected(routeId: string): void {
    const r = this.routes().find(item => item.id === routeId);
    if (r) {
      this.form.patchValue({
        routeName: r.name
      });
    }
  }

  onVehicleSelected(vehicleId: string): void {
    const v = this.vehicles().find(item => item.id === vehicleId);
    if (v) {
      this.form.patchValue({
        vehicleNumber: v.vehicleNumber
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.saved.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
