import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Booking, BookingStatus } from '../../../../core/models/booking.model';
import { RouteService } from '../../../../core/services/route.service';
import { DriverService } from '../../../../core/services/driver.service';
import { VehicleService } from '../../../../core/services/vehicle.service';

function locationMatchValidator(control: AbstractControl): ValidationErrors | null {
  const from = control.get('pickupLocation')?.value;
  const to = control.get('dropLocation')?.value;
  if (from && to && from.trim().toLowerCase() === to.trim().toLowerCase()) {
    return { sameLocation: true };
  }
  return null;
}

@Component({
  selector: 'app-booking-form',
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
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="booking-form">
      <div *ngIf="form.errors?.['sameLocation'] && form.touched" class="form-banner error">
        <mat-icon class="banner-icon">error_outline</mat-icon>
        <span>Pickup and Drop locations cannot be the same.</span>
      </div>

      <!-- Section: Passenger Information -->
      <div class="form-section-title">Passenger Details</div>
      
      <div class="form-row">
        <mat-form-field appearance="outline" class="form-col">
          <mat-label>Employee / Student Name</mat-label>
          <input matInput formControlName="employeeName" placeholder="e.g. Ananya Deshmukh" />
          <mat-error *ngIf="form.get('employeeName')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-col">
          <mat-label>Email Address</mat-label>
          <input matInput formControlName="employeeEmail" placeholder="employee@campusops.in" type="email" />
          <mat-error *ngIf="form.get('employeeEmail')?.hasError('required')">Email is required</mat-error>
          <mat-error *ngIf="form.get('employeeEmail')?.hasError('email')">Enter a valid email address</mat-error>
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="form-col">
          <mat-label>Department</mat-label>
          <input matInput formControlName="employeeDepartment" placeholder="e.g. Computer Science" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-col">
          <mat-label>Contact Phone</mat-label>
          <input matInput formControlName="employeePhone" placeholder="+91 98450 00000" />
        </mat-form-field>
      </div>

      <!-- Section: Journey Locations -->
      <div class="form-section-title">Transit Route & Locations</div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="form-col">
          <mat-label>Campus Route</mat-label>
          <mat-select formControlName="routeId" (selectionChange)="onRouteChanged($event.value)">
            <mat-option *ngFor="let r of routes()" [value]="r.id">
              {{ r.code }} • {{ r.name }}
            </mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('routeId')?.hasError('required')">Route is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-col">
          <mat-label>Shuttle Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="Requested">Requested</mat-option>
            <mat-option value="Accepted">Accepted</mat-option>
            <mat-option value="Waiting">Waiting</mat-option>
            <mat-option value="On Going">On Going</mat-option>
            <mat-option value="Completed">Completed</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="form-col">
          <mat-label>Pickup Location</mat-label>
          <input matInput formControlName="pickupLocation" placeholder="e.g. Hostel Block A" />
          <mat-error *ngIf="form.get('pickupLocation')?.hasError('required')">Pickup location required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-col">
          <mat-label>Drop Location</mat-label>
          <input matInput formControlName="dropLocation" placeholder="e.g. Academic Block Central" />
          <mat-error *ngIf="form.get('dropLocation')?.hasError('required')">Drop location required</mat-error>
        </mat-form-field>
      </div>

      <!-- Section: Schedule & Timings -->
      <div class="form-section-title">Schedule Timings</div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="form-col">
          <mat-label>Date</mat-label>
          <input matInput type="date" formControlName="date" />
          <mat-error *ngIf="form.get('date')?.hasError('required')">Date is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-col">
          <mat-label>Requested Pickup Time</mat-label>
          <input matInput type="time" formControlName="requestedPickupTime" />
          <mat-error *ngIf="form.get('requestedPickupTime')?.hasError('required')">Time is required</mat-error>
        </mat-form-field>
      </div>

      <!-- Section: Dispatch Vehicle & Driver -->
      <div class="form-section-title">Fleet Allocation</div>

      <div class="form-row">
        <mat-form-field appearance="outline" class="form-col">
          <mat-label>Assigned Vehicle</mat-label>
          <mat-select formControlName="vehicleId" (selectionChange)="onVehicleChanged($event.value)">
            <mat-option *ngFor="let v of vehicles()" [value]="v.id">
              {{ v.vehicleNumber }} ({{ v.type }} - {{ v.capacity }} seats)
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="form-col">
          <mat-label>Assigned Driver</mat-label>
          <mat-select formControlName="driverId" (selectionChange)="onDriverChanged($event.value)">
            <mat-option *ngFor="let d of drivers()" [value]="d.id">
              {{ d.name }} ({{ d.status }})
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <!-- Notes -->
      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Operational Notes</mat-label>
        <textarea matInput formControlName="notes" rows="2" placeholder="e.g. Recurring student shift transfer, accessibility requirements"></textarea>
      </mat-form-field>

      <!-- Form Actions -->
      <div class="form-actions">
        <button mat-button type="button" class="btn-secondary" (click)="cancelled.emit()">
          Cancel
        </button>
        <button mat-flat-button color="primary" class="btn-primary" type="submit" [disabled]="form.invalid">
          <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
          <span>{{ isEditMode ? 'Save Changes' : 'Create Booking' }}</span>
        </button>
      </div>
    </form>
  `,
  styles: [`
    .booking-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 4px;
    }

    .form-section-title {
      font-size: var(--so-font-xs);
      font-weight: var(--so-fw-bold);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--so-text-muted);
      margin-top: 10px;
      margin-bottom: 2px;
      border-bottom: 1px solid var(--so-border-subtle);
      padding-bottom: 4px;
    }

    .form-row {
      display: flex;
      gap: 12px;

      @media (max-width: 600px) {
        flex-direction: column;
        gap: 0;
      }
    }

    .form-col {
      flex: 1;
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

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--so-border);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingFormComponent implements OnInit {
  @Input() booking?: Booking | null;
  @Input() isEditMode = false;
  @Output() saved = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private routeService = inject(RouteService);
  private driverService = inject(DriverService);
  private vehicleService = inject(VehicleService);

  readonly routes = this.routeService.routes;
  readonly drivers = this.driverService.drivers;
  readonly vehicles = this.vehicleService.vehicles;

  form!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const b = this.booking;
    this.form = this.fb.group({
      employeeName: [b?.employeeName || '', [Validators.required, Validators.minLength(2)]],
      employeeEmail: [b?.employeeEmail || '', [Validators.required, Validators.email]],
      employeeDepartment: [b?.employeeDepartment || 'Computer Science & Eng'],
      employeePhone: [b?.employeePhone || '+91 98450 11223'],
      pickupLocation: [b?.pickupLocation || 'Hostel Block A', [Validators.required]],
      dropLocation: [b?.dropLocation || 'Academic Block Central', [Validators.required]],
      date: [b?.date || '2026-09-22', [Validators.required]],
      requestedPickupTime: [b?.requestedPickupTime || '09:00', [Validators.required]],
      plannedPickupTime: [b?.plannedPickupTime || '09:00'],
      plannedDropTime: [b?.plannedDropTime || '09:25'],
      status: [b?.status || 'Requested', [Validators.required]],
      routeId: [b?.routeId || 'RT-101', [Validators.required]],
      routeName: [b?.routeName || 'Hostel Block A ↔ Academic Block'],
      vehicleId: [b?.vehicleId || 'VEH-101'],
      vehicleNumber: [b?.vehicleNumber || 'KA-01-EA-4521'],
      driverId: [b?.driverId || 'DRV-101'],
      driverName: [b?.driverName || 'Amit Verma'],
      notes: [b?.notes || '']
    }, { validators: locationMatchValidator });
  }

  onRouteChanged(routeId: string): void {
    const r = this.routes().find(item => item.id === routeId);
    if (r) {
      this.form.patchValue({
        routeName: r.name,
        pickupLocation: r.startPoint,
        dropLocation: r.endPoint,
        vehicleId: r.assignedVehicleId,
        vehicleNumber: r.assignedVehicleNumber,
        driverId: r.assignedDriverId,
        driverName: r.assignedDriverName
      });
    }
  }

  onVehicleChanged(vehicleId: string): void {
    const v = this.vehicles().find(item => item.id === vehicleId);
    if (v) {
      this.form.patchValue({
        vehicleNumber: v.vehicleNumber
      });
    }
  }

  onDriverChanged(driverId: string): void {
    const d = this.drivers().find(item => item.id === driverId);
    if (d) {
      this.form.patchValue({
        driverName: d.name
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      // Compute planned drop time offset if needed
      if (!formValue.plannedPickupTime) {
        formValue.plannedPickupTime = formValue.requestedPickupTime;
      }
      this.saved.emit(formValue);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
