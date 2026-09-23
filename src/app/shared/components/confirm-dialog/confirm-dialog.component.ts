import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog-wrapper">
      <div class="dialog-header">
        <div class="dialog-icon" [ngClass]="{ 'destructive': data.isDestructive }">
          <mat-icon>{{ data.icon || (data.isDestructive ? 'warning' : 'help_outline') }}</mat-icon>
        </div>
        <h2 mat-dialog-title class="dialog-title">{{ data.title }}</h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="dialog-actions">
        <button mat-button class="btn-secondary" (click)="onCancel()">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button
          mat-flat-button
          [class.btn-danger]="data.isDestructive"
          [class.btn-primary]="!data.isDestructive"
          (click)="onConfirm()"
        >
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog-wrapper {
      padding: 8px 4px;
      min-width: 360px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .dialog-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--so-primary-light);
      color: var(--so-primary);
      display: flex;
      align-items: center;
      justify-content: center;

      &.destructive {
        background: #FEE2E2;
        color: #DC2626;
      }
    }

    .dialog-title {
      font-size: var(--so-font-lg) !important;
      font-weight: var(--so-fw-bold) !important;
      margin: 0 !important;
      color: var(--so-text-primary);
    }

    .dialog-content {
      font-size: var(--so-font-base);
      color: var(--so-text-secondary);
      line-height: 1.5;
      padding: 12px 0 20px 0 !important;
    }

    .dialog-actions {
      display: flex;
      gap: 10px;
      padding-top: 12px;
      border-top: 1px solid var(--so-border-subtle);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
