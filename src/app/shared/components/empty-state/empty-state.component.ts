import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state-container">
      <div class="empty-icon-circle">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      <div *ngIf="actionLabel" class="empty-actions">
        <button mat-flat-button color="primary" class="btn-primary" (click)="actionClicked.emit()">
          <mat-icon *ngIf="actionIcon">{{ actionIcon }}</mat-icon>
          {{ actionLabel }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .empty-state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      background: var(--so-surface);
      border: 1px dashed var(--so-border-strong);
      border-radius: var(--so-radius-lg);
      margin: 16px 0;
    }

    .empty-icon-circle {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: var(--so-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--so-text-muted);
      margin-bottom: 16px;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    .empty-title {
      font-size: var(--so-font-md);
      font-weight: var(--so-fw-semibold);
      color: var(--so-text-primary);
      margin-bottom: 6px;
    }

    .empty-description {
      font-size: var(--so-font-sm);
      color: var(--so-text-muted);
      max-width: 420px;
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .empty-actions {
      margin-top: 8px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input({ required: true }) title = 'No items found';
  @Input() description = 'There are no records to display matching your criteria.';
  @Input() actionLabel?: string;
  @Input() actionIcon?: string;
  @Output() actionClicked = new EventEmitter<void>();
}
